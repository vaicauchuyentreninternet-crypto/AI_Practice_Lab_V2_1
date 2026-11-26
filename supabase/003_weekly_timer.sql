begin;
create table if not exists apl_weekly.starts(
 week date not null, student uuid references auth.users on delete cascade,
 deadline timestamptz not null, primary key(week,student)
);
create or replace function public.weekly_start() returns timestamptz language plpgsql security definer set search_path='' as $$
declare w date:=apl_weekly.monday(); d timestamptz;
begin
 if auth.uid() is null then raise exception 'Hãy đăng nhập'; end if;
 insert into apl_weekly.starts values(w,auth.uid(),least(clock_timestamp()+interval '45 minutes',(w+7)::timestamp at time zone 'Asia/Ho_Chi_Minh')) on conflict do nothing;
 select deadline into d from apl_weekly.starts where week=w and student=auth.uid();
 return d;
end $$;
alter function public.weekly_status() set schema apl_weekly;
alter function public.weekly_submit(date,jsonb) set schema apl_weekly;
create function public.weekly_status() returns jsonb language sql stable security definer set search_path='' as $$
 select (s-'questions') || jsonb_build_object('deadline',d,'now',now(),'questions',case when d>now() then s->'questions' else '[]'::jsonb end)
 from apl_weekly.weekly_status() s left join lateral
 (select deadline as d from apl_weekly.starts where week=apl_weekly.monday() and student=auth.uid()) a on true
$$;
create function public.weekly_submit(w date,answers jsonb) returns int language plpgsql security definer set search_path='' as $$
declare saved int;
begin
 select points into saved from apl_weekly.entries where week=w and student=auth.uid();
 if saved is not null then return saved; end if;
 if not exists(select 1 from apl_weekly.starts where week=w and student=auth.uid() and deadline>clock_timestamp()) then raise exception 'Chưa bắt đầu hoặc đã hết giờ'; end if;
 return apl_weekly.weekly_submit(w,answers);
end $$;
revoke all on function public.weekly_submit(date,jsonb),public.weekly_start(),public.weekly_status() from public,anon,authenticated;
grant execute on function public.weekly_status() to anon,authenticated;
grant execute on function public.weekly_submit(date,jsonb),public.weekly_start() to authenticated;
commit;
