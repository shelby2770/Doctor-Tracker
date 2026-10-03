"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, use, type ReactNode } from "react";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth-token";
import type { ApiItemResponse, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Clear cached auth after login/logout so guards re-evaluate. */
  refresh: () => Promise<void>;
  clear: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<ApiItemResponse<{ user: User }>>("/auth/me");
    return data.data.user;
  } catch {
    // 401 -> not logged in; treated as "no user", not an error state.
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 60_000,
    retry: false,
  });

  const user = data ?? null;

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    clear: () => {
      clearToken();
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
