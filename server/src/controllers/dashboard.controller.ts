import type { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/dashboard/stats
 *
 * Returns everything the dashboard needs in a single round-trip. Each piece
 * is a server-side aggregation so the client never pulls raw collections just
 * to count them. All queries run in parallel.
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const monthsBack = 6;
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const [
    totalDoctors,
    totalPatients,
    topDoctorsByPatients,
    patientsByCondition,
    patientsByStatus,
    patientsBySpecialization,
    patientsTimeseries,
    doctorsTimeseries,
    newThisMonth,
  ] = await Promise.all([
    // --- scalar totals ---
    Doctor.countDocuments(),
    Patient.countDocuments(),

    // --- patients per doctor (top 6) ---
    Patient.aggregate([
      { $group: { _id: '$doctor', patients: { $sum: 1 } } },
      { $sort: { patients: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          name: '$doctor.name',
          specialization: '$doctor.specialization',
          patients: 1,
        },
      },
    ]),

    // --- patients grouped by condition (top 6) ---
    Patient.aggregate([
      { $group: { _id: '$condition', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: '$_id', value: 1 } },
    ]),

    // --- patients grouped by status ---
    Patient.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { value: -1 } },
    ]),

    // --- patients grouped by their doctor's specialization ---
    Patient.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      { $group: { _id: '$doctor.specialization', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, name: '$_id', value: 1 } },
    ]),

    // --- new patients per month (last 6 months) ---
    Patient.aggregate([
      { $match: { createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          value: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // --- new doctors per month (last 6 months) ---
    Doctor.aggregate([
      { $match: { createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          value: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // --- new patients created this calendar month ---
    Patient.countDocuments({
      createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    }),
  ]);

  // Build a dense 6-month timeline so months with zero records still show.
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const timeseries: { label: string; patients: number; doctors: number }[] = [];
  const patientMap = new Map(
    patientsTimeseries.map((d) => [`${d._id.year}-${d._id.month}`, d.value]),
  );
  const doctorMap = new Map(
    doctorsTimeseries.map((d) => [`${d._id.year}-${d._id.month}`, d.value]),
  );
  for (let i = 0; i < monthsBack; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1) + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    timeseries.push({
      label: `${monthFmt.format(d)} ${String(d.getFullYear()).slice(2)}`,
      patients: patientMap.get(key) ?? 0,
      doctors: doctorMap.get(key) ?? 0,
    });
  }

  const avgPatientsPerDoctor =
    totalDoctors === 0 ? 0 : Math.round((totalPatients / totalDoctors) * 10) / 10;

  res.json({
    success: true,
    data: {
      totals: {
        doctors: totalDoctors,
        patients: totalPatients,
        avgPatientsPerDoctor,
        newPatientsThisMonth: newThisMonth,
      },
      topDoctorsByPatients,
      patientsByCondition,
      patientsByStatus,
      patientsBySpecialization,
      timeseries,
    },
  });
});
