"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Card, PageHeader, ghostButtonClass, inputClass } from "@/components/ui";
import { Protected } from "@/components/Protected";
import { grammarModules } from "@/data/grammar";

export default function GrammarPage() {
  return (
    <Protected>
      <GrammarView />
    </Protected>
  );
}

function GrammarView() {
  const [query, setQuery] = useState("");
  const filteredModules = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return grammarModules;
    return grammarModules.filter((module) => {
      const content = [
        module.title,
        module.summary,
        ...module.keyPoints,
        ...module.examples,
        ...module.commonMistakes
      ].join(" ").toLowerCase();
      return content.includes(keyword);
    });
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="英语语法参考" description="用静态内容组织考研英语一语法框架，后续可以继续扩展例句和长难句拆解。" />
        <Link className={ghostButtonClass} href="/english">
          <ArrowLeft className="h-4 w-4" />
          返回单词统计
        </Link>
      </div>

      <Card>
        <label className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            className={inputClass}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索语法模块、例句或易错点"
            value={query}
          />
        </label>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <h2 className="text-lg font-semibold">目录</h2>
            <nav className="mt-3 space-y-1">
              {filteredModules.map((module) => (
                <a className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-paper hover:text-ink" href={`#${module.id}`} key={module.id}>
                  {module.title}
                </a>
              ))}
            </nav>
          </Card>
        </aside>

        <div className="space-y-4">
          {filteredModules.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">没有匹配的语法模块。可以换一个关键词试试。</p>
            </Card>
          ) : null}
          {filteredModules.map((module) => (
            <Card className="scroll-mt-24" key={module.id}>
              <article id={module.id}>
                <h2 className="text-xl font-semibold">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{module.summary}</p>

                <GrammarList title="核心规则" items={module.keyPoints} />
                <GrammarList title="例句" items={module.examples} />
                <GrammarList title="常见易错点" items={module.commonMistakes} />
              </article>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function GrammarList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p className="rounded-md border border-line bg-paper p-3 text-sm leading-6 text-muted" key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
