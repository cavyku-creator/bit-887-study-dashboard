"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Field, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import type { CopyrightScope, KnowledgeSubject, MaterialSource, MaterialSourceKind, OcrStatus } from "@/lib/types";
import type { MaterialSourceDraft } from "@/lib/use-material-sources";
import { copyrightScopeLabels, ocrStatusLabels, sourceKindLabels } from "./MaterialSourceCard";

type MaterialSourceEditorDraft = {
  source_kind: MaterialSourceKind;
  subject: KnowledgeSubject;
  title: string;
  source_label: string;
  source_url: string;
  ocr_status: OcrStatus;
  ocr_text: string;
  copyright_scope: CopyrightScope;
  is_private: boolean;
};

export function MaterialSourceEditor({
  initialSource,
  onCancel,
  onSubmit
}: {
  initialSource?: MaterialSource | null;
  onCancel: () => void;
  onSubmit: (payload: MaterialSourceDraft) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState<MaterialSourceEditorDraft>(() => toDraft(initialSource));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(initialSource));
    setError(null);
  }, [initialSource]);

  async function submit() {
    setError(null);
    if (!draft.title.trim()) {
      setError("资料标题不能为空。");
      return;
    }

    setSaving(true);
    const result = await onSubmit({
      ...draft,
      title: draft.title.trim(),
      source_label: draft.source_label.trim() || null,
      source_url: draft.source_url.trim() || null,
      ocr_text: draft.ocr_text.trim() || null
    });
    setSaving(false);

    if (result) setError(result);
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{initialSource ? "编辑资料源" : "登记资料源"}</h2>
          <p className="mt-1 text-sm text-muted">优先保存自己整理后的摘要、索引和知识项，附件只作为可选私有能力。</p>
        </div>
        <button className={ghostButtonClass} onClick={onCancel} type="button">
          <X className="h-4 w-4" />
          关闭
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="资料类型">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, source_kind: event.target.value as MaterialSourceKind })} value={draft.source_kind}>
            {Object.entries(sourceKindLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="科目">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, subject: event.target.value as KnowledgeSubject })} value={draft.subject}>
            <option value="professional_887">专业课 887</option>
            <option value="english">英语</option>
            <option value="general">通用</option>
          </select>
        </Field>
        <Field label="标题">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, title: event.target.value })} value={draft.title} />
        </Field>
        <Field label="来源说明">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, source_label: event.target.value })} placeholder="例如 自己整理的课程索引" value={draft.source_label} />
        </Field>
        <Field label="来源链接">
          <input className={inputClass} onChange={(event) => setDraft({ ...draft, source_url: event.target.value })} value={draft.source_url} />
        </Field>
        <Field label="OCR 状态">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, ocr_status: event.target.value as OcrStatus })} value={draft.ocr_status}>
            {Object.entries(ocrStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="版权边界">
          <select className={inputClass} onChange={(event) => setDraft({ ...draft, copyright_scope: event.target.value as CopyrightScope })} value={draft.copyright_scope}>
            {Object.entries(copyrightScopeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-2 text-sm">
          <input checked={draft.is_private} onChange={(event) => setDraft({ ...draft, is_private: event.target.checked })} type="checkbox" />
          附件和资料默认私有
        </label>
        <div className="md:col-span-2">
          <Field label="OCR 文本或手工摘录">
            <textarea className={inputClass} onChange={(event) => setDraft({ ...draft, ocr_text: event.target.value })} rows={8} value={draft.ocr_text} />
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

function toDraft(source?: MaterialSource | null): MaterialSourceEditorDraft {
  return {
    source_kind: source?.source_kind ?? "manual",
    subject: source?.subject ?? "professional_887",
    title: source?.title ?? "",
    source_label: source?.source_label ?? "",
    source_url: source?.source_url ?? "",
    ocr_status: source?.ocr_status ?? "not_needed",
    ocr_text: source?.ocr_text ?? "",
    copyright_scope: source?.copyright_scope ?? "private_notes_only",
    is_private: source?.is_private ?? true
  };
}
