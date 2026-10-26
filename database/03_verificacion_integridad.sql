-- ============================================================================
-- SCRIPT DE VERIFICACIÓN DE INTEGRIDAD REFERENCIAL Y DATOS — VETCARE
-- ============================================================================
USE `vetcare`;

-- 1. Verificación de conteo de registros por tabla
SELECT 'propietarios' AS tabla, COUNT(*) AS total_registros FROM propietarios
UNION ALL
SELECT 'pacientes', COUNT(*) FROM pacientes
UNION ALL
SELECT 'especialidades', COUNT(*) FROM especialidades
UNION ALL
SELECT 'veterinarios', COUNT(*) FROM veterinarios
UNION ALL
SELECT 'servicios', COUNT(*) FROM servicios
UNION ALL
SELECT 'citas', COUNT(*) FROM citas
UNION ALL
SELECT 'citas_servicios', COUNT(*) FROM citas_servicios
UNION ALL
SELECT 'historiales_clinicos', COUNT(*) FROM historiales_clinicos;

-- 2. Verificación de huérfanos en pacientes (deben ser 0)
SELECT COUNT(*) AS pacientes_huerfanos 
FROM pacientes p 
LEFT JOIN propietarios pr ON p.id_propietario = pr.id_propietario 
WHERE p.id_propietario IS NOT NULL AND pr.id_propietario IS NULL;

-- 3. Verificación de huérfanos en veterinarios (deben ser 0)
SELECT COUNT(*) AS veterinarios_sin_especialidad_valida 
FROM veterinarios v 
LEFT JOIN especialidades e ON v.id_especialidad = e.id_especialidad 
WHERE v.id_especialidad IS NOT NULL AND e.id_especialidad IS NULL;

-- 4. Verificación de huérfanos en citas (deben ser 0)
SELECT COUNT(*) AS citas_con_referencias_invalidas 
FROM citas c 
LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente 
LEFT JOIN veterinarios v ON c.id_veterinario = v.id_veterinario 
WHERE (c.id_paciente IS NOT NULL AND p.id_paciente IS NULL)
   OR (c.id_veterinario IS NOT NULL AND v.id_veterinario IS NULL);

-- 5. Verificación de citas_servicios (deben ser 0 huérfanos)
SELECT COUNT(*) AS detalles_servicio_invalidos 
FROM citas_servicios cs 
LEFT JOIN citas c ON cs.id_cita = c.id_cita 
LEFT JOIN servicios s ON cs.id_servicio = s.id_servicio 
WHERE (cs.id_cita IS NOT NULL AND c.id_cita IS NULL)
   OR (cs.id_servicio IS NOT NULL AND s.id_servicio IS NULL);

-- 6. Verificación de historiales clínicos (deben ser 0 huérfanos)
SELECT COUNT(*) AS historiales_huerfanos 
FROM historiales_clinicos h 
LEFT JOIN pacientes p ON h.id_paciente = p.id_paciente 
WHERE h.id_paciente IS NOT NULL AND p.id_paciente IS NULL;
