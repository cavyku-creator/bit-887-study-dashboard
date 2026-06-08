"use client";

import { useMemo } from "react";
import { addDays, fillVocabularySeries, summarizeVocabularyStats } from "./stats";
import { todayISO } from "./date";
import { useTable } from "./use-table";
import type { EnglishDailyStat } from "./types";

export type VocabularyStatDraft = Pick<
  EnglishDailyStat,
  | "date"
  | "app_name"
  | "new_words"
  | "reviewed_words"
  | "study_minutes"
  | "accuracy"
  | "note"
  | "target_new_words"
  | "target_reviewed_words"
  | "check_in_status"
>;

export function useVocabularyStats(options: { from?: string; to?: string; appName?: string; limit?: number } = {}) {
  const today = options.to ?? todayISO();
  const from = options.from ?? addDays(today, -29);
  const filters = useMemo(
    () => [
      { column: "date", op: "gte" as const, value: options.from ?? "" },
      { column: "date", op: "lte" as const, value: today },
      { column: "app_name", value: options.appName ?? "" }
    ],
    [options.appName, options.from, today]
  );

  const table = useTable("english_daily_stats", {
    filters,
    orderBy: "date",
    ascending: false,
    limit: options.limit
  });

  const summary = useMemo(() => summarizeVocabularyStats(table.rows, today), [table.rows, today]);
  const series = useMemo(() => fillVocabularySeries(table.rows, { from, to: today }), [from, table.rows, today]);

  async function saveStat(payload: VocabularyStatDraft) {
    const existing = table.rows.find((row) => row.date === payload.date && row.app_name === payload.app_name);
    return existing ? table.update(existing.id, payload) : table.insert(payload);
  }

  return {
    ...table,
    from,
    to: today,
    summary,
    series,
    saveStat
  };
}
