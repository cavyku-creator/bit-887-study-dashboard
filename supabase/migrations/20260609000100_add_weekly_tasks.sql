alter table public.profiles
  add column if not exists study_preferences jsonb not null default '{}'::jsonb;

create table if not exists public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  week_start_date date not null,
  subject text not null check (subject in ('math', 'english', 'politics', 'professional_887')),
  title text not null,
  description text,
  source_type text not null default 'manual' check (source_type in ('manual', 'auto')),
  phase_code text not null default 'foundation',
  status text not null default 'todo' check (status in ('todo', 'doing', 'done', 'skipped')),
  priority smallint not null default 3 check (priority between 1 and 5),
  estimated_minutes integer not null default 60 check (estimated_minutes > 0),
  planned_sessions smallint not null default 1 check (planned_sessions > 0),
  due_date date,
  generated_batch_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.weekly_task_task_links (
  weekly_task_id uuid not null references public.weekly_tasks(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (weekly_task_id, task_id)
);

create index if not exists weekly_tasks_user_week_idx
  on public.weekly_tasks(user_id, week_start_date);

create index if not exists weekly_tasks_user_week_subject_idx
  on public.weekly_tasks(user_id, week_start_date, subject);

create unique index if not exists weekly_tasks_user_week_auto_unique
  on public.weekly_tasks(user_id, week_start_date, subject, title)
  where source_type = 'auto';

create index if not exists weekly_task_task_links_user_idx
  on public.weekly_task_task_links(user_id, created_at);

drop trigger if exists set_weekly_tasks_updated_at on public.weekly_tasks;
create trigger set_weekly_tasks_updated_at
before update on public.weekly_tasks
for each row execute function public.set_updated_at();

alter table public.weekly_tasks enable row level security;
alter table public.weekly_task_task_links enable row level security;

grant select, insert, update, delete on public.weekly_tasks to authenticated;
grant select, insert, update, delete on public.weekly_task_task_links to authenticated;

drop policy if exists "weekly_tasks_select_own" on public.weekly_tasks;
drop policy if exists "weekly_tasks_insert_own" on public.weekly_tasks;
drop policy if exists "weekly_tasks_update_own" on public.weekly_tasks;
drop policy if exists "weekly_tasks_delete_own" on public.weekly_tasks;

create policy "weekly_tasks_select_own"
on public.weekly_tasks for select to authenticated
using ((select auth.uid()) = user_id);

create policy "weekly_tasks_insert_own"
on public.weekly_tasks for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "weekly_tasks_update_own"
on public.weekly_tasks for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "weekly_tasks_delete_own"
on public.weekly_tasks for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "weekly_task_task_links_select_own" on public.weekly_task_task_links;
drop policy if exists "weekly_task_task_links_insert_own" on public.weekly_task_task_links;
drop policy if exists "weekly_task_task_links_update_own" on public.weekly_task_task_links;
drop policy if exists "weekly_task_task_links_delete_own" on public.weekly_task_task_links;

create policy "weekly_task_task_links_select_own"
on public.weekly_task_task_links for select to authenticated
using ((select auth.uid()) = user_id);

create policy "weekly_task_task_links_insert_own"
on public.weekly_task_task_links for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "weekly_task_task_links_update_own"
on public.weekly_task_task_links for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "weekly_task_task_links_delete_own"
on public.weekly_task_task_links for delete to authenticated
using ((select auth.uid()) = user_id);
