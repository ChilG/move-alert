alter table public.move_alert_settings
  add column if not exists next_reminder_at timestamptz;

notify pgrst, 'reload schema';
