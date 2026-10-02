import mongoose, { type HydratedDocument, type Model, Schema } from 'mongoose';

export interface IDoctor {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type DoctorModel = Model<IDoctor>;

const doctorSchema = new Schema<IDoctor, DoctorModel>(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

/**
 * Indexes — chosen to match the access patterns the API exposes:
 *  - text index powers the search box (name / specialization / hospital)
 *  - single-field indexes power the filter dropdowns
 *  - createdAt index powers date-range filtering + default newest-first sort
 */
doctorSchema.index(
  { name: 'text', specialization: 'text', hospital: 'text' },
  { weights: { name: 5, specialization: 3, hospital: 1 }, name: 'doctor_text' },
);
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ hospital: 1 });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ email: 1 }, { unique: true });

export type DoctorDocument = HydratedDocument<IDoctor>;

export const Doctor: DoctorModel =
  (mongoose.models.Doctor as DoctorModel) ||
  mongoose.model<IDoctor, DoctorModel>('Doctor', doctorSchema);
