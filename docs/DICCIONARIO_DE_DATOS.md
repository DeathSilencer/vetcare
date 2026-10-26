# 📖 DICCIONARIO DE DATOS — VETCARE
## Sistema Integral de Gestión Veterinaria
**Base de Datos:** `vetcare`  
**Motor:** InnoDB (MySQL / MariaDB)  
**Codificación:** UTF-8 Unicode (`utf8mb4_general_ci`)

---

### 1. Tabla: `propietarios`
Almacena la información de contacto de los clientes y dueños responsables de las mascotas atendidas en la clínica.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_propietario` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único del propietario. |
| `nombre` | `VARCHAR` | 100 | No | No | `NOT NULL` | Nombre completo del propietario. |
| `telefono` | `VARCHAR` | 15 | No | No | `NOT NULL` | Teléfono de contacto directo. |
| `correo` | `VARCHAR` | 100 | No | No | `NULL` | Correo electrónico del cliente. |

---

### 2. Tabla: `pacientes`
Contiene los datos de identificación, especie y raza de cada animal atendido en la veterinaria.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_paciente` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único del paciente. |
| `nombre` | `VARCHAR` | 50 | No | No | `NOT NULL` | Nombre de la mascota. |
| `especie` | `VARCHAR` | 50 | No | No | `NOT NULL` | Especie animal (Perro, Gato, Ave, etc.). |
| `raza` | `VARCHAR` | 50 | No | No | `NULL` | Raza de la mascota. |
| `id_propietario` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `propietarios(id_propietario)` | Clave foránea al propietario del paciente. |

---

### 3. Tabla: `especialidades`
Catálogo de ramas de especialidad médica veterinaria ofrecidas por la clínica.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_especialidad` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador de la especialidad médica. |
| `nombre_especialidad` | `VARCHAR` | 50 | No | No | `NOT NULL` | Nombre de la especialidad (Cirugía, etc.). |

---

### 4. Tabla: `veterinarios`
Personal médico adscrito a la veterinaria con su especialidad correspondiente.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_veterinario` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único del médico veterinario. |
| `nombre` | `VARCHAR` | 100 | No | No | `NOT NULL` | Nombre completo del veterinario. |
| `telefono` | `VARCHAR` | 15 | No | No | `NULL` | Teléfono de contacto profesional. |
| `id_especialidad` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `especialidades(id_especialidad)` | Especialidad médica del veterinario. |

---

### 5. Tabla: `servicios`
Catálogo oficial de procedimientos clínicos, quirúrgicos y consultas con sus precios en moneda nacional ($ MXN).

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_servicio` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único del servicio. |
| `descripcion` | `VARCHAR` | 100 | No | No | `NOT NULL` | Nombre o descripción del procedimiento. |
| `costo` | `DECIMAL` | 10, 2 | No | No | `NOT NULL`, `>= 0.00` | Costo unitario en pesos mexicanos. |

---

### 6. Tabla: `citas`
Agenda médica de citas entre un paciente y un veterinario en fecha y horario determinados.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_cita` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único de la cita. |
| `fecha_hora` | `DATETIME` | — | No | No | `NOT NULL` | Fecha y hora exacta programada. |
| `motivo` | `VARCHAR` | 255 | No | No | `NOT NULL` | Razón de la consulta veterinaria. |
| `estado` | `ENUM` | — | No | No | `NOT NULL`, `'pendiente'` (Migración) | Estado: pendiente, completada, cancelada. |
| `id_paciente` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `pacientes(id_paciente)` | Paciente citado a consulta. |
| `id_veterinario` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `veterinarios(id_veterinario)` | Veterinario responsable de la atención. |

---

### 7. Tabla: `citas_servicios`
Tabla intermedia que resuelve la relación muchos a muchos ($N:M$) entre citas y los múltiples servicios médicos aplicados en cada una.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_detalle` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador del detalle del servicio. |
| `id_cita` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `citas(id_cita)` | Cita a la que pertenece el servicio. |
| `id_servicio` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `servicios(id_servicio)` | Servicio médico aplicado. |

---

### 8. Tabla: `historiales_clinicos`
Registro cronológico de diagnósticos y tratamientos prescritos a cada mascota.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_historial` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único del registro clínico. |
| `id_paciente` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `pacientes(id_paciente)` | Mascota a la que pertenece el historial. |
| `fecha_registro` | `DATE` | — | No | No | `NOT NULL` | Fecha de la valoración médica. |
| `diagnostico` | `TEXT` | — | No | No | `NOT NULL` | Diagnóstico clínico y síntomas observados. |
| `tratamiento` | `TEXT` | — | No | No | `NOT NULL` | Terapia, recetas y recomendaciones. |

---

### 9. Tabla Adicional: `usuarios` (Migración de Autenticación y Seguridad)
Almacena credenciales encriptadas mediante bcrypt y roles para control de acceso RBAC.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `id_usuario` | `INT` | 11 | **SÍ** | No | `AUTO_INCREMENT`, `NOT NULL` | Identificador único del usuario. |
| `nombre` | `VARCHAR` | 100 | No | No | `NOT NULL` | Nombre completo del usuario. |
| `correo` | `VARCHAR` | 100 | No | No | `NOT NULL`, `UNIQUE` | Correo electrónico de acceso. |
| `password_hash` | `VARCHAR` | 255 | No | No | `NOT NULL` | Hash seguro de contraseña (bcrypt). |
| `rol` | `ENUM` | — | No | No | `NOT NULL`, Default `'RECEPCION'` | Roles: `ADMIN`, `RECEPCION`, `VETERINARIO`. |
| `activo` | `TINYINT` | 1 | No | No | `NOT NULL`, Default `1` | Estado de la cuenta (1: activo, 0: inactivo). |
| `id_veterinario` | `INT` | 11 | No | **SÍ** | `NULL`, Ref: `veterinarios(id_veterinario)` | Vínculo opcional a un médico veterinario. |
| `fecha_creacion` | `TIMESTAMP`| — | No | No | `DEFAULT CURRENT_TIMESTAMP` | Fecha de alta de la cuenta. |
| `ultimo_login` | `DATETIME` | — | No | No | `NULL` | Fecha y hora de última sesión activa. |

---

### 10. Tabla: `sessions` (Persistencia de Sesiones en MySQL)
Almacena sesiones del servidor gestionadas por `express-mysql-session`.

| Campo | Tipo | Longitud | PK | FK | Restricción / Nulo | Descripción |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `session_id` | `VARCHAR` | 128 | **SÍ** | No | `NOT NULL` | Identificador de cookie de sesión. |
| `expires` | `INT` | 11 Unsigned| No | No | `NOT NULL` | Timestamp UNIX de expiración. |
| `data` | `MEDIUMTEXT` | — | No | No | `NULL` | Contenido serializado de la sesión. |
