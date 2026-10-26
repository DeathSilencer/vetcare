-- ========================================================
-- VetCare — Esquema Original de Base de Datos
-- Base de datos: `vetcare`
-- ========================================================

CREATE DATABASE IF NOT EXISTS `vetcare` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `vetcare`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `citas`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `citas` (
  `id_cita` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_veterinario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `citas_servicios`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `citas_servicios` (
  `id_detalle` int(11) NOT NULL,
  `id_cita` int(11) DEFAULT NULL,
  `id_servicio` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `especialidades`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `especialidades` (
  `id_especialidad` int(11) NOT NULL,
  `nombre_especialidad` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `historiales_clinicos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historiales_clinicos` (
  `id_historial` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `fecha_registro` date NOT NULL,
  `diagnostico` text NOT NULL,
  `tratamiento` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `pacientes`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `especie` varchar(50) NOT NULL,
  `raza` varchar(50) DEFAULT NULL,
  `id_propietario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `propietarios`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `propietarios` (
  `id_propietario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `correo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `servicios`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `servicios` (
  `id_servicio` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `costo` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `veterinarios`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `veterinarios` (
  `id_veterinario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `id_especialidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Índices y claves primarias
ALTER TABLE `citas`
  ADD PRIMARY KEY IF NOT EXISTS (`id_cita`),
  ADD KEY IF NOT EXISTS `id_paciente` (`id_paciente`),
  ADD KEY IF NOT EXISTS `id_veterinario` (`id_veterinario`);

ALTER TABLE `citas_servicios`
  ADD PRIMARY KEY IF NOT EXISTS (`id_detalle`),
  ADD KEY IF NOT EXISTS `id_cita` (`id_cita`),
  ADD KEY IF NOT EXISTS `id_servicio` (`id_servicio`);

ALTER TABLE `especialidades`
  ADD PRIMARY KEY IF NOT EXISTS (`id_especialidad`);

ALTER TABLE `historiales_clinicos`
  ADD PRIMARY KEY IF NOT EXISTS (`id_historial`),
  ADD KEY IF NOT EXISTS `id_paciente` (`id_paciente`);

ALTER TABLE `pacientes`
  ADD PRIMARY KEY IF NOT EXISTS (`id_paciente`),
  ADD KEY IF NOT EXISTS `id_propietario` (`id_propietario`);

ALTER TABLE `propietarios`
  ADD PRIMARY KEY IF NOT EXISTS (`id_propietario`);

ALTER TABLE `servicios`
  ADD PRIMARY KEY IF NOT EXISTS (`id_servicio`);

ALTER TABLE `veterinarios`
  ADD PRIMARY KEY IF NOT EXISTS (`id_veterinario`),
  ADD KEY IF NOT EXISTS `id_especialidad` (`id_especialidad`);

-- Auto Increment
ALTER TABLE `citas` MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `citas_servicios` MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `especialidades` MODIFY `id_especialidad` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `historiales_clinicos` MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `pacientes` MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `propietarios` MODIFY `id_propietario` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `servicios` MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `veterinarios` MODIFY `id_veterinario` int(11) NOT NULL AUTO_INCREMENT;

-- Claves Foráneas
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`),
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_veterinario`) REFERENCES `veterinarios` (`id_veterinario`);

ALTER TABLE `citas_servicios`
  ADD CONSTRAINT `citas_servicios_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`),
  ADD CONSTRAINT `citas_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`);

ALTER TABLE `historiales_clinicos`
  ADD CONSTRAINT `historiales_clinicos_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`);

ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id_propietario`);

ALTER TABLE `veterinarios`
  ADD CONSTRAINT `veterinarios_ibfk_1` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`);

COMMIT;
