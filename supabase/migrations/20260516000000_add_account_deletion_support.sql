create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  locale text,
  note text,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'rejected')
  )
);

alter table public.account_deletion_requests enable row level security;

revoke all on public.account_deletion_requests from anon, authenticated;
grant insert on public.account_deletion_requests to anon, authenticated;

drop policy if exists "Anyone can create account deletion requests"
  on public.account_deletion_requests;

create policy "Anyone can create account deletion requests"
  on public.account_deletion_requests
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    raise exception 'Authentication required to delete account.';
  end if;

  delete from auth.users
  where id = requester_id;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

notify pgrst, 'reload schema';
