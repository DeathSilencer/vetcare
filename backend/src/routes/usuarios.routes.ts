import { Router } from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  createUsuarioSchema,
  updateUsuarioSchema,
} from '../controllers/usuarios.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('ADMIN')); // Módulo 100% exclusivo para ADMIN

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', validateBody(createUsuarioSchema), createUsuario);
router.put('/:id', validateBody(updateUsuarioSchema), updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
