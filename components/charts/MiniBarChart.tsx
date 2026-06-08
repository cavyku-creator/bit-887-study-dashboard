"use client";

export type MiniBarDatum = {
  label: string;
  value: number;
  secondaryValue?: number;
};

export function MiniBarChart({
  data,
  height = 180,
  primaryLabel = "新词",
  secondaryLabel = "复习"
}: {
  data: MiniBarDatum[];
  height?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  const width = Math.max(320, data.length * 44);
  const chartHeight = height - 42;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.value, item.secondaryValue ?? 0]));
  const groupWidth = width / Math.max(1, data.length);
  const barWidth = Math.min(14, groupWidth / 4);

  return (
    <div className="w-full overflow-x-auto">
      <svg aria-label={`${primaryLabel}和${secondaryLabel}柱状图`} className="min-w-full" height={height} role="img" viewBox={`0 0 ${width} ${height}`}>
        <line stroke="#e5ded4" x1="0" x2={width} y1={chartHeight} y2={chartHeight} />
        {data.map((item, index) => {
          const x = index * groupWidth + groupWidth / 2;
          const primaryHeight = (item.value / maxValue) * (chartHeight - 16);
          const secondaryHeight = ((item.secondaryValue ?? 0) / maxValue) * (chartHeight - 16);
          return (
            <g key={`${item.label}-${index}`}>
              <rect fill="#6b6aa8" height={primaryHeight} rx="3" width={barWidth} x={x - barWidth - 2} y={chartHeight - primaryHeight} />
              <rect fill="#93a58d" height={secondaryHeight} rx="3" width={barWidth} x={x + 2} y={chartHeight - secondaryHeight} />
              <text fill="#80766a" fontSize="10" textAnchor="middle" x={x} y={height - 18}>
                {item.label}
              </text>
            </g>
          );
        })}
        <g transform={`translate(0 ${height - 8})`}>
          <circle cx="8" cy="-2" fill="#6b6aa8" r="4" />
          <text fill="#80766a" fontSize="11" x="18" y="2">{primaryLabel}</text>
          <circle cx="72" cy="-2" fill="#93a58d" r="4" />
          <text fill="#80766a" fontSize="11" x="82" y="2">{secondaryLabel}</text>
        </g>
      </svg>
    </div>
  );
}
