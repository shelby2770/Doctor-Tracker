import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
        <Activity className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-surface-900">Doctor Tracker</p>
        <p className="text-[11px] text-surface-400">Admin Portal</p>
      </div>
    </div>
  );
}
