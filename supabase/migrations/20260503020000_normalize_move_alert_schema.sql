create table if not exists public.move_alert_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  interval_minutes integer not null default 45 check (interval_minutes in (30, 45, 60)),
  reminder_enabled boolean not null default true,
  quiet_hours_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.move_alert_daily_summaries (
  user_id uuid not null references auth.users (id) on delete cascade,
  summary_date date not null,
  completed_count integer not null default 0 check (completed_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, summary_date)
);

create table if not exists public.move_alert_completed_stretches (
  user_id uuid not null references auth.users (id) on delete cascade,
  summary_date date not null,
  stretch_id text not null check (length(trim(stretch_id)) > 0),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, summary_date, stretch_id),
  foreign key (user_id, summary_date)
    references public.move_alert_daily_summaries (user_id, summary_date)
    on delete cascade
);

create table if not exists public.move_alert_timeline_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  summary_date date not null,
  position integer not null check (position >= 0),
  label_key text not null check (
    label_key in (
      'timeline.neckResetCompleted',
      'timeline.shoulderRollsCompleted',
      'timeline.wristReleaseCompleted',
      'timeline.deskBackStretchCompleted',
      'timeline.shoulderReminderSkipped',
      'timeline.breakSkipped',
      'timeline.nextMovementBreak'
    )
  ),
  status text not null check (status in ('done', 'skipped', 'next')),
  item_time time not null,
  created_at timestamptz not null default now(),
  primary key (user_id, summary_date, position),
  foreign key (user_id, summary_date)
    references public.move_alert_daily_summaries (user_id, summary_date)
    on delete cascade
);

insert into public.move_alert_settings (
  user_id,
  interval_minutes,
  reminder_enabled,
  quiet_hours_enabled,
  created_at,
  updated_at
)
select
  user_id,
  interval_minutes,
  reminder_enabled,
  quiet_hours_enabled,
  created_at,
  updated_at
from public.move_alert_states
on conflict (user_id) do update
set
  interval_minutes = excluded.interval_minutes,
  reminder_enabled = excluded.reminder_enabled,
  quiet_hours_enabled = excluded.quiet_hours_enabled,
  updated_at = excluded.updated_at;

insert into public.move_alert_daily_summaries (
  user_id,
  summary_date,
  completed_count,
  skipped_count,
  streak_days,
  created_at,
  updated_at
)
select
  user_id,
  current_date,
  completed_today,
  skipped_today,
  streak_days,
  created_at,
  updated_at
from public.move_alert_states
on conflict (user_id, summary_date) do update
set
  completed_count = excluded.completed_count,
  skipped_count = excluded.skipped_count,
  streak_days = excluded.streak_days,
  updated_at = excluded.updated_at;

insert into public.move_alert_completed_stretches (
  user_id,
  summary_date,
  stretch_id
)
select
  states.user_id,
  current_date,
  stretch_id
from public.move_alert_states states
cross join lateral unnest(states.completed_stretch_ids) as stretch_id
on conflict (user_id, summary_date, stretch_id) do nothing;

insert into public.move_alert_timeline_items (
  user_id,
  summary_date,
  position,
  label_key,
  status,
  item_time
)
select
  states.user_id,
  current_date,
  timeline_item.ordinality - 1,
  timeline_item.value ->> 'labelKey',
  timeline_item.value ->> 'status',
  (timeline_item.value ->> 'time')::time
from public.move_alert_states states
cross join lateral jsonb_array_elements(states.timeline_items) with ordinality
  as timeline_item(value, ordinality)
where states.timeline_items is not null
  and jsonb_typeof(states.timeline_items) = 'array'
  and timeline_item.value ->> 'labelKey' in (
    'timeline.neckResetCompleted',
    'timeline.shoulderRollsCompleted',
    'timeline.wristReleaseCompleted',
    'timeline.deskBackStretchCompleted',
    'timeline.shoulderReminderSkipped',
    'timeline.breakSkipped',
    'timeline.nextMovementBreak'
  )
  and timeline_item.value ->> 'status' in ('done', 'skipped', 'next')
  and timeline_item.value ->> 'time' ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
