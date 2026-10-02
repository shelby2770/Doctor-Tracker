import axios, { AxiosError } from "axios";

/**
 * Single axios instance for the whole app.
 * `withCredentials` lets the browser send the httpOnly auth cookie that the
 * Express API sets on login, so we never store the JWT in JS-readable storage.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

interface ApiErrorBody {
  message?: string;
  details?: Record<string, string[] | string>;
}

/** Extract a human-readable message from an unknown error. */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const axiosErr = err as AxiosError<ApiErrorBody>;
  if (axiosErr?.isAxiosError) {
    return axiosErr.response?.data?.message ?? axiosErr.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Field-level validation errors returned by the API (Zod flatten shape). */
export function getFieldErrors(err: unknown): Record<string, string> {
  const axiosErr = err as AxiosError<ApiErrorBody>;
  const details = axiosErr?.response?.data?.details;
  if (!details) return {};
  return Object.fromEntries(
    Object.entries(details).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]),
  );
}
