do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'move_alert_settings_interval_minutes_check'
      and conrelid = 'public.move_alert_settings'::regclass
  ) then
    alter table public.move_alert_settings
      drop constraint move_alert_settings_interval_minutes_check;
  end if;
end;
$$;

alter table public.move_alert_settings
  add constraint move_alert_settings_interval_minutes_check
  check (interval_minutes >= 10 and interval_minutes <= 300);

notify pgrst, 'reload schema';
