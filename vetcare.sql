-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-10-2026 a las 20:34:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vetcare`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id_cita` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_veterinario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id_cita`, `fecha_hora`, `motivo`, `id_paciente`, `id_veterinario`) VALUES
(1, '2026-10-10 10:15:00', 'Revisión general', 1, 1),
(2, '2026-10-10 11:30:00', 'Vacuna anual', 2, 1),
(3, '2026-10-10 12:45:00', 'Problema dental', 3, 3),
(4, '2026-10-11 09:00:00', 'Alergia piel', 4, 4),
(5, '2026-10-11 10:15:00', 'Chequeo corazón', 5, 5),
(6, '2026-10-12 11:30:00', 'Infección ojo', 6, 6),
(7, '2026-10-12 13:45:00', 'Convulsiones', 7, 7),
(8, '2026-10-13 14:00:00', 'Cojea pata', 8, 8),
(9, '2026-10-13 16:15:00', 'Chequeo tumor', 9, 9),
(10, '2026-10-14 09:30:00', 'Dieta obesidad', 10, 10),
(11, '2026-10-14 11:45:00', 'Revisión loro', 11, 11),
(12, '2026-10-15 12:00:00', 'Terapia pata', 12, 12),
(13, '2026-10-15 15:15:00', 'Agresividad', 13, 13),
(14, '2026-10-16 10:30:00', 'Dolor crónico', 14, 14),
(15, '2026-10-16 12:45:00', 'Ecografía gestación', 15, 15),
(16, '2026-10-17 11:00:00', 'Vómitos', 16, 16),
(17, '2026-10-17 14:15:00', 'Diabetes', 17, 17),
(18, '2026-10-18 10:30:00', 'Cálculos', 18, 18),
(19, '2026-10-18 12:45:00', 'Vacuna cachorro', 19, 19),
(20, '2026-10-19 16:00:00', 'Chequeo anciano', 20, 20);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas_servicios`
--

