import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const veterinarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  telefono: z.string().max(15).nullable().optional().or(z.literal('')),
  id_especialidad: z.number({ required_error: 'Debe seleccionar una especialidad' }).int().positive(),
});

export async function getVeterinarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const especialidadId = req.query.id_especialidad ? parseInt(req.query.id_especialidad as string, 10) : null;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit as string || '10', 10));
    const offset = (page - 1) * limit;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM veterinarios v
      LEFT JOIN especialidades e ON v.id_especialidad = e.id_especialidad
      WHERE 1=1
    `;
    let dataQuery = `
      SELECT 
        v.id_veterinario,
        v.nombre,
        v.telefono,
        v.id_especialidad,
        e.nombre_especialidad,
        COUNT(c.id_cita) AS total_citas
      FROM veterinarios v
      LEFT JOIN especialidades e ON v.id_especialidad = e.id_especialidad
      LEFT JOIN citas c ON v.id_veterinario = c.id_veterinario
      WHERE 1=1
    `;

    const params: any[] = [];
    const countParams: any[] = [];

    if (search) {
      const searchClause = ' AND (v.nombre LIKE ? OR v.telefono LIKE ? OR e.nombre_especialidad LIKE ?)';
      countQuery += searchClause;
      dataQuery += searchClause;
      params.push(search, search, search);
      countParams.push(search, search, search);
    }

    if (especialidadId) {
      const espClause = ' AND v.id_especialidad = ?';
      countQuery += espClause;
      dataQuery += espClause;
      params.push(especialidadId);
      countParams.push(especialidadId);
    }

    dataQuery += ' GROUP BY v.id_veterinario, v.nombre, v.telefono, v.id_especialidad, e.nombre_especialidad ORDER BY v.nombre ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, params);

    res.json({
      success: true,
      data: {
        items: rows,
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

export async function getVeterinarioById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT v.*, e.nombre_especialidad 
       FROM veterinarios v
       LEFT JOIN especialidades e ON v.id_especialidad = e.id_especialidad
       WHERE v.id_veterinario = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Veterinario no encontrado.' });
      return;
    }

    const [citas] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, p.nombre AS nombre_paciente, p.especie AS especie_paciente
       FROM citas c
       INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
       WHERE c.id_veterinario = ?
       ORDER BY c.fecha_hora DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...rows[0],
        citas,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createVeterinario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nombre, telefono, id_especialidad } = req.body;
    const sanitizedTel = telefono && telefono.trim() !== '' ? telefono.trim() : null;

    // Verificar especialidad
    const [espCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_especialidad FROM especialidades WHERE id_especialidad = ?',
      [id_especialidad]
    );

    if (espCheck.length === 0) {
      res.status(400).json({ success: false, message: 'La especialidad seleccionada no existe.' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO veterinarios (nombre, telefono, id_especialidad) VALUES (?, ?, ?)',
      [nombre.trim(), sanitizedTel, id_especialidad]
    );

    res.status(201).json({
      success: true,
      message: 'Veterinario registrado exitosamente.',
      data: {
        id_veterinario: result.insertId,
        nombre,
        telefono: sanitizedTel,
        id_especialidad,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVeterinario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { nombre, telefono, id_especialidad } = req.body;
    const sanitizedTel = telefono && telefono.trim() !== '' ? telefono.trim() : null;

    const [espCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_especialidad FROM especialidades WHERE id_especialidad = ?',
      [id_especialidad]
    );

    if (espCheck.length === 0) {
      res.status(400).json({ success: false, message: 'La especialidad seleccionada no existe.' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE veterinarios SET nombre = ?, telefono = ?, id_especialidad = ? WHERE id_veterinario = ?',
      [nombre.trim(), sanitizedTel, id_especialidad, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Veterinario no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Veterinario actualizado exitosamente.',
      data: {
        id_veterinario: id,
        nombre,
        telefono: sanitizedTel,
        id_especialidad,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVeterinario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    // Verificar si tiene citas vinculadas
    const [citas] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM citas WHERE id_veterinario = ?',
      [id]
    );

    if (citas[0]?.count > 0) {
      res.status(409).json({
        success: false,
        message: `No se puede eliminar al veterinario porque tiene ${citas[0].count} cita(s) asignada(s). Reasigne o cancele las citas antes de continuar.`,
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM veterinarios WHERE id_veterinario = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Veterinario no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Veterinario eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
