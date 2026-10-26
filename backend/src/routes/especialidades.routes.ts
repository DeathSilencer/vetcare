import { Router } from 'express';
import {
  getEspecialidades,
  getEspecialidadById,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad,
  especialidadSchema,
} from '../controllers/especialidades.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getEspecialidades);
router.get('/:id', getEspecialidadById);
router.post('/', requireRoles('ADMIN'), validateBody(especialidadSchema), createEspecialidad);
router.put('/:id', requireRoles('ADMIN'), validateBody(especialidadSchema), updateEspecialidad);
router.delete('/:id', requireRoles('ADMIN'), deleteEspecialidad);

export default router;
