"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { englishTypes } from "@/lib/labels";
import { useTable } from "@/lib/use-table";
import type { EnglishItem, EnglishType } from "@/lib/types";

type Draft = Pick<EnglishItem, "type" | "content" | "explanation" | "example" | "mistake_reason" | "review_count">;
const initial: Draft = { type: "word", content: "", explanation: "", example: "", mistake_reason: "", review_count: 0 };

export default function EnglishPage() {
  return <Protected><EnglishView /></Protected>;
}

function EnglishView() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { rows, insert, update, remove } = useTable("english_items", { orderBy: "created_at", ascending: false });

  async function save() {
    if (!draft.content.trim()) return;
    const payload = {
      ...draft,
      explanation: draft.explanation || null,
      example: draft.example || null,
      mistake_reason: draft.mistake_reason || null,
      review_count: Number(draft.review_count)
    };
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (!result.error) {
      setDraft(initial);
      setEditingId(null);
    }
  }

  function edit(row: EnglishItem) {
    setEditingId(row.id);
    setDraft({
      type: row.type,
      content: row.content,
      explanation: row.explanation ?? "",
      example: row.example ?? "",
      mistake_reason: row.mistake_reason ?? "",
      review_count: row.review_count
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="英语模块" description="记录单词和长难句，保留解释、例句、错因和复习次数。" />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="类型"><select className={inputClass} onChange={(event) => setDraft({ ...draft, type: event.target.value as EnglishType })} value={draft.type}>{Object.entries(englishTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="复习次数"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, review_count: Number(event.target.value) })} type="number" value={draft.review_count} /></Field>
          <div className="md:col-span-2"><Field label="内容"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, content: event.target.value })} value={draft.content} /></Field></div>
          <Field label="解释"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} value={draft.explanation ?? ""} /></Field>
          <Field label="例句"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, example: event.target.value })} value={draft.example ?? ""} /></Field>
          <div className="md:col-span-2"><Field label="错误原因"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, mistake_reason: event.target.value })} value={draft.mistake_reason ?? ""} /></Field></div>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={save} type="button"><Plus className="h-4 w-4" />{editingId ? "保存记录" : "新增记录"}</button>
      </Card>
      <div className="grid gap-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2"><Badge className="border-line bg-paper text-muted">{englishTypes[row.type]}</Badge><Badge className="border-line bg-paper text-muted">复习 {row.review_count} 次</Badge></div>
              <div className="flex gap-2"><button className={ghostButtonClass} onClick={() => update(row.id, { review_count: row.review_count + 1 })} type="button">复习+1</button><button className={ghostButtonClass} onClick={() => edit(row)} type="button">编辑</button><button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button></div>
            </div>
            <p className="mt-3 whitespace-pre-wrap font-medium">{row.content}</p>
            {row.explanation ? <p className="mt-2 text-sm text-muted">{row.explanation}</p> : null}
            {row.example ? <p className="mt-2 text-sm">{row.example}</p> : null}
            {row.mistake_reason ? <p className="mt-2 text-sm text-politics">{row.mistake_reason}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
