create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

alter table public.move_alert_settings
  add column if not exists timezone text not null default 'Asia/Bangkok',
  add column if not exists reminder_processing_at timestamptz,
  add column if not exists last_reminder_sent_at timestamptz;

create table if not exists public.move_alert_push_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null check (length(trim(device_id)) > 0),
  expo_push_token text not null check (length(trim(expo_push_token)) > 0),
  platform text not null default 'unknown' check (platform in ('android', 'ios', 'unknown', 'web')),
  timezone text not null default 'Asia/Bangkok' check (length(trim(timezone)) > 0),
  language text not null default 'th' check (language in ('en', 'th')),
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create index if not exists move_alert_push_tokens_user_active_idx
  on public.move_alert_push_tokens (user_id, is_active, last_seen_at desc);

create table if not exists public.move_alert_push_delivery_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  push_token_id uuid references public.move_alert_push_tokens (id) on delete set null,
  status text not null check (
    status in (
      'failed',
      'invalid_token',
      'no_active_tokens',
      'sent',
      'skipped_quiet_hours'
    )
  ),
  error_message text,
  scheduled_for timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists move_alert_push_delivery_logs_user_created_idx
  on public.move_alert_push_delivery_logs (user_id, created_at desc);

alter table public.move_alert_push_tokens enable row level security;
alter table public.move_alert_push_delivery_logs enable row level security;

drop policy if exists "Users can read their move alert push tokens"
  on public.move_alert_push_tokens;
create policy "Users can read their move alert push tokens"
  on public.move_alert_push_tokens
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their move alert push tokens"
  on public.move_alert_push_tokens;
create policy "Users can create their move alert push tokens"
  on public.move_alert_push_tokens
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their move alert push tokens"
  on public.move_alert_push_tokens;
create policy "Users can update their move alert push tokens"
  on public.move_alert_push_tokens
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their move alert push delivery logs"
  on public.move_alert_push_delivery_logs;
create policy "Users can read their move alert push delivery logs"
  on public.move_alert_push_delivery_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_move_alert_push_tokens_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_move_alert_push_tokens_updated_at
  on public.move_alert_push_tokens;

create trigger set_move_alert_push_tokens_updated_at
  before update on public.move_alert_push_tokens
  for each row
  execute function public.set_move_alert_push_tokens_updated_at();

create or replace function public.move_alert_claim_due_reminders(batch_limit integer default 100)
returns table (
  user_id uuid,
  interval_minutes integer,
  next_reminder_at timestamptz,
  quiet_hours_days smallint[],
  quiet_hours_enabled boolean,
  quiet_hours_end_time time,
  quiet_hours_start_time time,
  timezone text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with due_settings as (
    select settings.user_id
    from public.move_alert_settings settings
    where settings.reminder_enabled = true
      and settings.next_reminder_at is not null
      and settings.next_reminder_at <= now()
      and (
        settings.reminder_processing_at is null
        or settings.reminder_processing_at < now() - interval '2 minutes'
      )
    order by settings.next_reminder_at asc
    limit greatest(1, least(coalesce(batch_limit, 100), 500))
    for update skip locked
  )
  update public.move_alert_settings settings
  set
    reminder_processing_at = now(),
    updated_at = now()
  from due_settings
  where settings.user_id = due_settings.user_id
  returning
    settings.user_id,
    settings.interval_minutes,
    settings.next_reminder_at,
    settings.quiet_hours_days,
    settings.quiet_hours_enabled,
    settings.quiet_hours_end_time,
    settings.quiet_hours_start_time,
    settings.timezone;
end;
$$;

revoke all on function public.move_alert_claim_due_reminders(integer) from public, anon, authenticated;
grant execute on function public.move_alert_claim_due_reminders(integer) to service_role;

do $$
begin
  perform cron.unschedule('move-alert-send-reminders-every-minute');
exception
  when others then
    null;
end;
$$;

select cron.schedule(
  'move-alert-send-reminders-every-minute',
  '* * * * *',
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-reminder-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'secret_key')
      ),
      body := jsonb_build_object('time', now()),
      timeout_milliseconds := 10000
    ) as request_id;
  $$
);

notify pgrst, 'reload schema';
