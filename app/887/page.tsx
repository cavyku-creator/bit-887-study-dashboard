"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { cardModules } from "@/lib/labels";
import { todayISO } from "@/lib/date";
import { useTable } from "@/lib/use-table";
import type { CardModule, KnowledgeCard } from "@/lib/types";

type Draft = Pick<KnowledgeCard, "module" | "front" | "back" | "difficulty" | "next_review_date" | "mastered">;

const initial: Draft = {
  module: "semiconductor_physics",
  front: "",
  back: "",
  difficulty: 3,
  next_review_date: todayISO(),
  mastered: false
};

export default function Cards887Page() {
  return (
    <Protected>
      <CardsView />
    </Protected>
  );
}

function CardsView() {
  const [module, setModule] = useState<CardModule | "all">("all");
  const [draft, setDraft] = useState<Draft>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const filters = useMemo(() => [{ column: "module", value: module === "all" ? "" : module }], [module]);
  const { rows, insert, update, remove } = useTable("knowledge_cards", { filters, orderBy: "next_review_date", ascending: true });

  async function save() {
    if (!draft.front.trim() || !draft.back.trim()) return;
    const payload = { ...draft, difficulty: Number(draft.difficulty), next_review_date: draft.next_review_date || null };
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (!result.error) {
      setDraft(initial);
      setEditingId(null);
    }
  }

  function edit(row: KnowledgeCard) {
    setEditingId(row.id);
    setDraft({
      module: row.module,
      front: row.front,
      back: row.back,
      difficulty: row.difficulty,
      next_review_date: row.next_review_date ?? "",
      mastered: row.mastered
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="887 知识卡片" description="半导体物理、工艺、电子电路基础的问答卡片。" />
      <Card>
        <Field label="模块筛选">
          <select className={inputClass} onChange={(event) => setModule(event.target.value as CardModule | "all")} value={module}>
            <option value="all">全部模块</option>
            {Object.entries(cardModules).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "编辑卡片" : "新增卡片"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="模块">
            <select className={inputClass} onChange={(event) => setDraft({ ...draft, module: event.target.value as CardModule })} value={draft.module}>
              {Object.entries(cardModules).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="难度 1-5"><input className={inputClass} max={5} min={1} onChange={(event) => setDraft({ ...draft, difficulty: Number(event.target.value) })} type="number" value={draft.difficulty} /></Field>
          <Field label="下次复习"><input className={inputClass} onChange={(event) => setDraft({ ...draft, next_review_date: event.target.value })} type="date" value={draft.next_review_date ?? ""} /></Field>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium"><input checked={draft.mastered} onChange={(event) => setDraft({ ...draft, mastered: event.target.checked })} type="checkbox" />已掌握</label>
          <Field label="正面问题"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, front: event.target.value })} value={draft.front} /></Field>
          <Field label="背面答案"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, back: event.target.value })} value={draft.back} /></Field>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={save} type="button">{editingId ? "保存卡片" : "新增卡片"}</button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="border-line bg-paper text-muted">{cardModules[row.module]}</Badge>
              <Badge className="border-line bg-paper text-muted">难度 {row.difficulty}</Badge>
              <Badge className={row.mastered ? "border-professional/20 bg-professional/10 text-professional" : "border-politics/20 bg-politics/10 text-politics"}>{row.mastered ? "已掌握" : "需复习"}</Badge>
            </div>
            <div className="min-h-28 rounded-md border border-line bg-paper p-4">
              <p className="whitespace-pre-wrap text-sm leading-6">{flipped[row.id] ? row.back : row.front}</p>
            </div>
            <p className="mt-2 text-xs text-muted">下次复习：{row.next_review_date || "未设置"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={ghostButtonClass} onClick={() => setFlipped({ ...flipped, [row.id]: !flipped[row.id] })} type="button"><RotateCcw className="h-4 w-4" />翻转</button>
              <button className={ghostButtonClass} onClick={() => update(row.id, { mastered: !row.mastered })} type="button">{row.mastered ? "需要复习" : "已掌握"}</button>
              <button className={ghostButtonClass} onClick={() => edit(row)} type="button">编辑</button>
              <button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
