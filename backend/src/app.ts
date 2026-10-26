import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import morgan from 'morgan';
import { env } from './config/env.js';
import { pool, testDbConnection } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';

const app = express();

// Configuración de proxy para Cloud Run / Firebase Hosting (permite detectar HTTPS y cabeceras x-forwarded-*)
app.set('trust proxy', 1);

// 1. Cabeceras de seguridad con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Permitir comunicación flexible
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS restringido al frontend autorizado con soporte de cookies
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://vetcare-cloud.web.app',
  'https://vetcare-cloud.firebaseapp.com',
];
if (env.CLIENT_URL && !allowedOrigins.includes(env.CLIENT_URL)) {
  allowedOrigins.push(env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones locales, herramientas API o rewrites internos de Firebase Hosting
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (/^https:\/\/.*\.web\.app$/.test(origin) || /^https:\/\/.*\.firebaseapp\.com$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origen CORS no permitido: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Parseo de peticiones y cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Logger HTTP (solo en consola)
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Almacén de sesiones seguro en MySQL (express-mysql-session)
const MySQLStore = (MySQLStoreFactory as any)(session);
const sessionStore = new MySQLStore(
  {
    expiration: 1000 * 60 * 60 * 24, // 24 horas de duración
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  },
  pool as any
);

app.use(
  session({
    name: env.COOKIE_NAME,
    secret: env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    },
  })
);

// 6. Limitador general de peticiones API
app.use('/api', apiLimiter);

// 7. Montaje de rutas de la API
app.use('/api', routes);

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    sistema: 'VetCare — Sistema Integral de Gestión Veterinaria',
    version: '1.0.0',
    estado: 'API en línea y operativa',
    documentacion: '/api/health',
  });
});

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`,
  });
});

// 8. Manejo centralizado de errores
app.use(errorHandler);

// Iniciar servidor solo si no estamos en entorno de prueba
if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🐾 VetCare Backend iniciado exitosamente`);
    console.log(`🚀 Puerto: ${env.PORT}`);
    console.log(`🌐 URL: http://localhost:${env.PORT}`);
    console.log(`======================================================`);

    const dbOk = await testDbConnection();
    if (dbOk) {
      console.log(`✅ Conexión con base de datos '${env.DB_NAME}' en MySQL establecida exitosamente.`);
    } else {
      console.error(`❌ ALERTA: No se pudo conectar a MySQL '${env.DB_NAME}'. Verifique credenciales en .env.`);
    }
  });
}

export default app;