CREATE TABLE `citas_servicios` (
  `id_detalle` int(11) NOT NULL,
  `id_cita` int(11) DEFAULT NULL,
  `id_servicio` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas_servicios`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id_especialidad` int(11) NOT NULL,
  `nombre_especialidad` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especialidades`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historiales_clinicos`
--

CREATE TABLE `historiales_clinicos` (
  `id_historial` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `fecha_registro` date NOT NULL,
  `diagnostico` text NOT NULL,
  `tratamiento` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historiales_clinicos`
--

INSERT INTO `historiales_clinicos` (`id_historial`, `id_paciente`, `fecha_registro`, `diagnostico`, `tratamiento`) VALUES
(1, 1, '2026-10-10', 'Sano', 'Ninguno'),
(2, 2, '2026-10-10', 'Requiere refuerzo rabia', 'Vacuna aplicada'),
(3, 3, '2026-10-10', 'Gingivitis severa', 'Limpieza bajo anestesia'),
(4, 4, '2026-10-11', 'Dermatitis atópica', 'Champú medicado'),
(5, 5, '2026-10-11', 'Soplo grado 2', 'Enalapril diario'),
(6, 6, '2026-10-12', 'Conjuntivitis', 'Gotas antibióticas'),
(7, 7, '2026-10-12', 'Epilepsia idiopática', 'Fenobarbital'),
(8, 8, '2026-10-13', 'Esguince', 'Reposo y meloxicam'),
(9, 9, '2026-10-13', 'Lipoma', 'Vigilancia'),
(10, 10, '2026-10-14', 'Sobrepeso 20%', 'Dieta restrictiva'),
(11, 11, '2026-10-14', 'Deficiencia vitamina', 'Gotas de vitaminas'),
(12, 12, '2026-10-15', 'Displasia cadera', 'Fisioterapia'),
(13, 13, '2026-10-15', 'Ansiedad separación', 'Entrenamiento'),
(14, 14, '2026-10-16', 'Artrosis', 'Acupuntura'),
(15, 15, '2026-10-16', 'Gestación 4 semanas', 'Vitaminas prenatales'),
(16, 16, '2026-10-17', 'Gastritis', 'Protector gástrico'),
(17, 17, '2026-10-17', 'Diabetes Mellitus', 'Insulina diaria'),
(18, 18, '2026-10-18', 'Urolitiasis', 'Dieta urinaria'),
(19, 19, '2026-10-18', 'Cachorro sano', 'Desparasitación'),
(20, 20, '2026-10-19', 'Sano para edad', 'Chequeo anual');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `especie` varchar(50) NOT NULL,
  `raza` varchar(50) DEFAULT NULL,
  `id_propietario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id_paciente`, `nombre`, `especie`, `raza`, `id_propietario`) VALUES
(1, 'Max', 'Perro', 'Labrador', 1),
(2, 'Luna', 'Gato', 'Siamés', 2),
(3, 'Rocky', 'Perro', 'Bulldog', 3),
(4, 'Coco', 'Perro', 'Pug', 4),
(5, 'Bella', 'Gato', 'Persa', 5),
(6, 'Toby', 'Perro', 'Beagle', 6),
(7, 'Lola', 'Perro', 'Chihuahua', 7),
(8, 'Simba', 'Gato', 'Mestizo', 8),
(9, 'Bimba', 'Perro', 'Poodle', 9),
(10, 'Milo', 'Perro', 'Boxer', 10),
(11, 'Nina', 'Gato', 'Angora', 11),
(12, 'Zeus', 'Perro', 'Doberman', 12),
(13, 'Kiwi', 'Ave', 'Loro', 13),
(14, 'Nala', 'Gato', 'Bengala', 14),
(15, 'Bruno', 'Perro', 'Husky', 15),
(16, 'Mia', 'Perro', 'Yorkshire', 16),
(17, 'Thor', 'Perro', 'Pastor Alemán', 17),
(18, 'Pipo', 'Roedor', 'Hámster', 18),
(19, 'Leo', 'Gato', 'Esfinge', 19),
(20, 'Rex', 'Perro', 'Gran Danés', 20);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `propietarios`
--

CREATE TABLE `propietarios` (
  `id_propietario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `correo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `propietarios`
--

INSERT INTO `propietarios` (`id_propietario`, `nombre`, `telefono`, `correo`) VALUES
(1, 'Carlos Mendoza', '5543128976', 'carlos.mendoza@gmail.com'),
(2, 'Ana Silva', '5519843201', 'ana.silva@gmail.com'),
(3, 'Luis Torres', '5587412369', 'luis.torres@gmail.com'),
(4, 'Maria Gomez', '5561234987', 'maria.gomez@gmail.com'),
(5, 'Jorge Ruiz', '5532145698', 'jorge.ruiz@gmail.com'),
(6, 'Laura Rojas', '5578963214', 'laura.rojas@gmail.com'),
(7, 'Pedro Diaz', '5598741230', 'pedro.diaz@gmail.com'),
(8, 'Sofia Castro', '5523698741', 'sofia.castro@gmail.com'),
(9, 'Hugo Reyes', '5514785236', 'hugo.reyes@gmail.com'),
(10, 'Elena Vargas', '5569874123', 'elena.vargas@gmail.com'),
(11, 'Martin Ortiz', '5621458796', 'martin.ortiz@gmail.com'),
(12, 'Lucia Flores', '5632147859', 'lucia.flores@gmail.com'),
(13, 'Raul Morales', '5687412536', 'raul.morales@gmail.com'),
(14, 'Diana Luna', '5612398745', 'diana.luna@gmail.com'),
(15, 'Mario Soto', '5698745213', 'mario.soto@gmail.com'),
(16, 'Carmen Vega', '5647851236', 'carmen.vega@gmail.com'),
(17, 'Pablo Rios', '5678912345', 'pablo.rios@gmail.com'),
(18, 'Rosa Mota', '5654123987', 'rosa.mota@gmail.com'),
(19, 'Ivan Muro', '5614789632', 'ivan.muro@gmail.com'),
(20, 'Sara Paz', '5687419632', 'sara.paz@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id_servicio` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `costo` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id_servicio`, `descripcion`, `costo`) VALUES
(1, 'Consulta General', 300.00),
(2, 'Vacuna Rabia', 150.00),
(3, 'Desparasitación Interna', 100.00),
(4, 'Esterilización Gato', 800.00),
(5, 'Esterilización Perro', 1200.00),
(6, 'Limpieza Dental', 600.00),
(7, 'Rayos X', 450.00),
(8, 'Ecografía', 550.00),
(9, 'Examen de Sangre', 400.00),
(10, 'Corte de Uñas', 80.00),
(11, 'Baño medicado', 250.00),
(12, 'Cirugía de tejidos blandos', 2500.00),
(13, 'Microchip', 350.00),
(14, 'Consulta Especialidad', 500.00),
(15, 'Hospedaje Día', 200.00),
(16, 'Vacuna Múltiple', 250.00),
(17, 'Tratamiento Quimioterapia', 1500.00),
(18, 'Sutura Herida', 350.00),
(19, 'Prueba Parvovirus', 300.00),
(20, 'Fisioterapia Sesión', 400.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinarios`
--

CREATE TABLE `veterinarios` (
  `id_veterinario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `id_especialidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `veterinarios`
--

INSERT INTO `veterinarios` (`id_veterinario`, `nombre`, `telefono`, `id_especialidad`) VALUES
(1, 'Dr. Roberto', '5551239874', 1),
(2, 'Dra. Alicia', '5559871236', 2),
(3, 'Dr. Hector', '5554789632', 3),
(4, 'Dra. Paola', '5553698741', 4),
(5, 'Dr. Julio', '5552147896', 5),
(6, 'Dra. Monica', '5558741236', 6),
(7, 'Dr. Oscar', '5559632147', 7),
(8, 'Dra. Blanca', '5551478523', 8),
(9, 'Dr. Andres', '5557896541', 9),
(10, 'Dra. Tania', '5553214569', 10),
(11, 'Dr. Simon', '5556541239', 11),
(12, 'Dra. Ines', '5559874125', 12),
(13, 'Dr. Victor', '5552369874', 13),
(14, 'Dra. Rita', '5558521479', 14),
(15, 'Dr. Omar', '5557412589', 15),
(16, 'Dra. Ruth', '5559638521', 16),
(17, 'Dr. Rene', '5551593574', 17),
(18, 'Dra. Flor', '5557539512', 18),
(19, 'Dr. Saul', '5554561238', 19),
(20, 'Dra. Luz', '5558963214', 20);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_veterinario` (`id_veterinario`);

--
-- Indices de la tabla `citas_servicios`
--
ALTER TABLE `citas_servicios`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_cita` (`id_cita`),
  ADD KEY `id_servicio` (`id_servicio`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id_especialidad`);

--
-- Indices de la tabla `historiales_clinicos`
--
ALTER TABLE `historiales_clinicos`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_paciente` (`id_paciente`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`),
  ADD KEY `id_propietario` (`id_propietario`);

--
-- Indices de la tabla `propietarios`
--
ALTER TABLE `propietarios`
  ADD PRIMARY KEY (`id_propietario`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id_servicio`);

--
-- Indices de la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD PRIMARY KEY (`id_veterinario`),
  ADD KEY `id_especialidad` (`id_especialidad`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `citas_servicios`
--
ALTER TABLE `citas_servicios`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id_especialidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `historiales_clinicos`
--
ALTER TABLE `historiales_clinicos`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `propietarios`
--
ALTER TABLE `propietarios`
  MODIFY `id_propietario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  MODIFY `id_veterinario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`),
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_veterinario`) REFERENCES `veterinarios` (`id_veterinario`);

--
-- Filtros para la tabla `citas_servicios`
--
ALTER TABLE `citas_servicios`
  ADD CONSTRAINT `citas_servicios_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`),
  ADD CONSTRAINT `citas_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`);

--
-- Filtros para la tabla `historiales_clinicos`
--
ALTER TABLE `historiales_clinicos`
  ADD CONSTRAINT `historiales_clinicos_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`);

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id_propietario`);

--
-- Filtros para la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD CONSTRAINT `veterinarios_ibfk_1` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
