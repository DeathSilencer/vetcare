import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const pacienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  especie: z.string().min(2, 'La especie es requerida (ej. Perro, Gato)').max(50),
  raza: z.string().max(50).nullable().optional().or(z.literal('')),
  id_propietario: z.number({ required_error: 'Debe seleccionar un propietario' }).int().positive(),
});

export async function getPacientes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const especie = req.query.especie ? (req.query.especie as string) : null;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit as string || '10', 10));
    const offset = (page - 1) * limit;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM pacientes p
      LEFT JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      WHERE 1=1
    `;
    let dataQuery = `
      SELECT 
        p.id_paciente,
        p.nombre,
        p.especie,
        p.raza,
        p.id_propietario,
        pr.nombre AS propietario_nombre,
        pr.telefono AS propietario_telefono,
        pr.correo AS propietario_correo
      FROM pacientes p
      LEFT JOIN propietarios pr ON p.id_propietario = pr.id_propietario
      WHERE 1=1
    `;

    const params: any[] = [];
    const countParams: any[] = [];

    if (search) {
      const searchClause = ' AND (p.nombre LIKE ? OR p.raza LIKE ? OR pr.nombre LIKE ?)';
      countQuery += searchClause;
      dataQuery += searchClause;
      params.push(search, search, search);
      countParams.push(search, search, search);
    }

    if (especie && especie !== 'todas') {
      const especieClause = ' AND p.especie = ?';
      countQuery += especieClause;
      dataQuery += especieClause;
      params.push(especie);
      countParams.push(especie);
    }

    dataQuery += ' ORDER BY p.id_paciente DESC LIMIT ? OFFSET ?';
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

export async function getPacienteById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        p.*, 
        pr.nombre AS propietario_nombre, 
        pr.telefono AS propietario_telefono, 
        pr.correo AS propietario_correo
       FROM pacientes p
       LEFT JOIN propietarios pr ON p.id_propietario = pr.id_propietario
       WHERE p.id_paciente = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
      return;
    }

    const paciente = rows[0];

    // Historial clínico del paciente
    const [historiales] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM historiales_clinicos WHERE id_paciente = ? ORDER BY fecha_registro DESC',
      [id]
    );

    // Citas del paciente
    const [citas] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, v.nombre AS nombre_veterinario 
       FROM citas c
       LEFT JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
       WHERE c.id_paciente = ? 
       ORDER BY c.fecha_hora DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...paciente,
        historiales,
        citas,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createPaciente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nombre, especie, raza, id_propietario } = req.body;
    const sanitizedRaza = raza && raza.trim() !== '' ? raza.trim() : null;

    // Verificar que el propietario exista
    const [propCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_propietario FROM propietarios WHERE id_propietario = ?',
      [id_propietario]
    );

    if (propCheck.length === 0) {
      res.status(400).json({
        success: false,
        message: 'El propietario seleccionado no existe.',
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO pacientes (nombre, especie, raza, id_propietario) VALUES (?, ?, ?, ?)',
      [nombre.trim(), especie.trim(), sanitizedRaza, id_propietario]
    );

    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente.',
      data: {
        id_paciente: result.insertId,
        nombre,
        especie,
        raza: sanitizedRaza,
        id_propietario,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePaciente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { nombre, especie, raza, id_propietario } = req.body;
    const sanitizedRaza = raza && raza.trim() !== '' ? raza.trim() : null;

    // Verificar propietario
    const [propCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_propietario FROM propietarios WHERE id_propietario = ?',
      [id_propietario]
    );

    if (propCheck.length === 0) {
      res.status(400).json({
        success: false,
        message: 'El propietario seleccionado no existe.',
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE pacientes SET nombre = ?, especie = ?, raza = ?, id_propietario = ? WHERE id_paciente = ?',
      [nombre.trim(), especie.trim(), sanitizedRaza, id_propietario, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente.',
      data: {
        id_paciente: id,
        nombre,
        especie,
        raza: sanitizedRaza,
        id_propietario,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePaciente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    // Verificar dependencias en citas o historiales
    const [citas] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM citas WHERE id_paciente = ?',
      [id]
    );
    const [historiales] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM historiales_clinicos WHERE id_paciente = ?',
      [id]
    );

    const citasCount = citas[0]?.count || 0;
    const histCount = historiales[0]?.count || 0;

    if (citasCount > 0 || histCount > 0) {
      res.status(409).json({
        success: false,
        message: `No se puede eliminar el paciente porque tiene ${citasCount} cita(s) y ${histCount} registro(s) en su historial clínico. Elimine o transfiera primero dichos registros para mantener la integridad referencial.`,
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM pacientes WHERE id_paciente = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Paciente no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Paciente eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
