import type { EnglishDailyStat, Task, TaskStatus } from "./types";

const DAY_MS = 86_400_000;

export type DateRange = {
  from: string;
  to: string;
};

export type VocabularySummary = {
  totalNewWords: number;
  totalReviewedWords: number;
  totalStudyMinutes: number;
  averageAccuracy: number | null;
  checkInDays: number;
  streakDays: number;
  currentWeekNewWords: number;
  currentWeekReviewedWords: number;
  currentMonthNewWords: number;
  currentMonthReviewedWords: number;
  targetHitDays: number;
};

export type TaskCompletionSummary = {
  total: number;
  done: number;
  skipped: number;
  active: number;
  completionRate: number;
};

export function addDays(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getWeekStart(dateISO: string) {
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export function getWeekEnd(dateISO: string) {
  return addDays(getWeekStart(dateISO), 6);
}

export function getMonthStart(dateISO: string) {
  return `${dateISO.slice(0, 7)}-01`;
}

export function isWithinDateRange(dateISO: string, range: DateRange) {
  return dateISO >= range.from && dateISO <= range.to;
}

export function calculateStreak(
  dates: string[],
  todayISO: string,
  options: { allowTodayMissing?: boolean } = {}
) {
  const doneDates = new Set(dates);
  let cursor = todayISO;
  let streak = 0;

  if (options.allowTodayMissing && !doneDates.has(cursor)) {
    cursor = addDays(cursor, -1);
  }

  while (doneDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function summarizeTasks(tasks: Pick<Task, "status">[]): TaskCompletionSummary {
  const total = tasks.length;
  const skipped = tasks.filter((task) => task.status === "skipped").length;
  const active = total - skipped;
  const done = tasks.filter((task) => task.status === "done").length;

  return {
    total,
    done,
    skipped,
    active,
    completionRate: active === 0 ? 0 : Math.round((done / active) * 100)
  };
}

export function summarizeVocabularyStats(stats: EnglishDailyStat[], todayISO: string): VocabularySummary {
  const weekStart = getWeekStart(todayISO);
  const monthStart = getMonthStart(todayISO);
  const checkInDates = stats
    .filter((stat) => isVocabularyCheckIn(stat))
    .map((stat) => stat.date);
  const accuracyValues = stats
    .map((stat) => stat.accuracy)
    .filter((accuracy): accuracy is number => accuracy !== null);

  return {
    totalNewWords: sumBy(stats, "new_words"),
    totalReviewedWords: sumBy(stats, "reviewed_words"),
    totalStudyMinutes: sumBy(stats, "study_minutes"),
    averageAccuracy: accuracyValues.length === 0 ? null : roundToOne(accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length),
    checkInDays: new Set(checkInDates).size,
    streakDays: calculateStreak(checkInDates, todayISO, { allowTodayMissing: true }),
    currentWeekNewWords: sumByDateRange(stats, "new_words", { from: weekStart, to: todayISO }),
    currentWeekReviewedWords: sumByDateRange(stats, "reviewed_words", { from: weekStart, to: todayISO }),
    currentMonthNewWords: sumByDateRange(stats, "new_words", { from: monthStart, to: todayISO }),
    currentMonthReviewedWords: sumByDateRange(stats, "reviewed_words", { from: monthStart, to: todayISO }),
    targetHitDays: stats.filter(hasHitDailyVocabularyTarget).length
  };
}

export function groupVocabularyStatsByDate(stats: EnglishDailyStat[]) {
  return stats.reduce<Record<string, EnglishDailyStat[]>>((groups, stat) => {
    groups[stat.date] = [...(groups[stat.date] ?? []), stat];
    return groups;
  }, {});
}

export function fillVocabularySeries(stats: EnglishDailyStat[], range: DateRange) {
  const groups = groupVocabularyStatsByDate(stats);
  const series: Array<{ date: string; new_words: number; reviewed_words: number; study_minutes: number }> = [];
  const days = Math.max(0, Math.round((new Date(range.to).getTime() - new Date(range.from).getTime()) / DAY_MS));

  for (let index = 0; index <= days; index += 1) {
    const date = addDays(range.from, index);
    const rows = groups[date] ?? [];
    series.push({
      date,
      new_words: sumBy(rows, "new_words"),
      reviewed_words: sumBy(rows, "reviewed_words"),
      study_minutes: sumBy(rows, "study_minutes")
    });
  }

  return series;
}

export function hasHitDailyVocabularyTarget(stat: EnglishDailyStat) {
  const newWordsTargetHit = stat.target_new_words === null || stat.new_words >= stat.target_new_words;
  const reviewedTargetHit = stat.target_reviewed_words === null || stat.reviewed_words >= stat.target_reviewed_words;
  return stat.check_in_status === "done" && newWordsTargetHit && reviewedTargetHit;
}

export function isVocabularyCheckIn(stat: Pick<EnglishDailyStat, "check_in_status" | "new_words" | "reviewed_words" | "study_minutes">) {
  if (stat.check_in_status === "missed") return false;
  return stat.new_words > 0 || stat.reviewed_words > 0 || stat.study_minutes > 0 || stat.check_in_status === "done";
}

export function countByStatus<T extends { status: TaskStatus }>(items: T[]) {
  return items.reduce<Record<TaskStatus, number>>(
    (counts, item) => ({
      ...counts,
      [item.status]: counts[item.status] + 1
    }),
    { todo: 0, doing: 0, done: 0, skipped: 0 }
  );
}

function sumBy<T extends Record<TKey, number>, TKey extends string>(rows: T[], key: TKey) {
  return rows.reduce((sum, row) => sum + row[key], 0);
}

function sumByDateRange<TKey extends "new_words" | "reviewed_words" | "study_minutes">(stats: EnglishDailyStat[], key: TKey, range: DateRange) {
  return sumBy(stats.filter((stat) => isWithinDateRange(stat.date, range)), key);
}

function roundToOne(value: number) {
  return Math.round(value * 10) / 10;
}
