/** Centralised React Query keys so invalidation stays consistent. */
export const queryKeys = {
  auth: ["auth", "me"] as const,
  dashboard: ["dashboard", "stats"] as const,

  doctors: {
    all: ["doctors"] as const,
    list: (params: unknown) => ["doctors", "list", params] as const,
    detail: (id: string) => ["doctors", "detail", id] as const,
    patients: (id: string, params: unknown) =>
      ["doctors", id, "patients", params] as const,
    options: ["doctors", "options"] as const,
    selectList: ["doctors", "select-list"] as const,
  },

  patients: {
    all: ["patients"] as const,
    list: (params: unknown) => ["patients", "list", params] as const,
    detail: (id: string) => ["patients", "detail", id] as const,
    options: ["patients", "options"] as const,
  },
} as const;

/** Drop undefined / empty-string values so they don't become `?x=` noise. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as Partial<T>;
}
