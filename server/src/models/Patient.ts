import mongoose, { type HydratedDocument, type Model, Schema, Types } from 'mongoose';

export const PATIENT_GENDERS = ['Male', 'Female', 'Other'] as const;
export const PATIENT_STATUSES = ['Active', 'Recovered', 'Critical', 'Under Observation'] as const;

export type PatientGender = (typeof PATIENT_GENDERS)[number];
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

export interface IPatient {
  name: string;
  age: number;
  gender: PatientGender;
  condition: string;
  status: PatientStatus;
  phone: string;
  email: string;
  doctor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type PatientModel = Model<IPatient>;

const patientSchema = new Schema<IPatient, PatientModel>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: PATIENT_GENDERS, required: true },
    condition: { type: String, required: true, trim: true },
    status: { type: String, enum: PATIENT_STATUSES, default: 'Active' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
  },
  { timestamps: true },
);

/**
 * Indexes tuned to the patient access patterns:
 *  - text index powers search (name / condition)
 *  - { doctor, createdAt } compound index powers "patients for a doctor"
 *    and keeps them sorted newest-first without an in-memory sort
 *  - condition / status indexes power the filter dropdowns
 *  - createdAt index powers date-range filtering + global newest-first sort
 */
patientSchema.index(
  { name: 'text', condition: 'text' },
  { weights: { name: 5, condition: 2 }, name: 'patient_text' },
);
patientSchema.index({ doctor: 1, createdAt: -1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ createdAt: -1 });

export type PatientDocument = HydratedDocument<IPatient>;

export const Patient: PatientModel =
  (mongoose.models.Patient as PatientModel) ||
  mongoose.model<IPatient, PatientModel>('Patient', patientSchema);
