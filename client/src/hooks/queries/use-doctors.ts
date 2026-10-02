"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams, queryKeys } from "@/lib/query-keys";
import type {
  ApiItemResponse,
  ApiListResponse,
  Doctor,
  DoctorFilterOptions,
  Patient,
  SortOption,
} from "@/lib/types";

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  sort?: SortOption;
}

export interface DoctorInput {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

/* ------------------------------- queries ------------------------------- */
export function useDoctors(params: DoctorListParams) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: queryKeys.doctors.list(cleaned),
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<Doctor>>("/doctors", {
        params: cleaned,
      });
      return data;
    },
    placeholderData: keepPreviousData, // keep old page visible while fetching next
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiItemResponse<Doctor>>(`/doctors/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export interface DoctorPatientParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  condition?: string;
  startDate?: string;
  endDate?: string;
  sort?: SortOption;
}

export function useDoctorPatients(doctorId: string, params: DoctorPatientParams) {
  const cleaned = cleanParams(params);
  return useQuery({
    queryKey: queryKeys.doctors.patients(doctorId, cleaned),
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<Patient>>(
        `/doctors/${doctorId}/patients`,
        { params: cleaned },
      );
      return data;
    },
    enabled: !!doctorId,
    placeholderData: keepPreviousData,
  });
}

export function useDoctorFilterOptions() {
  return useQuery({
    queryKey: queryKeys.doctors.options,
    queryFn: async () => {
      const { data } = await api.get<ApiItemResponse<DoctorFilterOptions>>(
        "/doctors/meta/options",
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ------------------------------ mutations ------------------------------ */
export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DoctorInput) => {
      const { data } = await api.post<ApiItemResponse<Doctor>>("/doctors", input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      qc.invalidateQueries({ queryKey: queryKeys.doctors.options });
    },
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<DoctorInput> }) => {
      const { data } = await api.patch<ApiItemResponse<Doctor>>(`/doctors/${id}`, input);
      return data.data;
    },
    onSuccess: (doctor) => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.doctors.detail(doctor._id) });
    },
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/doctors/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export interface AddPatientInput {
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: string;
  phone: string;
  email: string;
}

export function useAddDoctorPatient(doctorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddPatientInput) => {
      const { data } = await api.post<ApiItemResponse<Patient>>(
        `/doctors/${doctorId}/patients`,
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all });
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
