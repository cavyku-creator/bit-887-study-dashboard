"use client";

import { BarChart3, Flame, Timer, Trophy } from "lucide-react";
import { Card, PageHeader, ProgressRing } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { percent, todayISO } from "@/lib/date";
import { subjectColors, subjects } from "@/lib/labels";
import { useTable } from "@/lib/use-table";
import type { Subject, Task } from "@/lib/types";

const subjectOrder: Subject[] = ["math", "english", "politics", "professional_887"];

export default function DashboardPage() {
  return <Protected><DashboardView /></Protected>;
}

function DashboardView() {
  const { rows: tasks } = useTable("tasks", { orderBy: "date", ascending: false });
  const { rows: sessions } = useTable("study_sessions", { orderBy: "started_at", ascending: false });
  const today = todayISO();
  const weekStart = getWeekStart(today);
  const todaysDoneTasks = tasks.filter((task) => task.date === today && task.status === "done");
  const todayMinutesFromTasks = todaysDoneTasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const todayMinutesFromSessions = sessions.filter((session) => session.started_at.slice(0, 10) === today).reduce((sum, session) => sum + session.minutes, 0);
  const todayMinutes = todayMinutesFromSessions || todayMinutesFromTasks;
  const weeklyTasks = tasks.filter((task) => task.date >= weekStart && task.date <= today);
  const weeklyDone = weeklyTasks.filter((task) => task.status === "done").length;
  const weeklyCompletion = percent(weeklyDone, weeklyTasks.length);
  const streak = calculateStreak(tasks, today);

  return (
    <div className="space-y-5">
      <PageHeader title="进度总览" description="首页负责今天，这里只看本周节奏和四科是否均衡。" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="grid place-items-center gap-4">
          <ProgressRing label="本周完成" size="md" value={weeklyCompletion} />
          <div className="text-center">
            <p className="text-sm text-muted">本周已完成 {weeklyDone}/{weeklyTasks.length} 项</p>
            <p className="mt-1 text-xs text-muted">按周一到今天计算</p>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card><Timer className="h-5 w-5 text-accent" /><p className="mt-3 text-sm text-muted">今日学习时长</p><p className="mt-1 text-3xl font-semibold">{todayMinutes}</p><p className="text-xs text-muted">分钟</p></Card>
          <Card><BarChart3 className="h-5 w-5 text-accent" /><p className="mt-3 text-sm text-muted">本周完成率</p><p className="mt-1 text-3xl font-semibold">{weeklyCompletion}%</p><p className="text-xs text-muted">{weeklyDone}/{weeklyTasks.length} 项</p></Card>
          <Card><Flame className="h-5 w-5 text-accent" /><p className="mt-3 text-sm text-muted">连续学习天数</p><p className="mt-1 text-3xl font-semibold">{streak}</p><p className="text-xs text-muted">天</p></Card>
          <Card><Trophy className="h-5 w-5 text-accent" /><p className="mt-3 text-sm text-muted">今日完成任务</p><p className="mt-1 text-3xl font-semibold">{todaysDoneTasks.length}</p><p className="text-xs text-muted">项</p></Card>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">四科进度</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subjectOrder.map((subject) => {
            const subjectTasks = tasks.filter((task) => task.subject === subject);
            const done = subjectTasks.filter((task) => task.status === "done").length;
            const progress = percent(done, subjectTasks.length);
            return (
              <div className="rounded-md border border-line p-4" key={subject}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{subjects[subject]}</h3>
                    <p className="mt-1 text-sm text-muted">已完成 {done} / 总任务 {subjectTasks.length}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs ${subjectColors[subject]}`}>{progress}%</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-paper">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">各科任务完成数量</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {subjectOrder.map((subject) => (
            <div className="rounded-md border border-line bg-paper p-3" key={subject}>
              <p className="text-sm text-muted">{subjects[subject]}</p>
              <p className="mt-2 text-2xl font-semibold">{tasks.filter((task) => task.subject === subject && task.status === "done").length}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function getWeekStart(dateISO: string) {
  const date = new Date(dateISO);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function calculateStreak(tasks: Task[], today: string) {
  const doneDates = new Set(tasks.filter((task) => task.status === "done").map((task) => task.date));
  let streak = 0;
  const cursor = new Date(today);
  while (doneDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
