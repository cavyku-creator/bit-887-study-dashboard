"use client";

import Link from "next/link";
import { BookOpenCheck, CheckCircle2, Circle, FileText, Layers3, NotebookTabs, Plus, RadioTower } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Badge, Card, PageHeader, ProgressRing, buttonClass, ghostButtonClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { percent, todayISO } from "@/lib/date";
import { getWeekStart } from "@/lib/stats";
import { subjectColors, subjects } from "@/lib/labels";
import { useTable } from "@/lib/use-table";
import { professional887Modules } from "@/data/professional-887-outline";

const modules = [
  {
    title: "电子技术基础",
    priority: "初试主线",
    focus: ["二极管、BJT、FET结构与工作区", "放大电路组态、反馈、频率响应", "运放、滤波器、比较器基础"],
    starter: "先做器件工作区表，再做静态工作点和小信号模型题。"
  },
  {
    title: "半导体物理",
    priority: "初试主线",
    focus: ["能带、本征与杂质半导体", "载流子统计、迁移、扩散和复合", "PN结、接触、表面态与C-V特性"],
    starter: "每学一个公式都写清物理意义、适用条件和常见计算量。"
  },
  {
    title: "半导体工艺",
    priority: "复试预埋",
    focus: ["氧化、光刻、刻蚀、掺杂、薄膜", "工艺流程顺序与关键目的", "与器件结构的对应关系"],
    starter: "基础阶段每周轻扫一次，先做流程图，不抢初试主线时间。"
  }
];

const methodSteps = [
  { title: "概念", detail: "先能用自己的话解释物理图像和电路工作状态。" },
  { title: "公式", detail: "记公式前先写单位、适用条件、边界情况和常见变形。" },
  { title: "题型", detail: "简答题练表达，计算题练步骤完整；按 40% 简答、60% 计算安排训练。" }
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
  const weekStart = getWeekStart(today);
  const { rows: tasks, update } = useTable("tasks", {
    filters: [
      { column: "date", value: today },
      { column: "subject", value: "professional_887" }
    ],
    orderBy: "created_at",
    ascending: true
  });
  const { rows: weeklyTasks } = useTable("weekly_tasks", {
    filters: [
      { column: "week_start_date", value: weekStart },
      { column: "subject", value: "professional_887" }
    ],
    orderBy: "priority",
    ascending: true,
    limit: 20
  });
  const { rows: knowledgeItems } = useTable("knowledge_items", {
    filters: [{ column: "subject", value: "professional_887" }],
    orderBy: "updated_at",
    ascending: false,
    limit: 200
  });
  const { rows: materialSources } = useTable("material_sources", {
    filters: [{ column: "subject", value: "professional_887" }],
    orderBy: "updated_at",
    ascending: false,
    limit: 50
  });

  const activeTasks = tasks.filter((task) => task.status !== "skipped");
  const doneTasks = activeTasks.filter((task) => task.status === "done");
  const completion = percent(doneTasks.length, activeTasks.length);
  const nextTask = activeTasks.find((task) => task.status === "doing") ?? activeTasks.find((task) => task.status === "todo");
  const latestMaterial = materialSources[0];

  return (
    <div className="space-y-5">
      <PageHeader title="887 专业课计划" description="初试先抓电子技术基础和半导体物理，半导体工艺作为复试背景轻量预埋。" />

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
            <Link className={ghostButtonClass} href="/887/notes">
              <NotebookTabs className="h-4 w-4" />
              知识卡片
            </Link>
            <Link className={ghostButtonClass} href="/887/materials">
              <FileText className="h-4 w-4" />
              资料源
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Layers3 className="h-5 w-5 text-professional" />}
          label="本周 887 周任务"
          value={weeklyTasks.length}
          suffix="项"
          detail={`周起始日期 ${weekStart}`}
        />
        <MetricCard
          icon={<NotebookTabs className="h-5 w-5 text-professional" />}
          label="已沉淀知识项"
          value={knowledgeItems.length}
          suffix="条"
          detail="来自 knowledge_items"
        />
        <MetricCard
          icon={<FileText className="h-5 w-5 text-professional" />}
          label="最近资料整理"
          value={latestMaterial?.updated_at ? latestMaterial.updated_at.slice(0, 10) : "暂无"}
          detail={latestMaterial?.title ?? "还没有登记资料源"}
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-professional" />
          <h2 className="text-lg font-semibold">专业课结构</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {professional887Modules.map((module) => (
            <div className="rounded-md border border-line bg-paper p-3" key={module.title}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{module.title}</p>
                <Badge className={module.priority === "initial_main" ? "border-professional/20 bg-professional/10 text-professional" : "border-line bg-panel text-muted"}>
                  {module.priority === "initial_main" ? "初试主线" : "背景预埋"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{module.description}</p>
              <p className="mt-3 text-xs text-muted">{module.topics.length} 个主题可展开整理</p>
            </div>
          ))}
        </div>
      </Card>

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
          {modules.map((module) => {
            const count = activeTasks.filter((task) => module.focus.some((focus) => task.title.includes(focus.slice(0, 2)) || (task.chapter ?? "").includes(focus.slice(0, 2))) || task.title.includes(module.title) || (task.chapter ?? "").includes(module.title)).length;
            return (
              <div className="rounded-md border border-line bg-paper p-3" key={module.title}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{module.title}</p>
                  <Badge className={module.priority === "初试主线" ? "border-professional/20 bg-professional/10 text-professional" : "border-line bg-panel text-muted"}>{module.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">今日相关任务 {count} 项</p>
                <p className="mt-3 text-sm">{module.starter}</p>
                <div className="mt-3 space-y-1 text-xs text-muted">
                  {module.focus.map((item) => <p key={item}>· {item}</p>)}
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
