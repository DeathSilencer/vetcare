import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const historialSchema = z.object({
  id_paciente: z.number({ required_error: 'Debe seleccionar un paciente' }).int().positive(),
  fecha_registro: z.string().min(10, 'La fecha de registro es obligatoria (YYYY-MM-DD)'),
  diagnostico: z.string().min(3, 'El diagnóstico debe tener al menos 3 caracteres'),
  tratamiento: z.string().min(3, 'El tratamiento debe tener al menos 3 caracteres'),
});

export async function getHistoriales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const idPaciente = req.query.id_paciente ? parseInt(req.query.id_paciente as string, 10) : null;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit as string || '10', 10));
    const offset = (page - 1) * limit;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM historiales_clinicos h
      INNER JOIN pacientes p ON h.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      WHERE 1=1
    `;

    let dataQuery = `
      SELECT 
        h.id_historial,
        h.fecha_registro,
        h.diagnostico,
        h.tratamiento,
        h.id_paciente,
        p.nombre AS nombre_paciente,
        p.especie AS especie_paciente,
        p.raza AS raza_paciente,
        pr.nombre AS nombre_propietario,
        pr.telefono AS telefono_propietario
      FROM historiales_clinicos h
      INNER JOIN pacientes p ON h.id_paciente = p.id_paciente
      INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      WHERE 1=1
    `;

    const params: any[] = [];
    const countParams: any[] = [];

    if (idPaciente) {
      const pacClause = ' AND h.id_paciente = ?';
      countQuery += pacClause;
      dataQuery += pacClause;
      params.push(idPaciente);
      countParams.push(idPaciente);
    }

    if (search) {
      const sClause = ' AND (h.diagnostico LIKE ? OR h.tratamiento LIKE ? OR p.nombre LIKE ? OR pr.nombre LIKE ?)';
      countQuery += sClause;
      dataQuery += sClause;
      params.push(search, search, search, search);
      countParams.push(search, search, search, search);
    }

    dataQuery += ' ORDER BY h.fecha_registro DESC, h.id_historial DESC LIMIT ? OFFSET ?';
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

export async function getHistorialById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        h.*, 
        p.nombre AS nombre_paciente, 
        p.especie AS especie_paciente, 
        p.raza AS raza_paciente,
        pr.nombre AS nombre_propietario,
        pr.telefono AS telefono_propietario
       FROM historiales_clinicos h
       INNER JOIN pacientes p ON h.id_paciente = p.id_paciente
       INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
       WHERE h.id_historial = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Registro clínico no encontrado.' });
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

export async function createHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id_paciente, fecha_registro, diagnostico, tratamiento } = req.body;

    const [pacCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_paciente FROM pacientes WHERE id_paciente = ?',
      [id_paciente]
    );

    if (pacCheck.length === 0) {
      res.status(400).json({ success: false, message: 'El paciente seleccionado no existe.' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO historiales_clinicos (id_paciente, fecha_registro, diagnostico, tratamiento) VALUES (?, ?, ?, ?)',
      [id_paciente, fecha_registro, diagnostico.trim(), tratamiento.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Nota clínica registrada exitosamente en el historial.',
      data: {
        id_historial: result.insertId,
        id_paciente,
        fecha_registro,
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { id_paciente, fecha_registro, diagnostico, tratamiento } = req.body;

    const [pacCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_paciente FROM pacientes WHERE id_paciente = ?',
      [id_paciente]
    );

    if (pacCheck.length === 0) {
      res.status(400).json({ success: false, message: 'El paciente seleccionado no existe.' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE historiales_clinicos SET id_paciente = ?, fecha_registro = ?, diagnostico = ?, tratamiento = ? WHERE id_historial = ?',
      [id_paciente, fecha_registro, diagnostico.trim(), tratamiento.trim(), id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Registro clínico no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Nota clínica actualizada exitosamente.',
      data: {
        id_historial: id,
        id_paciente,
        fecha_registro,
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHistorial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM historiales_clinicos WHERE id_historial = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Registro clínico no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Registro clínico eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
