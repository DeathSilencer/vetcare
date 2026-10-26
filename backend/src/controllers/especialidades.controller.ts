import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const especialidadSchema = z.object({
  nombre_especialidad: z.string().min(3, 'El nombre de la especialidad debe tener al menos 3 caracteres').max(50),
});

export async function getEspecialidades(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;

    let query = `
      SELECT 
        e.id_especialidad,
        e.nombre_especialidad,
        COUNT(v.id_veterinario) AS total_veterinarios
      FROM especialidades e
      LEFT JOIN veterinarios v ON e.id_especialidad = v.id_especialidad
    `;
    const params: any[] = [];

    if (search) {
      query += ' WHERE e.nombre_especialidad LIKE ?';
      params.push(search);
    }

    query += ' GROUP BY e.id_especialidad, e.nombre_especialidad ORDER BY e.nombre_especialidad ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEspecialidadById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM especialidades WHERE id_especialidad = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Especialidad no encontrada.' });
      return;
    }

    const [veterinarios] = await pool.execute<RowDataPacket[]>(
      'SELECT id_veterinario, nombre, telefono FROM veterinarios WHERE id_especialidad = ? ORDER BY nombre ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...rows[0],
        veterinarios,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nombre_especialidad } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO especialidades (nombre_especialidad) VALUES (?)',
      [nombre_especialidad.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Especialidad creada exitosamente.',
      data: {
        id_especialidad: result.insertId,
        nombre_especialidad: nombre_especialidad.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { nombre_especialidad } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE especialidades SET nombre_especialidad = ? WHERE id_especialidad = ?',
      [nombre_especialidad.trim(), id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Especialidad no encontrada.' });
      return;
    }

    res.json({
      success: true,
      message: 'Especialidad actualizada exitosamente.',
      data: {
        id_especialidad: id,
        nombre_especialidad: nombre_especialidad.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEspecialidad(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    // Comprobar si hay veterinarios asignados a esta especialidad
    const [vets] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM veterinarios WHERE id_especialidad = ?',
      [id]
    );

    if (vets[0]?.count > 0) {
      res.status(409).json({
        success: false,
        message: `No es posible eliminar esta especialidad porque ${vets[0].count} veterinario(s) están asignados a ella. Reasigne sus especialidades antes de eliminarla.`,
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM especialidades WHERE id_especialidad = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Especialidad no encontrada.' });
      return;
    }

    res.json({
      success: true,
      message: 'Especialidad eliminada correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
