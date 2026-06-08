"use client";

import Link from "next/link";
import { BarChart3, BookOpenCheck, CalendarDays, CheckCircle2, Languages, ListPlus, RotateCcw, Save, Target, Trash2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { MiniBarChart } from "@/components/charts/MiniBarChart";
import { SparklineChart } from "@/components/charts/SparklineChart";
import { MetricCard } from "@/components/MetricCard";
import { Card, Field, PageHeader, ProgressRing, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { percent, todayISO } from "@/lib/date";
import { hasHitDailyVocabularyTarget } from "@/lib/stats";
import { englishBookPlanTemplates } from "@/lib/templates";
import { useTable } from "@/lib/use-table";
import { useVocabularyStats, type VocabularyStatDraft } from "@/lib/use-vocabulary-stats";
import type { EnglishDailyStat, JsonValue } from "@/lib/types";

const TOTAL_WORDS = 7941;

const initialStat: VocabularyStatDraft = {
  date: todayISO(),
  app_name: "不背单词",
  new_words: 0,
  reviewed_words: 0,
  study_minutes: 0,
  accuracy: null,
  note: "",
  target_new_words: 50,
  target_reviewed_words: 100,
  check_in_status: "done"
};

export default function EnglishPage() {
  return (
    <Protected>
      <VocabularyStatsView />
    </Protected>
  );
}

function VocabularyStatsView() {
  const [draft, setDraft] = useState<VocabularyStatDraft>(initialStat);
  const stats = useVocabularyStats();
  const today = todayISO();
  const profiles = useTable("profiles", { limit: 1 });
  const englishTasks = useTable("tasks", {
    filters: [
      { column: "date", value: today },
      { column: "subject", value: "english" }
    ],
    orderBy: "created_at",
    ascending: true
  });

  const vocabTarget = readVocabTarget(profiles.rows[0]?.study_preferences) ?? TOTAL_WORDS;
  const todayStat = stats.rows.find((row) => row.date === today);
  const learned = Math.min(vocabTarget, stats.summary.totalNewWords);
  const remaining = Math.max(0, vocabTarget - learned);
  const progress = percent(learned, vocabTarget);
  const recentSeven = stats.series.slice(-7).map((row) => ({
    label: row.date.slice(5),
    value: row.new_words,
    secondaryValue: row.reviewed_words
  }));
  const trendSeries = stats.series.map((row) => ({
    label: row.date.slice(5),
    value: row.new_words + row.reviewed_words
  }));
  const achievementMessages = useMemo(() => buildAchievementMessages(stats.summary.streakDays, todayStat, stats.series), [stats.series, stats.summary.streakDays, todayStat]);

  async function saveStat() {
    const payload: VocabularyStatDraft = {
      ...draft,
      new_words: Number(draft.new_words),
      reviewed_words: Number(draft.reviewed_words),
      study_minutes: Number(draft.study_minutes),
      accuracy: draft.accuracy === null ? null : Number(draft.accuracy),
      note: draft.note || null,
      target_new_words: draft.target_new_words === null ? null : Number(draft.target_new_words),
      target_reviewed_words: draft.target_reviewed_words === null ? null : Number(draft.target_reviewed_words)
    };
    const result = await stats.saveStat(payload);
    if (!result.error) setDraft({ ...initialStat, date: todayISO() });
  }

  function fillFromRow(row: EnglishDailyStat) {
    setDraft({
      date: row.date,
      app_name: row.app_name,
      new_words: row.new_words,
      reviewed_words: row.reviewed_words,
      study_minutes: row.study_minutes,
      accuracy: row.accuracy,
      note: row.note ?? "",
      target_new_words: row.target_new_words,
      target_reviewed_words: row.target_reviewed_words,
      check_in_status: row.check_in_status
    });
  }

  async function addBookPlanToToday() {
    for (const task of englishBookPlanTemplates) {
      const exists = englishTasks.rows.some((row) => row.title === task.title && row.material === task.material);
      if (!exists) await englishTasks.insert({ ...task, date: today });
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="单词统计" description="记录不背单词进度，并把唐迟阅读、田静语法纳入每日英语计划。" />

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="grid place-items-center gap-4">
          <ProgressRing label="总词量" size="md" tone="#6b6aa8" value={progress} />
          <div className="text-center">
            <p className="font-medium">{learned} / {vocabTarget} 词</p>
            <p className="mt-1 text-sm text-muted">剩余 {remaining} 词</p>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<CalendarDays className="h-5 w-5 text-english" />} label="今日新词" value={todayStat?.new_words ?? 0} suffix="词" />
          <MetricCard icon={<RotateCcw className="h-5 w-5 text-english" />} label="今日复习" value={todayStat?.reviewed_words ?? 0} suffix="词" />
          <MetricCard icon={<Target className="h-5 w-5 text-english" />} label="连续打卡" value={stats.summary.streakDays} suffix="天" />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5 text-english" />} label="累计复习" value={stats.summary.totalReviewedWords} suffix="词" />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<BarChart3 className="h-5 w-5 text-english" />} label="本周新词" value={stats.summary.currentWeekNewWords} suffix="词" />
        <MetricCard icon={<RotateCcw className="h-5 w-5 text-english" />} label="本周复习" value={stats.summary.currentWeekReviewedWords} suffix="词" />
        <MetricCard icon={<TrendingUp className="h-5 w-5 text-english" />} label="本月新词" value={stats.summary.currentMonthNewWords} suffix="词" />
        <MetricCard icon={<CheckCircle2 className="h-5 w-5 text-english" />} label="本月复习" value={stats.summary.currentMonthReviewedWords} suffix="词" />
      </div>

      {achievementMessages.length > 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">今日反馈</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {achievementMessages.map((message) => (
              <p className="rounded-md border border-line bg-paper p-3 text-sm text-muted" key={message}>{message}</p>
            ))}
          </div>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">最近 7 天</h2>
            <p className="mt-1 text-sm text-muted">新词和复习量对照。</p>
          </div>
          <MiniBarChart data={recentSeven} />
        </Card>
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">最近 30 天趋势</h2>
            <p className="mt-1 text-sm text-muted">按每天新词与复习合计绘制。</p>
          </div>
          <SparklineChart data={trendSeries} label="词汇训练量" />
        </Card>
      </section>

      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">英语书目计划</h2>
            <p className="mt-1 text-sm text-muted">不录入书中内容，只把每天要做的学习动作放进计划。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={ghostButtonClass} href="/english/grammar">
              <Languages className="h-4 w-4" />
              语法参考
            </Link>
            <button className={ghostButtonClass} onClick={addBookPlanToToday} type="button">
              <ListPlus className="h-4 w-4" />
              补齐今日英语计划
            </button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <BookPlanCard
            title="田静《句句真研》"
            focus="语法体系与句法分析"
            steps={["每天 1 个语法点", "拆 2 句句子结构", "记录看不懂的从句/修饰关系"]}
            minutes="约 35 分钟"
          />
          <BookPlanCard
            title="唐迟《阅读的逻辑》"
            focus="阅读方法与真题拆解"
            steps={["每天 1 个方法点", "配 1 篇阅读精读", "复盘错题定位和选项陷阱"]}
            minutes="约 55 分钟"
          />
        </div>
        <p className="mt-3 text-sm text-muted">建议顺序：先用句句真研补语法和句法，再做阅读的逻辑；阅读不要贪多，重在复盘。</p>
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">今日背词记录</h2>
          <p className="mt-1 text-sm text-muted">每天从不背单词抄关键数字过来：新词、复习、学习分钟，也可以记录今日目标。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="日期"><input className={inputClass} onChange={(event) => setDraft({ ...draft, date: event.target.value })} type="date" value={draft.date} /></Field>
          <Field label="App"><input className={inputClass} onChange={(event) => setDraft({ ...draft, app_name: event.target.value })} value={draft.app_name} /></Field>
          <Field label="打卡状态">
            <select className={inputClass} onChange={(event) => setDraft({ ...draft, check_in_status: event.target.value as VocabularyStatDraft["check_in_status"] })} value={draft.check_in_status}>
              <option value="done">完成</option>
              <option value="partial">部分完成</option>
              <option value="missed">未完成</option>
            </select>
          </Field>
          <Field label="今日新词"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, new_words: Number(event.target.value) })} type="number" value={draft.new_words} /></Field>
          <Field label="复习词数"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, reviewed_words: Number(event.target.value) })} type="number" value={draft.reviewed_words} /></Field>
          <Field label="学习分钟"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, study_minutes: Number(event.target.value) })} type="number" value={draft.study_minutes} /></Field>
          <Field label="新词目标"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, target_new_words: event.target.value === "" ? null : Number(event.target.value) })} type="number" value={draft.target_new_words ?? ""} /></Field>
          <Field label="复习目标"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, target_reviewed_words: event.target.value === "" ? null : Number(event.target.value) })} type="number" value={draft.target_reviewed_words ?? ""} /></Field>
          <Field label="正确率 %"><input className={inputClass} max={100} min={0} onChange={(event) => setDraft({ ...draft, accuracy: event.target.value === "" ? null : Number(event.target.value) })} type="number" value={draft.accuracy ?? ""} /></Field>
          <div className="md:col-span-3"><Field label="备注"><input className={inputClass} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="例如 今天复习旧词比较吃力" value={draft.note ?? ""} /></Field></div>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={saveStat} type="button">
          <Save className="h-4 w-4" />
          保存统计
        </button>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">最近记录</h2>
            <p className="mt-1 text-sm text-muted">点击编辑可回填到上面的表单。</p>
          </div>
          <p className="text-sm text-muted">累计学习 {stats.summary.totalStudyMinutes} 分钟</p>
        </div>
        {stats.rows.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-paper p-4 text-sm text-muted">还没有背词统计。今天开始记第一条就行。</p>
        ) : (
          <div className="divide-y divide-line rounded-md border border-line">
            {stats.rows.slice(0, 14).map((row) => (
              <div className="grid gap-3 p-3 md:grid-cols-[1fr_auto]" key={row.id}>
                <div>
                  <p className="font-medium">{row.date} · {row.app_name}</p>
                  <p className="mt-1 text-sm text-muted">
                    新词 {row.new_words} · 复习 {row.reviewed_words} · {row.study_minutes} 分钟
                    {row.accuracy !== null ? ` · 正确率 ${row.accuracy}%` : ""}
                  </p>
                  {row.note ? <p className="mt-1 text-sm text-muted">{row.note}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button className={ghostButtonClass} onClick={() => fillFromRow(row)} type="button">编辑</button>
                  <button className={ghostButtonClass} onClick={() => stats.remove(row.id)} type="button"><Trash2 className="h-4 w-4" />删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function BookPlanCard({ title, focus, steps, minutes }: { title: string; focus: string; steps: string[]; minutes: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <BookOpenCheck className="h-5 w-5 text-english" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{focus} · {minutes}</p>
      <div className="mt-3 space-y-2">
        {steps.map((step) => (
          <div className="flex items-center gap-2 text-sm" key={step}>
            <span className="h-1.5 w-1.5 rounded-full bg-english" />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function readVocabTarget(preferences?: Record<string, JsonValue>) {
  const value = preferences?.vocab_total_target;
  return typeof value === "number" && value > 0 ? value : null;
}

function buildAchievementMessages(streakDays: number, todayStat: EnglishDailyStat | undefined, series: Array<{ date: string; new_words: number; reviewed_words: number }>) {
  const messages: string[] = [];
  if (todayStat && hasHitDailyVocabularyTarget(todayStat)) messages.push("今日目标完成，明天按同样节奏继续。");
  if (streakDays >= 21) messages.push("连续打卡已达到 21 天，词汇循环进入稳定期。");
  else if (streakDays >= 14) messages.push("连续打卡已达到 14 天，复习惯性正在形成。");
  else if (streakDays >= 7) messages.push("连续打卡已达到 7 天，可以开始关注正确率和复习质量。");
  else if (streakDays >= 3) messages.push("连续打卡已达到 3 天，先把节奏保住。");

  const recent = series.slice(-3);
  if (recent.length === 3) {
    const totals = recent.map((item) => item.new_words + item.reviewed_words);
    if (totals[0] < totals[1] && totals[1] < totals[2]) messages.push("最近三天训练量持续上升，注意别用过量新词挤压复习。");
  }

  return messages;
}
