-- ============================================================================
-- PROYECTO INTEGRADOR DE BASES DE DATOS — VETCARE
-- Entrega 2: Implementación y Consultas SQL Requeridas
-- Base de Datos: `vetcare`
-- ============================================================================
USE `vetcare`;

-- ============================================================================
-- SECCIÓN 1: CONSULTAS SELECT (Al menos 10 consultas con condiciones y ordenamiento)
-- ============================================================================

-- Consulta 1: Listado de todos los propietarios ordenados alfabéticamente por nombre
SELECT id_propietario, nombre, telefono, correo 
FROM propietarios 
ORDER BY nombre ASC;

-- Consulta 2: Pacientes que pertenecen a la especie 'Perro'
SELECT id_paciente, nombre, especie, raza, id_propietario 
FROM pacientes 
WHERE especie = 'Perro' 
ORDER BY nombre ASC;

-- Consulta 3: Pacientes que pertenecen a la especie 'Gato'
SELECT id_paciente, nombre, especie, raza, id_propietario 
FROM pacientes 
WHERE especie = 'Gato' 
ORDER BY nombre ASC;

-- Consulta 4: Veterinarios que cuentan con número de teléfono registrado
SELECT id_veterinario, nombre, telefono, id_especialidad 
FROM veterinarios 
WHERE telefono IS NOT NULL AND telefono <> '' 
ORDER BY nombre ASC;

-- Consulta 5: Servicios veterinarios con costo superior a $400.00 MXN, ordenados de mayor a menor costo
SELECT id_servicio, descripcion, costo 
FROM servicios 
WHERE costo > 400.00 
ORDER BY costo DESC;

-- Consulta 6: Citas programadas para la segunda quincena de octubre 2026
SELECT id_cita, fecha_hora, motivo, id_paciente, id_veterinario 
FROM citas 
WHERE fecha_hora >= '2026-10-15 00:00:00' 
ORDER BY fecha_hora ASC;

-- Consulta 7: Historiales clínicos registrados a partir del 14 de octubre de 2026
SELECT id_historial, id_paciente, fecha_registro, diagnostico, tratamiento 
FROM historiales_clinicos 
WHERE fecha_registro >= '2026-10-14' 
ORDER BY fecha_registro DESC;

-- Consulta 8: Servicios veterinarios económicos con costo menor o igual a $300.00 MXN
SELECT id_servicio, descripcion, costo 
FROM servicios 
WHERE costo <= 300.00 
ORDER BY costo ASC;

-- Consulta 9: Búsqueda de diagnósticos clínicos que involucren vacunas, infecciones o problemas dentales
SELECT id_historial, id_paciente, fecha_registro, diagnostico, tratamiento 
FROM historiales_clinicos 
WHERE diagnostico LIKE '%vacuna%' 
   OR diagnostico LIKE '%gingivitis%' 
   OR diagnostico LIKE '%infección%' 
   OR diagnostico LIKE '%dermatitis%'
ORDER BY fecha_registro DESC;

-- Consulta 10: Especialidades veterinarias ordenadas alfabéticamente
SELECT id_especialidad, nombre_especialidad 
FROM especialidades 
ORDER BY nombre_especialidad ASC;


-- ============================================================================
-- SECCIÓN 2: CONSULTAS CON JOIN (Al menos 5 consultas multi-tabla)
-- ============================================================================

-- Consulta JOIN 1: Pacientes con los datos completos de su propietario
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

-- Consulta JOIN 2: Veterinarios con el nombre de su especialidad médica
SELECT 
    v.id_veterinario,
    v.nombre AS nombre_veterinario,
    v.telefono,
    e.id_especialidad,
    e.nombre_especialidad
FROM veterinarios v
INNER JOIN especialidades e ON v.id_especialidad = e.id_especialidad
ORDER BY e.nombre_especialidad ASC, v.nombre ASC;

-- Consulta JOIN 3: Citas detalladas con información de paciente, propietario y veterinario
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

-- Consulta JOIN 4: Detalle de servicios aplicados por cita con sus costos asociados
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

-- Consulta JOIN 5: Historial clínico con datos del paciente y su propietario
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

