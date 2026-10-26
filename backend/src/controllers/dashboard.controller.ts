import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Contadores principales
    const [countsRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
        (SELECT COUNT(*) FROM propietarios) AS total_propietarios,
        (SELECT COUNT(*) FROM veterinarios) AS total_veterinarios,
        (SELECT COUNT(*) FROM servicios) AS total_servicios,
        (SELECT COUNT(*) FROM citas WHERE DATE(fecha_hora) = CURDATE()) AS citas_hoy,
        (SELECT COUNT(*) FROM citas WHERE estado = 'pendiente') AS citas_pendientes,
        (SELECT COUNT(*) FROM citas WHERE estado = 'completada') AS citas_completadas,
        (SELECT COUNT(*) FROM citas WHERE estado = 'cancelada') AS citas_canceladas,
        (SELECT COUNT(*) FROM historiales_clinicos) AS total_historiales
    `);

    const counters = countsRows[0] || {
      total_pacientes: 0,
      total_propietarios: 0,
      total_veterinarios: 0,
      total_servicios: 0,
      citas_hoy: 0,
      citas_pendientes: 0,
      citas_completadas: 0,
      citas_canceladas: 0,
      total_historiales: 0,
    };

    // 2. Distribución de pacientes por especie
    const [especiesRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        especie, 
        COUNT(*) AS cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pacientes)), 1) AS porcentaje
      FROM pacientes
      GROUP BY especie
      ORDER BY cantidad DESC
    `);

    // 3. Distribución de citas por estado
    const [estadosRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        estado, 
        COUNT(*) AS total
      FROM citas
      GROUP BY estado
    `);

    // 4. Próximas citas (más recientes / próximas)
    const [proximasCitasRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        c.id_cita,
        c.fecha_hora,
        c.motivo,
        c.estado,
        p.nombre AS nombre_paciente,
        p.especie AS especie_paciente,
        pr.nombre AS nombre_propietario,
        pr.telefono AS telefono_propietario,
        v.nombre AS nombre_veterinario
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
      ORDER BY c.fecha_hora DESC
      LIMIT 6
    `);

    // 5. Actividad clínica reciente
    const [actividadRecienteRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        h.id_historial,
        h.fecha_registro,
        h.diagnostico,
        h.tratamiento,
        p.nombre AS nombre_paciente,
        p.especie AS especie_paciente,
        pr.nombre AS nombre_propietario
      FROM historiales_clinicos h
      INNER JOIN pacientes p ON h.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      ORDER BY h.fecha_registro DESC, h.id_historial DESC
      LIMIT 5
    `);

    // 6. Citas agrupadas por día (para la gráfica temporal)
    const [citasPorDiaRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(fecha_hora, '%Y-%m-%d') AS fecha,
        COUNT(*) AS total_citas
      FROM citas
      GROUP BY DATE_FORMAT(fecha_hora, '%Y-%m-%d')
      ORDER BY fecha ASC
      LIMIT 14
    `);

    res.json({
      success: true,
      data: {
        resumen: counters,
        distribucionEspecies: especiesRows,
        distribucionEstados: estadosRows,
        proximasCitas: proximasCitasRows,
        actividadReciente: actividadRecienteRows,
        citasPorDia: citasPorDiaRows,
      },
    });
  } catch (error) {
    next(error);
  }
}
