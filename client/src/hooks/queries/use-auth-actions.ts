"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiItemResponse, User } from "@/lib/types";

export interface LoginInput {
  email: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<ApiItemResponse<{ user: User; token: string }>>(
        "/auth/login",
        input,
      );
      return data.data.user;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
  });
}
