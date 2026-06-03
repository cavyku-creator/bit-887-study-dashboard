"use client";

import { BarChart3, BookOpenText, Plus, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { todayISO } from "@/lib/date";
import { englishTypes } from "@/lib/labels";
import { useTable } from "@/lib/use-table";
import type { EnglishDailyStat, EnglishItem, EnglishType } from "@/lib/types";

type Draft = Pick<EnglishItem, "type" | "content" | "explanation" | "example" | "mistake_reason" | "review_count">;
type StatDraft = Pick<EnglishDailyStat, "date" | "app_name" | "new_words" | "reviewed_words" | "study_minutes" | "accuracy" | "note">;

const initial: Draft = { type: "word", content: "", explanation: "", example: "", mistake_reason: "", review_count: 0 };
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
      <EnglishView />
    </Protected>
  );
}

function EnglishView() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [statDraft, setStatDraft] = useState<StatDraft>(initialStat);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importType, setImportType] = useState<EnglishType>("word");
  const [message, setMessage] = useState<string | null>(null);
  const { rows, insert, update, remove } = useTable("english_items", { orderBy: "created_at", ascending: false });
  const stats = useTable("english_daily_stats", { orderBy: "date", ascending: false });

  const summary = useMemo(() => {
    const wordCount = rows.filter((row) => row.type === "word").length;
    const sentenceCount = rows.filter((row) => row.type === "sentence").length;
    const totalReviews = rows.reduce((sum, row) => sum + row.review_count, 0);
    const todayStat = stats.rows.find((row) => row.date === todayISO());
    const weekStart = getWeekStart(todayISO());
    const weekStats = stats.rows.filter((row) => row.date >= weekStart && row.date <= todayISO());
    const weekNewWords = weekStats.reduce((sum, row) => sum + row.new_words, 0);
    const weekMinutes = weekStats.reduce((sum, row) => sum + row.study_minutes, 0);
    return { wordCount, sentenceCount, totalReviews, todayStat, weekNewWords, weekMinutes };
  }, [rows, stats.rows]);

  async function save() {
    if (!draft.content.trim()) return;
    const payload = {
      ...draft,
      explanation: draft.explanation || null,
      example: draft.example || null,
      mistake_reason: draft.mistake_reason || null,
      review_count: Number(draft.review_count)
    };
    const result = editingId ? await update(editingId, payload) : await insert(payload);
    if (!result.error) {
      setDraft(initial);
      setEditingId(null);
    }
  }

  async function saveStat() {
    const payload = {
      ...statDraft,
      new_words: Number(statDraft.new_words),
      reviewed_words: Number(statDraft.reviewed_words),
      study_minutes: Number(statDraft.study_minutes),
      accuracy: statDraft.accuracy === null ? null : Number(statDraft.accuracy),
      note: statDraft.note || null
    };
    const existing = stats.rows.find((row) => row.date === payload.date && row.app_name === payload.app_name);
    const result = existing ? await stats.update(existing.id, payload) : await stats.insert(payload);
    if (!result.error) setStatDraft({ ...initialStat, date: todayISO() });
  }

  async function importItems() {
    setMessage(null);
    const parsed = parseImport(importText, importType);
    if (parsed.length === 0) {
      setMessage("没有识别到可导入内容。请按：内容｜解释｜例句｜错因，每条一行。");
      return;
    }
    for (const item of parsed) await insert(item);
    setImportText("");
    setMessage(`已导入 ${parsed.length} 条。`);
  }

  function edit(row: EnglishItem) {
    setEditingId(row.id);
    setDraft({
      type: row.type,
      content: row.content,
      explanation: row.explanation ?? "",
      example: row.example ?? "",
      mistake_reason: row.mistake_reason ?? "",
      review_count: row.review_count
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="英语模块" description="管理单词、长难句和不背单词每日统计；资料内容支持你手动导入。" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <BookOpenText className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">单词库</p>
          <p className="mt-1 text-3xl font-semibold">{summary.wordCount}</p>
        </Card>
        <Card>
          <BookOpenText className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">长难句</p>
          <p className="mt-1 text-3xl font-semibold">{summary.sentenceCount}</p>
        </Card>
        <Card>
          <BarChart3 className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">本周背词</p>
          <p className="mt-1 text-3xl font-semibold">{summary.weekNewWords}</p>
          <p className="text-xs text-muted">{summary.weekMinutes} 分钟</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">不背单词每日统计</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="日期"><input className={inputClass} onChange={(event) => setStatDraft({ ...statDraft, date: event.target.value })} type="date" value={statDraft.date} /></Field>
          <Field label="App"><input className={inputClass} onChange={(event) => setStatDraft({ ...statDraft, app_name: event.target.value })} value={statDraft.app_name} /></Field>
          <Field label="今日新词"><input className={inputClass} min={0} onChange={(event) => setStatDraft({ ...statDraft, new_words: Number(event.target.value) })} type="number" value={statDraft.new_words} /></Field>
          <Field label="复习词数"><input className={inputClass} min={0} onChange={(event) => setStatDraft({ ...statDraft, reviewed_words: Number(event.target.value) })} type="number" value={statDraft.reviewed_words} /></Field>
          <Field label="学习分钟"><input className={inputClass} min={0} onChange={(event) => setStatDraft({ ...statDraft, study_minutes: Number(event.target.value) })} type="number" value={statDraft.study_minutes} /></Field>
          <Field label="正确率 %"><input className={inputClass} max={100} min={0} onChange={(event) => setStatDraft({ ...statDraft, accuracy: event.target.value === "" ? null : Number(event.target.value) })} type="number" value={statDraft.accuracy ?? ""} /></Field>
          <div className="md:col-span-3"><Field label="备注"><input className={inputClass} onChange={(event) => setStatDraft({ ...statDraft, note: event.target.value })} value={statDraft.note ?? ""} /></Field></div>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={saveStat} type="button">保存今日统计</button>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {stats.rows.slice(0, 6).map((row) => (
            <div className="rounded-md border border-line bg-paper p-3 text-sm" key={row.id}>
              <p className="font-medium">{row.date} · {row.app_name}</p>
              <p className="mt-1 text-muted">新词 {row.new_words} · 复习 {row.reviewed_words} · {row.study_minutes} 分钟</p>
              {row.accuracy !== null ? <p className="text-muted">正确率 {row.accuracy}%</p> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">批量导入</h2>
        <p className="mb-3 text-sm text-muted">
          支持导入你自己整理的资料。格式：每行一条，列用 Tab、逗号或 `｜` 分隔：内容｜解释｜例句｜错因。
        </p>
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <Field label="导入类型">
            <select className={inputClass} onChange={(event) => setImportType(event.target.value as EnglishType)} value={importType}>
              {Object.entries(englishTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="粘贴内容">
            <textarea className={inputClass} onChange={(event) => setImportText(event.target.value)} placeholder="abandon｜放弃；抛弃｜abandon the plan｜熟词义不稳" value={importText} />
          </Field>
        </div>
        {message ? <p className="mt-3 rounded-md border border-line bg-paper p-3 text-sm text-muted">{message}</p> : null}
        <button className={`${ghostButtonClass} mt-4`} onClick={importItems} type="button"><Upload className="h-4 w-4" />导入资料</button>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "编辑英语记录" : "新增英语记录"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="类型"><select className={inputClass} onChange={(event) => setDraft({ ...draft, type: event.target.value as EnglishType })} value={draft.type}>{Object.entries(englishTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="复习次数"><input className={inputClass} min={0} onChange={(event) => setDraft({ ...draft, review_count: Number(event.target.value) })} type="number" value={draft.review_count} /></Field>
          <div className="md:col-span-2"><Field label="内容"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, content: event.target.value })} value={draft.content} /></Field></div>
          <Field label="解释"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} value={draft.explanation ?? ""} /></Field>
          <Field label="例句"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, example: event.target.value })} value={draft.example ?? ""} /></Field>
          <div className="md:col-span-2"><Field label="错误原因"><textarea className={inputClass} onChange={(event) => setDraft({ ...draft, mistake_reason: event.target.value })} value={draft.mistake_reason ?? ""} /></Field></div>
        </div>
        <button className={`${buttonClass} mt-4`} onClick={save} type="button"><Plus className="h-4 w-4" />{editingId ? "保存记录" : "新增记录"}</button>
      </Card>

      <div className="grid gap-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2"><Badge className="border-line bg-paper text-muted">{englishTypes[row.type]}</Badge><Badge className="border-line bg-paper text-muted">复习 {row.review_count} 次</Badge></div>
              <div className="flex gap-2"><button className={ghostButtonClass} onClick={() => update(row.id, { review_count: row.review_count + 1 })} type="button">复习+1</button><button className={ghostButtonClass} onClick={() => edit(row)} type="button">编辑</button><button className={ghostButtonClass} onClick={() => remove(row.id)} type="button"><Trash2 className="h-4 w-4" /></button></div>
            </div>
            <p className="mt-3 whitespace-pre-wrap font-medium">{row.content}</p>
            {row.explanation ? <p className="mt-2 text-sm text-muted">{row.explanation}</p> : null}
            {row.example ? <p className="mt-2 text-sm">{row.example}</p> : null}
            {row.mistake_reason ? <p className="mt-2 text-sm text-politics">{row.mistake_reason}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

function parseImport(text: string, type: EnglishType): Draft[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\t|,|，|｜|\|/).map((part) => part.trim());
      return {
        type,
        content: parts[0] ?? "",
        explanation: parts[1] ?? "",
        example: parts[2] ?? "",
        mistake_reason: parts[3] ?? "",
        review_count: 0
      };
    })
    .filter((item) => item.content);
}

function getWeekStart(dateISO: string) {
  const date = new Date(dateISO);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}
