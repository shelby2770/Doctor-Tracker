/* Shared types that mirror the REST API responses. */

export type PatientGender = "Male" | "Female" | "Other";
export type PatientStatus =
  | "Active"
  | "Recovered"
  | "Critical"
  | "Under Observation";

export const PATIENT_GENDERS: PatientGender[] = ["Male", "Female", "Other"];
export const PATIENT_STATUSES: PatientStatus[] = [
  "Active",
  "Recovered",
  "Critical",
  "Under Observation",
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount?: number;
}

/** The `doctor` field is populated on list/detail responses. */
export interface DoctorRef {
  _id: string;
  name: string;
  specialization?: string;
  hospital?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: PatientGender;
  condition: string;
  status: PatientStatus;
  phone: string;
  email: string;
  doctor: DoctorRef | string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export interface DashboardStats {
  totals: {
    doctors: number;
    patients: number;
    avgPatientsPerDoctor: number;
    newPatientsThisMonth: number;
  };
  topDoctorsByPatients: {
    doctorId: string;
    name: string;
    specialization: string;
    patients: number;
  }[];
  patientsByCondition: { name: string; value: number }[];
  patientsByStatus: { name: string; value: number }[];
  patientsBySpecialization: { name: string; value: number }[];
  timeseries: { label: string; patients: number; doctors: number }[];
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}

export interface PatientFilterOptions {
  conditions: string[];
}
