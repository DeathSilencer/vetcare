import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

function sanitizeForCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();
  // Prevenir inyección de fórmulas de hojas de cálculo (CSV Injection)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escapar comillas dobles
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function getReporteCitasRango(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fechaInicio = (req.query.fecha_inicio as string) || '2026-01-01';
    const fechaFin = (req.query.fecha_fin as string) || '2026-12-31 23:59:59';

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.id_cita,
        DATE_FORMAT(c.fecha_hora, '%Y-%m-%d %H:%i') AS fecha_hora,
        c.motivo,
        c.estado,
        p.nombre AS paciente,
        p.especie,
        pr.nombre AS propietario,
        pr.telefono AS telefono_propietario,
        v.nombre AS veterinario,
        COALESCE(SUM(s.costo), 0) AS total_servicios
       FROM citas c
       INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
       INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
       INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
       LEFT JOIN citas_servicios cs ON c.id_cita = cs.id_cita
       LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
       WHERE c.fecha_hora BETWEEN ? AND ?
       GROUP BY c.id_cita, c.fecha_hora, c.motivo, c.estado, p.nombre, p.especie, pr.nombre, pr.telefono, v.nombre
       ORDER BY c.fecha_hora ASC`,
      [fechaInicio, fechaFin]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReporteCitasVeterinario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        v.id_veterinario,
        v.nombre AS veterinario,
        e.nombre_especialidad AS especialidad,
        COUNT(c.id_cita) AS total_citas,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) AS citas_completadas,
        SUM(CASE WHEN c.estado = 'pendiente' THEN 1 ELSE 0 END) AS citas_pendientes,
        SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS citas_canceladas
      FROM veterinarios v
      INNER JOIN especialidades e ON v.id_especialidad = e.id_especialidad
      LEFT JOIN citas c ON v.id_veterinario = c.id_veterinario
      GROUP BY v.id_veterinario, v.nombre, e.nombre_especialidad
      ORDER BY total_citas DESC, v.nombre ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportePacientesEspecie(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        especie,
        COUNT(*) AS total_pacientes,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pacientes)), 2) AS porcentaje
      FROM pacientes
      GROUP BY especie
      ORDER BY total_pacientes DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReporteServiciosDemanda(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        s.id_servicio,
        s.descripcion AS servicio,
        s.costo,
        COUNT(cs.id_detalle) AS veces_solicitado,
        COALESCE(SUM(s.costo), 0) AS ingresos_generados
      FROM servicios s
      LEFT JOIN citas_servicios cs ON s.id_servicio = cs.id_servicio
      GROUP BY s.id_servicio, s.descripcion, s.costo
      ORDER BY veces_solicitado DESC, ingresos_generados DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReporteFinanciero(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [kpiRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(DISTINCT c.id_cita) AS citas_con_servicios,
        ROUND(AVG(sub.costo_cita), 2) AS ticket_promedio,
        MAX(sub.costo_cita) AS cita_maxima,
        MIN(sub.costo_cita) AS cita_minima,
        SUM(sub.costo_cita) AS facturacion_total
      FROM (
        SELECT c.id_cita, COALESCE(SUM(s.costo), 0) AS costo_cita
        FROM citas c
        INNER JOIN citas_servicios cs ON c.id_cita = cs.id_cita
        INNER JOIN servicios s ON cs.id_servicio = s.id_servicio
        GROUP BY c.id_cita
      ) sub
    `);

    const [detallesRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        c.id_cita,
        DATE_FORMAT(c.fecha_hora, '%Y-%m-%d %H:%i') AS fecha_hora,
        p.nombre AS paciente,
        pr.nombre AS propietario,
        v.nombre AS veterinario,
        COUNT(cs.id_servicio) AS total_servicios,
        COALESCE(SUM(s.costo), 0) AS costo_cita
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
      LEFT JOIN citas_servicios cs ON c.id_cita = cs.id_cita
      LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
      GROUP BY c.id_cita, c.fecha_hora, p.nombre, pr.nombre, v.nombre
      ORDER BY costo_cita DESC
      LIMIT 15
    `);

    res.json({
      success: true,
      data: {
        kpis: kpiRows[0],
        topCitas: detallesRows,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPreguntasAcademicas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 5 Preguntas de negocio requeridas por el proyecto escolar
    const [p1] = await pool.execute<RowDataPacket[]>(`
      SELECT especie, COUNT(*) AS cantidad, ROUND((COUNT(*) / (SELECT COUNT(*) FROM pacientes)) * 100, 2) AS porcentaje
      FROM pacientes GROUP BY especie ORDER BY cantidad DESC
    `);

    const [p2] = await pool.execute<RowDataPacket[]>(`
      SELECT s.descripcion AS servicio, COUNT(cs.id_detalle) AS total_solicitudes, s.costo, SUM(s.costo) AS ingreso_acumulado
      FROM servicios s INNER JOIN citas_servicios cs ON s.id_servicio = cs.id_servicio
      GROUP BY s.id_servicio, s.descripcion, s.costo ORDER BY total_solicitudes DESC LIMIT 5
    `);

    const [p3] = await pool.execute<RowDataPacket[]>(`
      SELECT v.nombre AS veterinario, e.nombre_especialidad AS especialidad, COUNT(c.id_cita) AS citas_asignadas
      FROM veterinarios v INNER JOIN especialidades e ON v.id_especialidad = e.id_especialidad
      LEFT JOIN citas c ON v.id_veterinario = c.id_veterinario
      GROUP BY v.id_veterinario, v.nombre, e.nombre_especialidad ORDER BY citas_asignadas DESC LIMIT 5
    `);

    const [p4] = await pool.execute<RowDataPacket[]>(`
      SELECT p.nombre AS paciente, p.especie, pr.nombre AS propietario, COUNT(h.id_historial) AS intervenciones
      FROM pacientes p INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      LEFT JOIN historiales_clinicos h ON p.id_paciente = h.id_paciente
      GROUP BY p.id_paciente, p.nombre, p.especie, pr.nombre ORDER BY intervenciones DESC LIMIT 5
    `);

    const [p5] = await pool.execute<RowDataPacket[]>(`
      SELECT ROUND(AVG(sub.costo_cita), 2) AS ticket_promedio, MAX(sub.costo_cita) AS cita_mas_costosa, MIN(sub.costo_cita) AS cita_menos_costosa
      FROM (
        SELECT c.id_cita, SUM(s.costo) AS costo_cita FROM citas c
        INNER JOIN citas_servicios cs ON c.id_cita = cs.id_cita INNER JOIN servicios s ON cs.id_servicio = s.id_servicio GROUP BY c.id_cita
      ) sub
    `);

    res.json({
      success: true,
      data: [
        {
          id: 1,
          pregunta: '¿Cuáles son las especies más atendidas en la clínica y qué porcentaje representan?',
          justificacion: 'Permite al administrador planificar la adquisición de insumos, medicamentos y vacunas especializadas.',
          resultado: p1,
        },
        {
          id: 2,
          pregunta: '¿Cuáles son los 5 servicios con mayor demanda y cuánto ingreso han generado?',
          justificacion: 'Identifica los servicios más rentables y populares para promociones y asignación de personal.',
          resultado: p2,
        },
        {
          id: 3,
          pregunta: '¿Qué veterinarios atienden mayor volumen de citas y en qué especialidades?',
          justificacion: 'Facilita la distribución equitativa de turnos y guardias en la clínica.',
          resultado: p3,
        },
        {
          id: 4,
          pregunta: '¿Cuáles son los pacientes con mayor número de intervenciones clínicas registradas?',
          justificacion: 'Detecta pacientes crónicos para seguimiento preventivo y programas de salud animal.',
          resultado: p4,
        },
        {
          id: 5,
          pregunta: '¿Cuál es el ticket promedio facturado por cita y los rangos de costo?',
          justificacion: 'Brinda métricas financieras para estimar la rentabilidad operativa de la veterinaria.',
          resultado: p5[0],
        },
      ],
    });
  } catch (error) {
    next(error);
  }
}

export async function exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tipo = (req.query.tipo as string) || 'citas';

    if (tipo === 'citas') {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          c.id_cita,
          DATE_FORMAT(c.fecha_hora, '%Y-%m-%d %H:%i') AS fecha_hora,
          c.estado,
          c.motivo,
          p.nombre AS paciente,
          p.especie,
          pr.nombre AS propietario,
          pr.telefono AS telefono,
          v.nombre AS veterinario,
          COALESCE(SUM(s.costo), 0) AS total_costo
        FROM citas c
        INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
        INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
        INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
        LEFT JOIN citas_servicios cs ON c.id_cita = cs.id_cita
        LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
        GROUP BY c.id_cita, c.fecha_hora, c.estado, c.motivo, p.nombre, p.especie, pr.nombre, pr.telefono, v.nombre
        ORDER BY c.fecha_hora DESC
      `);

      const headers = ['ID Cita', 'Fecha y Hora', 'Estado', 'Motivo', 'Paciente', 'Especie', 'Propietario', 'Teléfono', 'Veterinario', 'Costo Total MXN'];
      let csvContent = '\uFEFF' + headers.join(',') + '\n';

      rows.forEach((r) => {
        const line = [
          sanitizeForCsv(r.id_cita),
          sanitizeForCsv(r.fecha_hora),
          sanitizeForCsv(r.estado),
          sanitizeForCsv(r.motivo),
          sanitizeForCsv(r.paciente),
          sanitizeForCsv(r.especie),
          sanitizeForCsv(r.propietario),
          sanitizeForCsv(r.telefono),
          sanitizeForCsv(r.veterinario),
          sanitizeForCsv(r.total_costo),
        ].join(',');
        csvContent += line + '\n';
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_citas_vetcare.csv"');
      res.send(csvContent);
      return;
    }

    if (tipo === 'pacientes') {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          p.id_paciente,
          p.nombre AS paciente,
          p.especie,
          p.raza,
          pr.nombre AS propietario,
          pr.telefono AS telefono,
          pr.correo AS correo
        FROM pacientes p
        INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
        ORDER BY p.id_paciente ASC
      `);

      const headers = ['ID Paciente', 'Nombre Paciente', 'Especie', 'Raza', 'Propietario', 'Teléfono Contacto', 'Correo Contacto'];
      let csvContent = '\uFEFF' + headers.join(',') + '\n';

      rows.forEach((r) => {
        const line = [
          sanitizeForCsv(r.id_paciente),
          sanitizeForCsv(r.paciente),
          sanitizeForCsv(r.especie),
          sanitizeForCsv(r.raza || 'No especificada'),
          sanitizeForCsv(r.propietario),
          sanitizeForCsv(r.telefono),
          sanitizeForCsv(r.correo || ''),
        ].join(',');
        csvContent += line + '\n';
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_pacientes_vetcare.csv"');
      res.send(csvContent);
      return;
    }

    res.status(400).json({ success: false, message: 'Tipo de reporte para exportar no soportado.' });
  } catch (error) {
    next(error);
  }
}
