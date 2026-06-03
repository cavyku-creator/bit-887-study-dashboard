"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { errorTypes } from "@/lib/labels";
import { todayISO } from "@/lib/date";
import { useTable } from "@/lib/use-table";
import type { ErrorType, MathError } from "@/lib/types";

type Draft = Pick<MathError, "source" | "chapter" | "problem_no" | "error_type" | "note" | "next_review_date" | "mastered">;

const initial: Draft = {
  source: "",
  chapter: "",
  problem_no: "",
  error_type: "concept",
  note: "",
  next_review_date: todayISO(),
  mastered: false
};

export default function MathErrorsPage() {
  return (
    <Protected>
      <MathErrorsView />
    </Protected>
  );
}

function MathErrorsView() {
  const [chapter, setChapter] = useState("");
  const [errorType, setErrorType] = useState<ErrorType | "all">("all");
  const [draft, setDraft] = useState<Draft>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const filters = useMemo(
    () => [
      { column: "chapter", value: chapter },
      { column: "error_type", value: errorType === "all" ? "" : errorType }
    ],
    [chapter, errorType]
  );
  const { rows, insert, update, remove, loading, error } = useTable("math_errors", { filters, orderBy: "next_review_date", ascending: true });

  async function save() {
    if (!draft.chapter.trim()) return;
    const payload = {
      ...draft,
      source: draft.source || null,
      problem_no: draft.problem_no || null,
      note: draft.note || null,
      next_review_date: draft.next_review_date || null
    };
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (!result.error) {
      setDraft(initial);
      setEditingId(null);
    }
  }

  function edit(row: MathError) {
    setEditingId(row.id);
    setDraft({
      source: row.source ?? "",
      chapter: row.chapter,
      problem_no: row.problem_no ?? "",
      error_type: row.error_type,
      note: row.note ?? "",
      next_review_date: row.next_review_date ?? "",
      mastered: row.mastered
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="数学错题本" description="记录错题来源、章节、错因和下次复习日期。" />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="按章节筛选">
            <input className={inputClass} onChange={(event) => setChapter(event.target.value)} placeholder="例如 极限与连续" value={chapter} />
          </Field>
          <Field label="按错因筛选">
            <select className={inputClass} onChange={(event) => setErrorType(event.target.value as ErrorType | "all")} value={errorType}>
              <option value="all">全部错因</option>
              {Object.entries(errorTypes).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "编辑错题" : "新增错题"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="资料来源"><input className={inputClass} onChange={(event) => setDraft({ ...draft, source: event.target.value })} value={draft.source ?? ""} /></Field>
          <Field label="章节"><input className={inputClass} onChange={(event) => setDraft({ ...draft, chapter: event.target.value })} value={draft.chapter} /></Field>
          <Field label="题号"><input className={inputClass} onChange={(event) => setDraft({ ...draft, problem_no: event.target.value })} value={draft.problem_no ?? ""} /></Field>
          <Field label="错因">
            <select className={inputClass} onChange={(event) => setDraft({ ...draft, error_type: event.target.value as ErrorType })} value={draft.error_type}>
              {Object.entries(errorTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="下次复习日期"><input className={inputClass} onChange={(event) => setDraft({ ...draft, next_review_date: event.target.value })} type="date" value={draft.next_review_date ?? ""} /></Field>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium">
            <input checked={draft.mastered} onChange={(event) => setDraft({ ...draft, mastered: event.target.checked })} type="checkbox" />
            已掌握
          </label>
          <div className="md:col-span-2">
            <Field label="错因备注"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, note: event.target.value })} value={draft.note ?? ""} /></Field>
          </div>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={save} type="button">
          <Plus className="h-4 w-4" />
          {editingId ? "保存错题" : "新增错题"}
        </button>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">错题列表</h2>
        {loading ? <p className="text-sm text-muted">正在加载...</p> : null}
        {error ? <p className="text-sm text-politics">{error}</p> : null}
        <div className="grid gap-3">
          {rows.map((row) => (
            <div className="rounded-md border border-line p-3" key={row.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{row.chapter} {row.problem_no ? `#${row.problem_no}` : ""}</h3>
                  <Badge className="border-line bg-paper text-muted">{errorTypes[row.error_type]}</Badge>
                  <Badge className={row.mastered ? "border-professional/20 bg-professional/10 text-professional" : "border-politics/20 bg-politics/10 text-politics"}>{row.mastered ? "已掌握" : "待复习"}</Badge>
                </div>
                <div className="flex gap-2">
                  <button className={ghostButtonClass} onClick={() => update(row.id, { mastered: !row.mastered })} type="button">掌握</button>
                  <button className={ghostButtonClass} onClick={() => edit(row)} type="button"><Pencil className="h-4 w-4" /></button>
                  <button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{row.source || "未填来源"} · 下次复习 {row.next_review_date || "未设置"}</p>
              {row.note ? <p className="mt-2 text-sm">{row.note}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
