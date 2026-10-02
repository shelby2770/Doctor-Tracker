import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

type Accent = "primary" | "sky" | "emerald" | "amber";

const accents: Record<Accent, string> = {
  primary: "bg-primary-50 text-primary-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  hint,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  hint?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-surface-500">{label}</p>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accents[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-surface-900">
          {value}
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-surface-400">{hint}</p> : null}
    </div>
  );
}
