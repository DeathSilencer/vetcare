import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Error Middleware]:', err);

  // Errores de validación de Zod
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({
      campo: i.path.join('.'),
      mensaje: i.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Los datos proporcionados no cumplen con las validaciones requeridas.',
      details: issues,
    });
    return;
  }

  // Errores específicos de MySQL / MariaDB
  if (err.code) {
    switch (err.code) {
      // 1451: Cannot delete or update a parent row: a foreign key constraint fails
      case 'ER_ROW_IS_REFERENCED_2':
      case '1451':
        res.status(409).json({
          success: false,
          message:
            'Operación bloqueada por integridad referencial: No es posible eliminar o modificar este registro porque tiene información vinculada en otras tablas (ej. pacientes, citas, historiales o servicios asociados).',
          error: 'FOREIGN_KEY_RESTRICTION',
        });
        return;

      // 1452: Cannot add or update a child row: a foreign key constraint fails
      case 'ER_NO_REFERENCED_ROW_2':
      case '1452':
        res.status(400).json({
          success: false,
          message:
            'El registro relacionado no existe en la base de datos (clave foránea inválida). Por favor seleccione un registro existente.',
          error: 'FOREIGN_KEY_NOT_FOUND',
        });
        return;

      // 1062: Duplicate entry
      case 'ER_DUP_ENTRY':
      case '1062':
        res.status(409).json({
          success: false,
          message:
            'Ya existe un registro con la misma información única (ej. correo electrónico repetido). Por favor verifique los datos ingresados.',
          error: 'DUPLICATE_ENTRY',
        });
        return;

      // Error de sintaxis o conexión
      case 'ECONNREFUSED':
      case 'PROTOCOL_CONNECTION_LOST':
        res.status(503).json({
          success: false,
          message:
            'No se pudo establecer conexión con el servidor MySQL/MariaDB. Por favor verifique que el servicio esté activo.',
          error: 'DATABASE_CONNECTION_LOST',
        });
        return;
    }
  }

  // Error genérico no expone datos sensibles ni consultas internas
  const status = err.statusCode || 500;
  const message =
    err.isOperational && err.message
      ? err.message
      : 'Ocurrió un error interno en el servidor. Por favor intente más tarde.';

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
