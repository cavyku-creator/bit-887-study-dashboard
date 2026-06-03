"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { todayISO } from "@/lib/date";
import { useTable } from "@/lib/use-table";
import type { CampLog } from "@/lib/types";

type Draft = Pick<CampLog, "date" | "course" | "teacher_progress" | "understanding" | "homework" | "unclear_points" | "tomorrow_priority">;
const initial: Draft = { date: todayISO(), course: "", teacher_progress: "", understanding: 3, homework: "", unclear_points: ["", "", ""], tomorrow_priority: "" };

export default function CampPage() {
  return <Protected><CampView /></Protected>;
}

function CampView() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { rows, insert, update, remove } = useTable("camp_logs", { orderBy: "date", ascending: false });

  async function save() {
    if (!draft.course.trim()) return;
    const payload = {
      ...draft,
      teacher_progress: draft.teacher_progress || null,
      homework: draft.homework || null,
      unclear_points: (draft.unclear_points ?? []).filter(Boolean),
      tomorrow_priority: draft.tomorrow_priority || null,
      understanding: Number(draft.understanding)
    };
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (!result.error) {
      setDraft(initial);
      setEditingId(null);
    }
  }

  function edit(row: CampLog) {
    const points = row.unclear_points ?? [];
    setEditingId(row.id);
    setDraft({
      date: row.date,
      course: row.course,
      teacher_progress: row.teacher_progress ?? "",
      understanding: row.understanding,
      homework: row.homework ?? "",
      unclear_points: [points[0] ?? "", points[1] ?? "", points[2] ?? ""],
      tomorrow_priority: row.tomorrow_priority ?? ""
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="集训营记录" description="记录每天课程、老师进度、听懂程度、作业和第二天优先项。" />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="日期"><input className={inputClass} onChange={(event) => setDraft({ ...draft, date: event.target.value })} type="date" value={draft.date} /></Field>
          <Field label="课程"><input className={inputClass} onChange={(event) => setDraft({ ...draft, course: event.target.value })} placeholder="例如 数学强化课" value={draft.course} /></Field>
          <Field label="老师讲到哪里"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, teacher_progress: event.target.value })} value={draft.teacher_progress ?? ""} /></Field>
          <Field label="课后作业"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, homework: event.target.value })} value={draft.homework ?? ""} /></Field>
          <Field label="听懂程度 1-5"><input className={inputClass} max={5} min={1} onChange={(event) => setDraft({ ...draft, understanding: Number(event.target.value) })} type="number" value={draft.understanding} /></Field>
          <Field label="明天最优先处理"><input className={inputClass} onChange={(event) => setDraft({ ...draft, tomorrow_priority: event.target.value })} value={draft.tomorrow_priority ?? ""} /></Field>
          {[0, 1, 2].map((index) => (
            <Field key={index} label={`没听懂的点 ${index + 1}`}>
              <input
                className={inputClass}
                onChange={(event) => {
                  const next = [...(draft.unclear_points ?? ["", "", ""])];
                  next[index] = event.target.value;
                  setDraft({ ...draft, unclear_points: next });
                }}
                value={draft.unclear_points?.[index] ?? ""}
              />
            </Field>
          ))}
        </div>
        <button className={`${buttonClass} mt-4`} onClick={save} type="button">{editingId ? "保存记录" : "新增记录"}</button>
      </Card>

      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h3 className="font-medium">{row.date} · {row.course}</h3><p className="mt-1 text-sm text-muted">听懂程度 {row.understanding}/5</p></div>
              <div className="flex gap-2"><button className={ghostButtonClass} onClick={() => edit(row)} type="button">编辑</button><button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button></div>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <p><span className="text-muted">进度：</span>{row.teacher_progress || "未填"}</p>
              <p><span className="text-muted">作业：</span>{row.homework || "未填"}</p>
              <p><span className="text-muted">明天优先：</span>{row.tomorrow_priority || "未填"}</p>
              <div className="flex flex-wrap gap-2">{(row.unclear_points ?? []).map((point) => <Badge className="border-line bg-paper text-muted" key={point}>{point}</Badge>)}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
