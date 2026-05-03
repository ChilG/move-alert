alter table public.move_alert_completed_stretches
  add column if not exists completed_count integer not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'move_alert_completed_stretches_completed_count_check'
      and conrelid = 'public.move_alert_completed_stretches'::regclass
  ) then
    alter table public.move_alert_completed_stretches
      add constraint move_alert_completed_stretches_completed_count_check
      check (completed_count > 0);
  end if;
end;
$$;

alter table public.move_alert_settings
  add column if not exists quiet_hours_start_time time not null default time '22:00',
  add column if not exists quiet_hours_end_time time not null default time '07:00',
  add column if not exists quiet_hours_days smallint[] not null default array[0, 1, 2, 3, 4, 5, 6]::smallint[];

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'move_alert_settings_quiet_hours_days_check'
      and conrelid = 'public.move_alert_settings'::regclass
  ) then
    alter table public.move_alert_settings
      add constraint move_alert_settings_quiet_hours_days_check
      check (
        cardinality(quiet_hours_days) > 0
        and quiet_hours_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
      );
  end if;
end;
$$;

notify pgrst, 'reload schema';
