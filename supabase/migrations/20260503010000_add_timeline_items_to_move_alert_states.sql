alter table public.move_alert_states
  add column if not exists timeline_items jsonb;

alter table public.move_alert_states
  alter column timeline_items drop default;

update public.move_alert_states
set timeline_items = '[]'::jsonb
where timeline_items is null;

alter table public.move_alert_states
  alter column timeline_items set not null;

alter table public.move_alert_states
  add constraint move_alert_states_timeline_items_is_array
  check (jsonb_typeof(timeline_items) = 'array');

notify pgrst, 'reload schema';
