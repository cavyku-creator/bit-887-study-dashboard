"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { Field, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import type { MaterialSource } from "@/lib/types";

export function OcrReviewPanel({
  source,
  onCancel,
  onSave
}: {
  source: MaterialSource;
  onCancel: () => void;
  onSave: (ocrText: string) => Promise<string | null>;
}) {
  const [ocrText, setOcrText] = useState(source.ocr_text ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOcrText(source.ocr_text ?? "");
    setError(null);
  }, [source]);

  async function save() {
    setSaving(true);
    const result = await onSave(ocrText);
    setSaving(false);
    if (result) setError(result);
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">OCR 文本校对</h2>
          <p className="mt-1 text-sm text-muted">当前没有接入联网 OCR 服务，可以把外部 OCR 或自己转录的文本粘贴在这里。</p>
        </div>
        <button className={ghostButtonClass} onClick={onCancel} type="button">
          <X className="h-4 w-4" />
          关闭
        </button>
      </div>

      <Field label={source.title}>
        <textarea className={inputClass} onChange={(event) => setOcrText(event.target.value)} rows={12} value={ocrText} />
      </Field>
      {error ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-politics">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={buttonClass} disabled={saving} onClick={save} type="button">
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存文本"}
        </button>
        <button className={ghostButtonClass} onClick={onCancel} type="button">取消</button>
      </div>
    </div>
  );
}
