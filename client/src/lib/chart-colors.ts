/** Cohesive, reasonably color-blind-friendly categorical palette. */
export const CHART_COLORS = [
  "#0d9488", // teal (brand)
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#ec4899", // pink
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ef4444", // red
];

/** Fixed colors for patient statuses so they read consistently everywhere. */
export const STATUS_COLORS: Record<string, string> = {
  Active: "#0ea5e9",
  Recovered: "#10b981",
  Critical: "#ef4444",
  "Under Observation": "#f59e0b",
};
