alter table public.english_daily_stats
  add column if not exists target_new_words integer check (target_new_words is null or target_new_words >= 0),
  add column if not exists target_reviewed_words integer check (target_reviewed_words is null or target_reviewed_words >= 0),
  add column if not exists check_in_status text not null default 'done' check (check_in_status in ('done', 'partial', 'missed'));

create unique index if not exists english_daily_stats_user_date_app_unique
  on public.english_daily_stats(user_id, date, app_name);
