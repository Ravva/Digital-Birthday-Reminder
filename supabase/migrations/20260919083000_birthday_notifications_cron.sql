-- Daily birthday notifications via pg_cron -> Edge Function.
-- Schedule '30 5 * * *' runs at 05:30 UTC = 08:30 MSK (MSK is UTC+3 year-round).
--
-- REQUIRED SETUP (run once via SQL Editor, NOT committed - secrets stay in Vault):
--   select vault.create_secret('https://abzpkoyyxxkduvovsmvx.supabase.co/functions/v1/send-birthday-notifications', 'birthday_function_url');
--   select vault.create_secret('<SUPABASE_SERVICE_ROLE_KEY>', 'birthday_service_role_key');
-- If a secret already exists, update it instead:
--   update vault.secrets set secret = '<new-value>' where name = 'birthday_function_url';
--
-- Verify: select * from cron.job; select * from cron.job_run_details order by start_time desc limit 5;

create extension if not exists "pg_cron" with schema "pg_catalog";

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create extension if not exists "pg_net" with schema "extensions";

select cron.unschedule(jobid) from cron.job where jobname = 'birthday-notifications-daily';

select cron.schedule(
  'birthday-notifications-daily',
  '30 5 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'birthday_function_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'birthday_service_role_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
