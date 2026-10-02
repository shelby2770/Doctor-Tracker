import { z } from 'zod';
import { baseListQuery } from './common.validator';

const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Phone number looks too short')
  .max(20, 'Phone number looks too long');

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  specialization: z.string().trim().min(2, 'Specialization is required'),
  hospital: z.string().trim().min(2, 'Hospital is required'),
  phone: phoneSchema,
  email: z.string().trim().email('A valid email is required'),
});

// All fields optional on update, but at least one must be present.
export const updateDoctorSchema = createDoctorSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' },
);

export const doctorListQuery = baseListQuery.extend({
  specialization: z.string().trim().optional(),
  hospital: z.string().trim().optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type DoctorListQuery = z.infer<typeof doctorListQuery>;
