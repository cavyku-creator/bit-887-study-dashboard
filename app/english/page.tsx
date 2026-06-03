"use client";

import { BarChart3, CalendarDays, CheckCircle2, RotateCcw, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, Field, PageHeader, ProgressRing, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { percent, todayISO } from "@/lib/date";
import { useTable } from "@/lib/use-table";
import type { EnglishDailyStat } from "@/lib/types";

const TOTAL_WORDS = 7941;

type StatDraft = Pick<EnglishDailyStat, "date" | "app_name" | "new_words" | "reviewed_words" | "study_minutes" | "accuracy" | "note">;

const initialStat: StatDraft = {
  date: todayISO(),
  app_name: "不背单词",
  new_words: 0,
  reviewed_words: 0,
  study_minutes: 0,
  accuracy: null,
  note: ""
};

export default function EnglishPage() {
  return (
    <Protected>
      <VocabularyStatsView />
    </Protected>
  );
}

function VocabularyStatsView() {
  const [draft, setDraft] = useState<StatDraft>(initialStat);
  const stats = useTable("english_daily_stats", { orderBy: "date", ascending: false });

  const summary = useMemo(() => {
    const today = todayISO();
    const todayStat = stats.rows.find((row) => row.date === today);
    const learned = Math.min(TOTAL_WORDS, stats.rows.reduce((sum, row) => sum + row.new_words, 0));
    const reviewed = stats.rows.reduce((sum, row) => sum + row.reviewed_words, 0);
    const minutes = stats.rows.reduce((sum, row) => sum + row.study_minutes, 0);
    const weekStart = getWeekStart(today);
    const weekStats = stats.rows.filter((row) => row.date >= weekStart && row.date <= today);
    const weekNew = weekStats.reduce((sum, row) => sum + row.new_words, 0);
    const weekReview = weekStats.reduce((sum, row) => sum + row.reviewed_words, 0);
    return {
      todayStat,
      learned,
      remaining: Math.max(0, TOTAL_WORDS - learned),
      reviewed,
      minutes,
      progress: percent(learned, TOTAL_WORDS),
      weekNew,
      weekReview
    };
  }, [stats.rows]);

  async function saveStat() {
    const payload = {
      ...draft,
      new_words: Number(draft.new_words),
      reviewed_words: Number(draft.reviewed_words),
      study_minutes: Number(draft.study_minutes),
      accuracy: draft.accuracy === null ? null : Number(draft.accuracy),
      note: draft.note || null
    };
    const existing = stats.rows.find((row) => row.date === payload.date && row.app_name === payload.app_name);
    const result = existing ? await stats.update(existing.id, payload) : await stats.insert(payload);
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
      note: row.note ?? ""
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="单词统计" description="记录每天不背单词的新词、复习词和总进度。目标词量 7941。" />

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="grid place-items-center gap-4">
          <ProgressRing label="总词量" size="md" tone="#6b6aa8" value={summary.progress} />
          <div className="text-center">
            <p className="font-medium">{summary.learned} / {TOTAL_WORDS} 词</p>
            <p className="mt-1 text-sm text-muted">剩余 {summary.remaining} 词</p>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<CalendarDays className="h-5 w-5 text-english" />} label="今日新词" value={summary.todayStat?.new_words ?? 0} suffix="词" />
          <Metric icon={<RotateCcw className="h-5 w-5 text-english" />} label="今日复习" value={summary.todayStat?.reviewed_words ?? 0} suffix="词" />
          <Metric icon={<BarChart3 className="h-5 w-5 text-english" />} label="本周新词" value={summary.weekNew} suffix="词" />
          <Metric icon={<CheckCircle2 className="h-5 w-5 text-english" />} label="累计复习" value={summary.reviewed} suffix="词" />
        </div>
      </section>

      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">今日背词记录</h2>
          <p className="mt-1 text-sm text-muted">每天从不背单词抄 3 个数字过来：新词、复习、学习分钟。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="日期"><input className={inputClass} onChange={(event) => setDraft({ ...draft, date: event.target.value })} type="date" value={draft.date} /></Field>
          <Field label="App"><input className={inputClass} onChange={(event) => setDraft({ ...draft, app_name: event.target.value })} value={draft.app_name} /></Field>
          <Field label="今日新词"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, new_words: Number(event.target.value) })} type="number" value={draft.new_words} /></Field>
          <Field label="复习词数"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, reviewed_words: Number(event.target.value) })} type="number" value={draft.reviewed_words} /></Field>
          <Field label="学习分钟"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, study_minutes: Number(event.target.value) })} type="number" value={draft.study_minutes} /></Field>
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
          <p className="text-sm text-muted">累计学习 {summary.minutes} 分钟</p>
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
                  <button className={ghostButtonClass} onClick={() => stats.remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix: string }) {
  return (
    <Card>
      {icon}
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted">{suffix}</p>
    </Card>
  );
}

function getWeekStart(dateISO: string) {
  const date = new Date(dateISO);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}
