import type { ReactNode } from "react";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-semibold tracking-normal text-ink">{title}</h1>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-line bg-panel p-4 shadow-soft ${className}`}>{children}</section>;
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

export function ProgressRing({
  value,
  label,
  size = "lg",
  tone = "var(--ring-color, #256f68)"
}: {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  tone?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const dimensions = size === "sm" ? "h-20 w-20" : size === "md" ? "h-28 w-28" : "h-44 w-44";
  const textSize = size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-5xl";

  return (
    <div
      aria-label={`${label ?? "进度"} ${safeValue}%`}
      className={`grid shrink-0 place-items-center rounded-full ${dimensions}`}
      role="img"
      style={{ background: `conic-gradient(${tone} ${safeValue * 3.6}deg, #ebe7df 0deg)` }}
    >
      <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-panel text-center shadow-soft">
        <div>
          <p className={`${textSize} font-semibold leading-none text-ink`}>{safeValue}%</p>
          {label ? <p className="mt-1 text-xs text-muted">{label}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border-line bg-white text-sm shadow-sm focus:border-accent focus:ring-accent";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm font-medium text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-60";
