"use client";

import { useMemo } from "react";
import { useTable } from "./use-table";
import type { KnowledgeItem, KnowledgeReviewState, KnowledgeSubject } from "./types";

export type KnowledgeItemDraft = Pick<KnowledgeItem, "subject" | "module" | "title" | "content_md"> &
  Partial<Pick<KnowledgeItem, "topic" | "slug" | "summary" | "tags" | "difficulty" | "review_state" | "latest_source_id" | "metadata">>;

export function useKnowledgeItems(options: { subject?: KnowledgeSubject | "all"; module?: string; reviewState?: KnowledgeReviewState | "all"; search?: string; limit?: number } = {}) {
  const filters = useMemo(
    () => [
      { column: "subject", value: options.subject === "all" ? "" : options.subject ?? "" },
      { column: "module", value: options.module ?? "" },
      { column: "review_state", value: options.reviewState === "all" ? "" : options.reviewState ?? "" },
      { column: "title", op: "ilike" as const, value: options.search ? `%${options.search}%` : "" }
    ],
    [options.module, options.reviewState, options.search, options.subject]
  );

  const table = useTable("knowledge_items", {
    filters,
    orderBy: "updated_at",
    ascending: false,
    limit: options.limit
  });

  async function addKnowledgeItem(payload: KnowledgeItemDraft) {
    return table.insert({
      ...payload,
      topic: payload.topic ?? null,
      slug: payload.slug ?? slugify(payload.title),
      summary: payload.summary ?? null,
      tags: payload.tags ?? [],
      difficulty: payload.difficulty ?? 3,
      review_state: payload.review_state ?? "new",
      latest_source_id: payload.latest_source_id ?? null,
      metadata: payload.metadata ?? {}
    });
  }

  function exportMarkdown(items = table.rows) {
    return items.map(formatKnowledgeItemMarkdown).join("\n\n---\n\n");
  }

  return {
    ...table,
    addKnowledgeItem,
    exportMarkdown
  };
}

export function formatKnowledgeItemMarkdown(item: KnowledgeItem) {
  const tags = item.tags.length > 0 ? `\n\n标签：${item.tags.join("、")}` : "";
  const summary = item.summary ? `\n\n${item.summary}` : "";
  return `# ${item.title}\n\n科目：${item.subject}\n模块：${item.module}${item.topic ? `\n主题：${item.topic}` : ""}${tags}${summary}\n\n${item.content_md}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
