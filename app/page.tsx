"use client";

import { CheckCircle2, Circle, Clock3, Pause, Play, Plus, RotateCcw, Square, Target, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
const pomodoroSeconds = 25 * 60;
const focusStorageKey = "bit085403.focusTimer";

type FocusStatus = "idle" | "running" | "paused" | "finished";
type FocusSnapshot = {
  taskId: string | null;
  status: FocusStatus;
  secondsLeft: number;
  elapsedSeconds: number;
  startedAt: string | null;
  updatedAt: string;
};

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
  const [pendingStatusTaskId, setPendingStatusTaskId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const filters = useMemo(() => [{ column: "date", value: today }], [today]);
  const { rows: tasks, loading, error, insert: insertTask, update: updateTask } = useTable("tasks", {
    filters,
    orderBy: "created_at",
    ascending: true
  });
  const { insert: insertStudySession } = useTable("study_sessions", {
    orderBy: "started_at",
    ascending: false
  });

  const doneTasks = tasks.filter((task) => task.status === "done");
  const activeTasks = tasks.filter((task) => task.status !== "skipped");
  const done = doneTasks.length;
  const completion = percent(done, activeTasks.length);
  const plannedMinutes = activeTasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const doneMinutes = doneTasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const nextTask = tasks.find((task) => task.status === "doing") ?? tasks.find((task) => task.status === "todo");
  const nextTaskIsPending = nextTask ? pendingStatusTaskId === nextTask.id : false;
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
      if (!exists) await insertTask({ ...template, date: today });
    }
  }

  async function setStatus(task: Task, status: TaskStatus) {
    setPendingStatusTaskId(task.id);
    setMutationError(null);
    const result = await updateTask(task.id, { status });
    if (result.error) setMutationError(result.error);
    setPendingStatusTaskId(null);
    return !result.error;
  }

  async function recordFocusSession(task: Task, startedAt: string, elapsedSeconds: number) {
    const minutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    setMutationError(null);
    const result = await insertStudySession({
      subject: task.subject,
      started_at: startedAt,
      ended_at: new Date().toISOString(),
      minutes,
      note: task.title
    });
    if (result.error) setMutationError(result.error);
    return !result.error;
  }

  function scrollToFocusTimer() {
    document.getElementById("focus-timer")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted">{nextTask?.status === "doing" ? "正在进行" : "下一件事"}</p>
                  {nextTask?.status === "doing" ? <Badge className="border-accent/20 bg-accent/10 text-accent">进行中</Badge> : null}
                </div>
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
                  <button className={buttonClass} disabled={nextTaskIsPending} onClick={() => setStatus(nextTask, "done")} type="button">
                    <CheckCircle2 className="h-4 w-4" />
                    {nextTaskIsPending ? "保存中" : "完成"}
                  </button>
                  <button
                    className={ghostButtonClass}
                    disabled={nextTaskIsPending}
                    onClick={scrollToFocusTimer}
                    type="button"
                  >
                    <TimerReset className="h-4 w-4" />
                    选择任务开始专注
                  </button>
                </>
              ) : (
                <button className={buttonClass} onClick={addTemplateTasks} type="button">
                  <Plus className="h-4 w-4" />
                  生成今日计划
                </button>
              )}
            </div>
            {mutationError ? <p className="rounded-md border border-politics/20 bg-politics/10 p-3 text-sm text-politics">{mutationError}</p> : null}
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

      <FocusTimer
        addTemplateTasks={addTemplateTasks}
        onRecordSession={recordFocusSession}
        onSetStatus={setStatus}
        tasks={activeTasks}
      />

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
                  disabled={pendingStatusTaskId === task.id}
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

