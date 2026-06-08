"use client";

export type SectionTab<TValue extends string> = {
  value: TValue;
  label: string;
  count?: number;
};

export function SectionTabs<TValue extends string>({
  tabs,
  value,
  onChange,
  className = ""
}: {
  tabs: SectionTab<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
}) {
  return (
    <div className={`flex max-w-full gap-2 overflow-x-auto rounded-md border border-line bg-panel p-1 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            aria-selected={active}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${
              active ? "bg-accent text-white" : "text-muted hover:bg-paper hover:text-ink"
            }`}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
            {typeof tab.count === "number" ? <span className={active ? "text-white/80" : "text-muted"}>{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
