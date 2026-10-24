import { Router } from 'express';
import * as controller from '../controllers/clinic.controller.js';

const router = Router();

router.get('/patients', controller.getPatients);
router.post('/patients', controller.createPatient);
router.get('/doctors', controller.getDoctors);
router.post('/doctors', controller.createDoctor);
router.get('/appointments', controller.getAppointments);
router.post('/appointments', controller.createAppointment);

export default router;
