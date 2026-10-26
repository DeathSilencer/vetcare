# 🐾 VetCare — Sistema Integral de Gestión Veterinaria
> **Proyecto Integrador de Bases de Datos & Desarrollo de Software Full-Stack**  
> Aplicación web profesional, moderna, robusta y segura para la administración clínica veterinaria, conectada a MySQL/MariaDB.

---

## 🌟 Características Principales

- **Frontend Profesional:** Desarrollado con **React**, **Vite**, **TypeScript** y estilizado con **Tailwind CSS**. Paleta visual médica con verde esmeralda, azul pizarra y estados discretos.
- **Backend Robusto:** API REST estructurada con **Node.js**, **Express**, **TypeScript** y **MySQL2** (pool de conexiones con soporte UTF-8 completo).
- **Seguridad de Nivel Empresarial:**
  - Contraseñas protegidas mediante hash criptográfico **bcrypt** (10 rondas de sal).
  - Autenticación mediante **sesiones del servidor y cookies HTTP-only**, persistidas en MySQL con `express-mysql-session`.
  - Protección de cabeceras con **Helmet**.
  - Limitación de solicitudes (**Rate Limiting**) para prevenir ataques de fuerza bruta en el login.
  - Validación de esquemas en frontend y backend con **Zod** y **React Hook Form**.
  - Control de acceso basado en roles (**RBAC**): `ADMIN`, `RECEPCION` y `VETERINARIO`.
- **Integridad Referencial y Transacciones ACID:**
  - Respeto total al esquema original de 8 tablas (`propietarios`, `pacientes`, `especialidades`, `veterinarios`, `citas`, `servicios`, `citas_servicios`, `historiales_clinicos`).
  - Detección e intercepción de violaciones de clave foránea (Error MySQL 1451) con mensajes claros al usuario.
  - Transacciones atómicas (`START TRANSACTION` / `COMMIT` / `ROLLBACK`) para la creación y edición de citas con servicios múltiples en `citas_servicios`.
  - Advertencia sobre conflictos de horario para citas del mismo veterinario (+/- 30 minutos).
- **Dashboard y Analítica en Tiempo Real:** Métricas reales calculadas desde MySQL, gráficos de distribución por especie (Recharts PieChart) y volumen de citas por estado (BarChart).
- **Reportes y Preguntas Académicas:** Módulo de reportes que responde las 5 preguntas de negocio requeridas por la rúbrica escolar, con exportación a **CSV seguro** (protegido contra CSV/Formula Injection).

---

## 📋 Requisitos Previos del Sistema

1. **Sistema Operativo:** Windows 10 u 11 (también compatible con Linux y macOS).
2. **Node.js:** Versión 18.x, 20.x o 24.x instalada.
3. **Servidor de Base de Datos:** **MySQL 8.0+** o **MariaDB 10.4+** (incluido en **XAMPP**, WampServer o Laragon).
4. **Navegador Web:** Google Chrome, Microsoft Edge, Firefox o cualquier navegador moderno.

---

## 🚀 Guía de Instalación Paso a Paso en Windows

### Paso 1: Iniciar el Servicio MySQL en XAMPP
1. Abra el panel de control de **XAMPP** (`xampp-control.exe`).
2. Haga clic en **Start** junto al módulo de **MySQL**.
3. Asegúrese de que el indicador se muestre en color verde (puerto por defecto `3306`).

---

### Paso 2: Crear la Base de Datos e Importar los Datos Originales
Abra una terminal de PowerShell o CMD en la raíz del proyecto y ejecute:

```powershell
# 1. Crear la base de datos vetcare
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS vetcare CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 2. Importar el esquema y los 20 registros iniciales por tabla
& "C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 vetcare < vetcare.sql
```

*(Opcional: Si utiliza **phpMyAdmin**, ingrese a `http://localhost/phpmyadmin`, cree la base de datos `vetcare` y use la pestaña "Importar" seleccionando el archivo `vetcare.sql`).*

---

