import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const propietarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  telefono: z.string().min(7, 'El teléfono debe tener entre 7 y 15 dígitos').max(15),
  correo: z.string().email('Correo electrónico inválido').nullable().optional().or(z.literal('')),
});

export async function getPropietarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit as string || '10', 10));
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM propietarios pr';
    let dataQuery = `
      SELECT 
        pr.id_propietario,
        pr.nombre,
        pr.telefono,
        pr.correo,
        COUNT(p.id_paciente) AS total_pacientes
      FROM propietarios pr
      LEFT JOIN pacientes p ON pr.id_propietario = p.id_propietario
    `;
    const params: any[] = [];
    const countParams: any[] = [];

    if (search) {
      const whereClause = ' WHERE pr.nombre LIKE ? OR pr.telefono LIKE ? OR pr.correo LIKE ?';
      countQuery += whereClause;
      dataQuery += whereClause;
      params.push(search, search, search);
      countParams.push(search, search, search);
    }

    dataQuery += ' GROUP BY pr.id_propietario, pr.nombre, pr.telefono, pr.correo ORDER BY pr.id_propietario DESC LIMIT ? OFFSET ?';
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

export async function getPropietarioById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM propietarios WHERE id_propietario = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Propietario no encontrado.' });
      return;
    }

    const propietario = rows[0];

    // Obtener pacientes asociados
    const [pacientes] = await pool.execute<RowDataPacket[]>(
      'SELECT id_paciente, nombre, especie, raza FROM pacientes WHERE id_propietario = ? ORDER BY nombre ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...propietario,
        pacientes,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createPropietario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nombre, telefono, correo } = req.body;
    const sanitizedEmail = correo && correo.trim() !== '' ? correo.trim() : null;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO propietarios (nombre, telefono, correo) VALUES (?, ?, ?)',
      [nombre.trim(), telefono.trim(), sanitizedEmail]
    );

    res.status(201).json({
      success: true,
      message: 'Propietario registrado exitosamente.',
      data: {
        id_propietario: result.insertId,
        nombre,
        telefono,
        correo: sanitizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePropietario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { nombre, telefono, correo } = req.body;
    const sanitizedEmail = correo && correo.trim() !== '' ? correo.trim() : null;

    const [check] = await pool.execute<RowDataPacket[]>(
      'SELECT id_propietario FROM propietarios WHERE id_propietario = ?',
      [id]
    );

    if (check.length === 0) {
      res.status(404).json({ success: false, message: 'Propietario no encontrado.' });
      return;
    }

    await pool.execute(
      'UPDATE propietarios SET nombre = ?, telefono = ?, correo = ? WHERE id_propietario = ?',
      [nombre.trim(), telefono.trim(), sanitizedEmail, id]
    );

    res.json({
      success: true,
      message: 'Propietario actualizado exitosamente.',
      data: {
        id_propietario: id,
        nombre,
        telefono,
        correo: sanitizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePropietario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    // Verificar si tiene pacientes vinculados antes de eliminar
    const [pacientes] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM pacientes WHERE id_propietario = ?',
      [id]
    );

    if (pacientes[0]?.count > 0) {
      res.status(409).json({
        success: false,
        message: `No es posible eliminar a este propietario porque tiene ${pacientes[0].count} paciente(s) registrado(s) a su nombre. Reasigne o elimine primero sus pacientes.`,
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM propietarios WHERE id_propietario = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Propietario no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Propietario eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
