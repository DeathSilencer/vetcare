import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos de login por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de acceso fallidos. Por seguridad, intente nuevamente en 15 minutos.',
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 peticiones cada 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de solicitudes excedido. Por favor reduzca la frecuencia de peticiones.',
  },
});
