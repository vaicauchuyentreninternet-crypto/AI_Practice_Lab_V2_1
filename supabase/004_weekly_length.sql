begin;
lock table apl_weekly.starts,apl_weekly.entries in share row exclusive mode;
create table if not exists apl_weekly.short_weeks(week date primary key);
insert into apl_weekly.short_weeks select week from apl_weekly.starts union select week from apl_weekly.entries on conflict do nothing;
create or replace function apl_weekly.size(w date) returns int language sql stable as $$
 select case when exists(select 1 from apl_weekly.short_weeks where week=w) then 5 else 20 end
$$;
create or replace function apl_weekly.paper(w date) returns setof apl_weekly.questions language sql stable as $$
 select q from (select q,row_number() over(partition by left(q.id,1) order by md5(w::text||q.id),q.id) as pos from apl_weekly.questions q) t
 order by case when apl_weekly.size(w)=20 then pos else 0 end,md5(w::text||(q).id),(q).id limit apl_weekly.size(w)
$$;
create or replace function apl_weekly.weekly_submit(w date, answers jsonb) returns int language plpgsql security definer set search_path='' as $$
declare score int; valid int;
begin
 if auth.uid() is null or w is distinct from apl_weekly.monday() then raise exception 'Tuần thi hoặc phiên đăng nhập đã thay đổi'; end if;
 if jsonb_typeof(answers) is distinct from 'object' then raise exception 'Đáp án không hợp lệ'; end if;
 select count(*) filter(where exists(select 1 from generate_series(0,jsonb_array_length(q.options)-1) i where answers->q.id=to_jsonb(i))),
 count(*) filter(where answers->q.id=to_jsonb(q.answer)) into valid,score from apl_weekly.paper(w) q;
 if valid<>apl_weekly.size(w) or (select count(*) from jsonb_object_keys(answers))<>apl_weekly.size(w) then raise exception 'Cần trả lời đúng định dạng tất cả câu'; end if;
 insert into apl_weekly.entries(week,student,points) values(w,auth.uid(),score) on conflict do nothing;
 select points into score from apl_weekly.entries where week=w and student=auth.uid();
 return score;
end $$;
create or replace function public.weekly_status() returns jsonb language sql stable security definer set search_path='' as $$
 select (s-'questions') || jsonb_build_object('total',apl_weekly.size(apl_weekly.monday()),'deadline',d,'now',now(),'questions',case when d>now() then s->'questions' else '[]'::jsonb end)
 from apl_weekly.weekly_status() s left join lateral
 (select deadline as d from apl_weekly.starts where week=apl_weekly.monday() and student=auth.uid()) a on true
$$;
commit;
