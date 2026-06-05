"use client";

import Link from "next/link";
import { BookOpenCheck, CheckCircle2, Circle, Layers3, Plus, RadioTower } from "lucide-react";
import { Badge, Card, PageHeader, ProgressRing, buttonClass, ghostButtonClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { percent, todayISO } from "@/lib/date";
import { subjectColors, subjects } from "@/lib/labels";
import { professional887Scope } from "@/lib/plan";
import { useTable } from "@/lib/use-table";

const methodSteps = [
  { title: "概念", detail: "先能用自己的话解释物理图像和电路工作状态。" },
  { title: "公式", detail: "记公式前先写单位、适用条件、边界情况和常见变形。" },
  { title: "题型", detail: "简答题练表达，计算题练步骤完整；后续拿到正式细纲后再调整题型权重。" }
];

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
    <div className="min-w-0 space-y-5">
      <PageHeader title="887 专业课计划" description="初试先抓电子技术基础和半导体物理，半导体工艺作为复试背景轻量预埋。" />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="grid place-items-center gap-4">
          <ProgressRing label="887 今日" size="md" tone="#3c7b4f" value={completion} />
          <Badge className={subjectColors.professional_887}>{subjects.professional_887}</Badge>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-muted">下一项 887</p>
              <h2 className="mt-2 break-words text-2xl font-semibold">{nextTask?.title ?? "今天还没有 887 任务"}</h2>
              <p className="mt-2 text-sm text-muted">{nextTask ? `${nextTask.chapter || "未填模块"} · ${nextTask.estimated_minutes} 分钟` : "优先从电子技术基础和半导体物理各挑一个薄弱点。"}</p>
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
        <div className="mb-4 flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5 text-professional" />
          <h2 className="text-lg font-semibold">887 基础轮打法</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {methodSteps.map((step) => (
            <div className="rounded-md border border-line bg-paper p-3" key={step.title}>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-professional" />
          <h2 className="text-lg font-semibold">模块提醒</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {professional887Scope.map((module) => {
            const count = activeTasks.filter((task) => module.focus.some((focus) => task.title.includes(focus.slice(0, 2)) || (task.chapter ?? "").includes(focus.slice(0, 2))) || task.title.includes(module.title) || (task.chapter ?? "").includes(module.title)).length;
            return (
              <div className="min-w-0 rounded-md border border-line bg-paper p-3" key={module.title}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{module.title}</p>
                  <Badge className={module.status === "初试主抓" ? "border-professional/20 bg-professional/10 text-professional" : "border-line bg-panel text-muted"}>{module.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">今日相关任务 {count} 项</p>
                <p className="mt-3 break-words text-sm">{module.action}</p>
                <p className="mt-2 break-words text-xs text-muted">{module.basis}</p>
                <div className="mt-3 space-y-1 text-xs text-muted">
                  {module.focus.map((item) => <p className="break-words" key={item}>· {item}</p>)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">今日 887 清单</h2>
        {activeTasks.length === 0 ? (
          <p className="text-sm text-muted">今天没有专业课任务。建议只加 1-2 个具体动作，例如“能带与载流子浓度 45 分钟”或“BJT/FET 工作区表 + 基础题 3 道”。</p>
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
                <div className="min-w-0">
                  <p className={`font-medium ${task.status === "done" ? "text-muted line-through" : ""}`}>{task.title}</p>
                  <p className="mt-1 break-words text-sm text-muted">{task.material || "未填资料"} · {task.chapter || "未填模块"} · {task.estimated_minutes} 分钟</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
