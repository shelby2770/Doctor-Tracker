"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

/** Build a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const items = getPageItems(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-100 px-5 py-3 sm:flex-row">
      <p className="text-xs text-surface-500">
        Showing <span className="font-medium text-surface-700">{from}</span>–
        <span className="font-medium text-surface-700">{to}</span> of{" "}
        <span className="font-medium text-surface-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!meta.hasPrevPage}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-40 focus-ring"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {items.map((item, idx) =>
          item === "…" ? (
            <span key={`e${idx}`} className="px-1 text-surface-400">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-ring",
                item === page
                  ? "bg-primary-600 text-white"
                  : "text-surface-600 hover:bg-surface-100",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!meta.hasNextPage}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-40 focus-ring"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
