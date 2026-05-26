create table if not exists public.app_update_policies (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('android', 'ios')),
  minimum_supported_version text not null default '0.0.0' check (minimum_supported_version ~ '^\d+\.\d+\.\d+$'),
  latest_version text not null default '0.0.0' check (latest_version ~ '^\d+\.\d+\.\d+$'),
  force_update boolean not null default false,
  store_url text not null,
  message_th text,
  message_en text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_update_policies_platform_active_updated_at_idx
  on public.app_update_policies (platform, is_active, updated_at desc);

alter table public.app_update_policies enable row level security;

drop policy if exists "Anyone can read active app update policies" on public.app_update_policies;

create policy "Anyone can read active app update policies"
  on public.app_update_policies
  for select
  to anon, authenticated
  using (is_active);
