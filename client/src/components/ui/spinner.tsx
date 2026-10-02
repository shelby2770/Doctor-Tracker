import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-surface-500">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
