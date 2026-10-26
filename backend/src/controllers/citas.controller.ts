import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const citaSchema = z.object({
  fecha_hora: z.string().min(10, 'La fecha y hora son obligatorias'),
  motivo: z.string().min(3, 'El motivo debe tener al menos 3 caracteres').max(255),
  id_paciente: z.number({ required_error: 'Debe seleccionar un paciente' }).int().positive(),
  id_veterinario: z.number({ required_error: 'Debe seleccionar un veterinario' }).int().positive(),
  servicios: z.array(z.number().int().positive()).min(1, 'Debe seleccionar al menos un servicio para la cita'),
  estado: z.enum(['pendiente', 'completada', 'cancelada']).optional().default('pendiente'),
});

export const citaEstadoSchema = z.object({
  estado: z.enum(['pendiente', 'completada', 'cancelada'], {
    required_error: 'El estado es requerido (pendiente, completada, cancelada)',
  }),
});

export async function getCitas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const estado = req.query.estado ? (req.query.estado as string) : null;
    const idVeterinario = req.query.id_veterinario ? parseInt(req.query.id_veterinario as string, 10) : null;
    const idPaciente = req.query.id_paciente ? parseInt(req.query.id_paciente as string, 10) : null;
    const fechaInicio = req.query.fecha_inicio ? (req.query.fecha_inicio as string) : null;
    const fechaFin = req.query.fecha_fin ? (req.query.fecha_fin as string) : null;

    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit as string || '10', 10));
    const offset = (page - 1) * limit;

    // Si el usuario autenticado es VETERINARIO, puede estar restringido a ver sus propias citas
    const user = req.session.user;
    let restrictedVetId: number | null = null;
    if (user?.rol === 'VETERINARIO' && user.id_veterinario) {
      restrictedVetId = user.id_veterinario;
    }

    let countQuery = `
      SELECT COUNT(DISTINCT c.id_cita) as total
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
      WHERE 1=1
    `;

    let dataQuery = `
      SELECT 
        c.id_cita,
        c.fecha_hora,
        c.motivo,
        c.estado,
        c.id_paciente,
        c.id_veterinario,
        p.nombre AS nombre_paciente,
        p.especie AS especie_paciente,
        pr.id_propietario,
        pr.nombre AS nombre_propietario,
        pr.telefono AS telefono_propietario,
        v.nombre AS nombre_veterinario,
        COALESCE(SUM(s.costo), 0) AS costo_total
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
      LEFT JOIN citas_servicios cs ON c.id_cita = cs.id_cita
      LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
      WHERE 1=1
    `;

    const params: any[] = [];
    const countParams: any[] = [];

    const effectiveVetId = restrictedVetId || idVeterinario;
    if (effectiveVetId) {
      const vetClause = ' AND c.id_veterinario = ?';
      countQuery += vetClause;
      dataQuery += vetClause;
      params.push(effectiveVetId);
      countParams.push(effectiveVetId);
    }

    if (idPaciente) {
      const pacClause = ' AND c.id_paciente = ?';
      countQuery += pacClause;
      dataQuery += pacClause;
      params.push(idPaciente);
      countParams.push(idPaciente);
    }

    if (estado && estado !== 'todos') {
      const estClause = ' AND c.estado = ?';
      countQuery += estClause;
      dataQuery += estClause;
      params.push(estado);
      countParams.push(estado);
    }

    if (fechaInicio) {
      const fIniClause = ' AND c.fecha_hora >= ?';
      countQuery += fIniClause;
      dataQuery += fIniClause;
      params.push(fechaInicio);
      countParams.push(fechaInicio);
    }

    if (fechaFin) {
      const fFinClause = ' AND c.fecha_hora <= ?';
      countQuery += fFinClause;
      dataQuery += fFinClause;
      params.push(fechaFin);
      countParams.push(fechaFin);
    }

    if (search) {
      const sClause = ' AND (p.nombre LIKE ? OR pr.nombre LIKE ? OR v.nombre LIKE ? OR c.motivo LIKE ?)';
      countQuery += sClause;
      dataQuery += sClause;
      params.push(search, search, search, search);
      countParams.push(search, search, search, search);
    }

    dataQuery += ` 
      GROUP BY 
        c.id_cita, c.fecha_hora, c.motivo, c.estado, c.id_paciente, c.id_veterinario,
        p.nombre, p.especie, pr.id_propietario, pr.nombre, pr.telefono, v.nombre
      ORDER BY c.fecha_hora DESC 
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    const [citas] = await pool.query<RowDataPacket[]>(dataQuery, params);

    // Obtener los servicios asociados para las citas retornadas
    if (citas.length > 0) {
      const citaIds = citas.map((c) => c.id_cita);
      const [serviciosRows] = await pool.query<RowDataPacket[]>(
        `SELECT cs.id_cita, s.id_servicio, s.descripcion, s.costo
         FROM citas_servicios cs
         INNER JOIN servicios s ON cs.id_servicio = s.id_servicio
         WHERE cs.id_cita IN (${citaIds.map(() => '?').join(',')})`,
        citaIds
      );

      const serviciosByCita: Record<number, any[]> = {};
      serviciosRows.forEach((s) => {
        if (!serviciosByCita[s.id_cita]) {
          serviciosByCita[s.id_cita] = [];
        }
        serviciosByCita[s.id_cita].push({
          id_servicio: s.id_servicio,
          descripcion: s.descripcion,
          costo: s.costo,
        });
      });

      citas.forEach((cita) => {
        cita.servicios = serviciosByCita[cita.id_cita] || [];
      });
    }

    res.json({
      success: true,
      data: {
        items: citas,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCitaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.*, 
        p.nombre AS nombre_paciente, 
        p.especie AS especie_paciente, 
        p.raza AS raza_paciente,
        pr.id_propietario,
        pr.nombre AS nombre_propietario, 
        pr.telefono AS telefono_propietario,
        pr.correo AS correo_propietario,
        v.nombre AS nombre_veterinario,
        e.nombre_especialidad
       FROM citas c
       INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
       INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
       INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
       LEFT JOIN especialidades e ON v.id_especialidad = e.id_especialidad
       WHERE c.id_cita = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Cita no encontrada.' });
      return;
    }

    const [servicios] = await pool.execute<RowDataPacket[]>(
      `SELECT s.id_servicio, s.descripcion, s.costo 
       FROM citas_servicios cs
       INNER JOIN servicios s ON cs.id_servicio = s.id_servicio
       WHERE cs.id_cita = ?`,
      [id]
    );

    const costoTotal = servicios.reduce((acc, curr) => acc + Number(curr.costo), 0);

    res.json({
      success: true,
      data: {
        ...rows[0],
        servicios,
        costo_total: costoTotal,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCita(req: Request, res: Response, next: NextFunction): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const { fecha_hora, motivo, id_paciente, id_veterinario, servicios, estado } = req.body;

    // 1. Verificar existencia de paciente y veterinario
    const [pacCheck] = await connection.execute<RowDataPacket[]>(
      'SELECT id_paciente FROM pacientes WHERE id_paciente = ?',
      [id_paciente]
    );
    if (pacCheck.length === 0) {
      connection.release();
      res.status(400).json({ success: false, message: 'El paciente seleccionado no existe.' });
      return;
    }

    const [vetCheck] = await connection.execute<RowDataPacket[]>(
      'SELECT id_veterinario, nombre FROM veterinarios WHERE id_veterinario = ?',
      [id_veterinario]
    );
    if (vetCheck.length === 0) {
      connection.release();
      res.status(400).json({ success: false, message: 'El veterinario seleccionado no existe.' });
      return;
    }

    // 2. Verificar posibles conflictos de horario (+/- 30 minutos)
    const [conflicts] = await connection.execute<RowDataPacket[]>(
      `SELECT id_cita, fecha_hora 
       FROM citas 
       WHERE id_veterinario = ? 
         AND estado <> 'cancelada'
         AND ABS(TIMESTAMPDIFF(MINUTE, fecha_hora, ?)) < 30`,
      [id_veterinario, fecha_hora]
    );

    if (conflicts.length > 0) {
      connection.release();
      res.status(409).json({
        success: false,
        message: `Conflicto de horario: El veterinario ${vetCheck[0].nombre} ya cuenta con otra cita programada cercana a esa hora (${conflicts[0].fecha_hora}). Por favor seleccione otro horario.`,
        error: 'SCHEDULE_CONFLICT',
      });
      return;
    }

    // 3. Iniciar Transacción ACID
    await connection.beginTransaction();

    const [citaResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO citas (fecha_hora, motivo, estado, id_paciente, id_veterinario) VALUES (?, ?, ?, ?, ?)',
      [fecha_hora, motivo.trim(), estado || 'pendiente', id_paciente, id_veterinario]
    );

    const newCitaId = citaResult.insertId;

    // 4. Insertar servicios asociados en citas_servicios
    for (const idServicio of servicios) {
      await connection.execute(
        'INSERT INTO citas_servicios (id_cita, id_servicio) VALUES (?, ?)',
        [newCitaId, idServicio]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Cita programada exitosamente.',
      data: {
        id_cita: newCitaId,
        fecha_hora,
        motivo,
        estado: estado || 'pendiente',
        id_paciente,
        id_veterinario,
        servicios,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

export async function updateCita(req: Request, res: Response, next: NextFunction): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      connection.release();
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { fecha_hora, motivo, id_paciente, id_veterinario, servicios, estado } = req.body;

    // Verificar existencia de la cita
    const [existCheck] = await connection.execute<RowDataPacket[]>(
      'SELECT id_cita FROM citas WHERE id_cita = ?',
      [id]
    );
    if (existCheck.length === 0) {
      connection.release();
      res.status(404).json({ success: false, message: 'Cita no encontrada.' });
      return;
    }

    // Verificar conflictos de horario para el veterinario excluyendo la cita actual
    const [conflicts] = await connection.execute<RowDataPacket[]>(
      `SELECT id_cita, fecha_hora 
       FROM citas 
       WHERE id_veterinario = ? 
         AND id_cita <> ?
         AND estado <> 'cancelada'
         AND ABS(TIMESTAMPDIFF(MINUTE, fecha_hora, ?)) < 30`,
      [id_veterinario, id, fecha_hora]
    );

    if (conflicts.length > 0) {
      connection.release();
      res.status(409).json({
        success: false,
        message: `Conflicto de horario: El veterinario ya cuenta con otra cita programada en ese rango horario (${conflicts[0].fecha_hora}).`,
        error: 'SCHEDULE_CONFLICT',
      });
      return;
    }

    await connection.beginTransaction();

    await connection.execute(
      'UPDATE citas SET fecha_hora = ?, motivo = ?, estado = ?, id_paciente = ?, id_veterinario = ? WHERE id_cita = ?',
      [fecha_hora, motivo.trim(), estado || 'pendiente', id_paciente, id_veterinario, id]
    );

    // Reasignar servicios: eliminar previos e insertar seleccionados
    await connection.execute('DELETE FROM citas_servicios WHERE id_cita = ?', [id]);

    for (const idServicio of servicios) {
      await connection.execute(
        'INSERT INTO citas_servicios (id_cita, id_servicio) VALUES (?, ?)',
        [id, idServicio]
      );
    }

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente.',
      data: {
        id_cita: id,
        fecha_hora,
        motivo,
        estado,
        id_paciente,
        id_veterinario,
        servicios,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

export async function updateCitaEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { estado } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE citas SET estado = ? WHERE id_cita = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Cita no encontrada.' });
      return;
    }

    res.json({
      success: true,
      message: `El estado de la cita fue actualizado a '${estado}'.`,
      data: { id_cita: id, estado },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCita(req: Request, res: Response, next: NextFunction): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      connection.release();
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    await connection.beginTransaction();

    // Eliminar servicios asignados a la cita
    await connection.execute('DELETE FROM citas_servicios WHERE id_cita = ?', [id]);

    // Eliminar la cita
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM citas WHERE id_cita = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      res.status(404).json({ success: false, message: 'Cita no encontrada.' });
      return;
    }

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Cita y sus servicios asociados eliminados correctamente.',
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}
