import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/index.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session || !req.session.user) {
    res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Debe iniciar sesión para acceder a este recurso.',
    });
    return;
  }
  next();
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Debe iniciar sesión.',
      });
      return;
    }

    if (!roles.includes(req.session.user.rol)) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}. Su rol actual es: ${req.session.user.rol}.`,
      });
      return;
    }

    next();
  };
}
