"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams, queryKeys } from "@/lib/query-keys";
import type {
  ApiItemResponse,
  ApiListResponse,
  Patient,
  PatientFilterOptions,
  SortOption,
} from "@/lib/types";

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  condition?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  sort?: SortOption;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: string;
  phone: string;
  email: string;
  doctor: string;
}

/* ------------------------------- queries ------------------------------- */
export function usePatients(params: PatientListParams) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: queryKeys.patients.list(cleaned),
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<Patient>>("/patients", {
        params: cleaned,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function usePatientFilterOptions() {
  return useQuery({
    queryKey: queryKeys.patients.options,
    queryFn: async () => {
      const { data } = await api.get<ApiItemResponse<PatientFilterOptions>>(
        "/patients/meta/options",
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ------------------------------ mutations ------------------------------ */
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PatientInput) => {
      const { data } = await api.post<ApiItemResponse<Patient>>("/patients", input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      qc.invalidateQueries({ queryKey: queryKeys.patients.options });
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<PatientInput> }) => {
      const { data } = await api.patch<ApiItemResponse<Patient>>(`/patients/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