function FocusTimer({
  addTemplateTasks,
  onRecordSession,
  onSetStatus,
  tasks
}: {
  addTemplateTasks: () => Promise<void>;
  onRecordSession: (task: Task, startedAt: string, elapsedSeconds: number) => Promise<boolean>;
  onSetStatus: (task: Task, status: TaskStatus) => Promise<boolean>;
  tasks: Task[];
}) {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<FocusStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(pomodoroSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [timerError, setTimerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectableTasks = tasks.filter((task) => task.status !== "done" && task.status !== "skipped");
  const selectedTask = taskId ? tasks.find((task) => task.id === taskId) ?? null : null;
  const timerProgress = percent(pomodoroSeconds - secondsLeft, pomodoroSeconds);
  const elapsedMinutes = Math.ceil(elapsedSeconds / 60);

  useEffect(() => {
    const rawSnapshot = window.localStorage.getItem(focusStorageKey);
    if (!rawSnapshot) return;

    try {
      const snapshot = JSON.parse(rawSnapshot) as FocusSnapshot;
      const secondsPassedAfterSave =
        snapshot.status === "running" ? Math.max(0, Math.floor((Date.now() - new Date(snapshot.updatedAt).getTime()) / 1000)) : 0;
      const nextSecondsLeft = Math.max(0, snapshot.secondsLeft - secondsPassedAfterSave);
      const nextElapsedSeconds = Math.min(pomodoroSeconds, snapshot.elapsedSeconds + secondsPassedAfterSave);

      setTaskId(snapshot.taskId);
      setSecondsLeft(nextSecondsLeft);
      setElapsedSeconds(nextElapsedSeconds);
      setStartedAt(snapshot.startedAt);
      setStatus(nextSecondsLeft === 0 && snapshot.status !== "idle" ? "finished" : snapshot.status);
    } catch {
      window.localStorage.removeItem(focusStorageKey);
    }
  }, []);

  useEffect(() => {
    if (status === "idle" || !taskId) {
      window.localStorage.removeItem(focusStorageKey);
      return;
    }

    const snapshot: FocusSnapshot = {
      taskId,
      status,
      secondsLeft,
      elapsedSeconds,
      startedAt,
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(focusStorageKey, JSON.stringify(snapshot));
  }, [elapsedSeconds, secondsLeft, startedAt, status, taskId]);

  useEffect(() => {
    if (status !== "running") return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setStatus("finished");
          return 0;
        }
        return current - 1;
      });
      setElapsedSeconds((current) => Math.min(pomodoroSeconds, current + 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [status]);

  async function startTask(task: Task) {
    setTimerError(null);
    const started = await onSetStatus(task, "doing");
    if (!started) return;

    setTaskId(task.id);
    setSecondsLeft(pomodoroSeconds);
    setElapsedSeconds(0);
    setStartedAt(new Date().toISOString());
    setStatus("running");
  }

  function resetRound() {
    setTimerError(null);
    setSecondsLeft(pomodoroSeconds);
    setElapsedSeconds(0);
    setStartedAt(new Date().toISOString());
    setStatus("running");
  }

  function stopWithoutSaving() {
    setTimerError(null);
    setTaskId(null);
    setSecondsLeft(pomodoroSeconds);
    setElapsedSeconds(0);
    setStartedAt(null);
    setStatus("idle");
  }

  async function saveSession(markDone: boolean) {
    if (!selectedTask || !startedAt) return;
    setSaving(true);
    setTimerError(null);

    const saved = await onRecordSession(selectedTask, startedAt, elapsedSeconds);
    if (!saved) {
      setSaving(false);
      return;
    }

    if (markDone) {
      const completed = await onSetStatus(selectedTask, "done");
      if (!completed) {
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    stopWithoutSaving();
  }

  return (
    <Card className="space-y-4" id="focus-timer">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">专注计时</h2>
          <p className="mt-1 text-sm text-muted">先选任务，再开始 25 分钟。暂停、重置、结束记录都在这里完成。</p>
        </div>
        <Badge className="border-accent/20 bg-accent/10 text-accent">番茄钟</Badge>
      </div>

      {status === "idle" || !selectedTask ? (
        <div className="space-y-3">
          {selectableTasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-paper p-4">
              <p className="text-sm text-muted">今天还没有可专注的任务。先生成计划，再选择一项开始。</p>
              <button className={`${ghostButtonClass} mt-3`} onClick={addTemplateTasks} type="button">
                <Plus className="h-4 w-4" />
                生成今日计划
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {selectableTasks.map((task) => (
                <div className="rounded-md border border-line bg-paper p-3" key={task.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{task.title}</p>
                    <Badge className={subjectColors[task.subject]}>{subjects[task.subject]}</Badge>
                    {task.status === "doing" ? <Badge className="border-accent/20 bg-accent/10 text-accent">进行中</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {task.material || "未填资料"} · {task.chapter || "未填章节"} · 计划 {task.estimated_minutes} 分钟
                  </p>
                  <button className={`${buttonClass} mt-3`} onClick={() => startTask(task)} type="button">
                    <Play className="h-4 w-4" />
                    开始 25 分钟
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex justify-center lg:justify-start">
            <ProgressRing label={status === "finished" ? "本轮完成" : "专注中"} value={timerProgress} />
          </div>
          <div className="min-w-0 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted">{statusLabels[status]}</p>
                <Badge className={subjectColors[selectedTask.subject]}>{subjects[selectedTask.subject]}</Badge>
              </div>
              <h3 className="mt-2 text-2xl font-semibold leading-tight">{selectedTask.title}</h3>
              <p className="mt-1 text-sm text-muted">
                已专注 {elapsedMinutes} 分钟 · {selectedTask.material || "未填资料"} · {selectedTask.chapter || "未填章节"}
              </p>
            </div>

            <div className="rounded-md border border-line bg-paper p-4 text-center">
              <p className="font-mono text-5xl font-semibold leading-none text-ink">{formatTimer(secondsLeft)}</p>
              <p className="mt-2 text-sm text-muted">{status === "finished" ? "本轮结束，可以记录时长或完成任务。" : "保持单任务推进，暂停时不会继续计时。"}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {status === "running" ? (
                <button className={ghostButtonClass} onClick={() => setStatus("paused")} type="button">
                  <Pause className="h-4 w-4" />
                  暂停
                </button>
              ) : null}
              {status === "paused" ? (
                <button className={buttonClass} onClick={() => setStatus("running")} type="button">
                  <Play className="h-4 w-4" />
                  继续
                </button>
              ) : null}
              <button className={ghostButtonClass} onClick={resetRound} type="button">
                <RotateCcw className="h-4 w-4" />
                重新开始
              </button>
              <button className={ghostButtonClass} disabled={saving || elapsedSeconds === 0} onClick={() => saveSession(false)} type="button">
                <Square className="h-4 w-4" />
                {saving ? "保存中" : "结束并记录"}
              </button>
              <button className={buttonClass} disabled={saving || elapsedSeconds === 0} onClick={() => saveSession(true)} type="button">
                <CheckCircle2 className="h-4 w-4" />
                {saving ? "保存中" : "完成任务"}
              </button>
              <button className={ghostButtonClass} disabled={saving} onClick={stopWithoutSaving} type="button">
                换任务
              </button>
            </div>

            {timerError ? <p className="rounded-md border border-politics/20 bg-politics/10 p-3 text-sm text-politics">{timerError}</p> : null}
          </div>
        </div>
      )}
    </Card>
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

const statusLabels: Record<FocusStatus, string> = {
  idle: "等待开始",
  running: "正在专注",
  paused: "已暂停",
  finished: "本轮完成"
};

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${restSeconds.toString().padStart(2, "0")}`;
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
