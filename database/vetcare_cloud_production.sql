-- ==============================================================================
-- VetCare — Script de Producción para Google Cloud SQL (MySQL 8.0)
-- Base de Datos: `vetcare`
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `vetcare` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_general_ci;

USE `vetcare`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `historiales_clinicos`;
DROP TABLE IF EXISTS `citas_servicios`;
DROP TABLE IF EXISTS `citas`;
DROP TABLE IF EXISTS `servicios`;
DROP TABLE IF EXISTS `pacientes`;
DROP TABLE IF EXISTS `propietarios`;
DROP TABLE IF EXISTS `veterinarios`;
DROP TABLE IF EXISTS `especialidades`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. Tabla: `especialidades`
-- ------------------------------------------------------------------------------
CREATE TABLE `especialidades` (
  `id_especialidad` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_especialidad` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `especialidades` (`id_especialidad`, `nombre_especialidad`) VALUES
(1, 'Medicina General'),
(2, 'Cirugía'),
(3, 'Odontología'),
(4, 'Dermatología'),
(5, 'Cardiología'),
(6, 'Oftalmología'),
(7, 'Neurología'),
(8, 'Traumatología'),
(9, 'Oncología'),
(10, 'Nutrición'),
(11, 'Exóticos'),
(12, 'Fisioterapia'),
(13, 'Comportamiento'),
(14, 'Acupuntura'),
(15, 'Imagenología'),
(16, 'Gastroenterología'),
(17, 'Endocrinología'),
(18, 'Urología'),
(19, 'Neonatología'),
(20, 'Geriatría');

-- ------------------------------------------------------------------------------
-- 2. Tabla: `veterinarios`
-- ------------------------------------------------------------------------------
CREATE TABLE `veterinarios` (
  `id_veterinario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(15) DEFAULT NULL,
  `id_especialidad` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_veterinario`),
  KEY `id_especialidad` (`id_especialidad`),
  CONSTRAINT `veterinarios_ibfk_1` FOREIGN KEY (`id_especialidad`) 
    REFERENCES `especialidades` (`id_especialidad`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `veterinarios` (`id_veterinario`, `nombre`, `telefono`, `id_especialidad`) VALUES
(1, 'Dra. Ana López', '555-1001', 1),
(2, 'Dr. Carlos Mendoza', '555-1002', 2),
(3, 'Dra. Beatriz Ruiz', '555-1003', 3),
(4, 'Dr. Daniel Silva', '555-1004', 4),
(5, 'Dra. Elena Cruz', '555-1005', 5),
(6, 'Dr. Fernando Ortiz', '555-1006', 6),
(7, 'Dra. Gabriela Ramos', '555-1007', 7),
(8, 'Dr. Hugo Castillo', '555-1008', 8),
(9, 'Dra. Isabel Romero', '555-1009', 9),
(10, 'Dr. Javier Morales', '555-1010', 10),
(11, 'Dra. Karla Herrera', '555-1011', 11),
(12, 'Dr. Luis Delgado', '555-1012', 12),
(13, 'Dra. Mariana Peña', '555-1013', 13),
(14, 'Dr. Nicolás Vargas', '555-1014', 14),
(15, 'Dra. Olivia Méndez', '555-1015', 15),
(16, 'Dr. Pablo Guzmán', '555-1016', 16),
(17, 'Dra. Raquel Flores', '555-1017', 17),
(18, 'Dr. Sergio Rojas', '555-1018', 18),
(19, 'Dra. Teresa Soto', '555-1019', 19),
(20, 'Dr. Víctor Cano', '555-1020', 20);

-- ------------------------------------------------------------------------------
-- 3. Tabla: `propietarios`
-- ------------------------------------------------------------------------------
CREATE TABLE `propietarios` (
  `id_propietario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(15) NOT NULL,
  `correo` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id_propietario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `propietarios` (`id_propietario`, `nombre`, `telefono`, `correo`) VALUES
(1, 'Alberto Fernández', '555-2001', 'alberto@example.com'),
(2, 'Blanca Sánchez', '555-2002', 'blanca@example.com'),
(3, 'César Medina', '555-2003', 'cesar@example.com'),
(4, 'Diana Cortés', '555-2004', 'diana@example.com'),
(5, 'Eduardo Navarro', '555-2005', 'eduardo@example.com'),
(6, 'Fabiola Guerrero', '555-2006', 'fabiola@example.com'),
(7, 'Gonzalo Paredes', '555-2007', 'gonzalo@example.com'),
(8, 'Hilda Estrada', '555-2008', 'hilda@example.com'),
(9, 'Iván Campos', '555-2009', 'ivan@example.com'),
(10, 'Julia Benítez', '555-2010', 'julia@example.com'),
(11, 'Kevin Bravo', '555-2011', 'kevin@example.com'),
(12, 'Lorena Fuentes', '555-2012', 'lorena@example.com'),
(13, 'Mario Aguirre', '555-2013', 'mario@example.com'),
(14, 'Nora Cárdenas', '555-2014', 'nora@example.com'),
(15, 'Óscar Lara', '555-2015', 'oscar@example.com'),
(16, 'Patricia Espinoza', '555-2016', 'patricia@example.com'),
(17, 'Quintín Valdez', '555-2017', 'quintin@example.com'),
(18, 'Rocío Solís', '555-2018', 'rocio@example.com'),
(19, 'Salvador Moya', '555-2019', 'salvador@example.com'),
(20, 'Tania Rivas', '555-2020', 'tania@example.com');

-- ------------------------------------------------------------------------------
-- 4. Tabla: `pacientes`
-- ------------------------------------------------------------------------------
CREATE TABLE `pacientes` (
  `id_paciente` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `especie` VARCHAR(50) NOT NULL,
  `raza` VARCHAR(50) DEFAULT NULL,
  `id_propietario` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_paciente`),
  KEY `id_propietario` (`id_propietario`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_propietario`) 
    REFERENCES `propietarios` (`id_propietario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `pacientes` (`id_paciente`, `nombre`, `especie`, `raza`, `id_propietario`) VALUES
(1, 'Max', 'Perro', 'Labrador', 1),
(2, 'Luna', 'Gato', 'Siamés', 2),
(3, 'Rocky', 'Perro', 'Bulldog', 3),
(4, 'Bella', 'Perro', 'Poodle', 4),
(5, 'Milo', 'Gato', 'Persa', 5),
(6, 'Coco', 'Ave', 'Loro', 6),
(7, 'Toby', 'Perro', 'Beagle', 7),
(8, 'Simba', 'Gato', 'Bengala', 8),
(9, 'Lola', 'Perro', 'Chihuahua', 9),
(10, 'Thor', 'Perro', 'Pastor Alemán', 10),
(11, 'Kira', 'Gato', 'Maine Coon', 11),
(12, 'Zeus', 'Perro', 'Rottweiler', 12),
(13, 'Nala', 'Gato', 'Ragdoll', 13),
(14, 'Bruno', 'Perro', 'Boxer', 14),
(15, 'Mia', 'Gato', 'Sphynx', 15),
(16, 'Pancho', 'Reptil', 'Iguana', 16),
(17, 'Pelusa', 'Conejo', 'Cabeza de León', 17),
(18, 'Boby', 'Perro', 'Dálmata', 18),
(19, 'Sasha', 'Perro', 'Husky', 19),
(20, 'Lucas', 'Gato', 'Común Europeo', 20);

-- ------------------------------------------------------------------------------
-- 5. Tabla: `servicios`
-- ------------------------------------------------------------------------------
CREATE TABLE `servicios` (
  `id_servicio` INT(11) NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(100) NOT NULL,
  `costo` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `servicios` (`id_servicio`, `descripcion`, `costo`) VALUES
(1, 'Consulta General', 250.00),
(2, 'Vacunación', 180.00),
(3, 'Desparasitación', 120.00),
(4, 'Esterilización Hembra', 850.00),
(5, 'Castración Macho', 650.00),
(6, 'Limpieza Dental', 400.00),
(7, 'Radiografía', 350.00),
(8, 'Ecografía', 450.00),
(9, 'Análisis de Sangre', 220.00),
(10, 'Cirugía Menor', 950.00),
(11, 'Corte de Pelo y Baño', 150.00),
(12, 'Corte de Uñas', 50.00),
(13, 'Microchip', 200.00),
(14, 'Urgencia Nocturna', 500.00),
(15, 'Hospitalización por día', 300.00),
(16, 'Certificado de Salud', 100.00),
(17, 'Biopsia', 600.00),
(18, 'Quimioterapia sesión', 750.00),
(19, 'Terapia Láser', 280.00),
(20, 'Fisioterapia sesión', 250.00);

-- ------------------------------------------------------------------------------
-- 6. Tabla: `citas` (con columna `estado`)
-- ------------------------------------------------------------------------------
CREATE TABLE `citas` (
  `id_cita` INT(11) NOT NULL AUTO_INCREMENT,
  `fecha_hora` DATETIME NOT NULL,
  `motivo` VARCHAR(255) NOT NULL,
  `estado` ENUM('pendiente','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  `id_paciente` INT(11) DEFAULT NULL,
  `id_veterinario` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_cita`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_veterinario` (`id_veterinario`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) 
    REFERENCES `pacientes` (`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_veterinario`) 
    REFERENCES `veterinarios` (`id_veterinario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `citas` (`id_cita`, `fecha_hora`, `motivo`, `estado`, `id_paciente`, `id_veterinario`) VALUES
(1, '2026-10-10 10:15:00', 'Revisión general', 'completada', 1, 1),
(2, '2026-10-10 11:30:00', 'Vacuna anual', 'completada', 2, 1),
(3, '2026-10-10 12:45:00', 'Problema dental', 'completada', 3, 3),
(4, '2026-10-11 09:00:00', 'Alergia piel', 'completada', 4, 4),
(5, '2026-10-11 10:15:00', 'Chequeo corazón', 'completada', 5, 5),
(6, '2026-10-12 11:30:00', 'Infección ojo', 'completada', 6, 6),
(7, '2026-10-12 13:45:00', 'Convulsiones', 'completada', 7, 7),
(8, '2026-10-13 14:00:00', 'Cojea pata', 'completada', 8, 8),
(9, '2026-10-13 16:15:00', 'Chequeo tumor', 'completada', 9, 9),
(10, '2026-10-14 09:30:00', 'Dieta obesidad', 'completada', 10, 10),
(11, '2026-10-14 11:45:00', 'Revisión loro', 'pendiente', 11, 11),
(12, '2026-10-15 12:00:00', 'Terapia pata', 'pendiente', 12, 12),
(13, '2026-10-15 15:15:00', 'Agresividad', 'cancelada', 13, 13),
(14, '2026-10-16 10:30:00', 'Dolor crónico', 'pendiente', 14, 14),
(15, '2026-10-16 12:45:00', 'Ecografía gestación', 'pendiente', 15, 15),
(16, '2026-10-17 11:00:00', 'Vómitos', 'pendiente', 16, 16),
(17, '2026-10-17 14:15:00', 'Diabetes', 'pendiente', 17, 17),
(18, '2026-10-18 10:30:00', 'Cálculos', 'pendiente', 18, 18),
(19, '2026-10-18 12:45:00', 'Vacuna cachorro', 'pendiente', 19, 19),
(20, '2026-10-19 16:00:00', 'Chequeo anciano', 'pendiente', 20, 20);

-- ------------------------------------------------------------------------------
-- 7. Tabla: `citas_servicios`
-- ------------------------------------------------------------------------------
CREATE TABLE `citas_servicios` (
  `id_detalle` INT(11) NOT NULL AUTO_INCREMENT,
  `id_cita` INT(11) DEFAULT NULL,
  `id_servicio` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_cita` (`id_cita`),
  KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `citas_servicios_ibfk_1` FOREIGN KEY (`id_cita`) 
    REFERENCES `citas` (`id_cita`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `citas_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) 
    REFERENCES `servicios` (`id_servicio`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `citas_servicios` (`id_detalle`, `id_cita`, `id_servicio`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 6),
(4, 4, 1),
(5, 4, 11),
(6, 5, 14),
(7, 6, 14),
(8, 7, 9),
(9, 8, 7),
(10, 9, 17),
(11, 10, 1),
(12, 11, 14),
(13, 12, 20),
(14, 13, 14),
(15, 14, 14),
(16, 15, 8),
(17, 16, 1),
(18, 17, 9),
(19, 18, 8),
(20, 19, 16);

-- ------------------------------------------------------------------------------
-- 8. Tabla: `historiales_clinicos`
-- ------------------------------------------------------------------------------
CREATE TABLE `historiales_clinicos` (
  `id_historial` INT(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` INT(11) DEFAULT NULL,
  `fecha_registro` DATE NOT NULL,
  `diagnostico` TEXT NOT NULL,
  `tratamiento` TEXT NOT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `historiales_clinicos_ibfk_1` FOREIGN KEY (`id_paciente`) 
    REFERENCES `pacientes` (`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=21;

INSERT INTO `historiales_clinicos` (`id_historial`, `id_paciente`, `fecha_registro`, `diagnostico`, `tratamiento`) VALUES
(1, 1, '2026-10-10', 'Sano, peso ideal', 'Mantener dieta actual'),
(2, 2, '2026-10-10', 'Vacunación al día', 'Ninguno'),
(3, 3, '2026-10-10', 'Gingivitis leve', 'Limpieza dental y enjuague'),
(4, 4, '2026-10-11', 'Dermatitis por pulgas', 'Antiparasitario y champú medicado'),
(5, 5, '2026-10-11', 'Soplo cardíaco grado 2', 'Enalapril diario'),
(6, 6, '2026-10-12', 'Conjuntivitis bacteriana', 'Colirio antibiótico 7 días'),
(7, 7, '2026-10-12', 'Epilepsia idiopática', 'Fenobarbital cada 12h'),
(8, 8, '2026-10-13', 'Esguince carpal', 'Antiinflamatorio y reposo'),
(9, 9, '2026-10-13', 'Nódulo mamario sospechoso', 'Biopsia programada'),
(10, 10, '2026-10-14', 'Sobrepeso (+3kg)', 'Pienso light y paseo extra'),
(11, 11, '2026-10-14', 'Picaje por estrés', 'Enriquecimiento ambiental'),
(12, 12, '2026-10-15', 'Displasia de cadera', 'Fisioterapia y condroprotectores'),
(13, 13, '2026-10-15', 'Marcaje territorial', 'Feromonas y pautas etológicas'),
(14, 14, '2026-10-16', 'Artrosis lumbar', 'Acupuntura semanal'),
(15, 15, '2026-10-16', 'Gestación confirmada 3 fetos', 'Dieta materna'),
(16, 16, '2026-10-17', 'Gastritis aguda', 'Dieta blanda y protector gástrico'),
(17, 17, '2026-10-17', 'Diabetes mellitus', 'Insulina diaria y control glucemia'),
(18, 18, '2026-10-18', 'Urolitiasis estruvita', 'Pienso urinario y abundante agua'),
(19, 19, '2026-10-18', 'Cachorro sano, primera dosis', 'Próxima vacuna en 21 días'),
(20, 20, '2026-10-19', 'Síndrome disfunción cognitiva', 'Suplemento antioxidante');

-- ------------------------------------------------------------------------------
-- 9. Tabla: `usuarios` (Autenticación y Roles del Sistema)
-- ------------------------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('ADMIN', 'RECEPCION', 'VETERINARIO') NOT NULL DEFAULT 'RECEPCION',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `id_veterinario` INT(11) DEFAULT NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `idx_usuarios_correo` (`correo`),
  KEY `fk_usuarios_veterinarios` (`id_veterinario`),
  CONSTRAINT `fk_usuarios_veterinarios` FOREIGN KEY (`id_veterinario`) 
    REFERENCES `veterinarios` (`id_veterinario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=4;

-- Usuarios de demostración (Hashes bcrypt con 10 rondas de sal):
-- ADMIN:       admin@vetcare.com       -> Admin123!
-- RECEPCION:   recepcion@vetcare.com   -> Recepcion123!
-- VETERINARIO: veterinario@vetcare.com -> Vet123!
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `password_hash`, `rol`, `activo`, `id_veterinario`) VALUES
(1, 'Administrador del Sistema', 'admin@vetcare.com', '$2a$10$UvD3h4o37M2nyGU0ONe3FeJRG5PwPXOx/hpWE.NEmQOGvSvpjFJaK', 'ADMIN', 1, NULL),
(2, 'Recepcionista Central', 'recepcion@vetcare.com', '$2a$10$RBqfljhKW.CvfL8EouhxF.tYt.YunsiyYlPSodqm1A/u0ZQvc/neG', 'RECEPCION', 1, NULL),
(3, 'Dr. Roberto Médico', 'veterinario@vetcare.com', '$2a$10$cdyu7MdS8RircIdjxnbU0OpjKzH9ak6LYZregPDJgUaVadhRBsi4y', 'VETERINARIO', 1, 1);

-- ------------------------------------------------------------------------------
-- 10. Tabla: `sessions` (Almacén de Sesiones express-mysql-session)
-- ------------------------------------------------------------------------------
CREATE TABLE `sessions` (
  `session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` INT(11) UNSIGNED NOT NULL,
  `data` MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

COMMIT;
