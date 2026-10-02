"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiItemResponse, DashboardStats } from "@/lib/types";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const { data } = await api.get<ApiItemResponse<DashboardStats>>("/dashboard/stats");
      return data.data;
    },
    staleTime: 60_000,
  });
}
