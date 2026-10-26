# 📊 CONSULTAS SQL DEL PROYECTO — VETCARE
## Documentación Académica para la Entrega 2
**Base de Datos:** `vetcare`  
**Archivo fuente ejecutable:** `database/02_consultas_academicas.sql`

---

## 1. Consultas SELECT con Condiciones y Ordenamiento (10 Consultas)

### Consulta 1: Directorio de propietarios ordenados alfabéticamente
```sql
SELECT id_propietario, nombre, telefono, correo 
FROM propietarios 
ORDER BY nombre ASC;
```

### Consulta 2: Pacientes caninos registrados
```sql
SELECT id_paciente, nombre, especie, raza, id_propietario 
FROM pacientes 
WHERE especie = 'Perro' 
ORDER BY nombre ASC;
```

### Consulta 3: Pacientes felinos registrados
```sql
SELECT id_paciente, nombre, especie, raza, id_propietario 
FROM pacientes 
WHERE especie = 'Gato' 
ORDER BY nombre ASC;
```

### Consulta 4: Veterinarios que tienen teléfono de contacto
```sql
SELECT id_veterinario, nombre, telefono, id_especialidad 
FROM veterinarios 
WHERE telefono IS NOT NULL AND telefono <> '' 
ORDER BY nombre ASC;
```

### Consulta 5: Procedimientos veterinarios de alta gama (costo > $400.00 MXN)
```sql
SELECT id_servicio, descripcion, costo 
FROM servicios 
WHERE costo > 400.00 
ORDER BY costo DESC;
```

### Consulta 6: Citas agendadas para la segunda quincena de octubre 2026
```sql
SELECT id_cita, fecha_hora, motivo, id_paciente, id_veterinario 
FROM citas 
WHERE fecha_hora >= '2026-10-15 00:00:00' 
ORDER BY fecha_hora ASC;
```

### Consulta 7: Notas clínicas registradas a partir del 14 de octubre de 2026
```sql
SELECT id_historial, id_paciente, fecha_registro, diagnostico, tratamiento 
FROM historiales_clinicos 
WHERE fecha_registro >= '2026-10-14' 
ORDER BY fecha_registro DESC;
```

### Consulta 8: Servicios veterinarios preventivos y económicos (costo <= $300.00 MXN)
```sql
SELECT id_servicio, descripcion, costo 
FROM servicios 
WHERE costo <= 300.00 
ORDER BY costo ASC;
```

### Consulta 9: Búsqueda de diagnósticos clínicos por sintomatología o tratamiento
```sql
SELECT id_historial, id_paciente, fecha_registro, diagnostico, tratamiento 
FROM historiales_clinicos 
WHERE diagnostico LIKE '%vacuna%' 
   OR diagnostico LIKE '%gingivitis%' 
   OR diagnostico LIKE '%infección%' 
   OR diagnostico LIKE '%dermatitis%'
ORDER BY fecha_registro DESC;
```

### Consulta 10: Especialidades médicas veterinarias en orden alfabético
```sql
SELECT id_especialidad, nombre_especialidad 
FROM especialidades 
ORDER BY nombre_especialidad ASC;
```

---

## 2. Consultas con JOIN Multi-Tabla (Al menos 5 Consultas)

### Consulta JOIN 1: Pacientes vinculados con los datos de su propietario
```sql
SELECT 
    p.id_paciente,
    p.nombre AS nombre_paciente,
    p.especie,
    p.raza,
    pr.id_propietario,
    pr.nombre AS nombre_propietario,
    pr.telefono AS telefono_propietario,
    pr.correo AS correo_propietario
FROM pacientes p
INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
ORDER BY pr.nombre ASC, p.nombre ASC;
```

### Consulta JOIN 2: Médicos veterinarios con su especialidad médica
```sql
SELECT 
    v.id_veterinario,
    v.nombre AS nombre_veterinario,
    v.telefono,
    e.id_especialidad,
    e.nombre_especialidad
FROM veterinarios v
INNER JOIN especialidades e ON v.id_especialidad = e.id_especialidad
ORDER BY e.nombre_especialidad ASC, v.nombre ASC;
```

### Consulta JOIN 3: Agenda de citas con paciente, dueño y veterinario
```sql
SELECT 
    c.id_cita,
    c.fecha_hora,
    c.motivo,
    p.nombre AS paciente,
    p.especie,
    pr.nombre AS propietario,
    pr.telefono AS telefono_contacto,
    v.nombre AS veterinario
FROM citas c
INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
ORDER BY c.fecha_hora ASC;
```

### Consulta JOIN 4: Detalle de servicios y costos aplicados en cada cita
```sql
SELECT 
    cs.id_detalle,
    c.id_cita,
    c.fecha_hora,
    p.nombre AS paciente,
    s.id_servicio,
    s.descripcion AS servicio,
    s.costo
FROM citas_servicios cs
INNER JOIN citas c ON cs.id_cita = c.id_cita
INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
INNER JOIN servicios s ON cs.id_servicio = s.id_servicio
ORDER BY c.fecha_hora ASC;
```

