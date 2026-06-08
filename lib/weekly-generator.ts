import { foundationPhases, weeklyCadence } from "./plan";
import { addDays, getWeekEnd, getWeekStart } from "./stats";
import type { JsonValue, Subject, WeeklyTask } from "./types";

export type WeeklyGeneratorPreferences = {
  phase_code?: string;
  minutes_by_subject?: Partial<Record<Subject, number>>;
  disabled_subjects?: Subject[];
  extra_focus?: Partial<Record<Subject, string[]>>;
};

export type GeneratedWeeklyTask = Pick<
  WeeklyTask,
  | "week_start_date"
  | "subject"
  | "title"
  | "description"
  | "source_type"
  | "phase_code"
  | "status"
  | "priority"
  | "estimated_minutes"
  | "planned_sessions"
  | "due_date"
  | "generated_batch_id"
  | "metadata"
>;

type WeeklyTemplate = {
  subject: Subject;
  title: string;
  description: string;
  priority: number;
  estimated_minutes: number;
  planned_sessions: number;
  dueOffset: number;
};

const defaultWeeklyTemplates: WeeklyTemplate[] = [
  {
    subject: "math",
    title: "数学一基础推进与错题回看",
    description: "围绕当前阶段完成一个主干小节、基础题训练和错题归因。",
    priority: 1,
    estimated_minutes: 300,
    planned_sessions: 4,
    dueOffset: 5
  },
  {
    subject: "english",
    title: "英语词汇循环与长难句训练",
    description: "保持新词、复习、长难句或阅读精读的稳定闭环。",
    priority: 2,
    estimated_minutes: 210,
    planned_sessions: 5,
    dueOffset: 6
  },
  {
    subject: "professional_887",
    title: "887 主线知识卡片与基础题",
    description: "电子技术基础和半导体物理轮换推进，每次产出卡片或基础计算。",
    priority: 1,
    estimated_minutes: 300,
    planned_sessions: 4,
    dueOffset: 5
  },
  {
    subject: "politics",
    title: "政治低负荷概念维护",
    description: "基础阶段只做保底概念轻扫，为暑期后加量预留入口。",
    priority: 5,
    estimated_minutes: 60,
    planned_sessions: 2,
    dueOffset: 6
  }
];

export function generateWeeklyTasks(input: {
  dateISO: string;
  preferences?: WeeklyGeneratorPreferences | null;
  generatedBatchId?: string | null;
}): GeneratedWeeklyTask[] {
  const weekStart = getWeekStart(input.dateISO);
  const weekEnd = getWeekEnd(input.dateISO);
  const phase = getPhaseForDate(input.dateISO);
  const disabledSubjects = new Set(input.preferences?.disabled_subjects ?? []);

  return defaultWeeklyTemplates
    .filter((template) => !disabledSubjects.has(template.subject))
    .map((template) => {
      const extraFocus = input.preferences?.extra_focus?.[template.subject] ?? [];
      const estimatedMinutes = input.preferences?.minutes_by_subject?.[template.subject] ?? template.estimated_minutes;
      return {
        week_start_date: weekStart,
        subject: template.subject,
        title: template.title,
        description: buildDescription(template.description, phase?.goal, extraFocus),
        source_type: "auto",
        phase_code: input.preferences?.phase_code ?? phase?.title ?? "foundation",
        status: "todo",
        priority: template.priority,
        estimated_minutes: estimatedMinutes,
        planned_sessions: template.planned_sessions,
        due_date: addDays(weekStart, template.dueOffset > 6 ? 6 : template.dueOffset),
        generated_batch_id: input.generatedBatchId ?? null,
        metadata: {
          phase_title: phase?.title ?? null,
          phase_checkpoints: phase?.checkpoints ?? [],
          week_end_date: weekEnd,
          cadence: weeklyCadence
        } satisfies Record<string, JsonValue>
      };
    });
}

export function getPhaseForDate(dateISO: string) {
  return foundationPhases.find((phase) => dateISO >= phase.start && dateISO <= phase.end) ?? foundationPhases[0];
}

export function buildWeeklyTaskKey(task: Pick<GeneratedWeeklyTask, "week_start_date" | "subject" | "title">) {
  return `${task.week_start_date}:${task.subject}:${task.title}`;
}

function buildDescription(base: string, phaseGoal?: string, extraFocus: string[] = []) {
  const parts = [base, phaseGoal ? `阶段目标：${phaseGoal}` : null, extraFocus.length > 0 ? `本周重点：${extraFocus.join("；")}` : null];
  return parts.filter(Boolean).join("\n\n");
}
