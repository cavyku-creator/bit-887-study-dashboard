"use client";

import { BookOpenCheck, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Badge, Card, ghostButtonClass } from "@/components/ui";
import type { KnowledgeItem } from "@/lib/types";

export function KnowledgeItemCard({
  item,
  latestSourceTitle,
  onEdit,
  onDelete,
  onAddToWeeklyTask
}: {
  item: KnowledgeItem;
  latestSourceTitle?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onAddToWeeklyTask: () => void;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className="border-professional/20 bg-professional/10 text-professional">{item.module}</Badge>
            <Badge className="border-line bg-paper text-muted">难度 {item.difficulty}</Badge>
            <Badge className="border-line bg-paper text-muted">{reviewStateLabels[item.review_state]}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-muted">{item.topic || "未填主题"}</p>
        </div>
        <BookOpenCheck className="h-6 w-6 shrink-0 text-professional" />
      </div>

      {item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge className="border-line bg-paper text-muted" key={tag}>{tag}</Badge>
          ))}
        </div>
      ) : null}

      {item.summary ? <p className="text-sm text-muted">{item.summary}</p> : null}
      <pre className="max-h-36 overflow-hidden whitespace-pre-wrap rounded-md border border-line bg-paper p-3 text-sm leading-6 text-muted">{item.content_md}</pre>

      <div className="border-t border-line pt-3">
        <p className="text-sm text-muted">最近来源：{latestSourceTitle ?? "未关联资料源"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={ghostButtonClass} onClick={onAddToWeeklyTask} type="button">
            <CalendarPlus className="h-4 w-4" />
            加入本周任务
          </button>
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

export const reviewStateLabels: Record<KnowledgeItem["review_state"], string> = {
  new: "新建",
  learning: "学习中",
  stable: "已稳定",
  needs_revision: "需修订"
};
