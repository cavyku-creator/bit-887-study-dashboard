"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Field, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { subjects, taskStatuses } from "@/lib/labels";
import type { Subject, TaskStatus, WeeklyTask } from "@/lib/types";
import type { WeeklyTaskDraft } from "@/lib/use-weekly-tasks";

type WeeklyTaskEditorDraft = {
  week_start_date: string;
  subject: Subject;
  title: string;
  description: string;
  priority: number;
  estimated_minutes: number;
  planned_sessions: number;
  due_date: string;
  phase_code: string;
  status: TaskStatus;
};

export function WeeklyTaskEditor({
  weekStart,
  initialTask,
  onCancel,
  onSubmit
}: {
  weekStart: string;
  initialTask?: WeeklyTask | null;
  onCancel: () => void;
  onSubmit: (payload: WeeklyTaskDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<WeeklyTaskEditorDraft>(() => toDraft(weekStart, initialTask));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(toDraft(weekStart, initialTask));
  }, [initialTask, weekStart]);

  async function submit() {
    if (!draft.title.trim()) return;
    setSaving(true);
    await onSubmit({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      due_date: draft.due_date || null,
      estimated_minutes: Number(draft.estimated_minutes),
      planned_sessions: Number(draft.planned_sessions),
      priority: Number(draft.priority)
    });
    setSaving(false);
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{initialTask ? "编辑周任务" : "新增周任务"}</h2>
          <p className="mt-1 text-sm text-muted">周任务是计划层，必要时再转成今天的执行任务。</p>
        </div>
        <button className={ghostButtonClass} onClick={onCancel} type="button">
          <X className="h-4 w-4" />
          关闭
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="周起始日期">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, week_start_date: event.target.value })} type="date" value={draft.week_start_date} />
        </Field>
        <Field label="科目">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, subject: event.target.value as Subject })} value={draft.subject}>
            {Object.entries(subjects).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="标题">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, title: event.target.value })} value={draft.title} />
        </Field>
        <Field label="阶段">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, phase_code: event.target.value })} value={draft.phase_code} />
        </Field>
        <Field label="优先级">
          <input className={inputClass} max={5} min={1} onChange={(event) => setDraft({ ...draft, priority: Number(event.target.value) })} type="number" value={draft.priority} />
        </Field>
        <Field label="预计分钟">
          <input className={inputClass} min={1} onChange={(event) => setDraft({ ...draft, estimated_minutes: Number(event.target.value) })} type="number" value={draft.estimated_minutes} />
        </Field>
        <Field label="计划次数">
          <input className={inputClass} min={1} onChange={(event) => setDraft({ ...draft, planned_sessions: Number(event.target.value) })} type="number" value={draft.planned_sessions} />
        </Field>
        <Field label="截止日期">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, due_date: event.target.value })} type="date" value={draft.due_date} />
        </Field>
        <Field label="状态">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })} value={draft.status}>
            {Object.entries(taskStatuses).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="描述">
            <textarea className={inputClass} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} value={draft.description} />
          </Field>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className={buttonClass} disabled={saving || !draft.title.trim()} onClick={submit} type="button">
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存"}
        </button>
        <button className={ghostButtonClass} onClick={onCancel} type="button">取消</button>
      </div>
    </div>
  );
}

function toDraft(weekStart: string, task?: WeeklyTask | null): WeeklyTaskEditorDraft {
  return {
    week_start_date: task?.week_start_date ?? weekStart,
    subject: task?.subject ?? "math",
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? 3,
    estimated_minutes: task?.estimated_minutes ?? 60,
    planned_sessions: task?.planned_sessions ?? 1,
    due_date: task?.due_date ?? "",
    phase_code: task?.phase_code ?? "foundation",
    status: task?.status ?? "todo"
  };
}
