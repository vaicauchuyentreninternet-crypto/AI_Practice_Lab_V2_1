-- Disposable PostgreSQL database only. Simulates two authenticated identities.
create role anon;
create role authenticated;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
\ir ../supabase/002_weekly.sql
begin;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
select set_config('test.uid','00000000-0000-0000-0000-000000000001',true);
do $$
declare w date:=apl_weekly.monday(); good jsonb; bad jsonb; s jsonb;
begin
 select jsonb_object_agg(id,answer),jsonb_object_agg(id,(answer+1)%jsonb_array_length(options)) into good,bad from apl_weekly.paper(w);
 assert not has_function_privilege('anon','public.weekly_submit(date,jsonb)','execute');
 assert not has_schema_privilege('authenticated','apl_weekly','usage');
 assert jsonb_array_length(public.weekly_status()->'questions')=5;
 assert not ((public.weekly_status()->'questions'->0) ? 'answer');
 begin perform public.weekly_submit(w-7,good);raise exception 'accepted stale week' using errcode='XX000';exception when raise_exception then null;end;
 begin perform public.weekly_submit(w,'{}');raise exception 'accepted missing answers' using errcode='XX000';exception when raise_exception then null;end;
 assert public.weekly_submit(w,good)=5;
 assert public.weekly_submit(w,bad)=5;
 perform set_config('test.uid','00000000-0000-0000-0000-000000000002',true);
 assert (public.weekly_status()->>'mine') is null;
 assert public.weekly_submit(w,good)=5;
 s:=public.weekly_status();
 assert jsonb_array_length(s->'leaders')=2 and s->'leaders'->1->>'rank'='1';
end $$;
rollback;
