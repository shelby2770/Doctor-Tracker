import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PatientStatus } from "@/lib/types";

type Tone = "primary" | "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-700 ring-primary-200",
  neutral: "bg-surface-100 text-surface-600 ring-surface-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusTone: Record<PatientStatus, Tone> = {
  Active: "info",
  Recovered: "success",
  Critical: "danger",
  "Under Observation": "warning",
};

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Badge tone={statusTone[status] ?? "neutral"}>{status}</Badge>;
}
