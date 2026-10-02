import { z } from "zod";
import { PATIENT_GENDERS, PATIENT_STATUSES } from "./types";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

const phone = z
  .string()
  .trim()
  .min(6, "Enter a valid phone number")
  .max(20, "Phone number is too long");

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  specialization: z.string().trim().min(2, "Specialization is required"),
  hospital: z.string().trim().min(2, "Hospital is required"),
  phone,
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});
export type DoctorValues = z.infer<typeof doctorSchema>;

/** Patient fields without the doctor link (used under a specific doctor). */
export const patientBaseSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  age: z.coerce.number().int("Age must be a whole number").min(0, "Invalid age").max(130, "Invalid age"),
  gender: z.enum(PATIENT_GENDERS as [string, ...string[]]),
  condition: z.string().trim().min(2, "Condition is required"),
  status: z.enum(PATIENT_STATUSES as [string, ...string[]]),
  phone,
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});
export type PatientBaseValues = z.infer<typeof patientBaseSchema>;

/** Patient fields including the doctor link (used on the global patient page). */
export const patientSchema = patientBaseSchema.extend({
  doctor: z.string().min(1, "Please select a doctor"),
});
export type PatientValues = z.infer<typeof patientSchema>;
