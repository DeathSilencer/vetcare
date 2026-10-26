import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import propietariosRoutes from './propietarios.routes.js';
import pacientesRoutes from './pacientes.routes.js';
import veterinariosRoutes from './veterinarios.routes.js';
import especialidadesRoutes from './especialidades.routes.js';
import serviciosRoutes from './servicios.routes.js';
import citasRoutes from './citas.routes.js';
import historialesRoutes from './historiales.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import reportesRoutes from './reportes.routes.js';
import { pool } from '../config/database.js';

const router = Router();

// Endpoint de salud y diagnóstico del sistema
router.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'VetCare API',
      database: 'Connected to MySQL/MariaDB (vetcare)',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'VetCare API',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/propietarios', propietariosRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/veterinarios', veterinariosRoutes);
router.use('/especialidades', especialidadesRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/citas', citasRoutes);
router.use('/historiales', historialesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/reportes', reportesRoutes);

export default router;
