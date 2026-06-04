"use client";

import { ClipboardList, Pencil, Target, Trash2 } from "lucide-react";
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
  const today = todayISO();
  const latest = rows[0];
  const todaysLogs = rows.filter((row) => row.date === today);
  const homeworkItems = parseHomework(latest?.homework);
  const averageUnderstanding = rows.length ? Math.round((rows.reduce((sum, row) => sum + row.understanding, 0) / rows.length) * 10) / 10 : 0;

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
      <PageHeader title="集训营作业" description="把每天听课进度、作业和卡住的点收在一个地方。" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <ClipboardList className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">今日课程记录</p>
          <p className="mt-1 text-3xl font-semibold">{todaysLogs.length}</p>
          <p className="text-xs text-muted">条</p>
        </Card>
        <Card>
          <Target className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">最近明日优先</p>
          <p className="mt-1 text-lg font-semibold">{latest?.tomorrow_priority || "还没记录"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">平均听懂程度</p>
          <p className="mt-2 text-3xl font-semibold">{averageUnderstanding || "-"}/5</p>
          <div className="mt-3 h-2 rounded-full bg-paper">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${averageUnderstanding ? (averageUnderstanding / 5) * 100 : 0}%` }} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{editingId ? "编辑课程作业" : "新增课程作业"}</h2>
          <p className="mt-1 text-sm text-muted">作业可以一行一项，列表里会自动变成清单。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="日期"><input className={inputClass} onChange={(event) => setDraft({ ...draft, date: event.target.value })} type="date" value={draft.date} /></Field>
          <Field label="课程"><input className={inputClass} onChange={(event) => setDraft({ ...draft, course: event.target.value })} placeholder="例如 数学强化课 / 887 工艺课" value={draft.course} /></Field>
          <Field label="老师讲到哪里"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, teacher_progress: event.target.value })} placeholder="例如 极限例题讲到夹逼准则，作业布置到 P42" value={draft.teacher_progress ?? ""} /></Field>
          <Field label="课后作业"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, homework: event.target.value })} placeholder={"一行一项，例如：\n整理课堂笔记\n完成课后题 1-12\n回看 PN 结推导"} value={draft.homework ?? ""} /></Field>
          <Field label={`听懂程度 ${draft.understanding}/5`}>
            <input
              className="w-full accent-accent"
              max={5}
              min={1}
              onChange={(event) => setDraft({ ...draft, understanding: Number(event.target.value) })}
              type="range"
              value={draft.understanding}
            />
          </Field>
          <Field label="明天最优先处理"><input className={inputClass} onChange={(event) => setDraft({ ...draft, tomorrow_priority: event.target.value })} placeholder="只写一件最重要的事" value={draft.tomorrow_priority ?? ""} /></Field>
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

      {latest ? (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">最近一次作业清单</h2>
          {homeworkItems.length ? (
            <div className="space-y-2">
              {homeworkItems.map((item) => (
                <label className="flex items-start gap-2 rounded-md border border-line bg-paper p-3 text-sm" key={item}>
                  <input className="mt-0.5 rounded border-line text-accent focus:ring-accent" type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">最近一次记录还没有作业。</p>
          )}
        </Card>
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h3 className="font-medium">{row.date} · {row.course}</h3><p className="mt-1 text-sm text-muted">听懂程度 {row.understanding}/5</p></div>
              <div className="flex gap-2"><button className={ghostButtonClass} onClick={() => edit(row)} type="button"><Pencil className="h-4 w-4" />编辑</button><button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" />删除</button></div>
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

function parseHomework(homework?: string | null) {
  return (homework ?? "")
    .split(/\n|；|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}
