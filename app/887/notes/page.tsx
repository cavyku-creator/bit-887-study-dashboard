"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { KnowledgeItemCard } from "@/components/notes/KnowledgeItemCard";
import { KnowledgeItemEditor } from "@/components/notes/KnowledgeItemEditor";
import { MetricCard } from "@/components/MetricCard";
import { Protected } from "@/components/Protected";
import { SectionTabs, type SectionTab } from "@/components/SectionTabs";
import { Card, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { professional887ModuleOptions } from "@/data/professional-887-outline";
import { addDays, getWeekStart } from "@/lib/stats";
import { todayISO } from "@/lib/date";
import { useKnowledgeItems, formatKnowledgeItemMarkdown, type KnowledgeItemDraft } from "@/lib/use-knowledge-items";
import { useMaterialSources } from "@/lib/use-material-sources";
import { useWeeklyTasks } from "@/lib/use-weekly-tasks";
import type { KnowledgeItem, KnowledgeReviewState } from "@/lib/types";

type ModuleFilter = string | "all";
type ReviewFilter = KnowledgeReviewState | "all";

export default function NotesPage() {
  return (
    <Protected>
      <NotesView />
    </Protected>
  );
}

function NotesView() {
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("all");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const today = todayISO();
  const knowledge = useKnowledgeItems({
    subject: "professional_887",
    module: moduleFilter === "all" ? "" : moduleFilter,
    reviewState: reviewFilter,
    search,
    limit: 200
  });
  const sources = useMaterialSources({ subject: "professional_887", limit: 200 });
  const weekly = useWeeklyTasks(today, { subject: "professional_887" });

  const sourceTitleById = useMemo(
    () => Object.fromEntries(sources.rows.map((source) => [source.id, source.title])),
    [sources.rows]
  );
  const allTags = useMemo(() => Array.from(new Set(knowledge.rows.flatMap((item) => item.tags))).sort(), [knowledge.rows]);
  const filteredItems = useMemo(
    () => (tagFilter ? knowledge.rows.filter((item) => item.tags.includes(tagFilter)) : knowledge.rows),
    [knowledge.rows, tagFilter]
  );
  const moduleTabs = useMemo<SectionTab<ModuleFilter>[]>(
    () => [
      { value: "all", label: "全部", count: knowledge.rows.length },
      ...professional887ModuleOptions.map((module) => ({
        value: module,
        label: module,
        count: knowledge.rows.filter((item) => item.module === module).length
      }))
    ],
    [knowledge.rows]
  );

  async function saveItem(payload: KnowledgeItemDraft) {
    setMessage(null);
    const result = editingItem ? await knowledge.update(editingItem.id, payload) : await knowledge.addKnowledgeItem(payload);
    if (result.error) return result.error;
    setShowEditor(false);
    setEditingItem(null);
    return null;
  }

  async function removeItem(item: KnowledgeItem) {
    if (!window.confirm(`确认删除知识项“${item.title}”？`)) return;
    const result = await knowledge.remove(item.id);
    if (result.error) setMessage(`删除失败：${result.error}`);
  }

  async function addToWeeklyTask(item: KnowledgeItem) {
    setMessage(null);
    const result = await weekly.addWeeklyTask({
      week_start_date: getWeekStart(today),
      subject: "professional_887",
      title: `沉淀知识项：${item.title}`,
      description: item.summary ?? item.content_md.slice(0, 180),
      source_type: "manual",
      phase_code: "knowledge",
      priority: item.review_state === "needs_revision" ? 1 : 3,
      estimated_minutes: Math.max(30, item.difficulty * 20),
      planned_sessions: 1,
      due_date: addDays(today, 3),
      metadata: {
        knowledge_item_id: item.id,
        module: item.module,
        topic: item.topic
      }
    });
    if (result.error) setMessage(`加入本周任务失败：${result.error}`);
    else setMessage("已加入本周 887 任务。");
  }

  function exportMarkdown() {
    const date = todayISO();
    const sourceIndex = sources.rows.map((source) => `### [${source.subject}] ${source.title}\n- 类型：${source.source_kind}\n- 私有：${source.is_private}\n- OCR 状态：${source.ocr_status}\n- 来源说明：${source.source_label ?? "未填写"}`).join("\n\n");
    const items = filteredItems.map((item) => {
      const latestSource = item.latest_source_id ? sourceTitleById[item.latest_source_id] : null;
      return `${formatKnowledgeItemMarkdown(item)}\n\n最近资料来源：${latestSource ?? "未关联"}`;
    }).join("\n\n---\n\n");
    const content = `# BIT 887 材料导出\n\n导出日期：${date}\n\n## 资料源索引\n\n${sourceIndex || "暂无资料源"}\n\n## 知识项\n\n${items || "暂无知识项"}\n\n## 待补充清单\n\n- 真题和课程目录由用户自行补充\n- OCR 文本需要人工校对后再沉淀为知识项\n`;
    downloadMarkdown(content, `bit887_materials_export_${date}.md`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="887 知识卡片" description="把专业课资料整理成可复习、可导出的结构化知识项。" />
        <Link className={ghostButtonClass} href="/887">
          <ArrowLeft className="h-4 w-4" />
          返回 887 概览
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="知识项" value={knowledge.rows.length} suffix="条" detail="当前筛选范围内的专业课知识沉淀" />
        <MetricCard label="标签" value={allTags.length} suffix="个" detail="用于按题型、模块和阶段回看" />
        <MetricCard label="本周 887 任务" value={weekly.rows.length} suffix="项" detail="可从知识项快速加入" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTabs onChange={setModuleFilter} tabs={moduleTabs} value={moduleFilter} />
          <div className="flex flex-wrap gap-2">
            <button className={ghostButtonClass} onClick={exportMarkdown} type="button">
              <Download className="h-4 w-4" />
              导出 Markdown
            </button>
            <button className={buttonClass} onClick={() => { setEditingItem(null); setShowEditor(true); }} type="button">
              <Plus className="h-4 w-4" />
              新增知识项
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input className={inputClass} onChange={(event) => setSearch(event.target.value)} placeholder="搜索标题" value={search} />
          <select className={inputClass} onChange={(event) => setReviewFilter(event.target.value as ReviewFilter)} value={reviewFilter}>
            <option value="all">全部复习状态</option>
            <option value="new">新建</option>
            <option value="learning">学习中</option>
            <option value="stable">已稳定</option>
            <option value="needs_revision">需修订</option>
          </select>
          <select className={inputClass} onChange={(event) => setTagFilter(event.target.value)} value={tagFilter}>
            <option value="">全部标签</option>
            {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
        {message ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-muted">{message}</p> : null}
      </Card>

      {showEditor ? (
        <KnowledgeItemEditor
          initialItem={editingItem}
          onCancel={() => { setShowEditor(false); setEditingItem(null); }}
          onSubmit={saveItem}
        />
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {knowledge.loading ? <Card><p className="text-sm text-muted">正在加载知识项...</p></Card> : null}
        {knowledge.error ? <Card><p className="text-sm text-politics">{knowledge.error}</p></Card> : null}
        {!knowledge.loading && filteredItems.length === 0 ? (
          <Card><p className="text-sm text-muted">还没有符合条件的知识项。可以先新增一条，或者从资料源页面整理生成。</p></Card>
        ) : null}
        {filteredItems.map((item) => (
          <KnowledgeItemCard
            item={item}
            key={item.id}
            latestSourceTitle={item.latest_source_id ? sourceTitleById[item.latest_source_id] : null}
            onAddToWeeklyTask={() => addToWeeklyTask(item)}
            onDelete={() => removeItem(item)}
            onEdit={() => { setEditingItem(item); setShowEditor(true); }}
          />
        ))}
      </div>
    </div>
  );
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
