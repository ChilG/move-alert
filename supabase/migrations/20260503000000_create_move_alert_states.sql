create table if not exists public.move_alert_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  completed_today integer not null default 0 check (completed_today >= 0),
  skipped_today integer not null default 0 check (skipped_today >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  interval_minutes integer not null default 45 check (interval_minutes in (30, 45, 60)),
  reminder_enabled boolean not null default true,
  quiet_hours_enabled boolean not null default true,
  completed_stretch_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.move_alert_states enable row level security;

drop policy if exists "Users can read their move alert state"
  on public.move_alert_states;

create policy "Users can read their move alert state"
  on public.move_alert_states
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their move alert state"
  on public.move_alert_states;

create policy "Users can create their move alert state"
  on public.move_alert_states
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their move alert state"
  on public.move_alert_states;

create policy "Users can update their move alert state"
  on public.move_alert_states
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their move alert state"
  on public.move_alert_states;

create policy "Users can delete their move alert state"
  on public.move_alert_states
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_move_alert_states_updated_at()
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

drop trigger if exists set_move_alert_states_updated_at
  on public.move_alert_states;

create trigger set_move_alert_states_updated_at
  before update on public.move_alert_states
  for each row
  execute function public.set_move_alert_states_updated_at();

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    where p.pubname = 'supabase_realtime'
      and pr.prrelid = 'public.move_alert_states'::regclass
  ) then
    alter publication supabase_realtime add table public.move_alert_states;
  end if;
end;
$$;

notify pgrst, 'reload schema';
