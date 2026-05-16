create table if not exists public.deleted_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  deleted_at timestamptz not null default now(),
  source text not null default 'app' check (source in ('app', 'admin'))
);

alter table public.deleted_accounts enable row level security;

revoke all on public.deleted_accounts from anon, authenticated;
grant select on public.deleted_accounts to authenticated;

drop policy if exists "Users can read their own deleted account status"
  on public.deleted_accounts;

create policy "Users can read their own deleted account status"
  on public.deleted_accounts
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.soft_delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester_id uuid := auth.uid();
  requester_email text;
begin
  if requester_id is null then
    raise exception 'Authentication required to delete account.';
  end if;

  select email
  into requester_email
  from auth.users
  where id = requester_id;

  if requester_email is null then
    raise exception 'Unable to locate account email for deletion.';
  end if;

  insert into public.deleted_accounts (user_id, email, source)
  values (requester_id, requester_email, 'app')
  on conflict (user_id) do update
  set
    email = excluded.email,
    deleted_at = now(),
    source = excluded.source;
end;
$$;

revoke all on function public.soft_delete_my_account() from public;
grant execute on function public.soft_delete_my_account() to authenticated;

notify pgrst, 'reload schema';
