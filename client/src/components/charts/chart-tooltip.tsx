"use client";

import type { ReactNode } from "react";

interface TooltipEntry {
  name?: ReactNode;
  value?: ReactNode;
  color?: string;
}

/** Shared tooltip styling for all Recharts charts. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: ReactNode;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs shadow-lg">
      {label ? (
        <p className="mb-1 font-medium text-surface-700">{label}</p>
      ) : null}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-surface-600">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-semibold text-surface-900">
            {entry.value}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}
