"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { todayISO } from "@/lib/date";
import { reviewTypes } from "@/lib/labels";
import { useTable } from "@/lib/use-table";
import type { Review, ReviewType } from "@/lib/types";

type Draft = Pick<Review, "date" | "type" | "completed" | "unfinished" | "reason" | "tomorrow_priority" | "weekly_problem" | "next_adjustment">;
const initial: Draft = { date: todayISO(), type: "daily", completed: "", unfinished: "", reason: "", tomorrow_priority: "", weekly_problem: "", next_adjustment: "" };

export default function ReviewPage() {
  return <Protected><ReviewView /></Protected>;
}

function ReviewView() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { rows, insert, update, remove } = useTable("reviews", { orderBy: "date", ascending: false });

  async function save() {
    const payload = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value === "" ? null : value])) as Partial<Review>;
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (!result.error) {
      setDraft(initial);
      setEditingId(null);
    }
  }

  function edit(row: Review) {
    setEditingId(row.id);
    setDraft({
      date: row.date,
      type: row.type,
      completed: row.completed ?? "",
      unfinished: row.unfinished ?? "",
      reason: row.reason ?? "",
      tomorrow_priority: row.tomorrow_priority ?? "",
      weekly_problem: row.weekly_problem ?? "",
      next_adjustment: row.next_adjustment ?? ""
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="复盘" description="每日复盘和每周复盘放在同一页，便于看调整是否落地。" />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="日期"><input className={inputClass} onChange={(event) => setDraft({ ...draft, date: event.target.value })} type="date" value={draft.date} /></Field>
          <Field label="类型"><select className={inputClass} onChange={(event) => setDraft({ ...draft, type: event.target.value as ReviewType })} value={draft.type}>{Object.entries(reviewTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="完成了什么"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, completed: event.target.value })} value={draft.completed ?? ""} /></Field>
          <Field label="未完成"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, unfinished: event.target.value })} value={draft.unfinished ?? ""} /></Field>
          <Field label="原因"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} value={draft.reason ?? ""} /></Field>
          <Field label="明天优先"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, tomorrow_priority: event.target.value })} value={draft.tomorrow_priority ?? ""} /></Field>
          <Field label="本周问题"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, weekly_problem: event.target.value })} value={draft.weekly_problem ?? ""} /></Field>
          <Field label="下次调整"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, next_adjustment: event.target.value })} value={draft.next_adjustment ?? ""} /></Field>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={save} type="button">{editingId ? "保存复盘" : "新增复盘"}</button>
      </Card>
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><h3 className="font-medium">{row.date}</h3><Badge className="border-line bg-paper text-muted">{reviewTypes[row.type]}</Badge></div>
              <div className="flex gap-2"><button className={ghostButtonClass} onClick={() => edit(row)} type="button">编辑</button><button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button></div>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <p><span className="text-muted">完成：</span>{row.completed || "未填"}</p>
              <p><span className="text-muted">未完成：</span>{row.unfinished || "未填"}</p>
              <p><span className="text-muted">原因：</span>{row.reason || "未填"}</p>
              <p><span className="text-muted">调整：</span>{row.next_adjustment || "未填"}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
