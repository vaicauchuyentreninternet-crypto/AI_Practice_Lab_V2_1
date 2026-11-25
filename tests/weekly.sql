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

\ir ../supabase/001_progress.sql
\ir ../supabase/003_weekly_timer.sql

insert into auth.users values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003');
grant usage on schema auth to authenticated;
select set_config('test.uid','00000000-0000-0000-0000-000000000001',false);

do $$
declare deadline timestamptz;
begin
 assert jsonb_array_length(public.weekly_status()->'questions')=0;
 deadline:=public.weekly_start();
 assert deadline between clock_timestamp() and clock_timestamp()+interval '45 minutes';
 assert deadline=public.weekly_start();
 assert jsonb_array_length(public.weekly_status()->'questions')=5;
end $$;

\ir ../supabase/004_weekly_length.sql

do $$
declare w date:=apl_weekly.monday(); good jsonb; s jsonb;
begin
 assert apl_weekly.size(w)=5;
 assert apl_weekly.size(w+7)=20;
 assert (select count(*) from (select left(id,1) from apl_weekly.paper(w+7)
   group by 1 having count(*)=5) balanced)=4;
 assert (public.weekly_status()->>'total')::int=5;
 select jsonb_object_agg(id,answer) into good from apl_weekly.paper(w);
 assert public.weekly_submit(w,good)=5;

 perform set_config('test.uid','00000000-0000-0000-0000-000000000002',true);
 perform public.weekly_start();
 update apl_weekly.starts set deadline=clock_timestamp()-interval '1 second'
   where week=w and student=auth.uid();
 s:=public.weekly_status();
 assert jsonb_array_length(s->'questions')=0 and (s->>'mine') is null;
 assert not (s->'leaders'->0 ?| array['student','user_id','email','id']);
 begin
   perform public.weekly_submit(w,good);
   raise exception 'accepted expired submission' using errcode='XX000';
 exception when raise_exception then null; end;

 perform set_config('test.uid','00000000-0000-0000-0000-000000000003',true);
 delete from apl_weekly.short_weeks where week=w;
 perform public.weekly_start();
 s:=public.weekly_status();
 assert (s->>'total')::int=20 and jsonb_array_length(s->'questions')=20;
 assert not (s->'questions'->0 ? 'answer');
 select jsonb_object_agg(id,answer) into good from apl_weekly.paper(w);
 assert public.weekly_submit(w,good)=20;
end $$;

set role authenticated;
select set_config('test.uid','00000000-0000-0000-0000-000000000001',false);
insert into public.student_progress values (auth.uid(),1,'{}');
select set_config('test.uid','00000000-0000-0000-0000-000000000002',false);
insert into public.student_progress values (auth.uid(),1,'{}');
do $$
begin
 assert (select count(*) from public.student_progress)=1;
 assert (select user_id from public.student_progress)=auth.uid();
 update public.student_progress set revision=2
   where user_id='00000000-0000-0000-0000-000000000001';
 assert not found;
 assert not has_schema_privilege(current_user,'apl_weekly','usage');
 assert not has_table_privilege('anon','public.student_progress','select');
end $$;
reset role;
