import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { Usuario } from '../types/index.js';
import { RowDataPacket } from 'mysql2';

export const loginSchema = z.object({
  correo: z.string().email('Debe ingresar un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const perfilUpdateSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  correo: z.string().email('Correo electrónico no válido'),
  passwordActual: z.string().optional(),
  passwordNuevo: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').optional(),
});

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { correo, password } = req.body;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.*, v.nombre AS nombre_veterinario 
       FROM usuarios u
       LEFT JOIN veterinarios v ON u.id_veterinario = v.id_veterinario
       WHERE u.correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Correo electrónico o contraseña incorrectos.',
      });
      return;
    }

    const usuario = rows[0] as Usuario & { nombre_veterinario?: string };

    if (!usuario.activo) {
      res.status(403).json({
        success: false,
        message: 'Esta cuenta de usuario se encuentra desactivada. Contacte al administrador.',
      });
      return;
    }

    const passwordValido = await comparePassword(password, usuario.password_hash);
    if (!passwordValido) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Correo electrónico o contraseña incorrectos.',
      });
      return;
    }

    // Actualizar último login
    await pool.execute('UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?', [
      usuario.id_usuario,
    ]);

    // Establecer sesión
    req.session.user = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      id_veterinario: usuario.id_veterinario,
      nombre_veterinario: usuario.nombre_veterinario || null,
    };

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        user: req.session.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Sesión finalizada correctamente.',
    });
  });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  if (!req.session || !req.session.user) {
    res.status(401).json({
      success: false,
      message: 'No hay una sesión activa.',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      user: req.session.user,
    },
  });
}

export async function updatePerfil(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session.user!.id_usuario;
    const { nombre, correo, passwordActual, passwordNuevo } = req.body;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    const usuario = rows[0] as Usuario;

    // Verificar si el nuevo correo ya existe en otro usuario
    if (correo !== usuario.correo) {
      const [emailCheck] = await pool.execute<RowDataPacket[]>(
        'SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario <> ?',
        [correo, userId]
      );
      if (emailCheck.length > 0) {
        res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado por otro usuario.',
        });
        return;
      }
    }

    if (passwordNuevo) {
      if (!passwordActual) {
        res.status(400).json({
          success: false,
          message: 'Debe ingresar su contraseña actual para establecer una nueva.',
        });
        return;
      }

      const match = await comparePassword(passwordActual, usuario.password_hash);
      if (!match) {
        res.status(400).json({
          success: false,
          message: 'La contraseña actual no es correcta.',
        });
        return;
      }

      const nuevoHash = await hashPassword(passwordNuevo);
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, correo = ?, password_hash = ? WHERE id_usuario = ?',
        [nombre, correo, nuevoHash, userId]
      );
    } else {
      await pool.execute(
        'UPDATE usuarios SET nombre = ?, correo = ? WHERE id_usuario = ?',
        [nombre, correo, userId]
      );
    }

    req.session.user!.nombre = nombre;
    req.session.user!.correo = correo;

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      data: {
        user: req.session.user,
      },
    });
  } catch (error) {
    next(error);
  }
}
