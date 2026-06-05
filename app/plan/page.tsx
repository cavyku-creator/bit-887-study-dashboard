"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  Info,
  Layers3,
  ListChecks,
  Map,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Card, PageHeader, ProgressRing, buttonClass, ghostButtonClass } from "@/components/ui";
import { daysBetween, daysUntil, percent, todayISO } from "@/lib/date";
import {
  aiPromptKits,
  auxiliaryTools,
  bitTarget,
  dailyRhythm,
  estimatedExamEndDate,
  estimatedExamNotice,
  estimatedExamStartDate,
  foundationEndDate,
  foundationPhases,
  kickOffActions,
  officialAdmission,
  planStartDate,
  predictionNotes,
  professional887Scope,
  thirdPartyCrossChecks,
  weeklyCadence
} from "@/lib/plan";

export default function PlanPage() {
  return <PlanView />;
}

function PlanView() {
  const today = todayISO();
  const foundationTotalDays = daysBetween(planStartDate, foundationEndDate) + 1;
  const elapsedFoundationDays = Math.min(foundationTotalDays, Math.max(0, daysBetween(planStartDate, today) + 1));
  const foundationProgress = percent(elapsedFoundationDays, foundationTotalDays);
  const planDay = today < planStartDate ? "未开始" : `第 ${daysBetween(planStartDate, today) + 1} 天`;
  const currentPhase = foundationPhases.find((phase) => today >= phase.start && today <= phase.end) ?? foundationPhases[0];

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader title="北理工 085403 起步计划" description="从 2026-06-06 开始；所有结论按官方确认、第三方整理、预测待发布分层展示。" />

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <SourcePill sourceType="官方确认" />
              <h2 className="mt-2 break-words text-2xl font-semibold">{bitTarget.label}</h2>
              <p className="mt-2 break-words text-sm text-muted">{bitTarget.title} · {bitTarget.direction}</p>
            </div>
            <Badge className="border-accent/20 bg-accent/10 text-accent">从 {planStartDate} 开始</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {officialAdmission.subjects.map((subject) => (
              <div className="min-w-0 rounded-md border border-line bg-paper p-3 text-sm" key={subject}>
                <CheckCircle2 className="mb-2 h-4 w-4 text-accent" />
                <span className="break-words">{subject}</span>
              </div>
            ))}
          </div>

          <p className="rounded-md border border-line bg-paper p-3 text-sm text-muted">{bitTarget.note}</p>

          <div className="flex flex-wrap gap-3">
            <Link className={buttonClass} href="/tasks">
              <ListChecks className="h-4 w-4" />
              去生成今日任务
            </Link>
            <Link className={ghostButtonClass} href="/887">
              <BookOpenCheck className="h-4 w-4" />
              查看 887
            </Link>
          </div>
        </Card>

        <Card className="grid min-w-0 place-items-center gap-4">
          <ProgressRing label="基础轮" size="md" value={foundationProgress} />
          <div className="w-full space-y-2 text-sm">
            <MetricLine icon={<CalendarDays className="h-4 w-4" />} label="当前计划日" value={planDay} />
            <MetricLine icon={<Gauge className="h-4 w-4" />} label="当前阶段" value={currentPhase.title} />
            <MetricLine icon={<Clock3 className="h-4 w-4" />} label="距预计初试首日" value={`${daysUntil(estimatedExamStartDate)} 天`} />
          </div>
          <p className="w-full rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            {estimatedExamStartDate} 至 {estimatedExamEndDate} 为预计窗口，{estimatedExamNotice}。
          </p>
        </Card>
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-3">
        <SourceSummaryCard
          icon={<ShieldCheck className="h-5 w-5 text-accent" />}
          sourceType={officialAdmission.sourceType}
          title="官方专业目录"
          href={officialAdmission.sourceHref}
          items={[
            `${officialAdmission.collegeCode} ${officialAdmission.college}`,
            `${officialAdmission.majorCode} ${officialAdmission.major}，${officialAdmission.studyMode}`,
            `统考招生人数 ${officialAdmission.plannedEnrollment} 人`,
            officialAdmission.retestNote
          ]}
        />
        <SourceSummaryCard
          icon={<Info className="h-5 w-5 text-english" />}
          sourceType="第三方整理"
          title="交叉核对"
          items={thirdPartyCrossChecks.map((item) => `${item.title}：${item.value}`)}
        />
        <SourceSummaryCard
          icon={<AlertTriangle className="h-5 w-5 text-politics" />}
          sourceType="预测/待官方发布"
          title="不能写死的内容"
          items={predictionNotes.map((item) => `${item.title}：${item.value}`)}
        />
      </section>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Layers3 className="h-5 w-5 text-professional" />
          <h2 className="text-lg font-semibold">887 参考范围</h2>
          <SourcePill sourceType="官方确认+第三方整理" />
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          {professional887Scope.map((scope) => (
            <div className="min-w-0 rounded-md border border-line bg-paper p-4" key={scope.title}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{scope.title}</h3>
                <Badge className={scope.status === "初试主抓" ? "border-professional/20 bg-professional/10 text-professional" : "border-line bg-panel text-muted"}>{scope.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{scope.basis}</p>
              <div className="mt-3 space-y-1 text-sm">
                {scope.focus.map((item) => (
                  <p className="break-words" key={item}>· {item}</p>
                ))}
              </div>
              <p className="mt-3 rounded-md border border-line bg-panel p-3 text-sm text-muted">{scope.action}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Map className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">6月6日起步</h2>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          {kickOffActions.map((item) => (
            <div className="min-w-0 rounded-md border border-line bg-paper p-4" key={item.date}>
              <p className="text-sm text-muted">{item.date}</p>
              <h3 className="mt-1 font-semibold">{item.title}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {item.actions.map((action) => (
                  <li className="flex min-w-0 gap-2" key={action}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="break-words">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">阶段推进</h2>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {foundationPhases.map((phase) => {
              const active = today >= phase.start && today <= phase.end;
              return (
                <div className={`min-w-0 rounded-md border p-4 ${active ? "border-accent bg-accent/5" : "border-line bg-paper"}`} key={phase.title}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{phase.title}</h3>
                    <Badge className={active ? "border-accent/20 bg-accent/10 text-accent" : "border-line bg-panel text-muted"}>{phase.start} - {phase.end}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{phase.goal}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {phase.checkpoints.map((checkpoint) => (
                      <li className="flex min-w-0 gap-2" key={checkpoint}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="break-words">{checkpoint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">每日时间块</h2>
          </div>
          <div className="space-y-3">
            {dailyRhythm.map((block) => (
              <div className="min-w-0 rounded-md border border-line bg-paper p-3" key={block.time}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{block.title}</p>
                  <span className="shrink-0 text-xs text-muted">{block.time}</span>
                </div>
                <p className="mt-1 break-words text-sm text-muted">{block.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">每周节奏</h2>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {weeklyCadence.map((item) => (
            <div className="min-w-0 rounded-md border border-line bg-paper p-4" key={item.label}>
              <p className="text-sm text-muted">{item.label}</p>
              <h3 className="mt-2 font-semibold">{item.focus}</h3>
              <p className="mt-2 break-words text-sm text-muted">{item.output}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">工具链</h2>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {auxiliaryTools.map((tool) => (
              <div className="min-w-0 rounded-md border border-line bg-paper p-4" key={tool.name}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <Badge className="border-line bg-panel text-muted">{tool.kind}</Badge>
                </div>
                <p className="mt-2 break-words text-sm text-muted">{tool.use}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {tool.workflow.map((step) => (
                    <li className="flex min-w-0 gap-2" key={step}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="break-words">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">AI 提示词</h2>
          </div>
          <div className="space-y-3">
            {aiPromptKits.map((kit) => (
              <div className="min-w-0 rounded-md border border-line bg-paper p-4" key={kit.title}>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="font-semibold">{kit.title}</h3>
                </div>
                <p className="break-words text-sm text-muted">{kit.prompt}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">来源链接</h2>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          <SourceLink href={officialAdmission.sourceHref} sourceType={officialAdmission.sourceType} title={officialAdmission.sourceTitle} />
          {thirdPartyCrossChecks.map((source) => (
            <SourceLink href={source.href} key={source.href} sourceType={source.sourceType} title={source.title} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function SourceSummaryCard({ icon, sourceType, title, href, items }: { icon: ReactNode; sourceType: string; title: string; href?: string; items: string[] }) {
  return (
    <Card className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        <SourcePill sourceType={sourceType} />
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li className="flex min-w-0 gap-2" key={item}>
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <span className="break-words text-muted">{item}</span>
          </li>
        ))}
      </ul>
      {href ? (
        <a className={`${ghostButtonClass} mt-4 w-full break-words`} href={href} rel="noreferrer" target="_blank">
          <ExternalLink className="h-4 w-4" />
          查看官方页面
        </a>
      ) : null}
    </Card>
  );
}

function SourceLink({ href, sourceType, title }: { href: string; sourceType: string; title: string }) {
  return (
    <a className="block min-w-0 rounded-md border border-line bg-paper p-3 text-sm hover:border-accent" href={href} rel="noreferrer" target="_blank">
      <SourcePill sourceType={sourceType} />
      <span className="mt-2 block break-words font-medium text-ink">{title}</span>
      <span className="mt-1 block break-all text-xs text-muted">{href}</span>
    </a>
  );
}

function SourcePill({ sourceType }: { sourceType: string }) {
  const className = sourceType.includes("官方")
    ? "border-accent/20 bg-accent/10 text-accent"
    : sourceType.includes("预测")
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-english/20 bg-english/10 text-english";

  return <Badge className={className}>{sourceType}</Badge>;
}

function MetricLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-paper p-3">
      <span className="flex min-w-0 items-center gap-2 text-muted">
        {icon}
        <span className="break-words">{label}</span>
      </span>
      <span className="break-words font-medium">{value}</span>
    </div>
  );
}
