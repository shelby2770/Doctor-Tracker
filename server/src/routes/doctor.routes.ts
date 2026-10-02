import { Router } from 'express';
import {
  addDoctorPatient,
  createDoctor,
  deleteDoctor,
  getDoctor,
  getDoctorFilterOptions,
  listDoctorPatients,
  listDoctors,
  updateDoctor,
} from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common.validator';
import {
  createDoctorSchema,
  doctorListQuery,
  updateDoctorSchema,
} from '../validators/doctor.validator';
import {
  createPatientForDoctorSchema,
  patientListQuery,
} from '../validators/patient.validator';

const router = Router();

// All doctor routes require authentication.
router.use(authenticate);

router.get('/meta/options', getDoctorFilterOptions);

router
  .route('/')
  .get(validate({ query: doctorListQuery }), listDoctors)
  .post(validate({ body: createDoctorSchema }), createDoctor);

router
  .route('/:id')
  .get(validate({ params: idParamSchema }), getDoctor)
  .patch(validate({ params: idParamSchema, body: updateDoctorSchema }), updateDoctor)
  .delete(validate({ params: idParamSchema }), deleteDoctor);

router
  .route('/:id/patients')
  .get(validate({ params: idParamSchema, query: patientListQuery }), listDoctorPatients)
  .post(
    validate({ params: idParamSchema, body: createPatientForDoctorSchema }),
    addDoctorPatient,
  );

export default router;
