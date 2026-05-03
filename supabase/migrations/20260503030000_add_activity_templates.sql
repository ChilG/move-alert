create table if not exists public.move_alert_activity_templates (
  id text primary key check (length(trim(id)) > 0),
  title_key text not null check (
    title_key in (
      'stretchItems.neckReset.title',
      'stretchItems.shoulderRolls.title',
      'stretchItems.wristRelease.title',
      'stretchItems.deskBackStretch.title'
    )
  ),
  target_key text not null check (
    target_key in (
      'stretchItems.neckReset.target',
      'stretchItems.shoulderRolls.target',
      'stretchItems.wristRelease.target',
      'stretchItems.deskBackStretch.target'
    )
  ),
  duration_key text not null check (
    duration_key in (
      'stretchItems.neckReset.duration',
      'stretchItems.shoulderRolls.duration',
      'stretchItems.wristRelease.duration',
      'stretchItems.deskBackStretch.duration'
    )
  ),
  description_key text not null check (
    description_key in (
      'stretchItems.neckReset.description',
      'stretchItems.shoulderRolls.description',
      'stretchItems.wristRelease.description',
      'stretchItems.deskBackStretch.description'
    )
  ),
  completion_label_key text not null check (
    completion_label_key in (
      'timeline.neckResetCompleted',
      'timeline.shoulderRollsCompleted',
      'timeline.wristReleaseCompleted',
      'timeline.deskBackStretchCompleted'
    )
  ),
  duration_seconds integer not null check (duration_seconds > 0),
  icon text not null check (length(trim(icon)) > 0),
  tone text not null check (tone in ('info', 'success', 'warning', 'error')),
  position integer not null unique check (position >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.move_alert_activity_templates (
  id,
  title_key,
  target_key,
  duration_key,
  description_key,
  completion_label_key,
  duration_seconds,
  icon,
  tone,
  position,
  is_active
)
values
  (
    'neck-reset',
    'stretchItems.neckReset.title',
    'stretchItems.neckReset.target',
    'stretchItems.neckReset.duration',
    'stretchItems.neckReset.description',
    'timeline.neckResetCompleted',
    45,
    'body-outline',
    'info',
    0,
    true
  ),
  (
    'shoulder-rolls',
    'stretchItems.shoulderRolls.title',
    'stretchItems.shoulderRolls.target',
    'stretchItems.shoulderRolls.duration',
    'stretchItems.shoulderRolls.description',
    'timeline.shoulderRollsCompleted',
    60,
    'sync-outline',
    'success',
    1,
    true
  ),
  (
    'wrist-release',
    'stretchItems.wristRelease.title',
    'stretchItems.wristRelease.target',
    'stretchItems.wristRelease.duration',
    'stretchItems.wristRelease.description',
    'timeline.wristReleaseCompleted',
    40,
    'hand-left-outline',
    'warning',
    2,
    true
  ),
  (
    'desk-back-stretch',
    'stretchItems.deskBackStretch.title',
    'stretchItems.deskBackStretch.target',
    'stretchItems.deskBackStretch.duration',
    'stretchItems.deskBackStretch.description',
    'timeline.deskBackStretchCompleted',
    90,
    'accessibility-outline',
    'error',
    3,
    true
  )
on conflict (id) do update
set
  title_key = excluded.title_key,
  target_key = excluded.target_key,
  duration_key = excluded.duration_key,
  description_key = excluded.description_key,
  completion_label_key = excluded.completion_label_key,
  duration_seconds = excluded.duration_seconds,
  icon = excluded.icon,
  tone = excluded.tone,
  position = excluded.position,
  is_active = excluded.is_active,
  updated_at = now();

alter table public.move_alert_activity_templates enable row level security;

drop policy if exists "Authenticated users can read activity templates"
  on public.move_alert_activity_templates;
create policy "Authenticated users can read activity templates"
  on public.move_alert_activity_templates
  for select
  to authenticated
  using (is_active);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'move_alert_completed_stretches_stretch_id_fkey'
      and conrelid = 'public.move_alert_completed_stretches'::regclass
  ) then
    alter table public.move_alert_completed_stretches
      add constraint move_alert_completed_stretches_stretch_id_fkey
      foreign key (stretch_id)
      references public.move_alert_activity_templates (id)
      on update cascade
      on delete restrict;
  end if;
end;
$$;

drop trigger if exists set_move_alert_activity_templates_updated_at
  on public.move_alert_activity_templates;
create trigger set_move_alert_activity_templates_updated_at
  before update on public.move_alert_activity_templates
  for each row
  execute function public.set_move_alert_updated_at();

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
      and pr.prrelid = 'public.move_alert_activity_templates'::regclass
  ) then
    alter publication supabase_realtime add table public.move_alert_activity_templates;
  end if;
end;
$$;

notify pgrst, 'reload schema';
