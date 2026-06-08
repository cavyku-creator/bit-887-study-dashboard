"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Field, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { professional887ModuleOptions } from "@/data/professional-887-outline";
import type { KnowledgeItem, KnowledgeReviewState } from "@/lib/types";
import type { KnowledgeItemDraft } from "@/lib/use-knowledge-items";
import { reviewStateLabels } from "./KnowledgeItemCard";

type KnowledgeItemEditorDraft = {
  module: string;
  topic: string;
  title: string;
  summary: string;
  content_md: string;
  tagsText: string;
  difficulty: number;
  review_state: KnowledgeReviewState;
};

export function KnowledgeItemEditor({
  initialItem,
  onCancel,
  onSubmit
}: {
  initialItem?: KnowledgeItem | null;
  onCancel: () => void;
  onSubmit: (payload: KnowledgeItemDraft) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState<KnowledgeItemEditorDraft>(() => toDraft(initialItem));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(initialItem));
    setError(null);
  }, [initialItem]);

  async function submit() {
    setError(null);
    if (!draft.title.trim()) {
      setError("标题不能为空。");
      return;
    }
    if (!draft.content_md.trim()) {
      setError("Markdown 正文不能为空。");
      return;
    }

    setSaving(true);
    const result = await onSubmit({
      subject: "professional_887",
      module: draft.module,
      topic: draft.topic.trim() || null,
      title: draft.title.trim(),
      summary: draft.summary.trim() || null,
      content_md: draft.content_md.trim(),
      tags: splitTags(draft.tagsText),
      difficulty: Number(draft.difficulty),
      review_state: draft.review_state
    });
    setSaving(false);

    if (result) setError(result);
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{initialItem ? "编辑知识项" : "新增知识项"}</h2>
          <p className="mt-1 text-sm text-muted">建议每个知识项只处理一个主题，正文用轻量 Markdown 记录。</p>
        </div>
        <button className={ghostButtonClass} onClick={onCancel} type="button">
          <X className="h-4 w-4" />
          关闭
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="模块">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, module: event.target.value })} value={draft.module}>
            {professional887ModuleOptions.map((module) => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </Field>
        <Field label="主题">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} value={draft.topic} />
        </Field>
        <Field label="标题">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, title: event.target.value })} value={draft.title} />
        </Field>
        <Field label="标签">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, tagsText: event.target.value })} placeholder="PN结, 半导体物理, 基础主线" value={draft.tagsText} />
        </Field>
        <Field label="难度">
          <input className={inputClass} max={5} min={1} onChange={(event) => setDraft({ ...draft, difficulty: Number(event.target.value) })} type="number" value={draft.difficulty} />
        </Field>
        <Field label="复习状态">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, review_state: event.target.value as KnowledgeReviewState })} value={draft.review_state}>
            {Object.entries(reviewStateLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="摘要">
            <textarea className={inputClass} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} rows={3} value={draft.summary} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Markdown 正文">
            <textarea className={inputClass} onChange={(event) => setDraft({ ...draft, content_md: event.target.value })} rows={10} value={draft.content_md} />
          </Field>
        </div>
      </div>

      {error ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-politics">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={buttonClass} disabled={saving} onClick={submit} type="button">
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存"}
        </button>
        <button className={ghostButtonClass} onClick={onCancel} type="button">取消</button>
      </div>
    </div>
  );
}

export function splitTags(value: string) {
  return value
    .split(/[,，、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toDraft(item?: KnowledgeItem | null): KnowledgeItemEditorDraft {
  return {
    module: item?.module ?? "半导体物理",
    topic: item?.topic ?? "",
    title: item?.title ?? "",
    summary: item?.summary ?? "",
    content_md: item?.content_md ?? "## 核心概念\n\n## 关键公式\n\n## 常考问法\n\n## 易错点\n",
    tagsText: item?.tags.join(", ") ?? "",
    difficulty: item?.difficulty ?? 3,
    review_state: item?.review_state ?? "new"
  };
}