on conflict (user_id, summary_date, position) do update
set
  label_key = excluded.label_key,
  status = excluded.status,
  item_time = excluded.item_time;

alter table public.move_alert_settings enable row level security;
alter table public.move_alert_daily_summaries enable row level security;
alter table public.move_alert_completed_stretches enable row level security;
alter table public.move_alert_timeline_items enable row level security;

drop policy if exists "Users can read their move alert settings"
  on public.move_alert_settings;
create policy "Users can read their move alert settings"
  on public.move_alert_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their move alert settings"
  on public.move_alert_settings;
create policy "Users can create their move alert settings"
  on public.move_alert_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their move alert settings"
  on public.move_alert_settings;
create policy "Users can update their move alert settings"
  on public.move_alert_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their move alert settings"
  on public.move_alert_settings;
create policy "Users can delete their move alert settings"
  on public.move_alert_settings
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read their move alert daily summaries"
  on public.move_alert_daily_summaries;
create policy "Users can read their move alert daily summaries"
  on public.move_alert_daily_summaries
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their move alert daily summaries"
  on public.move_alert_daily_summaries;
create policy "Users can create their move alert daily summaries"
  on public.move_alert_daily_summaries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their move alert daily summaries"
  on public.move_alert_daily_summaries;
create policy "Users can update their move alert daily summaries"
  on public.move_alert_daily_summaries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their move alert daily summaries"
  on public.move_alert_daily_summaries;
create policy "Users can delete their move alert daily summaries"
  on public.move_alert_daily_summaries
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read their completed stretches"
  on public.move_alert_completed_stretches;
create policy "Users can read their completed stretches"
  on public.move_alert_completed_stretches
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their completed stretches"
  on public.move_alert_completed_stretches;
create policy "Users can create their completed stretches"
  on public.move_alert_completed_stretches
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their completed stretches"
  on public.move_alert_completed_stretches;
create policy "Users can update their completed stretches"
  on public.move_alert_completed_stretches
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their completed stretches"
  on public.move_alert_completed_stretches;
create policy "Users can delete their completed stretches"
  on public.move_alert_completed_stretches
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read their timeline items"
  on public.move_alert_timeline_items;
create policy "Users can read their timeline items"
  on public.move_alert_timeline_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their timeline items"
  on public.move_alert_timeline_items;
create policy "Users can create their timeline items"
  on public.move_alert_timeline_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their timeline items"
  on public.move_alert_timeline_items;
create policy "Users can update their timeline items"
  on public.move_alert_timeline_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their timeline items"
  on public.move_alert_timeline_items;
create policy "Users can delete their timeline items"
  on public.move_alert_timeline_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_move_alert_updated_at()
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

drop trigger if exists set_move_alert_settings_updated_at
  on public.move_alert_settings;
create trigger set_move_alert_settings_updated_at
  before update on public.move_alert_settings
  for each row
  execute function public.set_move_alert_updated_at();

drop trigger if exists set_move_alert_daily_summaries_updated_at
  on public.move_alert_daily_summaries;
create trigger set_move_alert_daily_summaries_updated_at
  before update on public.move_alert_daily_summaries
  for each row
  execute function public.set_move_alert_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'move_alert_settings',
    'move_alert_daily_summaries',
    'move_alert_completed_stretches',
    'move_alert_timeline_items'
  ]
  loop
    if exists (
      select 1
      from pg_publication
      where pubname = 'supabase_realtime'
    ) and not exists (
      select 1
      from pg_publication_rel pr
      join pg_publication p on p.oid = pr.prpubid
      where p.pubname = 'supabase_realtime'
        and pr.prrelid = format('public.%I', table_name)::regclass
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;

drop table if exists public.move_alert_states;
drop function if exists public.set_move_alert_states_updated_at();

notify pgrst, 'reload schema';
