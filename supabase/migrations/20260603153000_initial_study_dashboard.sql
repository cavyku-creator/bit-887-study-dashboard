create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subject text not null check (subject in ('math', 'english', 'politics', 'professional_887')),
  title text not null,
  material text,
  chapter text,
  estimated_minutes integer not null default 30 check (estimated_minutes > 0),
  date date not null,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done', 'skipped')),
  mode text not null default 'standard' check (mode in ('standard', 'minimum'))
);

create table public.math_errors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text,
  chapter text not null,
  problem_no text,
  error_type text not null check (error_type in ('concept', 'formula', 'calculation', 'no_idea')),
  note text,
  next_review_date date,
  mastered boolean not null default false
);

create table public.knowledge_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  module text not null check (module in ('semiconductor_physics', 'semiconductor_process', 'electronics')),
  front text not null,
  back text not null,
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  next_review_date date,
  mastered boolean not null default false
);

create table public.english_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null check (type in ('word', 'sentence')),
  content text not null,
  explanation text,
  example text,
  mistake_reason text,
  review_count integer not null default 0 check (review_count >= 0)
);

create table public.camp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  course text not null,
  teacher_progress text,
  understanding integer not null default 3 check (understanding between 1 and 5),
  homework text,
  unclear_points text[],
  tomorrow_priority text
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  type text not null check (type in ('daily', 'weekly')),
  completed text,
  unfinished text,
  reason text,
  tomorrow_priority text,
  weekly_problem text,
  next_adjustment text
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subject text not null check (subject in ('math', 'english', 'politics', 'professional_887')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  minutes integer not null default 0 check (minutes >= 0),
  note text
);

create index profiles_user_id_idx on public.profiles(user_id);
create index tasks_user_date_idx on public.tasks(user_id, date);
create index tasks_user_subject_idx on public.tasks(user_id, subject);
create index math_errors_user_review_idx on public.math_errors(user_id, next_review_date);
create index knowledge_cards_user_review_idx on public.knowledge_cards(user_id, next_review_date);
create index english_items_user_type_idx on public.english_items(user_id, type);
create index camp_logs_user_date_idx on public.camp_logs(user_id, date);
create index reviews_user_date_idx on public.reviews(user_id, date);
create index study_sessions_user_started_idx on public.study_sessions(user_id, started_at);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger set_math_errors_updated_at before update on public.math_errors for each row execute function public.set_updated_at();
create trigger set_knowledge_cards_updated_at before update on public.knowledge_cards for each row execute function public.set_updated_at();
create trigger set_english_items_updated_at before update on public.english_items for each row execute function public.set_updated_at();
create trigger set_camp_logs_updated_at before update on public.camp_logs for each row execute function public.set_updated_at();
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger set_study_sessions_updated_at before update on public.study_sessions for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.math_errors enable row level security;
alter table public.knowledge_cards enable row level security;
alter table public.english_items enable row level security;
alter table public.camp_logs enable row level security;
alter table public.reviews enable row level security;
alter table public.study_sessions enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.math_errors to authenticated;
grant select, insert, update, delete on public.knowledge_cards to authenticated;
grant select, insert, update, delete on public.english_items to authenticated;
grant select, insert, update, delete on public.camp_logs to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "tasks_select_own" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "math_errors_select_own" on public.math_errors
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "math_errors_insert_own" on public.math_errors
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "math_errors_update_own" on public.math_errors
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "math_errors_delete_own" on public.math_errors
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "knowledge_cards_select_own" on public.knowledge_cards
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "knowledge_cards_insert_own" on public.knowledge_cards
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "knowledge_cards_update_own" on public.knowledge_cards
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "knowledge_cards_delete_own" on public.knowledge_cards
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "english_items_select_own" on public.english_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "english_items_insert_own" on public.english_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "english_items_update_own" on public.english_items
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "english_items_delete_own" on public.english_items
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "camp_logs_select_own" on public.camp_logs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "camp_logs_insert_own" on public.camp_logs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "camp_logs_update_own" on public.camp_logs
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "camp_logs_delete_own" on public.camp_logs
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "reviews_select_own" on public.reviews
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "reviews_update_own" on public.reviews
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "study_sessions_select_own" on public.study_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "study_sessions_insert_own" on public.study_sessions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "study_sessions_update_own" on public.study_sessions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_sessions_delete_own" on public.study_sessions
  for delete to authenticated using ((select auth.uid()) = user_id);
