"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, ListPlus, Plus, Wand2 } from "lucide-react";
import { Badge, Card, PageHeader, ProgressRing, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { MetricCard } from "@/components/MetricCard";
import { Protected } from "@/components/Protected";
import { SectionTabs, type SectionTab } from "@/components/SectionTabs";
import { WeeklyTaskCard } from "@/components/weekly/WeeklyTaskCard";
import { WeeklyTaskEditor } from "@/components/weekly/WeeklyTaskEditor";
import { getPhaseForDate } from "@/lib/weekly-generator";
import { percent, todayISO } from "@/lib/date";
import { countByStatus } from "@/lib/stats";
import { subjects } from "@/lib/labels";
import { useTable } from "@/lib/use-table";
import { useWeeklyTasks, type WeeklyTaskDraft } from "@/lib/use-weekly-tasks";
import type { Subject, WeeklyTask } from "@/lib/types";

type SubjectFilter = Subject | "all";

export default function WeeklyPage() {
  return (
    <Protected>
      <WeeklyView />
    </Protected>
  );
}

function WeeklyView() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const today = todayISO();
  const phase = getPhaseForDate(today);
  const weekly = useWeeklyTasks(today, { subject: selectedSubject });
  const dailyTasks = useTable("tasks", { filters: [{ column: "date", value: today }], orderBy: "created_at", ascending: true });
  const generatedPreview = weekly.previewGenerated();

  const statusCounts = useMemo(() => countByStatus(weekly.rows), [weekly.rows]);
  const completion = percent(statusCounts.done, weekly.rows.filter((task) => task.status !== "skipped").length);
  const sortedTasks = useMemo(
    () => [...weekly.rows].sort((a, b) => a.priority - b.priority || a.due_date?.localeCompare(b.due_date ?? "") || a.created_at.localeCompare(b.created_at)),
    [weekly.rows]
  );
  const tabs = useMemo<SectionTab<SubjectFilter>[]>(
    () => [
      { value: "all", label: "全部", count: weekly.rows.length },
      ...Object.entries(subjects).map(([value, label]) => ({
        value: value as Subject,
        label,
        count: weekly.rows.filter((task) => task.subject === value).length
      }))
    ],
    [weekly.rows]
  );

  async function generateTasks() {
    setMessage(null);
    const result = await weekly.generateForWeek();
    if (result.error) setMessage(`自动生成失败：${result.error}`);
    else {
      setShowPreview(false);
      setMessage(generatedPreview.length === 0 ? "本周自动任务已经存在，无需重复生成。" : "已生成本周自动任务。");
    }
  }

  async function saveTask(payload: WeeklyTaskDraft) {
    setMessage(null);
    const result = editingTask ? await weekly.update(editingTask.id, payload) : await weekly.addWeeklyTask(payload);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setShowEditor(false);
    setEditingTask(null);
  }

  async function createDailyTask(task: WeeklyTask) {
    setMessage(null);
    const existing = dailyTasks.rows.find((row) => row.title === task.title && row.subject === task.subject && row.date === today);
    if (existing) {
      const linkResult = await weekly.linkDailyTask(task.id, existing.id);
      if (linkResult.error) setMessage(`日任务已存在，但关联失败：${linkResult.error}`);
      else setMessage("日任务已存在，已补充关联。");
      return;
    }

    const insertResult = await dailyTasks.insert(weekly.buildDailyTaskDraft(task, today));
    if (insertResult.error || !insertResult.data) {
      setMessage(`转为日任务失败：${insertResult.error ?? "未返回任务编号"}`);
      return;
    }

    const linkResult = await weekly.linkDailyTask(task.id, insertResult.data.id);
    if (linkResult.error) setMessage(`日任务已创建，但关联失败：${linkResult.error}`);
    else setMessage("已转为今日任务。");
  }

  function startAddTask() {
    setEditingTask(null);
    setShowEditor(true);
  }

  function startEditTask(task: WeeklyTask) {
    setEditingTask(task);
    setShowEditor(true);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="每周任务" description="把阶段计划压成一周可执行的任务，再按需要转成今日任务。" />

      <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="grid place-items-center gap-4">
          <ProgressRing label="本周完成" size="md" value={completion} />
          <div className="text-center text-sm text-muted">
            <p>{weekly.weekStart} 至 {weekly.weekEnd}</p>
            <p className="mt-1">当前阶段：{phase?.title ?? "基础阶段"}</p>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard icon={<CalendarClock className="h-5 w-5" />} label="周起始日期" value={weekly.weekStart} detail="按周一作为周起点" />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="已完成" value={statusCounts.done} suffix="项" detail={`待做 ${statusCounts.todo}，进行中 ${statusCounts.doing}`} />
          <MetricCard icon={<ListPlus className="h-5 w-5" />} label="已转日任务" value={weekly.links.length} suffix="条" detail="记录周计划和日执行之间的关联" />
        </div>
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTabs onChange={setSelectedSubject} tabs={tabs} value={selectedSubject} />
          <div className="flex flex-wrap gap-2">
            <button className={ghostButtonClass} onClick={() => setShowPreview((value) => !value)} type="button">
              <Wand2 className="h-4 w-4" />
              自动生成预览
            </button>
            <button className={buttonClass} onClick={startAddTask} type="button">
              <Plus className="h-4 w-4" />
              手工添加
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-muted">{message}</p> : null}
      </Card>

      {showPreview ? (
        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">自动生成预览</h2>
              <p className="mt-1 text-sm text-muted">确认后写入 `weekly_tasks`，已有同周同科目同标题的 auto 任务会被跳过。</p>
            </div>
            <button className={buttonClass} disabled={generatedPreview.length === 0} onClick={generateTasks} type="button">
              确认生成
            </button>
          </div>
          {generatedPreview.length === 0 ? (
            <p className="rounded-md border border-dashed border-line bg-paper p-4 text-sm text-muted">没有可新增的自动任务。</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {generatedPreview.map((task) => (
                <div className="rounded-md border border-line bg-paper p-3" key={`${task.subject}-${task.title}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-accent/20 bg-accent/10 text-accent">自动生成</Badge>
                    <Badge className="border-line bg-panel text-muted">优先级 {task.priority}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold">{task.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-muted">{task.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {showEditor ? (
        <WeeklyTaskEditor
          initialTask={editingTask}
          onCancel={() => {
            setShowEditor(false);
            setEditingTask(null);
          }}
          onSubmit={saveTask}
          weekStart={weekly.weekStart}
        />
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          {weekly.loading ? <Card><p className="text-sm text-muted">正在加载周任务...</p></Card> : null}
          {weekly.error ? <Card><p className="text-sm text-politics">{weekly.error}</p></Card> : null}
          {!weekly.loading && sortedTasks.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">本周还没有任务。可以先自动生成预览，也可以手工添加一项。</p>
            </Card>
          ) : null}
          {sortedTasks.map((task) => (
            <WeeklyTaskCard
              key={task.id}
              linkedCount={weekly.taskIdsByWeeklyTaskId[task.id]?.length ?? 0}
              onCreateDailyTask={() => createDailyTask(task)}
              onDelete={() => weekly.remove(task.id)}
              onEdit={() => startEditTask(task)}
              onStatusToggle={() => weekly.update(task.id, { status: task.status === "done" ? "todo" : "done" })}
              task={task}
            />
          ))}
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold">本周重点</h2>
            <p className="mt-2 text-sm text-muted">{phase?.goal ?? "保持数学、英语、887 的基础闭环。"}</p>
            <div className="mt-3 space-y-2 text-sm">
              {(phase?.checkpoints ?? []).map((item) => (
                <p className="rounded-md border border-line bg-paper p-2" key={item}>{item}</p>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">今日执行日期</h2>
            <input className={`${inputClass} mt-3`} readOnly type="date" value={today} />
            <p className="mt-2 text-sm text-muted">“转为日任务”会写入这个日期，并关联当前周任务。</p>
          </Card>
        </aside>
      </section>
    </div>
  );
}
