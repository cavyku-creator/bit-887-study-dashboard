"use client";

import { CheckCircle2, Circle, Clock3, Plus, Target, TimerReset } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, PageHeader, ProgressRing, buttonClass, ghostButtonClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { daysUntil, formatChineseDate, percent, todayISO } from "@/lib/date";
import { subjectColors, subjects } from "@/lib/labels";
import { estimatedExamNotice, estimatedExamStartDate, planStartDate } from "@/lib/plan";
import { defaultTaskTemplates } from "@/lib/templates";
import { useTable } from "@/lib/use-table";
import type { Subject, Task, TaskStatus } from "@/lib/types";

const subjectOrder: Subject[] = ["math", "english", "politics", "professional_887"];
const focusBlocks = [
  { label: "上午", hint: "数学 / 887 主攻", range: "08:00-11:30" },
  { label: "下午", hint: "英语 / 政治推进", range: "14:00-17:30" },
  { label: "晚上", hint: "复盘 + 作业补齐", range: "19:30-22:30" }
];

export default function HomePage() {
  return (
    <Protected>
      <TodayView />
    </Protected>
  );
}

function TodayView() {
  const today = todayISO();
  const [selectedSubject, setSelectedSubject] = useState<Subject>("math");
  const filters = useMemo(() => [{ column: "date", value: today }], [today]);
  const { rows: tasks, loading, error, insert, update } = useTable("tasks", {
    filters,
    orderBy: "created_at",
    ascending: true
  });

  const doneTasks = tasks.filter((task) => task.status === "done");
  const activeTasks = tasks.filter((task) => task.status !== "skipped");
  const done = doneTasks.length;
  const completion = percent(done, activeTasks.length);
  const plannedMinutes = activeTasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const doneMinutes = doneTasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const nextTask = tasks.find((task) => task.status === "doing") ?? tasks.find((task) => task.status === "todo");
  const selectedTasks = tasks.filter((task) => task.subject === selectedSubject);

  async function addTemplateTasks() {
    await addTemplates(defaultTaskTemplates);
  }

  async function addSelectedSubjectTemplates() {
    await addTemplates(defaultTaskTemplates.filter((template) => template.subject === selectedSubject));
  }

  async function addTemplates(templates: typeof defaultTaskTemplates) {
    for (const template of templates) {
      const exists = tasks.some((task) => task.title === template.title && task.subject === template.subject);
      if (!exists) await insert({ ...template, date: today });
    }
  }

  async function setStatus(task: Task, status: TaskStatus) {
    await update(task.id, { status });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="今日进度" description={formatChineseDate()} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex justify-center lg:justify-start">
            <ProgressRing label="今日完成" value={completion} />
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">下一件事</p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight">{nextTask?.title ?? "先把今天的计划放进来"}</h2>
                <p className="mt-2 text-sm text-muted">
                  {nextTask ? `${subjects[nextTask.subject]} · ${nextTask.estimated_minutes} 分钟` : "建议从模板或任务计划里添加 3-6 件真正要做的事"}
                </p>
              </div>
              <Target className="h-8 w-8 shrink-0 text-accent" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="完成任务" value={`${done}/${activeTasks.length}`} />
              <Metric label="已完成时长" value={`${doneMinutes} 分钟`} />
              <Metric label="计划总量" value={`${plannedMinutes} 分钟`} />
            </div>

            <div className="flex flex-wrap gap-3">
              {nextTask ? (
                <>
                  <button className={buttonClass} onClick={() => setStatus(nextTask, "done")} type="button">
                    <CheckCircle2 className="h-4 w-4" />
                    完成
                  </button>
                  <button className={ghostButtonClass} onClick={() => setStatus(nextTask, "doing")} type="button">
                    <TimerReset className="h-4 w-4" />
                    开始做
                  </button>
                </>
              ) : (
                <button className={buttonClass} onClick={addTemplateTasks} type="button">
                  <Plus className="h-4 w-4" />
                  生成今日计划
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm text-muted">关键日期</p>
            <h2 className="mt-2 text-lg font-semibold">倒计时</h2>
          </div>
          <Countdown label="起步日" value={daysUntil(planStartDate)} date={planStartDate} />
          <Countdown label="预计初试首日" value={daysUntil(estimatedExamStartDate)} date={estimatedExamStartDate} note={estimatedExamNotice} />
          <div className="rounded-md border border-line bg-paper p-3 text-sm text-muted">
            6月6日起按基础轮推进；今天只盯住进度环和下一件事。
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">四科进度</h2>
              <p className="mt-1 text-sm text-muted">按今天任务自动计算，不需要额外填表。</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {subjectOrder.map((subject) => {
              const subjectTasks = activeTasks.filter((task) => task.subject === subject);
              const subjectDone = subjectTasks.filter((task) => task.status === "done").length;
              const subjectProgress = percent(subjectDone, subjectTasks.length);
              return (
                <div className="rounded-md border border-line bg-paper p-3" key={subject}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{subjects[subject]}</p>
                      <p className="text-xs text-muted">{subjectDone}/{subjectTasks.length} 项</p>
                    </div>
                    <Badge className={subjectColors[subject]}>{subjectProgress}%</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-line/70">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${subjectProgress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">今日节奏</h2>
          <div className="mt-4 space-y-3">
            {focusBlocks.map((block) => (
              <div className="rounded-md border border-line bg-paper p-3" key={block.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{block.label}</p>
                  <span className="text-xs text-muted">{block.range}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{block.hint}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">今天的清单</h2>
            <p className="mt-1 text-sm text-muted">按科目切换，完成一项划掉一项。</p>
          </div>
          {tasks.length > 0 ? (
            <button className={ghostButtonClass} onClick={addTemplateTasks} type="button">
              <Plus className="h-4 w-4" />
              补齐模板任务
            </button>
          ) : null}
        </div>
        <SubjectTabs selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} tasks={tasks} />

        {error ? <p className="rounded-md border border-politics/20 bg-politics/10 p-3 text-sm text-politics">{error}</p> : null}
        {loading ? <p className="text-sm text-muted">正在加载任务...</p> : null}
        {!loading && tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-paper p-4">
            <p className="text-sm text-muted">今天还没有任务。先生成一组模板，再删改成你真实要做的事。</p>
            <button className={`${ghostButtonClass} mt-3`} onClick={addTemplateTasks} type="button">
              <Plus className="h-4 w-4" />
              生成今日计划
            </button>
          </div>
        ) : !loading && selectedTasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-paper p-4">
            <p className="text-sm text-muted">{subjects[selectedSubject]} 今天还没有任务。</p>
            <button className={`${ghostButtonClass} mt-3`} onClick={addSelectedSubjectTemplates} type="button">
              <Plus className="h-4 w-4" />
              添加{subjects[selectedSubject]}模板
            </button>
          </div>
        ) : (
          <div className="divide-y divide-line rounded-md border border-line">
            {selectedTasks.map((task) => (
              <div className="flex items-start gap-3 p-3" key={task.id}>
                <button
                  aria-label="切换完成状态"
                  className="mt-0.5 text-accent"
                  onClick={() => setStatus(task, task.status === "done" ? "todo" : "done")}
                  type="button"
                >
                  {task.status === "done" ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-medium ${task.status === "done" ? "text-muted line-through" : ""}`}>{task.title}</h3>
                    <Badge className={subjectColors[task.subject]}>{subjects[task.subject]}</Badge>
                    {task.status === "doing" ? <Badge className="border-accent/20 bg-accent/10 text-accent">进行中</Badge> : null}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <Clock3 className="h-3.5 w-3.5" />
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

function SubjectTabs({
  selectedSubject,
  setSelectedSubject,
  tasks
}: {
  selectedSubject: Subject;
  setSelectedSubject: (subject: Subject) => void;
  tasks: Task[];
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
      {subjectOrder.map((subject) => {
        const total = tasks.filter((task) => task.subject === subject && task.status !== "skipped").length;
        const done = tasks.filter((task) => task.subject === subject && task.status === "done").length;
        const active = selectedSubject === subject;
        return (
          <button
            className={`rounded-md border p-3 text-left transition ${
              active ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink hover:border-accent"
            }`}
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            type="button"
          >
            <p className="font-medium">{subjects[subject]}</p>
            <p className={`mt-1 text-xs ${active ? "text-white/80" : "text-muted"}`}>{done}/{total} 项</p>
          </button>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Countdown({ label, value, date, note }: { label: string; value: number; date: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-paper p-3">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted">{date}</p>
        {note ? <p className="mt-1 break-words text-xs text-muted">{note}</p> : null}
      </div>
      <p className="shrink-0 text-2xl font-semibold">{value} 天</p>
    </div>
  );
}
