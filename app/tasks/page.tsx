"use client";

import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { subjectColors, subjects, taskModes, taskStatuses } from "@/lib/labels";
import { todayISO } from "@/lib/date";
import { useTable } from "@/lib/use-table";
import type { Subject, Task, TaskMode, TaskStatus } from "@/lib/types";

type TaskDraft = Pick<Task, "subject" | "title" | "material" | "chapter" | "estimated_minutes" | "date" | "status" | "mode">;

const initialDraft: TaskDraft = {
  subject: "math",
  title: "",
  material: "",
  chapter: "",
  estimated_minutes: 45,
  date: todayISO(),
  status: "todo",
  mode: "standard"
};

export default function TasksPage() {
  return (
    <Protected>
      <TasksView />
    </Protected>
  );
}

function TasksView() {
  const [subject, setSubject] = useState<Subject | "all">("all");
  const [date, setDate] = useState(todayISO());
  const [draft, setDraft] = useState<TaskDraft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const filters = useMemo(
    () => [
      { column: "date", value: date },
      { column: "subject", value: subject === "all" ? "" : subject }
    ],
    [date, subject]
  );
  const { rows, loading, error, insert, update, remove } = useTable("tasks", { filters, orderBy: "date", ascending: true });

  function edit(row: Task) {
    setEditingId(row.id);
    setDraft({
      subject: row.subject,
      title: row.title,
      material: row.material ?? "",
      chapter: row.chapter ?? "",
      estimated_minutes: row.estimated_minutes,
      date: row.date,
      status: row.status,
      mode: row.mode
    });
  }

  async function save() {
    setMessage(null);
    if (!draft.title.trim()) {
      setMessage("任务标题不能为空。");
      return;
    }
    const payload = {
      ...draft,
      material: draft.material || null,
      chapter: draft.chapter || null,
      estimated_minutes: Number(draft.estimated_minutes)
    };
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (result.error) setMessage(result.error);
    else {
      setDraft({ ...initialDraft, date });
      setEditingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="任务管理" description="新增、编辑、删除每日任务，按科目和日期过滤。" />

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="科目筛选">
            <select className={inputClass} onChange={(event) => setSubject(event.target.value as Subject | "all")} value={subject}>
              <option value="all">全部科目</option>
              {Object.entries(subjects).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="日期筛选">
            <input className={inputClass} onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "编辑任务" : "新增任务"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="科目">
            <select className={inputClass} onChange={(event) => setDraft({ ...draft, subject: event.target.value as Subject })} value={draft.subject}>
              {Object.entries(subjects).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="标题">
            <input className={inputClass} onChange={(event) => setDraft({ ...draft, title: event.target.value })} value={draft.title} />
          </Field>
          <Field label="资料">
            <input className={inputClass} onChange={(event) => setDraft({ ...draft, material: event.target.value })} value={draft.material ?? ""} />
          </Field>
          <Field label="章节">
            <input className={inputClass} onChange={(event) => setDraft({ ...draft, chapter: event.target.value })} value={draft.chapter ?? ""} />
          </Field>
          <Field label="预计分钟">
            <input className={inputClass} min={1} onChange={(event) => setDraft({ ...draft, estimated_minutes: Number(event.target.value) })} type="number" value={draft.estimated_minutes} />
          </Field>
          <Field label="日期">
            <input className={inputClass} onChange={(event) => setDraft({ ...draft, date: event.target.value })} type="date" value={draft.date} />
          </Field>
          <Field label="状态">
            <select className={inputClass} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })} value={draft.status}>
              {Object.entries(taskStatuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="任务模式">
            <select className={inputClass} onChange={(event) => setDraft({ ...draft, mode: event.target.value as TaskMode })} value={draft.mode}>
              {Object.entries(taskModes).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {message ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-muted">{message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <button className={buttonClass} onClick={save} type="button">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "保存修改" : "新增任务"}
          </button>
          {editingId ? (
            <button className={ghostButtonClass} onClick={() => { setEditingId(null); setDraft({ ...initialDraft, date }); }} type="button">
              <X className="h-4 w-4" />
              取消编辑
            </button>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">任务列表</h2>
        {loading ? <p className="text-sm text-muted">正在加载...</p> : null}
        {error ? <p className="text-sm text-politics">{error}</p> : null}
        <div className="space-y-3">
          {rows.map((task) => (
            <div className="grid gap-3 rounded-md border border-line p-3 md:grid-cols-[1fr_auto]" key={task.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge className={subjectColors[task.subject]}>{subjects[task.subject]}</Badge>
                  <Badge className="border-line bg-paper text-muted">{taskModes[task.mode]}</Badge>
                  <Badge className="border-line bg-paper text-muted">{taskStatuses[task.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {task.date} · {task.material || "未填资料"} · {task.chapter || "未填章节"} · {task.estimated_minutes} 分钟
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className={ghostButtonClass} onClick={() => update(task.id, { status: task.status === "done" ? "todo" : "done" })} type="button">
                  完成
                </button>
                <button className={ghostButtonClass} onClick={() => edit(task)} type="button">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className={ghostButtonClass} onClick={() => remove(task.id)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
