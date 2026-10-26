-- ============================================================================
-- VETCARE — MIGRACIONES Y EXTENSIONES DEL SISTEMA
-- Base de Datos: `vetcare`
-- ============================================================================
USE `vetcare`;

-- ----------------------------------------------------------------------------
-- 1. CREACIÓN DE LA TABLA DE USUARIOS PARA AUTENTICACIÓN Y ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('ADMIN', 'RECEPCION', 'VETERINARIO') NOT NULL DEFAULT 'RECEPCION',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `id_veterinario` INT(11) NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` DATETIME NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `idx_usuarios_correo` (`correo`),
  KEY `fk_usuarios_veterinarios` (`id_veterinario`),
  CONSTRAINT `fk_usuarios_veterinarios` FOREIGN KEY (`id_veterinario`) 
    REFERENCES `veterinarios` (`id_veterinario`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------
-- 2. USUARIOS POR DEFECTO PARA DEMOSTRACIÓN ACADÉMICA
-- Credenciales preconfiguradas:
-- ADMIN:       admin@vetcare.com       / Admin123!
-- RECEPCION:   recepcion@vetcare.com   / Recepcion123!
-- VETERINARIO: veterinario@vetcare.com / Vet123! (Vinculado a Dr. Roberto)
-- ----------------------------------------------------------------------------
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `password_hash`, `rol`, `activo`, `id_veterinario`) 
VALUES 
  (1, 'Administrador del Sistema', 'admin@vetcare.com', '$2a$10$UvD3h4o37M2nyGU0ONe3FeJRG5PwPXOx/hpWE.NEmQOGvSvpjFJaK', 'ADMIN', 1, NULL),
  (2, 'Recepcionista Central', 'recepcion@vetcare.com', '$2a$10$RBqfljhKW.CvfL8EouhxF.tYt.YunsiyYlPSodqm1A/u0ZQvc/neG', 'RECEPCION', 1, NULL),
  (3, 'Dr. Roberto Médico', 'veterinario@vetcare.com', '$2a$10$cdyu7MdS8RircIdjxnbU0OpjKzH9ak6LYZregPDJgUaVadhRBsi4y', 'VETERINARIO', 1, 1)
ON DUPLICATE KEY UPDATE 
  `nombre` = VALUES(`nombre`),
  `password_hash` = VALUES(`password_hash`),
  `rol` = VALUES(`rol`),
  `activo` = VALUES(`activo`);

-- ----------------------------------------------------------------------------
-- 3. EXTENSIÓN COMPATIBLE DE LA TABLA `citas` (COLUMNA `estado`)
-- Agrega columna 'estado' sin afectar la estructura previa ni datos existentes.
-- ----------------------------------------------------------------------------
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'citas' 
    AND COLUMN_NAME = 'estado'
);

SET @alter_sql = IF(
  @col_exists = 0,
  "ALTER TABLE `citas` ADD COLUMN `estado` ENUM('pendiente', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente' AFTER `motivo`;",
  "SELECT 'Columna estado ya existe';"
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar estados de ejemplo para dar realismo a las 20 citas existentes
UPDATE `citas` SET `estado` = 'completada' WHERE `id_cita` IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
UPDATE `citas` SET `estado` = 'cancelada' WHERE `id_cita` IN (13);
UPDATE `citas` SET `estado` = 'pendiente' WHERE `id_cita` NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13);

-- ----------------------------------------------------------------------------
-- 4. TABLA DE SESIONES EN MYSQL PARA EXPRESS-MYSQL-SESSION
-- Permite persistencia de sesiones seguras en la base de datos MySQL/MariaDB
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` INT(11) UNSIGNED NOT NULL,
  `data` MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
