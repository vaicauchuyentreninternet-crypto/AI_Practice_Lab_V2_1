begin;
lock table apl_weekly.starts, apl_weekly.entries in share row exclusive mode;
create table apl_weekly.legacy_weeks(week date primary key);
insert into apl_weekly.legacy_weeks select week from apl_weekly.starts union select week from apl_weekly.entries;
create table apl_weekly.essays(week date,student uuid,body text not null, rubric smallint[],primary key(week,student),
 foreign key(week,student) references apl_weekly.entries on delete cascade,
 check(rubric is null or (array_length(rubric,1)=4 and array_position(rubric,null) is null and 0<=all(rubric) and 2>=all(rubric))));
alter function public.weekly_submit(date,jsonb) rename to weekly_legacy_submit;
revoke all on function public.weekly_legacy_submit(date,jsonb) from public,anon,authenticated;
create function public.weekly_submit(w date,answers jsonb) returns int language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from apl_weekly.legacy_weeks where week=w) then raise exception 'Cần nộp cả bài tự luận'; end if;
 return public.weekly_legacy_submit(w,answers);
end $$;
create function public.weekly_submit_mixed(w date,answers jsonb,body text) returns int language plpgsql security definer set search_path='' as $$
declare objective int;
begin
 if w is distinct from apl_weekly.monday() or exists(select 1 from apl_weekly.legacy_weeks where week=w) or body is null or length(body)>12000 then raise exception 'Bài nộp không hợp lệ'; end if;
 objective:=public.weekly_legacy_submit(w,answers);
 insert into apl_weekly.essays values(w,auth.uid(),body,null) on conflict do nothing;
 return objective;
end $$;
alter function public.weekly_status() rename to weekly_before_essay;
revoke all on function public.weekly_before_essay() from public,anon,authenticated;
create function public.weekly_status() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare s jsonb:=public.weekly_before_essay(); w date:=apl_weekly.monday(); mine_record record; leaders jsonb;
begin
 if exists(select 1 from apl_weekly.legacy_weeks where week=w) then return s; end if;
 select e.points*90.0/apl_weekly.size(w) as objective,(select sum(x)*10.0/8 from unnest(r.rubric)x) as subjective into mine_record from apl_weekly.entries e join apl_weekly.essays r using(week,student) where e.week=w and e.student=auth.uid();
 select coalesce(jsonb_agg(to_jsonb(t) order by points desc,alias),'[]') into leaders from
 (select alias,points,rank() over(order by points desc) rank from
 (select e.alias,e.points*90.0/apl_weekly.size(w)+(select sum(x)*10.0/8 from unnest(r.rubric)x) points from apl_weekly.entries e join apl_weekly.essays r using(week,student) where e.week=w and r.rubric is not null) scores order by points desc,alias limit 10)t;
 return s||jsonb_build_object('mixed',true,'leaders',leaders,'objective',mine_record.objective,'subjective',mine_record.subjective);
end $$;
revoke all on function public.weekly_submit(date,jsonb),public.weekly_submit_mixed(date,jsonb,text),public.weekly_status() from public,anon,authenticated;
grant execute on function public.weekly_submit(date,jsonb),public.weekly_submit_mixed(date,jsonb,text) to authenticated;
grant execute on function public.weekly_status() to authenticated,anon;
commit;
