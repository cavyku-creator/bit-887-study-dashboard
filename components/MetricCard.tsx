import type { ReactNode } from "react";
import { Card } from "./ui";

export function MetricCard({
  icon,
  label,
  value,
  suffix,
  detail,
  className = ""
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  suffix?: string;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold leading-none text-ink">
            {value}
            {suffix ? <span className="ml-1 text-sm font-medium text-muted">{suffix}</span> : null}
          </p>
        </div>
        {icon ? <div className="shrink-0 text-accent">{icon}</div> : null}
      </div>
      {detail ? <div className="mt-3 text-sm text-muted">{detail}</div> : null}
    </Card>
  );
}
