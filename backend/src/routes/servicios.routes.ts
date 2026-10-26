import { Router } from 'express';
import {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  servicioSchema,
} from '../controllers/servicios.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getServicios);
router.get('/:id', getServicioById);
router.post('/', requireRoles('ADMIN', 'RECEPCION'), validateBody(servicioSchema), createServicio);
router.put('/:id', requireRoles('ADMIN', 'RECEPCION'), validateBody(servicioSchema), updateServicio);
router.delete('/:id', requireRoles('ADMIN'), deleteServicio);

export default router;
