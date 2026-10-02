import { Router } from 'express';
import {
  createPatient,
  deletePatient,
  getPatient,
  getPatientFilterOptions,
  listPatients,
  updatePatient,
} from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common.validator';
import {
  createPatientSchema,
  patientListQuery,
  updatePatientSchema,
} from '../validators/patient.validator';

const router = Router();

router.use(authenticate);

router.get('/meta/options', getPatientFilterOptions);

router
  .route('/')
  .get(validate({ query: patientListQuery }), listPatients)
  .post(validate({ body: createPatientSchema }), createPatient);

router
  .route('/:id')
  .get(validate({ params: idParamSchema }), getPatient)
  .patch(validate({ params: idParamSchema, body: updatePatientSchema }), updatePatient)
  .delete(validate({ params: idParamSchema }), deletePatient);

export default router;
