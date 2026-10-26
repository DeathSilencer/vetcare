import { Router } from 'express';
import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  updateCitaEstado,
  deleteCita,
  citaSchema,
  citaEstadoSchema,
} from '../controllers/citas.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getCitas);
router.get('/:id', getCitaById);
router.post('/', requireRoles('ADMIN', 'RECEPCION'), validateBody(citaSchema), createCita);
router.put('/:id', requireRoles('ADMIN', 'RECEPCION', 'VETERINARIO'), validateBody(citaSchema), updateCita);
router.patch('/:id/estado', requireRoles('ADMIN', 'RECEPCION', 'VETERINARIO'), validateBody(citaEstadoSchema), updateCitaEstado);
router.delete('/:id', requireRoles('ADMIN', 'RECEPCION'), deleteCita);

export default router;
