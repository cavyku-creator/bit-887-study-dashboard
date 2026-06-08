"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Info, Plus } from "lucide-react";
import { MaterialSourceCard } from "@/components/materials/MaterialSourceCard";
import { MaterialSourceEditor } from "@/components/materials/MaterialSourceEditor";
import { OcrReviewPanel } from "@/components/materials/OcrReviewPanel";
import { KnowledgeItemEditor, splitTags } from "@/components/notes/KnowledgeItemEditor";
import { MetricCard } from "@/components/MetricCard";
import { Protected } from "@/components/Protected";
import { Card, PageHeader, buttonClass, ghostButtonClass } from "@/components/ui";
import type { KnowledgeItemDraft } from "@/lib/use-knowledge-items";
import { useKnowledgeItems } from "@/lib/use-knowledge-items";
import { type MaterialSourceDraft, useMaterialSources } from "@/lib/use-material-sources";
import type { MaterialSource } from "@/lib/types";

export default function MaterialsPage() {
  return (
    <Protected>
      <MaterialsView />
    </Protected>
  );
}

function MaterialsView() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingSource, setEditingSource] = useState<MaterialSource | null>(null);
  const [ocrSource, setOcrSource] = useState<MaterialSource | null>(null);
  const [knowledgeSource, setKnowledgeSource] = useState<MaterialSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const sources = useMaterialSources({ subject: "professional_887", limit: 200 });
  const knowledge = useKnowledgeItems({ subject: "professional_887", limit: 200 });

  async function saveSource(payload: MaterialSourceDraft) {
    setMessage(null);
    const result = editingSource ? await sources.update(editingSource.id, payload) : await sources.addMaterialSource(payload);
    if (result.error) return result.error;
    setShowEditor(false);
    setEditingSource(null);
    return null;
  }

  async function removeSource(source: MaterialSource) {
    if (!window.confirm(`确认删除资料源“${source.title}”？`)) return;
    const result = await sources.remove(source.id);
    if (result.error) setMessage(`删除失败：${result.error}`);
  }

  async function saveOcrText(ocrText: string) {
    if (!ocrSource) return "没有选中的资料源。";
    const result = await sources.updateOcrText(ocrSource.id, ocrText);
    if (result.error) return result.error;
    setOcrSource(null);
    return null;
  }

  async function createKnowledgeItem(payload: KnowledgeItemDraft) {
    if (!knowledgeSource) return "没有选中的资料源。";
    const result = await knowledge.addKnowledgeItem({
      ...payload,
      latest_source_id: knowledgeSource.id,
      metadata: {
        source_title: knowledgeSource.title,
        source_kind: knowledgeSource.source_kind
      }
    });
    if (result.error) return result.error;
    setKnowledgeSource(null);
    setMessage("已从资料源生成知识项。");
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="887 资料源" description="登记资料索引、手工粘贴 OCR 文本，再整理成可复习的知识项。" />
        <Link className={ghostButtonClass} href="/887">
          <ArrowLeft className="h-4 w-4" />
          返回 887 概览
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="资料源" value={sources.rows.length} suffix="条" detail="手工登记、链接、PDF 或截图索引" />
        <MetricCard label="OCR 已完成" value={sources.rows.filter((source) => source.ocr_status === "done").length} suffix="条" detail="包含手工粘贴或校对后的文本" />
        <MetricCard label="知识项" value={knowledge.rows.length} suffix="条" detail="从资料整理出来的结构化笔记" />
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-professional" />
            <div className="space-y-1 text-sm text-muted">
              <p>附件默认私有；Storage 未配置时，仍可手工登记资料源和粘贴文本。</p>
              <p>建议优先保存自己整理后的摘要与知识项。图片上传可能带来体积、OCR 误差、隐私和版权边界问题。</p>
              <p>当前未接入联网 OCR 服务；可以把外部 OCR 或手工转录文本粘贴到校对面板。</p>
            </div>
          </div>
          <button className={buttonClass} onClick={() => { setEditingSource(null); setShowEditor(true); }} type="button">
            <Plus className="h-4 w-4" />
            登记资料源
          </button>
        </div>
        {message ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-muted">{message}</p> : null}
      </Card>

      {showEditor ? (
        <MaterialSourceEditor
          initialSource={editingSource}
          onCancel={() => { setShowEditor(false); setEditingSource(null); }}
          onSubmit={saveSource}
        />
      ) : null}

      {ocrSource ? (
        <OcrReviewPanel
          onCancel={() => setOcrSource(null)}
          onSave={saveOcrText}
          source={ocrSource}
        />
      ) : null}

      {knowledgeSource ? (
        <KnowledgeItemEditor
          initialItem={{
            id: "",
            user_id: "",
            created_at: "",
            updated_at: "",
            subject: "professional_887",
            module: "课程笔记",
            topic: null,
            title: knowledgeSource.title,
            slug: null,
            summary: buildSummary(knowledgeSource.ocr_text),
            content_md: buildKnowledgeDraft(knowledgeSource),
            tags: splitTags(knowledgeSource.title),
            difficulty: 3,
            review_state: "new",
            latest_source_id: knowledgeSource.id,
            metadata: {}
          }}
          onCancel={() => setKnowledgeSource(null)}
          onSubmit={createKnowledgeItem}
        />
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {sources.loading ? <Card><p className="text-sm text-muted">正在加载资料源...</p></Card> : null}
        {sources.error ? <Card><p className="text-sm text-politics">{sources.error}</p></Card> : null}
        {!sources.loading && sources.rows.length === 0 ? (
          <Card><p className="text-sm text-muted">还没有资料源。先登记一个标题和来源说明，就能开始整理 OCR 文本和知识项。</p></Card>
        ) : null}
        {sources.rows.map((source) => (
          <MaterialSourceCard
            key={source.id}
            onCreateKnowledgeItem={() => setKnowledgeSource(source)}
            onDelete={() => removeSource(source)}
            onEdit={() => { setEditingSource(source); setShowEditor(true); }}
            onReviewOcr={() => setOcrSource(source)}
            source={source}
          />
        ))}
      </div>
    </div>
  );
}

function buildSummary(ocrText: string | null) {
  if (!ocrText) return "";
  return ocrText.replace(/\s+/g, " ").slice(0, 120);
}

function buildKnowledgeDraft(source: MaterialSource) {
  const body = source.ocr_text?.trim() || "在这里把资料源整理成自己的摘要、公式、易错点和例题。";
  return `## 来源摘要\n\n${body}\n\n## 核心概念\n\n## 关键公式\n\n## 易错点\n`;
}
