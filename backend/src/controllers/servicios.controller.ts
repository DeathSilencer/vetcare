import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const servicioSchema = z.object({
  descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres').max(100),
  costo: z.number({ required_error: 'El costo es obligatorio' }).min(0, 'El costo no puede ser negativo'),
});

export async function getServicios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;

    let query = `
      SELECT 
        s.id_servicio,
        s.descripcion,
        s.costo,
        COUNT(cs.id_detalle) AS veces_solicitado
      FROM servicios s
      LEFT JOIN citas_servicios cs ON s.id_servicio = cs.id_servicio
    `;
    const params: any[] = [];

    if (search) {
      query += ' WHERE s.descripcion LIKE ?';
      params.push(search);
    }

    query += ' GROUP BY s.id_servicio, s.descripcion, s.costo ORDER BY s.descripcion ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getServicioById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM servicios WHERE id_servicio = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado.' });
      return;
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function createServicio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { descripcion, costo } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO servicios (descripcion, costo) VALUES (?, ?)',
      [descripcion.trim(), costo]
    );

    res.status(201).json({
      success: true,
      message: 'Servicio registrado exitosamente.',
      data: {
        id_servicio: result.insertId,
        descripcion: descripcion.trim(),
        costo,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateServicio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { descripcion, costo } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE servicios SET descripcion = ?, costo = ? WHERE id_servicio = ?',
      [descripcion.trim(), costo, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente.',
      data: {
        id_servicio: id,
        descripcion: descripcion.trim(),
        costo,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteServicio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    // Comprobar si se ha asignado a citas
    const [citas] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM citas_servicios WHERE id_servicio = ?',
      [id]
    );

    if (citas[0]?.count > 0) {
      res.status(409).json({
        success: false,
        message: `No es posible eliminar este servicio porque ha sido asignado a ${citas[0].count} cita(s). Consérvelo para mantener los registros contables y el historial clínico intactos.`,
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM servicios WHERE id_servicio = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Servicio eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
