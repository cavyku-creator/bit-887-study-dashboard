"use client";

import { useMemo } from "react";
import { buildWeeklyTaskKey, generateWeeklyTasks, type WeeklyGeneratorPreferences } from "./weekly-generator";
import { getWeekEnd, getWeekStart } from "./stats";
import { useTable } from "./use-table";
import type { Task, WeeklyTask } from "./types";

export type WeeklyTaskDraft = Pick<
  WeeklyTask,
  "week_start_date" | "subject" | "title" | "description" | "priority" | "estimated_minutes" | "planned_sessions" | "due_date" | "phase_code"
> &
  Partial<Pick<WeeklyTask, "source_type" | "status" | "generated_batch_id" | "metadata">>;

export function useWeeklyTasks(dateISO: string, options: { subject?: WeeklyTask["subject"] | "all" } = {}) {
  const weekStart = getWeekStart(dateISO);
  const weekEnd = getWeekEnd(dateISO);
  const filters = useMemo(
    () => [
      { column: "week_start_date", value: weekStart },
      { column: "subject", value: options.subject === "all" ? "" : options.subject }
    ],
    [options.subject, weekStart]
  );

  const weeklyTasks = useTable("weekly_tasks", {
    filters,
    orderBy: "priority",
    ascending: true
  });

  const links = useTable("weekly_task_task_links", {
    orderBy: "created_at",
    ascending: false,
    limit: 200
  });

  const taskIdsByWeeklyTaskId = useMemo(
    () =>
      links.rows.reduce<Record<string, string[]>>((groups, link) => {
        groups[link.weekly_task_id] = [...(groups[link.weekly_task_id] ?? []), link.task_id];
        return groups;
      }, {}),
    [links.rows]
  );

  function previewGenerated(preferences?: WeeklyGeneratorPreferences | null) {
    const existingKeys = new Set(weeklyTasks.rows.map(buildWeeklyTaskKey));
    return generateWeeklyTasks({ dateISO, preferences }).filter((task) => !existingKeys.has(buildWeeklyTaskKey(task)));
  }

  async function addWeeklyTask(payload: WeeklyTaskDraft) {
    return weeklyTasks.insert({
      ...payload,
      source_type: payload.source_type ?? "manual",
      status: payload.status ?? "todo",
      phase_code: payload.phase_code || "foundation",
      metadata: payload.metadata ?? {}
    });
  }

  async function generateForWeek(preferences?: WeeklyGeneratorPreferences | null) {
    const tasks = previewGenerated(preferences);
    for (const task of tasks) {
      const result = await weeklyTasks.insert(task);
      if (result.error) return result;
    }
    return { error: null };
  }

  async function linkDailyTask(weeklyTaskId: string, taskId: string) {
    return links.insert({ weekly_task_id: weeklyTaskId, task_id: taskId });
  }

  function buildDailyTaskDraft(weeklyTask: WeeklyTask, date = dateISO): Pick<Task, "subject" | "title" | "material" | "chapter" | "estimated_minutes" | "date" | "status" | "mode"> {
    return {
      subject: weeklyTask.subject,
      title: weeklyTask.title,
      material: "每周任务",
      chapter: weeklyTask.phase_code,
      estimated_minutes: Math.max(1, Math.round(weeklyTask.estimated_minutes / weeklyTask.planned_sessions)),
      date,
      status: "todo",
      mode: "standard"
    };
  }

  return {
    ...weeklyTasks,
    weekStart,
    weekEnd,
    links: links.rows,
    taskIdsByWeeklyTaskId,
    previewGenerated,
    generateForWeek,
    addWeeklyTask,
    linkDailyTask,
    buildDailyTaskDraft,
    reloadLinks: links.reload
  };
}
