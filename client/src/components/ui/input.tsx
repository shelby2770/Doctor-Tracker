import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus-ring disabled:bg-surface-50 disabled:text-surface-400",
          invalid
            ? "border-rose-400 focus-visible:outline-rose-500"
            : "border-surface-300 hover:border-surface-400",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
