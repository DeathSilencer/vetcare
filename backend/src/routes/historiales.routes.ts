import { Router } from 'express';
import {
  getHistoriales,
  getHistorialById,
  createHistorial,
  updateHistorial,
  deleteHistorial,
  historialSchema,
} from '../controllers/historiales.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getHistoriales);
router.get('/:id', getHistorialById);
router.post('/', requireRoles('ADMIN', 'VETERINARIO'), validateBody(historialSchema), createHistorial);
router.put('/:id', requireRoles('ADMIN', 'VETERINARIO'), validateBody(historialSchema), updateHistorial);
router.delete('/:id', requireRoles('ADMIN'), deleteHistorial);

export default router;
