"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Plus, RadioTower } from "lucide-react";
import { Badge, Card, PageHeader, ProgressRing, buttonClass, ghostButtonClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { percent, todayISO } from "@/lib/date";
import { subjectColors, subjects } from "@/lib/labels";
import { useTable } from "@/lib/use-table";

const modules = ["半导体物理", "半导体工艺", "电子电路基础"];

export default function Professional887Page() {
  return (
    <Protected>
      <Professional887View />
    </Protected>
  );
}

function Professional887View() {
  const today = todayISO();
  const { rows: tasks, update } = useTable("tasks", {
    filters: [
      { column: "date", value: today },
      { column: "subject", value: "professional_887" }
    ],
    orderBy: "created_at",
    ascending: true
  });

  const activeTasks = tasks.filter((task) => task.status !== "skipped");
  const doneTasks = activeTasks.filter((task) => task.status === "done");
  const completion = percent(doneTasks.length, activeTasks.length);
  const nextTask = activeTasks.find((task) => task.status === "doing") ?? activeTasks.find((task) => task.status === "todo");

  return (
    <div className="space-y-5">
      <PageHeader title="887 专业课计划" description="按半导体物理、半导体工艺、电子电路基础三条线推进。" />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="grid place-items-center gap-4">
          <ProgressRing label="887 今日" size="md" tone="#3c7b4f" value={completion} />
          <Badge className={subjectColors.professional_887}>{subjects.professional_887}</Badge>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">下一项 887</p>
              <h2 className="mt-2 text-2xl font-semibold">{nextTask?.title ?? "今天还没有 887 任务"}</h2>
              <p className="mt-2 text-sm text-muted">{nextTask ? `${nextTask.chapter || "未填模块"} · ${nextTask.estimated_minutes} 分钟` : "优先从物理、工艺、电路里各挑一个薄弱点。"}</p>
            </div>
            <RadioTower className="h-8 w-8 text-professional" />
          </div>
          <div className="flex flex-wrap gap-3">
            {nextTask ? (
              <button className={buttonClass} onClick={() => update(nextTask.id, { status: "done" })} type="button">
                <CheckCircle2 className="h-4 w-4" />
                完成
              </button>
            ) : null}
            <Link className={ghostButtonClass} href="/tasks">
              <Plus className="h-4 w-4" />
              添加专业课任务
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">模块提醒</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {modules.map((module) => {
            const count = activeTasks.filter((task) => (task.chapter || task.title).includes(module.replace("半导体", "")) || (task.chapter || "").includes(module)).length;
            return (
              <div className="rounded-md border border-line bg-paper p-3" key={module}>
                <p className="font-medium">{module}</p>
                <p className="mt-1 text-sm text-muted">今日相关任务 {count} 项</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">今日 887 清单</h2>
        {activeTasks.length === 0 ? (
          <p className="text-sm text-muted">今天没有专业课任务。建议只加 1-2 个具体动作，例如“PN 结形成机制 30 分钟”或“氧化/光刻/掺杂流程复盘”。</p>
        ) : (
          <div className="divide-y divide-line rounded-md border border-line">
            {activeTasks.map((task) => (
              <div className="flex items-start gap-3 p-3" key={task.id}>
                <button
                  className="mt-0.5 text-professional"
                  onClick={() => update(task.id, { status: task.status === "done" ? "todo" : "done" })}
                  type="button"
                >
                  {task.status === "done" ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
                <div>
                  <p className={`font-medium ${task.status === "done" ? "text-muted line-through" : ""}`}>{task.title}</p>
                  <p className="mt-1 text-sm text-muted">{task.material || "未填资料"} · {task.chapter || "未填模块"} · {task.estimated_minutes} 分钟</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
