# 🎯 GUÍA DE DEMOSTRACIÓN ANTE EL DOCENTE (5 a 10 Minutos)
## VetCare — Sistema Integral de Gestión Veterinaria

Esta guía está diseñada para que el equipo presente el proyecto con fluidez, demostrando el 100% de los criterios de la rúbrica y los requerimientos del Proyecto 2.

---

### Paso 1: Introducción y Arquitectura (1 Minuto)
1. **Presentar el propósito del sistema:**
   > *"Profesor, desarrollamos VetCare, un sistema integral full-stack para clínicas veterinarias. La aplicación está construida con React, TypeScript y Tailwind CSS en el frontend, conectada a una API REST en Node.js y Express, comunicándose con nuestra base de datos relacional MySQL/MariaDB `vetcare`."*
2. **Resaltar la base de datos:**
   > *"Respetamos intactas las 8 tablas de la base de datos original (`propietarios`, `pacientes`, `especialidades`, `veterinarios`, `citas`, `servicios`, `citas_servicios`, `historiales_clinicos`) y añadimos una migración compatible para la seguridad con la tabla `usuarios` (encriptada con bcrypt) y sesiones persistidas en MySQL."*

---

### Paso 2: Inicio de Sesión y Control de Roles (1.5 Minutos)
1. **Abrir la aplicación en el navegador:** `http://localhost:5173`
2. **Demostrar la pantalla de Login:**
   - Mostrar el botón de ver/ocultar contraseña.
   - Probar ingresar una contraseña errónea para que el profesor vea el mensaje de error controlado.
   - Utilizar el botón de acceso rápido de demostración:
     - **Admin:** `admin@vetcare.com` / `Admin123!`
3. **Explicar los 3 roles implementados:**
   - `ADMIN`: Acceso total, incluyendo el módulo exclusivo de administración de usuarios.
   - `RECEPCION`: Gestión de propietarios, pacientes y agenda de citas.
   - `VETERINARIO`: Consulta de pacientes, agenda médica e historial clínico.

---

### Paso 3: Dashboard en Tiempo Real (1.5 Minutos)
1. **Mostrar los KPIs en vivo:**
   - Explicar que los contadores (Pacientes, Propietarios, Citas, Veterinarios, Servicios) provienen de consultas reales `COUNT(*)` en MySQL, no de datos simulados.
2. **Mostrar las Gráficas interactivas:**
   - Gráfica de pastel: Distribución de pacientes por especie (Perros, Gatos, Aves, Roedores).
   - Gráfica de barras: Estado de citas (completadas, pendientes, canceladas).
3. **Próximas citas y notas clínicas recientes:**
   - Demostrar cómo se extraen en tiempo real mediante `JOIN` entre citas, pacientes, dueños y veterinarios.

---

### Paso 4: Demostración de las Operaciones CRUD (3 Minutos)
*(Requisito explícito del profesor en la captura: Consulta, Inserción, Modificación y Eliminación con confirmación).*

1. **CONSULTAR (Read):**
   - Ir al módulo **Propietarios** o **Pacientes**.
   - Usar el buscador en vivo (ej. escribir *"Carlos"* o *"Labrador"*).
   - Mostrar la paginación funcional.
2. **INSERTAR (Create):**
   - Clic en **"Nuevo Propietario"**.
   - Dejar un campo vacío para mostrar la validación en tiempo real (React Hook Form + Zod).
   - Llenar los datos:
     - Nombre: `Roberto González Prueba`
     - Teléfono: `5588776655`
     - Correo: `roberto.prueba@vetcare.com`
   - Guardar y mostrar la notificación Toast de éxito.
3. **MODIFICAR (Update):**
   - Clic en el botón de editar (icono lápiz) del registro recién creado.
   - Cambiar el teléfono a `5599001122`.
   - Guardar y verificar que el cambio se refleje al instante en la tabla.
4. **ELIMINAR con Confirmación (Delete):**
   - Clic en el botón eliminar (icono basurero).
   - **Destacar:** Mostrar el modal de confirmación obligatorio antes de borrar.
   - Confirmar y verificar la eliminación.
5. **DEMOSTRACIÓN DE INTEGRIDAD REFERENCIAL (Claves Foráneas):**
   - Ir a **Especialidades**.
   - Intentar eliminar la especialidad **"Medicina General"** (la cual tiene asignado al Dr. Roberto).
   - **Mostrar el resultado:** El backend y la base de datos bloquean la operación (Error 1451) y la interfaz muestra una alerta comprensible explicando que no se puede eliminar porque tiene veterinarios asociados.

---

### Paso 5: Transacciones ACID y Citas Multi-Servicio (1.5 Minutos)
1. **Ir a Citas:**
   - Clic en **"Agendar Cita"**.
   - Elegir paciente y veterinario.
   - Seleccionar **múltiples servicios** (ej. Consulta General + Vacuna Rabia).
   - **Explicar al profesor:**
     > *"Esta operación se ejecuta dentro de una transacción ACID (`START TRANSACTION ... COMMIT`), insertando la cita en la tabla `citas` y asociando los servicios en la tabla intermedia `citas_servicios`. Además, el sistema calcula automáticamente el costo total."*
2. **Detección de conflictos de horario:**
   - Intentar agendar otra cita para el mismo veterinario a la misma hora para mostrar la advertencia de conflicto de agenda.

---

### Paso 6: Sección de Reportes y Consultas de Negocio (1.5 Minutos)
1. **Ir a Reportes:**
   - Mostrar la pestaña **"Preguntas de Negocio"**:
     - Mostrar las 5 preguntas que el sistema resuelve mediante SQL (Requisito 8.10 de la rúbrica).
     - Abrir cualquiera para mostrar la respuesta devuelta en vivo por MySQL.
   - Pestaña **"Citas por Rango de Fechas"**:
     - Seleccionar un rango y mostrar la tabla detallada.
   - Demostrar la **Exportación a CSV**:
     - Clic en *"Exportar Citas (CSV)"*.
     - Abrir el archivo descargado para demostrar que los datos son reales y que las columnas están protegidas contra inyecciones de fórmulas.

---

### Cierre de la Demostración
> *"Con esto queda demostrado que la aplicación cumple con todos los requisitos del proyecto: arquitectura moderna, conexión segura a MySQL, respeto al esquema original, operaciones CRUD completas, validaciones, transacciones y reportes de negocio."*
