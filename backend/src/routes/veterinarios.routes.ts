import { Router } from 'express';
import {
  getVeterinarios,
  getVeterinarioById,
  createVeterinario,
  updateVeterinario,
  deleteVeterinario,
  veterinarioSchema,
} from '../controllers/veterinarios.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getVeterinarios);
router.get('/:id', getVeterinarioById);
router.post('/', requireRoles('ADMIN'), validateBody(veterinarioSchema), createVeterinario);
router.put('/:id', requireRoles('ADMIN'), validateBody(veterinarioSchema), updateVeterinario);
router.delete('/:id', requireRoles('ADMIN'), deleteVeterinario);

export default router;
