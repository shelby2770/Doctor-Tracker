/**
 * Access-token store for the cross-site deployment.
 *
 * In production the client (Vercel) and API (Render) are different sites, and
 * some browsers (Safari/Firefox) block the cross-site auth cookie. As a
 * fallback we also keep the JWT here and send it as `Authorization: Bearer`.
 * The httpOnly cookie remains the primary mechanism where it is allowed.
 *
 * Trade-off: a token in localStorage is readable by JS (XSS surface). That is
 * the accepted cost of supporting cross-site auth in all browsers.
 */
const TOKEN_KEY = "dt_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode, blocked) — cookie still works */
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
