import type { SortOrder } from 'mongoose';

type SortKey = 'newest' | 'oldest' | 'name_asc' | 'name_desc';

/** Map a friendly sort key to a Mongo sort spec. */
export function getSortSpec(sort: SortKey): Record<string, SortOrder> {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'name_asc':
      return { name: 1 };
    case 'name_desc':
      return { name: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

/**
 * Build an inclusive createdAt range filter from optional start/end dates.
 * The end date is pushed to the end of that day so "to 2024-01-31" includes
 * everything created on the 31st.
 */
export function buildDateRange(
  startDate?: Date,
  endDate?: Date,
): Record<string, Date> | undefined {
  if (!startDate && !endDate) return undefined;
  const range: Record<string, Date> = {};
  if (startDate) range.$gte = startDate;
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
}
