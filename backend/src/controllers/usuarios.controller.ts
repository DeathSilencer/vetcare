import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const createUsuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['ADMIN', 'RECEPCION', 'VETERINARIO']),
  id_veterinario: z.number().int().positive().nullable().optional(),
  activo: z.boolean().optional().default(true),
});

export const updateUsuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  rol: z.enum(['ADMIN', 'RECEPCION', 'VETERINARIO']),
  id_veterinario: z.number().int().positive().nullable().optional(),
  activo: z.boolean(),
});

export async function getUsuarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.correo,
        u.rol,
        u.activo,
        u.id_veterinario,
        u.fecha_creacion,
        u.ultimo_login,
        v.nombre AS nombre_veterinario
      FROM usuarios u
      LEFT JOIN veterinarios v ON u.id_veterinario = v.id_veterinario
      ORDER BY u.id_usuario ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsuarioById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id_usuario,
        u.nombre,
        u.correo,
        u.rol,
        u.activo,
        u.id_veterinario,
        u.fecha_creacion,
        u.ultimo_login,
        v.nombre AS nombre_veterinario
       FROM usuarios u
       LEFT JOIN veterinarios v ON u.id_veterinario = v.id_veterinario
       WHERE u.id_usuario = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
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

export async function createUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nombre, correo, password, rol, id_veterinario, activo } = req.body;

    // Verificar si el correo ya existe
    const [emailCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_usuario FROM usuarios WHERE correo = ?',
      [correo.trim()]
    );

    if (emailCheck.length > 0) {
      res.status(409).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado por otro usuario.',
      });
      return;
    }

    // Si el rol es VETERINARIO y se envía id_veterinario, verificar su existencia
    if (rol === 'VETERINARIO' && id_veterinario) {
      const [vetCheck] = await pool.execute<RowDataPacket[]>(
        'SELECT id_veterinario FROM veterinarios WHERE id_veterinario = ?',
        [id_veterinario]
      );
      if (vetCheck.length === 0) {
        res.status(400).json({ success: false, message: 'El veterinario seleccionado no existe.' });
        return;
      }
    }

    const passwordHash = await hashPassword(password);
    const effectiveVetId = rol === 'VETERINARIO' && id_veterinario ? id_veterinario : null;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO usuarios (nombre, correo, password_hash, rol, activo, id_veterinario) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre.trim(), correo.trim(), passwordHash, rol, activo !== false ? 1 : 0, effectiveVetId]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        id_usuario: result.insertId,
        nombre,
        correo,
        rol,
        activo: activo !== false,
        id_veterinario: effectiveVetId,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    const { nombre, correo, password, rol, id_veterinario, activo } = req.body;

    const [check] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (check.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    // Verificar si el correo está ocupado por otro id
    const [emailCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario <> ?',
      [correo.trim(), id]
    );

    if (emailCheck.length > 0) {
      res.status(409).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado por otro usuario.',
      });
      return;
    }

    const effectiveVetId = rol === 'VETERINARIO' && id_veterinario ? id_veterinario : null;

    if (password && password.trim() !== '') {
      const passwordHash = await hashPassword(password);
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, correo = ?, password_hash = ?, rol = ?, activo = ?, id_veterinario = ? WHERE id_usuario = ?',
        [nombre.trim(), correo.trim(), passwordHash, rol, activo ? 1 : 0, effectiveVetId, id]
      );
    } else {
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, activo = ?, id_veterinario = ? WHERE id_usuario = ?',
        [nombre.trim(), correo.trim(), rol, activo ? 1 : 0, effectiveVetId, id]
      );
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente.',
      data: {
        id_usuario: id,
        nombre,
        correo,
        rol,
        activo,
        id_veterinario: effectiveVetId,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Identificador inválido.' });
      return;
    }

    // Evitar que el administrador se elimine a sí mismo
    if (req.session.user?.id_usuario === id) {
      res.status(400).json({
        success: false,
        message: 'No puede eliminar su propia cuenta de usuario mientras está en sesión.',
      });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente.',
    });
  } catch (error) {
    next(error);
  }
}
