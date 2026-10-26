import { Router } from 'express';
import {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente,
  pacienteSchema,
} from '../controllers/pacientes.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPacientes);
router.get('/:id', getPacienteById);
router.post('/', requireRoles('ADMIN', 'RECEPCION'), validateBody(pacienteSchema), createPaciente);
router.put('/:id', requireRoles('ADMIN', 'RECEPCION'), validateBody(pacienteSchema), updatePaciente);
router.delete('/:id', requireRoles('ADMIN'), deletePaciente);

export default router;
