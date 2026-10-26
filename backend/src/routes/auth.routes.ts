import { Router } from 'express';
import {
  login,
  logout,
  getSession,
  updatePerfil,
  loginSchema,
  perfilUpdateSchema,
} from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', getSession);
router.put('/perfil', requireAuth, validateBody(perfilUpdateSchema), updatePerfil);

export default router;