-- Consulta JOIN 6 (Extra): Citas con el total económico acumulado por los servicios contratados
SELECT 
    c.id_cita,
    c.fecha_hora,
    c.motivo,
    p.nombre AS paciente,
    v.nombre AS veterinario,
    COUNT(cs.id_servicio) AS total_servicios_asociados,
    COALESCE(SUM(s.costo), 0.00) AS costo_total_cita
FROM citas c
INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
INNER JOIN veterinarios v ON c.id_veterinario = v.id_veterinario
LEFT JOIN citas_servicios cs ON c.id_cita = cs.id_cita
LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio
GROUP BY c.id_cita, c.fecha_hora, c.motivo, p.nombre, v.nombre
ORDER BY c.fecha_hora ASC;


-- ============================================================================
-- SECCIÓN 3: FUNCIONES DE AGREGACIÓN (COUNT, SUM, AVG, MAX, MIN)
-- ============================================================================

-- Consulta AGG 1: Métricas estadísticas de los precios de los servicios de la clínica
SELECT 
    COUNT(*) AS total_servicios_ofrecidos,
    SUM(costo) AS suma_total_catalogo,
    ROUND(AVG(costo), 2) AS costo_promedio_servicio,
    MIN(costo) AS costo_minimo,
    MAX(costo) AS costo_maximo
FROM servicios;

