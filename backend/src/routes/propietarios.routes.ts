import { Router } from 'express';
import {
  getPropietarios,
  getPropietarioById,
  createPropietario,
  updatePropietario,
  deletePropietario,
  propietarioSchema,
} from '../controllers/propietarios.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPropietarios);
router.get('/:id', getPropietarioById);
router.post('/', requireRoles('ADMIN', 'RECEPCION'), validateBody(propietarioSchema), createPropietario);
router.put('/:id', requireRoles('ADMIN', 'RECEPCION'), validateBody(propietarioSchema), updatePropietario);
router.delete('/:id', requireRoles('ADMIN'), deletePropietario);

export default router;