### Consulta JOIN 5: Historial clínico con datos del paciente y teléfono del dueño
```sql
SELECT 
    h.id_historial,
    h.fecha_registro,
    p.nombre AS paciente,
    p.especie,
    p.raza,
    pr.nombre AS propietario,
    pr.telefono AS telefono_propietario,
    h.diagnostico,
    h.tratamiento
FROM historiales_clinicos h
INNER JOIN pacientes p ON h.id_paciente = p.id_paciente
INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
ORDER BY h.fecha_registro DESC;
```

---

## 3. Funciones de Agregación (COUNT, SUM, AVG, MAX, MIN)

```sql
SELECT 
    COUNT(*) AS total_servicios_ofrecidos,
    SUM(costo) AS suma_total_catalogo,
    ROUND(AVG(costo), 2) AS costo_promedio_servicio,
    MIN(costo) AS costo_minimo,
    MAX(costo) AS costo_maximo
FROM servicios;
```

---

## 4. Agrupamiento con GROUP BY y Filtro HAVING

### Consulta GROUP BY: Pacientes agrupados por especie
```sql
SELECT especie, COUNT(*) AS total_pacientes 
FROM pacientes 
GROUP BY especie 
ORDER BY total_pacientes DESC;
```

### Consulta GROUP BY y HAVING: Citas cuyo costo en servicios supera $300.00 MXN
```sql
SELECT 
    c.id_cita,
    p.nombre AS paciente,
    c.fecha_hora,
    COUNT(cs.id_servicio) AS total_servicios,
    SUM(s.costo) AS costo_total
FROM citas c
INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
INNER JOIN citas_servicios cs ON c.id_cita = cs.id_cita
INNER JOIN servicios s ON cs.id_servicio = s.id_servicio
GROUP BY c.id_cita, p.nombre, c.fecha_hora
HAVING SUM(s.costo) > 300.00
ORDER BY costo_total DESC;
```

---

## 5. Operaciones UPDATE y DELETE Respetando Integridad Referencial

### Modificación (UPDATE):
```sql
UPDATE propietarios 
SET telefono = '5511223344', correo = 'carlos.mendoza.actualizado@gmail.com' 
WHERE id_propietario = 1;
```

### Demostración de Bloqueo por Clave Foránea (Integridad Referencial):
```sql
-- Al intentar eliminar una especialidad con veterinarios adscritos:
DELETE FROM especialidades WHERE id_especialidad = 1;
-- Retorna ERROR 1451 (ER_ROW_IS_REFERENCED_2): Cannot delete or update a parent row
```

---

## 6. 5 Preguntas de Negocio Respondidas Mediante SQL (Requisito 8.10)

1. **¿Cuáles son las especies más atendidas en la clínica y qué porcentaje representan?**
   ```sql
   SELECT especie, COUNT(*) AS cantidad, ROUND((COUNT(*) / (SELECT COUNT(*) FROM pacientes)) * 100, 2) AS porcentaje
   FROM pacientes GROUP BY especie ORDER BY cantidad DESC;
   ```
2. **¿Cuáles son los 5 servicios con mayor demanda y cuánto ingreso total han generado?**
   ```sql
   SELECT s.descripcion AS servicio, COUNT(cs.id_detalle) AS total_solicitudes, s.costo, SUM(s.costo) AS ingreso_acumulado
   FROM servicios s INNER JOIN citas_servicios cs ON s.id_servicio = cs.id_servicio
   GROUP BY s.id_servicio, s.descripcion, s.costo ORDER BY total_solicitudes DESC LIMIT 5;
   ```
3. **¿Qué veterinarios tienen mayor carga de citas agendadas y qué especialidad atienden?**
   ```sql
   SELECT v.nombre AS veterinario, e.nombre_especialidad AS especialidad, COUNT(c.id_cita) AS citas_asignadas
   FROM veterinarios v INNER JOIN especialidades e ON v.id_especialidad = e.id_especialidad
   LEFT JOIN citas c ON v.id_veterinario = c.id_veterinario
   GROUP BY v.id_veterinario, v.nombre, e.nombre_especialidad ORDER BY citas_asignadas DESC;
   ```
4. **¿Cuáles son los pacientes con mayor número de intervenciones en su historial clínico?**
   ```sql
   SELECT p.nombre AS paciente, p.especie, pr.nombre AS propietario, COUNT(h.id_historial) AS total_intervenciones
   FROM pacientes p INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
   LEFT JOIN historiales_clinicos h ON p.id_paciente = h.id_paciente
   GROUP BY p.id_paciente, p.nombre, p.especie, pr.nombre ORDER BY total_intervenciones DESC;
   ```
5. **¿Cuál es el ticket promedio facturado por cita y los rangos de costo?**
   ```sql
   SELECT ROUND(AVG(sub.costo_cita), 2) AS ticket_promedio, MAX(sub.costo_cita) AS cita_mas_costosa, MIN(sub.costo_cita) AS cita_menos_costosa
   FROM (
     SELECT c.id_cita, SUM(s.costo) AS costo_cita FROM citas c
     INNER JOIN citas_servicios cs ON c.id_cita = cs.id_cita INNER JOIN servicios s ON cs.id_servicio = s.id_servicio GROUP BY c.id_cita
   ) sub;
   ```
