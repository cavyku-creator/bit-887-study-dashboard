"use client";

export type SparklineDatum = {
  label: string;
  value: number;
};

export function SparklineChart({
  data,
  height = 180,
  label = "趋势"
}: {
  data: SparklineDatum[];
  height?: number;
  label?: string;
}) {
  const width = Math.max(360, data.length * 18);
  const padding = 18;
  const chartHeight = height - 34;
  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - item.value / maxValue) * (chartHeight - padding);
    return { x, y, item };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg aria-label={`${label}折线图`} className="min-w-full" height={height} role="img" viewBox={`0 0 ${width} ${height}`}>
        <line stroke="#e5ded4" x1={padding} x2={width - padding} y1={chartHeight} y2={chartHeight} />
        <polyline fill="none" points={line} stroke="#256f68" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point, index) => (
          <g key={`${point.item.label}-${index}`}>
            <circle cx={point.x} cy={point.y} fill="#f7f4ee" r="4" stroke="#256f68" strokeWidth="2" />
            {index === 0 || index === points.length - 1 || index % 6 === 0 ? (
              <text fill="#80766a" fontSize="10" textAnchor="middle" x={point.x} y={height - 10}>
                {point.item.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
