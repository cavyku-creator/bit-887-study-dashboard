"use client";

import { CheckCircle2, Circle, Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, PageHeader, buttonClass, ghostButtonClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { formatChineseDate, daysUntil, percent, todayISO } from "@/lib/date";
import { subjectColors, subjects, taskModes } from "@/lib/labels";
import { defaultTaskTemplates } from "@/lib/templates";
import { useTable } from "@/lib/use-table";
import type { TaskMode } from "@/lib/types";

export default function HomePage() {
  return (
    <Protected>
      <TodayView />
    </Protected>
  );
}

function TodayView() {
  const today = todayISO();
  const [mode, setMode] = useState<TaskMode>("standard");
  const filters = useMemo(() => [{ column: "date", value: today }, { column: "mode", value: mode }], [mode, today]);
  const { rows: tasks, loading, error, insert, update } = useTable("tasks", {
    filters,
    orderBy: "created_at",
    ascending: true
  });

  const done = tasks.filter((task) => task.status === "done").length;
  const completion = percent(done, tasks.length);
  const nextTask = tasks.find((task) => task.status === "doing") ?? tasks.find((task) => task.status === "todo");

  async function addTemplateTasks() {
    for (const template of defaultTaskTemplates.filter((item) => item.mode === mode)) {
      await insert({ ...template, date: today });
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="今日任务" description={formatChineseDate()} />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">现在应该做的下一件事</p>
              <h2 className="mt-2 text-2xl font-semibold">{nextTask?.title ?? "先添加今天的任务"}</h2>
              {nextTask ? (
                <p className="mt-2 text-sm text-muted">
                  {subjects[nextTask.subject]} · {nextTask.estimated_minutes} 分钟
                </p>
              ) : null}
            </div>
            <Target className="h-8 w-8 shrink-0 text-accent" />
          </div>
          {nextTask ? (
            <button className={buttonClass} onClick={() => update(nextTask.id, { status: "done" })} type="button">
              <CheckCircle2 className="h-4 w-4" />
              完成这件事
            </button>
          ) : (
            <button className={ghostButtonClass} onClick={addTemplateTasks} type="button">
              <Plus className="h-4 w-4" />
              添加{taskModes[mode]}模板
            </button>
          )}
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card>
            <p className="text-sm text-muted">距新东方集训营</p>
            <p className="mt-2 text-3xl font-semibold">{daysUntil("2026-07-01")} 天</p>
            <p className="text-xs text-muted">按 2026-07-01 计算</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">距初试</p>
            <p className="mt-2 text-3xl font-semibold">{daysUntil("2026-12-20")} 天</p>
            <p className="text-xs text-muted">2026-12-20</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">今日完成率</p>
            <p className="mt-2 text-3xl font-semibold">{completion}%</p>
            <p className="text-xs text-muted">
              {done}/{tasks.length} 项
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">任务列表</h2>
          <div className="flex rounded-md border border-line bg-paper p-1">
            {(["standard", "minimum"] as TaskMode[]).map((item) => (
              <button
                className={`rounded px-3 py-1.5 text-sm ${mode === item ? "bg-panel text-ink shadow-sm" : "text-muted"}`}
                key={item}
                onClick={() => setMode(item)}
                type="button"
              >
                {taskModes[item]}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="rounded-md border border-politics/20 bg-politics/10 p-3 text-sm text-politics">{error}</p> : null}
        {loading ? <p className="text-sm text-muted">正在加载任务...</p> : null}
        {!loading && tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-paper p-4">
            <p className="text-sm text-muted">今天还没有{taskModes[mode]}。模板不会自动写入数据库，你可以手动添加一组开始。</p>
            <button className={`${ghostButtonClass} mt-3`} onClick={addTemplateTasks} type="button">
              <Plus className="h-4 w-4" />
              添加模板任务
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div className="flex items-start gap-3 rounded-md border border-line p-3" key={task.id}>
                <button
                  aria-label="切换完成状态"
                  className="mt-0.5 text-accent"
                  onClick={() => update(task.id, { status: task.status === "done" ? "todo" : "done" })}
                  type="button"
                >
                  {task.status === "done" ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-medium ${task.status === "done" ? "text-muted line-through" : ""}`}>{task.title}</h3>
                    <Badge className={subjectColors[task.subject]}>{subjects[task.subject]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {task.material || "未填资料"} · {task.chapter || "未填章节"} · {task.estimated_minutes} 分钟
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
