"use client";

import { CalendarDays, CheckCircle2, Circle, Pencil, Trash2, PlusCircle } from "lucide-react";
import { Badge, Card, ghostButtonClass } from "@/components/ui";
import { subjectColors, subjects, taskStatuses } from "@/lib/labels";
import type { WeeklyTask } from "@/lib/types";

export function WeeklyTaskCard({
  task,
  linkedCount = 0,
  onStatusToggle,
  onEdit,
  onDelete,
  onCreateDailyTask
}: {
  task: WeeklyTask;
  linkedCount?: number;
  onStatusToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateDailyTask: () => void;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={subjectColors[task.subject]}>{subjects[task.subject]}</Badge>
            <Badge className="border-line bg-paper text-muted">{taskStatuses[task.status]}</Badge>
            <Badge className={task.source_type === "auto" ? "border-accent/20 bg-accent/10 text-accent" : "border-line bg-paper text-muted"}>
              {task.source_type === "auto" ? "自动生成" : "手工添加"}
            </Badge>
          </div>
          <h3 className={`text-lg font-semibold ${task.status === "done" ? "text-muted line-through" : "text-ink"}`}>{task.title}</h3>
          {task.description ? <p className="mt-2 whitespace-pre-line text-sm text-muted">{task.description}</p> : null}
        </div>
        <button className="shrink-0 text-accent" onClick={onStatusToggle} title={task.status === "done" ? "恢复待做" : "标为完成"} type="button">
          {task.status === "done" ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
        </button>
      </div>

      <div className="grid gap-2 text-sm text-muted sm:grid-cols-4">
        <p>优先级 {task.priority}</p>
        <p>{task.estimated_minutes} 分钟</p>
        <p>{task.planned_sessions} 次</p>
        <p className="inline-flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          {task.due_date ?? "未设截止"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-sm text-muted">已转为日任务 {linkedCount} 项</p>
        <div className="flex flex-wrap gap-2">
          <button className={ghostButtonClass} onClick={onCreateDailyTask} type="button">
            <PlusCircle className="h-4 w-4" />
            转为日任务
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