### Paso 3: Aplicar las Migraciones del Sistema
Ejecute el script de migración que crea la tabla `usuarios`, la tabla de persistencia `sessions` y agrega la columna `estado` a las citas sin alterar las tablas previas:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 vetcare < database/01_migraciones_vetcare.sql
```

---

### Paso 4: Instalar las Dependencias del Proyecto
Desde la raíz del proyecto, ejecute:

```powershell
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Regresar a la raíz
cd ..
```

---

### Paso 5: Configurar las Variables de Entorno del Backend
En la carpeta `backend/` existe un archivo `.env` configurado automáticamente. Si desea personalizarlo o crear uno nuevo, copie `.env.example`:

```powershell
cd backend
copy .env.example .env
```

Contenido del archivo `backend/.env`:
```env
PORT=4000
NODE_ENV=development

# Conexión a MySQL (XAMPP por defecto utiliza usuario root sin contraseña)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=vetcare

# Seguridad de Sesión
SESSION_SECRET=vetcare_ultra_secure_session_key_academic_2026_xyz!
CLIENT_URL=http://localhost:5173

# Credenciales del Administrador Inicial
DEFAULT_ADMIN_NAME="Administrador VetCare"
DEFAULT_ADMIN_EMAIL="admin@vetcare.com"
DEFAULT_ADMIN_PASSWORD="Admin123!"
```

---

### Paso 6: Verificar la Conexión y Crear el Administrador Inicial
Ejecute los scripts de diagnóstico y sembrado desde la carpeta `backend/`:

```powershell
cd backend
# 1. Verificar conectividad y tablas de MySQL
npm run check:db

# 2. Asegurar que el usuario Administrador existe con hash bcrypt
npm run seed:admin
```

---

### Paso 7: Iniciar el Sistema (Backend y Frontend)

#### Opción A: Modo Desarrollo (Recomendado para la demostración escolar)
Abra **dos terminales**:

**Terminal 1 (Backend - Servidor API en puerto 4000):**
```powershell
cd backend
npm run dev
```

**Terminal 2 (Frontend - Aplicación React en puerto 5173):**
```powershell
cd frontend
npm run dev
```

Abra su navegador en: **`http://localhost:5173`**

#### Opción B: Ejecución en Producción
```powershell
# En backend:
cd backend
npm run build
npm start

# En frontend (compilar activos estáticos):
cd frontend
npm run build
```

---

## 🔐 Credenciales de Acceso para la Demostración

La pantalla de inicio de sesión incluye botones de acceso rápido con un solo clic para alternar entre roles:

