"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "@/lib/chart-colors";
import { ChartTooltip } from "./chart-tooltip";

interface Datum {
  name: string;
  value: number;
}

export function DonutChart({
  data,
  colorMap,
  height = 260,
}: {
  data: Datum[];
  colorMap?: Record<string, string>;
  height?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-2">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={colorMap?.[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-surface-900">{total}</span>
          <span className="text-xs text-surface-400">Total</span>
        </div>
      </div>

      <ul className="flex w-full flex-1 flex-col gap-2">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-surface-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    colorMap?.[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
              {entry.name}
            </span>
            <span className="font-medium text-surface-900">
              {entry.value}
              <span className="ml-1 text-xs font-normal text-surface-400">
                ({total ? Math.round((entry.value / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