-- Consulta AGG 2: Recuento de registros clave en el sistema
SELECT 
    (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
    (SELECT COUNT(*) FROM propietarios) AS total_propietarios,
    (SELECT COUNT(*) FROM veterinarios) AS total_veterinarios,
    (SELECT COUNT(*) FROM citas) AS total_citas,
    (SELECT COUNT(*) FROM historiales_clinicos) AS total_historiales;


-- ============================================================================
-- SECCIÓN 4: GROUP BY Y HAVING
-- ============================================================================

-- Consulta GROUP BY 1: Cantidad de pacientes distribuidos por especie
SELECT 
    especie, 
    COUNT(*) AS total_pacientes 
FROM pacientes 
GROUP BY especie 
ORDER BY total_pacientes DESC;

-- Consulta GROUP BY y HAVING 2: Especialidades que tienen 1 o más veterinarios asignados
SELECT 
    e.nombre_especialidad,
    COUNT(v.id_veterinario) AS total_veterinarios
FROM especialidades e
LEFT JOIN veterinarios v ON e.id_especialidad = v.id_especialidad
GROUP BY e.id_especialidad, e.nombre_especialidad
HAVING COUNT(v.id_veterinario) >= 1
ORDER BY total_veterinarios DESC, e.nombre_especialidad ASC;

-- Consulta GROUP BY y HAVING 3: Citas cuyo costo total en servicios supere los $300.00 MXN
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

-- Consulta GROUP BY 4: Servicios más solicitados en las citas
SELECT 
    s.id_servicio,
    s.descripcion AS servicio,
    s.costo,
    COUNT(cs.id_detalle) AS veces_solicitado,
    SUM(s.costo) AS ingresos_generados
FROM servicios s
LEFT JOIN citas_servicios cs ON s.id_servicio = cs.id_servicio
GROUP BY s.id_servicio, s.descripcion, s.costo
ORDER BY veces_solicitado DESC, ingresos_generados DESC;


-- ============================================================================
-- SECCIÓN 5: OPERACIONES UPDATE Y DELETE CON INTEGRIDAD REFERENCIAL
-- ============================================================================

-- Demostración de UPDATE 1: Actualizar teléfono y correo de un propietario
UPDATE propietarios 
SET telefono = '5511223344', correo = 'carlos.mendoza.actualizado@gmail.com' 
WHERE id_propietario = 1;

-- Demostración de UPDATE 2: Actualizar costo de un servicio
UPDATE servicios 
SET costo = 320.00 
WHERE id_servicio = 1;

-- Demostración de Integridad Referencial al ELIMINAR:
-- Caso A: Intentar eliminar una especialidad que tiene veterinarios asignados (Falla por FK `veterinarios_ibfk_1`)
-- DELETE FROM especialidades WHERE id_especialidad = 1; -- ERROR 1451: Cannot delete or update a parent row

-- Caso B: Eliminación válida y limpia respetando la cascada/orden referencial:
-- Para eliminar una cita de prueba sin romper integridad, se eliminan primero sus servicios asociados:
-- DELETE FROM citas_servicios WHERE id_cita = 20;
-- DELETE FROM citas WHERE id_cita = 20;


-- ============================================================================
-- SECCIÓN 6: 5 PREGUNTAS DE NEGOCIO RESPONDIDAS MEDIANTE SQL
-- ============================================================================

-- PREGUNTA 1: ¿Cuáles son las especies más atendidas en la clínica y qué porcentaje representan?
-- Respuesta de negocio: Permite al administrador abastecer medicamentos e insumos quirúrgicos orientados a caninos y felinos.
SELECT 
    especie,
    COUNT(*) AS cantidad,
    ROUND((COUNT(*) / (SELECT COUNT(*) FROM pacientes)) * 100, 2) AS porcentaje
FROM pacientes
GROUP BY especie
ORDER BY cantidad DESC;

-- PREGUNTA 2: ¿Cuáles son los 5 servicios con mayor demanda y cuánto ingreso total han generado?
-- Respuesta de negocio: Identifica los servicios estrella para promociones o contratación de personal especializado.
SELECT 
    s.descripcion AS servicio,
    COUNT(cs.id_detalle) AS total_solicitudes,
    ROUND(s.costo, 2) AS costo_unitario,
    ROUND(SUM(s.costo), 2) AS ingreso_acumulado
FROM servicios s
INNER JOIN citas_servicios cs ON s.id_servicio = cs.id_servicio
GROUP BY s.id_servicio, s.descripcion, s.costo
ORDER BY total_solicitudes DESC, ingreso_acumulado DESC
LIMIT 5;

-- PREGUNTA 3: ¿Qué veterinarios tienen mayor carga de citas agendadas y qué especialidad atienden?
-- Respuesta de negocio: Facilita la distribución equitativa de turnos y guardias en la clínica.
SELECT 
    v.id_veterinario,
    v.nombre AS veterinario,
    e.nombre_especialidad AS especialidad,
    COUNT(c.id_cita) AS citas_asignadas
FROM veterinarios v
INNER JOIN especialidades e ON v.id_especialidad = e.id_especialidad
LEFT JOIN citas c ON v.id_veterinario = c.id_veterinario
GROUP BY v.id_veterinario, v.nombre, e.nombre_especialidad
ORDER BY citas_asignadas DESC, v.nombre ASC;

-- PREGUNTA 4: ¿Cuáles son los pacientes con mayor número de intervenciones en su historial clínico?
-- Respuesta de negocio: Detecta pacientes crónicos para seguimiento preventivo y programas de salud animal.
SELECT 
    p.id_paciente,
    p.nombre AS paciente,
    p.especie,
    p.raza,
    pr.nombre AS propietario,
    pr.telefono AS telefono_urgencias,
    COUNT(h.id_historial) AS total_consultas_clinicas
FROM pacientes p
INNER JOIN propietarios pr ON p.id_propietario = pr.id_propietario
LEFT JOIN historiales_clinicos h ON p.id_paciente = h.id_paciente
GROUP BY p.id_paciente, p.nombre, p.especie, p.raza, pr.nombre, pr.telefono
ORDER BY total_consultas_clinicas DESC;

-- PREGUNTA 5: ¿Cuál es el gasto promedio por cita y la cita de mayor valor económico facturada?
-- Respuesta de negocio: Brinda métricas financieras para estimar el ticket promedio de la veterinaria.
SELECT 
    ROUND(AVG(sub.costo_cita), 2) AS ticket_promedio_por_cita,
    MAX(sub.costo_cita) AS cita_mas_costosa,
    MIN(sub.costo_cita) AS cita_menos_costosa
FROM (
    SELECT c.id_cita, COALESCE(SUM(s.costo), 0.00) AS costo_cita
    FROM citas c
    INNER JOIN citas_servicios cs ON c.id_cita = cs.id_cita
    INNER JOIN servicios s ON cs.id_servicio = s.id_servicio
    GROUP BY c.id_cita
) sub;
