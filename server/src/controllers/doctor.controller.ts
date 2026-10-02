import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { Doctor, type IDoctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildPaginationMeta, getSkip } from '../utils/pagination';
import { buildDateRange, getSortSpec } from '../utils/queryHelpers';
import type {
  CreateDoctorInput,
  DoctorListQuery,
  UpdateDoctorInput,
} from '../validators/doctor.validator';
import type { PatientListQuery } from '../validators/patient.validator';
import { buildPatientFilter } from './patient.controller';

/** Build a Mongo filter for the doctor list from validated query params. */
function buildDoctorFilter(q: DoctorListQuery): FilterQuery<IDoctor> {
  const filter: FilterQuery<IDoctor> = {};

  if (q.search) filter.$text = { $search: q.search };
  if (q.specialization) filter.specialization = q.specialization;
  if (q.hospital) filter.hospital = q.hospital;

  const createdAt = buildDateRange(q.startDate, q.endDate);
  if (createdAt) filter.createdAt = createdAt;

  return filter;
}

// GET /api/doctors
export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const q = req.valid!.query as DoctorListQuery;
  const filter = buildDoctorFilter(q);
  const skip = getSkip(q);

  // Run the count and the page query in parallel.
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(getSortSpec(q.sort)).skip(skip).limit(q.limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  // Attach patient counts for the current page only (small, bounded query).
  const ids = doctors.map((d) => d._id);
  const counts = await Patient.aggregate<{ _id: typeof ids[number]; count: number }>([
    { $match: { doctor: { $in: ids } } },
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const data = doctors.map((d) => ({
    ...d,
    patientCount: countMap.get(String(d._id)) ?? 0,
  }));

  res.json({ success: true, data, meta: buildPaginationMeta(total, q) });
});

// GET /api/doctors/:id
export const getDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const doctor = await Doctor.findById(id).lean();
  if (!doctor) throw ApiError.notFound('Doctor not found');

  const patientCount = await Patient.countDocuments({ doctor: id });
  res.json({ success: true, data: { ...doctor, patientCount } });
});

// POST /api/doctors
export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const body = req.valid!.body as CreateDoctorInput;
  const doctor = await Doctor.create(body);
  res.status(201).json({ success: true, data: doctor });
});

// PATCH /api/doctors/:id
export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const body = req.valid!.body as UpdateDoctorInput;

  const doctor = await Doctor.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!doctor) throw ApiError.notFound('Doctor not found');

  res.json({ success: true, data: doctor });
});

// DELETE /api/doctors/:id  (cascades to the doctor's patients)
export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) throw ApiError.notFound('Doctor not found');

  const { deletedCount } = await Patient.deleteMany({ doctor: id });
  res.json({
    success: true,
    message: `Doctor deleted along with ${deletedCount} patient(s)`,
  });
});

// GET /api/doctors/:id/patients
export const listDoctorPatients = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const q = req.valid!.query as PatientListQuery;

  const doctorExists = await Doctor.exists({ _id: id });
  if (!doctorExists) throw ApiError.notFound('Doctor not found');

  // Reuse the shared patient filter, pinned to this doctor.
  const filter = { ...buildPatientFilter(q), doctor: id };
  const skip = getSkip(q);

  const [patients, total] = await Promise.all([
    Patient.find(filter).sort(getSortSpec(q.sort)).skip(skip).limit(q.limit).lean(),
    Patient.countDocuments(filter),
  ]);

  res.json({ success: true, data: patients, meta: buildPaginationMeta(total, q) });
});

// POST /api/doctors/:id/patients
export const addDoctorPatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const body = req.valid!.body as Record<string, unknown>;

  const doctorExists = await Doctor.exists({ _id: id });
  if (!doctorExists) throw ApiError.notFound('Doctor not found');

  const patient = await Patient.create({ ...body, doctor: id });
  res.status(201).json({ success: true, data: patient });
});

// GET /api/doctors/meta/list  — lightweight {id, name, specialization} for
// "assign doctor" dropdowns. Projected + lean, so it stays small even with
// many doctors (no pagination needed for a select list).
export const getDoctorSelectList = asyncHandler(
  async (_req: Request, res: Response) => {
    const doctors = await Doctor.find()
      .select('name specialization')
      .sort({ name: 1 })
      .lean();
    res.json({ success: true, data: doctors });
  },
);

// GET /api/doctors/meta/options  — distinct values for filter dropdowns
export const getDoctorFilterOptions = asyncHandler(
  async (_req: Request, res: Response) => {
    const [specializations, hospitals] = await Promise.all([
      Doctor.distinct('specialization'),
      Doctor.distinct('hospital'),
    ]);
    res.json({
      success: true,
      data: {
        specializations: specializations.sort(),
        hospitals: hospitals.sort(),
      },
    });
  },
);
