"use client";

import { FileText, Pencil, Trash2 } from "lucide-react";
import { Badge, Card, ghostButtonClass } from "@/components/ui";
import type { MaterialSource } from "@/lib/types";

export function MaterialSourceCard({
  source,
  onEdit,
  onDelete,
  onReviewOcr,
  onCreateKnowledgeItem
}: {
  source: MaterialSource;
  onEdit: () => void;
  onDelete: () => void;
  onReviewOcr: () => void;
  onCreateKnowledgeItem: () => void;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className="border-professional/20 bg-professional/10 text-professional">{sourceKindLabels[source.source_kind]}</Badge>
            <Badge className="border-line bg-paper text-muted">{ocrStatusLabels[source.ocr_status]}</Badge>
            <Badge className="border-line bg-paper text-muted">{source.is_private ? "私有" : "非私有"}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{source.title}</h3>
          <p className="mt-1 text-sm text-muted">{source.source_label || "未填写来源说明"}</p>
        </div>
        <FileText className="h-6 w-6 shrink-0 text-professional" />
      </div>

      {source.source_url ? <p className="break-all text-sm text-muted">链接：{source.source_url}</p> : null}
      <p className="text-sm text-muted">版权边界：{copyrightScopeLabels[source.copyright_scope]}</p>
      {source.ocr_text ? <p className="line-clamp-3 rounded-md border border-line bg-paper p-3 text-sm text-muted">{source.ocr_text}</p> : null}

      <div className="border-t border-line pt-3">
        <div className="flex flex-wrap gap-2">
          <button className={ghostButtonClass} onClick={onReviewOcr} type="button">校对 OCR 文本</button>
          <button className={ghostButtonClass} onClick={onCreateKnowledgeItem} type="button">生成知识项</button>
          <button className={ghostButtonClass} onClick={onEdit} type="button">
            <Pencil className="h-4 w-4" />
            编辑
          </button>
          <button className={ghostButtonClass} onClick={onDelete} type="button">
            <Trash2 className="h-4 w-4" />
            删除
          </button>
        </div>
      </div>
    </Card>
  );
}

export const sourceKindLabels: Record<MaterialSource["source_kind"], string> = {
  manual: "手工登记",
  screenshot: "截图",
  pdf: "PDF",
  ocr_text: "OCR 文本",
  url: "网页链接",
  note: "整理笔记"
};

export const ocrStatusLabels: Record<MaterialSource["ocr_status"], string> = {
  pending: "待处理",
  done: "已完成",
  failed: "失败",
  not_needed: "无需 OCR"
};

export const copyrightScopeLabels: Record<MaterialSource["copyright_scope"], string> = {
  private_notes_only: "仅私有笔记",
  personal_copy: "个人副本",
  unknown: "未知"
};
