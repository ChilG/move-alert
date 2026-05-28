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