| Rol | Correo Electrónico | Contraseña | Permisos y Alcance |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@vetcare.com` | `Admin123!` | Acceso total a todos los módulos y gestión de usuarios. |
| **RECEPCION** | `recepcion@vetcare.com` | `Recepcion123!` | Gestión de citas, propietarios, pacientes y servicios. |
| **VETERINARIO** | `veterinario@vetcare.com` | `Vet123!` | Agenda médica, citas e historiales clínicos (Dr. Roberto). |

---

## 🧪 Ejecución de Pruebas Automatizadas

El backend incluye una suite completa de pruebas unitarias y de integración que verifica 11 puntos críticos:
- Conexión y PING a MySQL.
- Encriptación y comparación de hashes bcrypt.
- Autenticación y roles en la base de datos.
- Preservación del esquema original y conteo mínimo de 20 registros.
- Bloqueo por integridad referencial (Error 1451).
- Ciclo CRUD completo en tablas (Insert, Read, Update, Delete).
- Transacciones ACID para citas multi-servicio.
- Consultas relacionales con JOIN y agregación.

Para ejecutar las pruebas:
```powershell
cd backend
npm test
```

---

## 🗂️ Estructura del Proyecto

```text
VetCare/
├── backend/                    # Servidor REST con Express & TypeScript
│   ├── src/
│   │   ├── config/             # Configuración de base de datos MySQL y variables de entorno
│   │   ├── controllers/        # Controladores CRUD y analítica para cada tabla
│   │   ├── middlewares/        # Autenticación, control de roles, rate limiter, errores
│   │   ├── routes/             # Endpoints REST modulares
│   │   ├── scripts/            # Scripts de diagnóstico, migración y creación de admin
│   │   ├── tests/              # Suite de pruebas automatizadas
│   │   ├── types/              # Declaraciones e interfaces de TypeScript
│   │   ├── utils/              # Funciones de hashing bcrypt
│   │   └── app.ts              # Punto de entrada del servidor Express
│   ├── .env.example            # Ejemplo de variables de entorno
│   ├── package.json            # Dependencias del backend
│   └── tsconfig.json           # Configuración de compilador TypeScript
│
├── frontend/                   # Interfaz de Usuario con React, Vite y Tailwind
│   ├── src/
│   │   ├── api/                # Cliente HTTP fetch con credenciales de sesión
│   │   ├── components/         # Botones, Modales, Tablas, Notificaciones Toast, Sidebar
│   │   ├── context/            # Contextos globales de Autenticación y Alertas
│   │   ├── pages/              # 12 Vistas (Dashboard, Citas, Pacientes, Reportes, etc.)
│   │   ├── types/              # Tipos TypeScript del frontend
│   │   ├── utils/              # Formateadores de moneda mexicana ($ MXN) y fechas
│   │   ├── App.tsx             # Enrutador principal y protección de rutas
│   │   └── main.tsx            # Punto de entrada de React
│   ├── package.json            # Dependencias del frontend
│   ├── vite.config.ts          # Configuración del servidor Vite y proxy reverso
│   └── tailwind.config.js      # Configuración de Tailwind CSS con paleta VetCare
│
├── database/                   # Scripts y consultas SQL
│   ├── 00_esquema_original.sql # Esquema original con creación de base de datos
│   ├── 01_migraciones_vetcare.sql # Migración de usuarios, sesiones y estado
│   ├── 02_consultas_academicas.sql # 10 SELECT, 5 JOIN, agregaciones y 5 preguntas
│   └── 03_verificacion_integridad.sql # Comprobación de huérfanos y claves foráneas
│
├── docs/                       # Documentación académica
│   ├── DICCIONARIO_DE_DATOS.md # Diccionario de datos formal para la entrega
│   ├── CONSULTAS_SQL_PROYECTO.md # Enunciados y código SQL de cada consulta
│   └── GUIA_DEMOSTRACION_PROFESOR.md # Guión para la presentación de 5 a 10 minutos
│
├── vetcare.sql                 # Archivo SQL original provisto
├── package.json                # Scripts centralizados del proyecto
├── .gitignore                  # Exclusión de node_modules y variables locales
└── README.md                   # Esta guía
```

---

## 🛠️ Solución de Problemas Frecuentes

1. **Error de Conexión `ECONNREFUSED` / `Can't connect to MySQL server on 'localhost'`:**
   - Verifique que el servicio de **MySQL** esté iniciado en el panel de **XAMPP**.
   - Compruebe que el puerto configurado en `backend/.env` coincida con el puerto de MySQL (habitualmente `3306`).
2. **Error `Access denied for user 'root'@'localhost'`:**
   - En XAMPP, el usuario `root` no tiene contraseña por defecto (`DB_PASSWORD=`). Si usted configuró una contraseña en phpMyAdmin, colóquela en `backend/.env`.
3. **El puerto 4000 o 5173 ya está en uso:**
   - Puede modificar el puerto del backend cambiando `PORT=4001` en `backend/.env`.
4. **Problemas de CORS o Cookies no persistidas:**
   - Asegúrese de acceder al frontend siempre a través de `http://localhost:5173`. Las cookies de sesión están configuradas con `SameSite: 'lax'` y `httpOnly: true` para compatibilidad local.

---

## 👨‍🏫 Demostración Rápida ante el Profesor

Consulte el documento detallado en [docs/GUIA_DEMOSTRACION_PROFESOR.md](docs/GUIA_DEMOSTRACION_PROFESOR.md) para seguir el guión paso a paso:
1. **Login:** Iniciar sesión con diferentes roles (`ADMIN`, `RECEPCION`, `VETERINARIO`).
2. **Dashboard:** Mostrar estadísticas reales calculadas en MySQL y gráficos interactivos.
3. **Operaciones CRUD:** Insertar, buscar, modificar y eliminar un paciente o propietario.
4. **Integridad Referencial:** Intentar eliminar una especialidad con veterinarios asignados para demostrar la captura del Error 1451.
5. **Transacciones:** Agendar una cita con múltiples servicios y ver el cálculo de costo automático.
6. **Reportes:** Mostrar la resolución en vivo de las 5 preguntas de negocio y descargar el CSV.
