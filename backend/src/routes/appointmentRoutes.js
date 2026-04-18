import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { validateFields } from '../middleware/validateAppointment.js';

const router = express.Router();

router.get('/conflicts/check', appointmentController.checkConflicts);

// CRUD de citas
router.post('/', validateFields, appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;