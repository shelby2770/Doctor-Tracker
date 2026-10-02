"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import type { SortOption } from "@/lib/types";

export interface DoctorFilterState {
  search: string;
  specialization: string;
  hospital: string;
  startDate: string;
  endDate: string;
  sort: SortOption;
}

interface DoctorFiltersProps {
  value: DoctorFilterState;
  onChange: (patch: Partial<DoctorFilterState>) => void;
  onClear: () => void;
  specializations: string[];
  hospitals: string[];
}

export function DoctorFilters({
  value,
  onChange,
  onClear,
  specializations,
  hospitals,
}: DoctorFiltersProps) {
  const hasActive =
    !!value.search ||
    !!value.specialization ||
    !!value.hospital ||
    !!value.startDate ||
    !!value.endDate ||
    value.sort !== "newest";

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={value.search}
          onChange={(v) => onChange({ search: v })}
          placeholder="Search by name, specialization or hospital…"
          className="sm:max-w-md"
        />
        <div className="flex items-center gap-2 text-xs font-medium text-surface-400 sm:ml-auto">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Select
          value={value.specialization}
          onChange={(e) => onChange({ specialization: e.target.value })}
          aria-label="Filter by specialization"
        >
          <option value="">All specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          value={value.hospital}
          onChange={(e) => onChange({ hospital: e.target.value })}
          aria-label="Filter by hospital"
        >
          <option value="">All hospitals</option>
          {hospitals.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>

        <label className="flex flex-col">
          <span className="sr-only">From date</span>
          <input
            type="date"
            value={value.startDate}
            max={value.endDate || undefined}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="h-10 w-full rounded-lg border border-surface-300 bg-white px-3 text-sm text-surface-700 hover:border-surface-400 focus-ring"
            aria-label="Created from"
          />
        </label>

        <label className="flex flex-col">
          <span className="sr-only">To date</span>
          <input
            type="date"
            value={value.endDate}
            min={value.startDate || undefined}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="h-10 w-full rounded-lg border border-surface-300 bg-white px-3 text-sm text-surface-700 hover:border-surface-400 focus-ring"
            aria-label="Created to"
          />
        </label>

        <Select
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOption })}
          aria-label="Sort"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </Select>

        {hasActive ? (
          <button
            onClick={onClear}
            className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50 focus-ring"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
