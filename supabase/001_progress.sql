begin;
create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null check (revision >= 1),
  profile jsonb not null check (jsonb_typeof(profile) = 'object' and octet_length(profile::text) <= 5000000)
);
alter table public.student_progress enable row level security;
revoke all on public.student_progress from public, anon, authenticated;
grant select, insert, update on public.student_progress to authenticated;
drop policy if exists own_progress on public.student_progress;
create policy own_progress on public.student_progress to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
