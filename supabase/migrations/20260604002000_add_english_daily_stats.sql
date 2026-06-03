create table if not exists public.english_daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  app_name text not null default '不背单词',
  new_words integer not null default 0 check (new_words >= 0),
  reviewed_words integer not null default 0 check (reviewed_words >= 0),
  study_minutes integer not null default 0 check (study_minutes >= 0),
  accuracy numeric(5,2) check (accuracy is null or (accuracy >= 0 and accuracy <= 100)),
  note text
);

create index if not exists english_daily_stats_user_date_idx
  on public.english_daily_stats(user_id, date);

drop trigger if exists set_english_daily_stats_updated_at on public.english_daily_stats;
create trigger set_english_daily_stats_updated_at
  before update on public.english_daily_stats
  for each row execute function public.set_updated_at();

alter table public.english_daily_stats enable row level security;

grant select, insert, update, delete on public.english_daily_stats to authenticated;

drop policy if exists "english_daily_stats_select_own" on public.english_daily_stats;
drop policy if exists "english_daily_stats_insert_own" on public.english_daily_stats;
drop policy if exists "english_daily_stats_update_own" on public.english_daily_stats;
drop policy if exists "english_daily_stats_delete_own" on public.english_daily_stats;

create policy "english_daily_stats_select_own" on public.english_daily_stats
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "english_daily_stats_insert_own" on public.english_daily_stats
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "english_daily_stats_update_own" on public.english_daily_stats
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "english_daily_stats_delete_own" on public.english_daily_stats
  for delete to authenticated using ((select auth.uid()) = user_id);
