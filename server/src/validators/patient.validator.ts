import { z } from 'zod';
import { PATIENT_GENDERS, PATIENT_STATUSES } from '../models/Patient';
import { baseListQuery, objectId } from './common.validator';

const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Phone number looks too short')
  .max(20, 'Phone number looks too long');

/** Base patient fields. `doctor` is required when creating from the
 *  global patient page; the nested doctor route injects it from the URL. */
export const createPatientSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.enum(PATIENT_GENDERS),
  condition: z.string().trim().min(2, 'Condition is required'),
  status: z.enum(PATIENT_STATUSES).default('Active'),
  phone: phoneSchema,
  email: z.string().trim().email('A valid email is required'),
  doctor: objectId,
});

/** Used by POST /doctors/:id/patients — doctor comes from the path. */
export const createPatientForDoctorSchema = createPatientSchema.omit({
  doctor: true,
});

export const updatePatientSchema = createPatientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const patientListQuery = baseListQuery.extend({
  condition: z.string().trim().optional(),
  status: z.enum(PATIENT_STATUSES).optional(),
  doctorId: objectId.optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type CreatePatientForDoctorInput = z.infer<typeof createPatientForDoctorSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientListQuery = z.infer<typeof patientListQuery>;
