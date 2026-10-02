import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { Patient, type IPatient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildPaginationMeta, getSkip } from '../utils/pagination';
import { buildDateRange, getSortSpec } from '../utils/queryHelpers';
import type {
  CreatePatientInput,
  PatientListQuery,
  UpdatePatientInput,
} from '../validators/patient.validator';

/**
 * Shared patient filter builder — used by the global patient list and,
 * with an extra `doctor` pin, by the per-doctor patient list.
 */
export function buildPatientFilter(q: PatientListQuery): FilterQuery<IPatient> {
  const filter: FilterQuery<IPatient> = {};

  if (q.search) filter.$text = { $search: q.search };
  if (q.condition) filter.condition = q.condition;
  if (q.status) filter.status = q.status;
  if (q.doctorId) filter.doctor = q.doctorId;

  const createdAt = buildDateRange(q.startDate, q.endDate);
  if (createdAt) filter.createdAt = createdAt;

  return filter;
}

// GET /api/patients
export const listPatients = asyncHandler(async (req: Request, res: Response) => {
  const q = req.valid!.query as PatientListQuery;
  const filter = buildPatientFilter(q);
  const skip = getSkip(q);

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .sort(getSortSpec(q.sort))
      .skip(skip)
      .limit(q.limit)
      .populate('doctor', 'name specialization hospital')
      .lean(),
    Patient.countDocuments(filter),
  ]);

  res.json({ success: true, data: patients, meta: buildPaginationMeta(total, q) });
});

// GET /api/patients/:id
export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const patient = await Patient.findById(id)
    .populate('doctor', 'name specialization hospital')
    .lean();
  if (!patient) throw ApiError.notFound('Patient not found');
  res.json({ success: true, data: patient });
});

// POST /api/patients
export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const body = req.valid!.body as CreatePatientInput;

  const doctorExists = await Doctor.exists({ _id: body.doctor });
  if (!doctorExists) throw ApiError.badRequest('Selected doctor does not exist');

  const patient = await Patient.create(body);
  res.status(201).json({ success: true, data: patient });
});

// PATCH /api/patients/:id
export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const body = req.valid!.body as UpdatePatientInput;

  if (body.doctor) {
    const doctorExists = await Doctor.exists({ _id: body.doctor });
    if (!doctorExists) throw ApiError.badRequest('Selected doctor does not exist');
  }

  const patient = await Patient.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).populate('doctor', 'name specialization hospital');
  if (!patient) throw ApiError.notFound('Patient not found');

  res.json({ success: true, data: patient });
});

// DELETE /api/patients/:id
export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.valid!.params as { id: string };
  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) throw ApiError.notFound('Patient not found');
  res.json({ success: true, message: 'Patient deleted' });
});

// GET /api/patients/meta/options  — distinct values for filter dropdowns
export const getPatientFilterOptions = asyncHandler(
  async (_req: Request, res: Response) => {
    const conditions = await Patient.distinct('condition');
    res.json({
      success: true,
      data: {
        conditions: (conditions as string[]).sort(),
      },
    });
  },
);
