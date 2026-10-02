"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { FullPageSpinner } from "@/components/ui/spinner";

/**
 * Client-side route protection. The *real* enforcement lives on the API
 * (every protected endpoint requires a valid JWT); this guard handles the
 * UX of redirecting unauthenticated visitors to the login screen.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <FullPageSpinner label="Loading your workspace…" />;
  if (!isAuthenticated) return <FullPageSpinner label="Redirecting to sign in…" />;

  return <>{children}</>;
}
