import { Router } from 'express';
import {
  getReporteCitasRango,
  getReporteCitasVeterinario,
  getReportePacientesEspecie,
  getReporteServiciosDemanda,
  getReporteFinanciero,
  getPreguntasAcademicas,
  exportCsv,
} from '../controllers/reportes.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/citas-rango', getReporteCitasRango);
router.get('/citas-veterinario', getReporteCitasVeterinario);
router.get('/pacientes-especie', getReportePacientesEspecie);
router.get('/servicios-demanda', getReporteServiciosDemanda);
router.get('/financiero', getReporteFinanciero);
router.get('/academicas', getPreguntasAcademicas);
router.get('/export-csv', exportCsv);

export default router;
