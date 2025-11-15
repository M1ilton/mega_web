-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-11-2025 a las 09:30:37
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
-- Base de datos: `mega_web`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividad_usuario`
--

CREATE TABLE `actividad_usuario` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo_actividad` enum('login','logout','pedido','reparacion','perfil_actualizado','contrasena_cambiada','favorito_agregado') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `fecha_actividad` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `actividad_usuario`
--

INSERT INTO `actividad_usuario` (`id`, `usuario_id`, `tipo_actividad`, `descripcion`, `ip_address`, `user_agent`, `fecha_actividad`) VALUES
(4, 5, 'reparacion', 'Reparación solicitada: REP-746992', NULL, NULL, '2025-11-14 12:29:29'),
(5, 5, 'reparacion', 'Reparación solicitada: REP-696412', NULL, NULL, '2025-11-14 12:30:40'),
(6, 5, 'reparacion', 'Reparación solicitada: REP-662925', NULL, NULL, '2025-11-14 15:47:35'),
(7, 4, 'reparacion', 'Reparación solicitada: REP-460960', NULL, NULL, '2025-11-14 23:28:55'),
(8, 9, 'pedido', 'Pedido realizado: PED-435673', NULL, NULL, '2025-11-15 06:01:47'),
(9, 4, 'reparacion', 'Reparación solicitada: REP-477075', NULL, NULL, '2025-11-15 06:49:18'),
(10, 4, 'pedido', 'Pedido realizado: PED-873453', NULL, NULL, '2025-11-15 07:07:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contacto_mensajes`
--

CREATE TABLE `contacto_mensajes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `asunto` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `estado` enum('nuevo','leido','respondido') DEFAULT 'nuevo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `contacto_mensajes`
--

INSERT INTO `contacto_mensajes` (`id`, `nombre`, `email`, `telefono`, `asunto`, `mensaje`, `estado`, `fecha_creacion`) VALUES
(1, 'Jose Imanol', 'jose@gmail.com', '3205504039', 'consulta', 'vygvhiunjkm', 'nuevo', '2025-11-15 07:08:28'),
(2, 'Jose Imanol', 'josechaverra9010@gmail.com', '3204405039', 'queja', 'epapepepcslcas', 'nuevo', '2025-11-15 07:09:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cupones`
--

CREATE TABLE `cupones` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `tipo_descuento` enum('porcentaje','fijo','envio_gratis') DEFAULT 'porcentaje',
  `valor_descuento` decimal(10,2) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_expiracion` date NOT NULL,
  `usos_maximos` int(11) DEFAULT 1,
  `usos_por_usuario` int(11) DEFAULT 1,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cupones`
--

INSERT INTO `cupones` (`id`, `codigo`, `descripcion`, `tipo_descuento`, `valor_descuento`, `fecha_inicio`, `fecha_expiracion`, `usos_maximos`, `usos_por_usuario`, `activo`, `created_at`) VALUES
(1, 'MEGA10', 'En toda la tienda', 'porcentaje', 10.00, '2025-01-01', '2025-03-31', 1000, 1, 1, '2025-11-14 05:24:17'),
(2, 'PRIMERA20', 'Primera reparación', 'porcentaje', 20.00, '2025-01-01', '2025-02-15', 500, 1, 1, '2025-11-14 05:24:17'),
(3, 'ENVIOGRATIS', 'Sin mínimo de compra', 'envio_gratis', 0.00, '2025-01-01', '2025-02-28', 2000, 3, 1, '2025-11-14 05:24:17'),
(4, 'FIDELIDAD50', 'Cliente frecuente', 'fijo', 50000.00, '2025-01-01', '2025-12-31', 100, 1, 1, '2025-11-14 05:24:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cupones_usados`
--

CREATE TABLE `cupones_usados` (
  `id` int(11) NOT NULL,
  `cupon_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `fecha_uso` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `garantias`
--

CREATE TABLE `garantias` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `reparacion_id` int(11) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `tipo_cobertura` varchar(200) NOT NULL,
  `detalles_cobertura` text DEFAULT NULL,
  `estado` enum('activa','vencida','reclamada','cancelada') DEFAULT 'activa',
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `garantias`
--

INSERT INTO `garantias` (`id`, `pedido_id`, `reparacion_id`, `fecha_inicio`, `fecha_vencimiento`, `tipo_cobertura`, `detalles_cobertura`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(4, NULL, 1, '2025-01-22', '2025-04-22', 'Mano de obra y repuestos y mas', 'Garantía de 90 días en cambio de pantalla', 'activa', NULL, '2025-11-14 12:39:54', '2025-11-15 06:08:36'),
(5, NULL, 2, '2025-01-15', '2025-04-15', 'Mano de obra y repuestos', 'Garantía de 90 días en cambio de batería', 'activa', NULL, '2025-11-14 12:39:54', '2025-11-14 12:39:54'),
(6, 5, NULL, '2025-11-15', '2026-02-13', 'Mano de obra y repuestos', 'ascscas', 'activa', 'ascsac', '2025-11-15 06:08:55', '2025-11-15 06:50:12'),
(7, NULL, NULL, '2025-11-15', '2026-02-12', 'Apple iPhone 13', NULL, 'activa', NULL, '2025-11-15 06:51:18', '2025-11-15 06:51:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `asunto` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `estado` enum('nuevo','leido','respondido','archivado') DEFAULT 'nuevo',
  `ip_address` varchar(45) DEFAULT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_respuesta` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','procesando','en_camino','entregado','cancelado') DEFAULT 'pendiente',
  `total` decimal(10,2) NOT NULL,
  `productos` int(11) DEFAULT 1,
  `direccion_envio` text DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `codigo`, `usuario_id`, `fecha_pedido`, `estado`, `total`, `productos`, `direccion_envio`, `metodo_pago`, `created_at`, `updated_at`) VALUES
(5, 'PED-435673', 9, '2025-11-15 06:01:47', 'pendiente', 20000.00, 1, 'ancnakjckla', 'efectivo', '2025-11-15 06:01:47', '2025-11-15 06:01:47'),
(10, 'PED-873453', 4, '2025-11-15 07:07:34', 'pendiente', 89000.00, 1, 'Cra 7 # 24, QUIBDÓ', 'transferencia', '2025-11-15 07:07:34', '2025-11-15 07:07:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` enum('accesorios','repuestos','equipos','servicios') DEFAULT 'accesorios',
  `stock` int(11) DEFAULT 0,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `categoria`, `stock`, `imagen_url`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Cargador Rápido USB-C 65W', 'Cargador de pared con tecnología de carga rápida', 35000.00, 'accesorios', 50, NULL, 1, '2025-11-14 05:24:17', '2025-11-14 05:24:17'),
(2, 'Auriculares Bluetooth Pro', 'Auriculares inalámbricos con cancelación de ruido', 89000.00, 'accesorios', 29, NULL, 1, '2025-11-14 05:24:17', '2025-11-15 07:07:34'),
(3, 'Power Bank 20000mAh', 'Batería portátil de alta capacidad', 75000.00, 'accesorios', 25, NULL, 1, '2025-11-14 05:24:17', '2025-11-14 05:24:17'),
(4, 'Funda Protectora Premium', 'Funda resistente a impactos para smartphone', 25000.00, 'accesorios', 120, '', 1, '2025-11-14 05:24:17', '2025-11-15 02:03:19'),
(5, 'Cable USB-C Trenzado 2m', 'Cable de carga y datos de alta durabilidad', 15000.00, 'accesorios', 90, '', 1, '2025-11-14 05:24:17', '2025-11-15 02:03:09'),
(6, 'Camiseta Básica Roja', 'Camiseta', 32000.00, 'accesorios', 41, '', 1, '2025-11-15 02:03:48', '2025-11-15 02:04:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reclamaciones_garantia`
--

CREATE TABLE `reclamaciones_garantia` (
  `id` int(11) NOT NULL,
  `garantia_id` int(11) NOT NULL,
  `fecha_reclamacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `motivo` text NOT NULL,
  `estado_reclamacion` enum('pendiente','en_revision','aprobada','rechazada','resuelta') DEFAULT 'pendiente',
  `resolucion` text DEFAULT NULL,
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reparaciones`
--

CREATE TABLE `reparaciones` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `equipo` varchar(200) NOT NULL,
  `servicio` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tiempo_estimado` varchar(50) DEFAULT NULL,
  `estado` enum('recibido','en_diagnostico','en_proceso','completado','entregado','cancelado') NOT NULL DEFAULT 'recibido',
  `diagnostico` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `nombre_cliente` varchar(200) NOT NULL,
  `telefono_cliente` varchar(20) NOT NULL,
  `email_cliente` varchar(100) NOT NULL,
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_entrega` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_estimada_entrega` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reparaciones`
--

INSERT INTO `reparaciones` (`id`, `codigo`, `usuario_id`, `equipo`, `servicio`, `descripcion`, `precio`, `tiempo_estimado`, `estado`, `diagnostico`, `observaciones`, `nombre_cliente`, `telefono_cliente`, `email_cliente`, `fecha_ingreso`, `fecha_entrega`, `created_at`, `updated_at`, `fecha_estimada_entrega`) VALUES
(1, 'REP-000001', NULL, 'Apple iPhone 13', 'Pantalla Rota', 'Reemplazo completo de display', 135000.00, '2-3 horas', 'completado', NULL, NULL, 'Juan Pérez', '3001234567', 'juan@example.com', '2024-11-01 10:30:00', NULL, '2025-11-14 12:29:10', '2025-11-14 12:29:10', '2025-11-14 10:50:04'),
(2, 'REP-000002', NULL, 'Samsung Galaxy S21', 'Batería Agotada', 'Cambio de batería original', 72000.00, '1 hora', 'en_proceso', NULL, NULL, 'María González', '3009876543', 'maria@example.com', '2024-11-14 14:15:00', NULL, '2025-11-14 12:29:10', '2025-11-14 12:29:10', '2025-11-14 10:50:04'),
(3, 'REP-000003', NULL, 'Xiaomi Redmi Note 10', 'Puerto de Carga', 'Reparación de puerto USB', 54000.00, '1-2 horas', 'recibido', NULL, NULL, 'Carlos López', '3005551234', 'carlos@example.com', '2024-11-14 16:45:00', NULL, '2025-11-14 12:29:10', '2025-11-14 12:29:10', '2025-11-14 10:50:04'),
(4, 'REP-746992', 5, 'Apple 13', 'Batería Agotada', 'Cambio de batería original', 72000.00, '1 hora', 'recibido', NULL, NULL, 'Jose Imanol Chaverra Bejarano', '3204405039', 'josechaverra90100@gmail.com', '2025-11-14 07:29:29', NULL, '2025-11-14 12:29:29', '2025-11-14 12:29:29', '2025-11-14 10:50:04'),
(5, 'REP-696412', 5, 'Motorola 14', 'Daño por Agua', 'Limpieza profunda y recuperación', 162000.00, '3-5 horas', 'recibido', NULL, NULL, 'Jose Imanol Chaverra Bejarano', '3204405039', 'josechaverra90100@gmail.com', '2025-11-14 07:30:40', NULL, '2025-11-14 12:30:40', '2025-11-14 12:30:40', '2025-11-14 10:50:04'),
(6, 'REP-662925', 5, 'Motorola w12', 'Botones', 'Reparación de botones', 40500.00, '1 hora', 'recibido', NULL, NULL, 'Jose Imanol Chaverra Bejarano', '3204405039', 'josechaverra90100@gmail.com', '2025-11-14 10:47:35', NULL, '2025-11-14 15:47:35', '2025-11-14 15:47:35', '2025-11-14 10:50:04'),
(7, 'REP-460960', 4, 'Samsung 15', 'Altavoz', 'Reemplazo completo de display', 45000.00, '1 hora', 'recibido', '', '', 'Jose Imanol Chaverra Bejarano', '3204405039', 'josechaverra9010@gmail.com', '2025-11-14 18:28:55', NULL, '2025-11-14 23:28:55', '2025-11-15 06:05:48', '2025-11-14 17:00:00'),
(8, 'REP-477075', 4, 'Apple 13', 'Daño por Agua', 'Limpieza profunda y recuperación', 162000.00, '3-5 horas', 'recibido', NULL, NULL, 'Jose Imanol Chaverra Bejarano', '3204405039', 'josechaverra9010@gmail.com', '2025-11-15 01:49:18', NULL, '2025-11-15 06:49:18', '2025-11-15 06:49:18', '2025-11-15 01:49:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas`
--

CREATE TABLE `resenas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `estrellas` tinyint(1) NOT NULL CHECK (`estrellas` >= 1 and `estrellas` <= 5),
  `servicio` varchar(200) NOT NULL,
  `comentario` text NOT NULL,
  `verificado` tinyint(1) DEFAULT 0,
  `aprobado` tinyint(1) DEFAULT 0,
  `respuesta` text DEFAULT NULL,
  `fecha_respuesta` timestamp NULL DEFAULT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `resenas`
--

INSERT INTO `resenas` (`id`, `usuario_id`, `nombre`, `email`, `estrellas`, `servicio`, `comentario`, `verificado`, `aprobado`, `respuesta`, `fecha_respuesta`, `fecha_publicacion`, `ip_address`, `fecha_creacion`) VALUES
(1, 1, 'María González', 'maria@example.com', 5, 'Cambio de pantalla - iPhone 13', 'Excelente servicio, muy rápido y profesional. Mi celular quedó como nuevo. El técnico fue muy amable y me explicó todo el proceso. Totalmente recomendado.', 1, 1, 'Gracias María por tu confianza. Nos alegra mucho que hayas quedado satisfecha con nuestro servicio. ¡Esperamos verte pronto!', NULL, '2025-01-18 05:00:00', NULL, '2025-11-14 10:27:35'),
(2, 5, 'Carlos Ramírez', 'carlos@example.com', 5, 'Compra: Auriculares Bluetooth', 'Los auriculares llegaron súper rápido y en perfectas condiciones. La calidad de sonido es increíble. El precio fue muy competitivo comparado con otras tiendas.', 1, 1, 'Gracias Carlos! Nos encanta saber que disfrutas de tu compra. Esperamos seguir cumpliendo tus expectativas.', NULL, '2025-01-15 05:00:00', NULL, '2025-11-14 10:27:35'),
(3, 2, 'Ana López', 'ana@example.com', 4, 'Cambio de batería - Samsung Galaxy S21', 'Buen servicio en general. La batería nueva funciona perfecto. Solo sugeriría mejorar los tiempos de espera en temporada alta.', 1, 1, 'Agradecemos tu feedback Ana. Estamos trabajando para optimizar nuestros tiempos de atención. ¡Gracias por elegirnos!', NULL, '2025-01-12 05:00:00', NULL, '2025-11-14 10:27:35'),
(4, NULL, 'Pedro Martínez', 'pedro@example.com', 5, 'Compra: Cargador rápido + Cable', 'Producto original y de calidad. La atención al cliente fue excelente, me asesoraron muy bien sobre qué cargador comprar para mi celular.', 1, 1, NULL, NULL, '2025-01-10 05:00:00', NULL, '2025-11-14 10:27:35'),
(5, 4, 'Laura Sánchez', 'laura@example.com', 5, 'Reparación por daño de agua - iPhone 12', 'Pensé que mi celular estaba perdido después de caer al agua, pero lograron recuperarlo! El servicio fue transparente y honesto. Mil gracias!', 1, 1, 'Laura, nos alegra enormemente haber podido salvar tu equipo. Gracias por confiar en nosotros en un momento tan crítico!', NULL, '2025-01-08 05:00:00', NULL, '2025-11-14 10:27:35'),
(6, 4, 'Roberto Torres', 'roberto@example.com', 4, 'Compra: Funda + Protector de pantalla', 'Buenos productos, bien empaquetados. La funda es resistente y el protector se instaló fácilmente. Precio justo.', 1, 1, NULL, NULL, '2025-01-05 05:00:00', NULL, '2025-11-14 10:27:35'),
(7, NULL, 'Diana Vargas', 'diana@example.com', 5, 'Cambio de puerto de carga - Xiaomi', 'Reparación rápida y efectiva. En menos de 2 horas mi celular estaba listo. El técnico fue muy profesional y el precio accesible.', 1, 1, 'Diana, tu satisfacción es nuestra prioridad. Gracias por tu preferencia!', NULL, '2025-01-03 05:00:00', NULL, '2025-11-14 10:27:35'),
(8, NULL, 'Miguel Ángel', 'miguel@example.com', 5, 'Compra: Power Bank 20000mAh', 'Excelente compra! El power bank carga super rápido y tiene muy buena capacidad. Perfecto para viajes largos.', 1, 1, NULL, NULL, '2024-12-28 05:00:00', NULL, '2025-11-14 10:27:35'),
(9, NULL, 'jose chaverra', '', 4, 'Cambio de puerto de carga', 'de los mejores servicios', 1, 1, 'eppa', '2025-11-15 06:31:25', '2025-11-14 15:41:23', NULL, '2025-11-14 10:41:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas_likes`
--

CREATE TABLE `resenas_likes` (
  `id` int(11) NOT NULL,
  `resena_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `resenas_likes`
--

INSERT INTO `resenas_likes` (`id`, `resena_id`, `ip_address`, `fecha_creacion`) VALUES
(1, 9, '::1', '2025-11-14 15:41:39'),
(3, 1, '::1', '2025-11-14 15:41:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas_utilidad`
--

CREATE TABLE `resenas_utilidad` (
  `id` int(11) NOT NULL,
  `resena_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `fecha_inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `activa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('admin','trabajador','cliente') DEFAULT 'cliente',
  `puntos_fidelidad` int(11) DEFAULT 0,
  `nivel_fidelidad` enum('bronce','plata','oro','platino') DEFAULT 'bronce',
  `estado` enum('activo','inactivo','suspendido') DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_sesion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `municipio`, `contrasena`, `rol`, `puntos_fidelidad`, `nivel_fidelidad`, `estado`, `fecha_registro`, `ultima_sesion`, `created_at`, `updated_at`) VALUES
(1, '1000000001', 'Admin', 'Sistema', 'admin@megacell.com', '3001234567', '1990-01-01', 'Quibdó', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 0, 'bronce', 'activo', '2025-11-14 05:08:23', NULL, '2025-11-14 05:08:23', '2025-11-14 05:08:23'),
(2, '1000000002', 'María', 'González', 'maria.gonzalez@megacell.com', '3002345678', '1992-05-15', 'Quibdó', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', 0, 'bronce', 'activo', '2025-11-14 05:08:23', NULL, '2025-11-14 05:08:23', '2025-11-15 00:56:11'),
(4, '1078001139', 'Jose Imanol', 'Chaverra Bejarano', 'josechaverra9010@gmail.com', '3204405039', '2002-09-13', 'Quibdó', '$2y$10$8c3HUgCp4xXbw7Rqq6Ulk.ppPJvDyWpu/IyjFN/ual3xIJ5yFr3lK', 'admin', 0, 'bronce', 'activo', '2025-11-14 05:13:49', '2025-11-15 08:22:54', '2025-11-14 05:13:49', '2025-11-15 08:22:54'),
(5, '1078001140', 'Jose Imanol', 'Chaverra Bejarano', 'josechaverra90100@gmail.com', '3204405039', '2004-05-04', 'Bojayá', '$2y$10$SLmY848FtJj59A4GLwBDBeT8vA4YVvP45./zPUW57l/INMOllp5XC', 'cliente', 0, 'bronce', 'activo', '2025-11-14 12:01:51', '2025-11-14 12:31:54', '2025-11-14 12:01:51', '2025-11-14 12:31:54'),
(6, '1010000001', 'Ana', 'Gómez Pérez', 'ana.gomez@mail.com', '3001234567', '1990-05-15', 'Bogotá', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 50, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(7, '1010000002', 'Juan', 'Rodríguez Díaz', 'juan.rodriguez@mail.com', '3019876543', '1985-11-20', 'Medellín', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 250, 'plata', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(8, '1010000003', 'María', 'López Castro', 'maria.lopez@mail.com', '3025551234', '1995-03-10', 'Cali', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', '', 0, '', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(9, '1010000004', 'Carlos', 'Martínez Soto', 'carlos.m@mail.com', '3034445678', '2000-07-25', 'Barranquilla', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 800, 'oro', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(10, '1010000005', 'Laura', 'Sánchez Vargas', 'laura.s@mail.com', '3047778901', '1978-01-01', 'Cartagena', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 10, 'bronce', 'inactivo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(11, '1010000006', 'Felipe', 'Torres Madero', 'felipe.t@mail.com', '3051112233', '1992-04-30', 'Bucaramanga', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 350, 'plata', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(12, '1010000007', 'Sofía', 'Ramírez Vega', 'sofia.r@mail.com', '3069990011', '1987-12-12', 'Pereira', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 1200, 'oro', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(13, '1010000008', 'Ricardo', 'Díaz Morales', 'ricardo.d@mail.com', '3078887766', '1998-09-05', 'Manizales', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 150, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(14, '1010000009', 'Elena', 'Pérez Mesa', 'elena.p@mail.com', '3086665544', '1980-06-18', 'Pasto', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', '', 0, '', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(15, '1010000010', 'Andrés', 'Castro Rivas', 'andres.c@mail.com', '3093332211', '1993-02-28', 'Villavicencio', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 600, 'plata', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(16, '1010000011', 'Valeria', 'Sierra Gil', 'valeria.s@mail.com', '3101230000', '2001-10-03', 'Armenia', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 20, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(17, '1010000012', 'David', 'Herrera Cano', 'david.h@mail.com', '3119870000', '1989-08-14', 'Ibagué', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 950, 'oro', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(18, '1010000013', 'Camila', 'Morales Paz', 'camila.m@mail.com', '3125550000', '1996-01-22', 'Cúcuta', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 450, 'plata', 'inactivo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(19, '1010000014', 'Santiago', 'Quintero Rey', 'santiago.q@mail.com', '3134440000', '1983-04-04', 'Neiva', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', '', 0, '', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(20, '1010000015', 'Isabella', 'Rojas Solano', 'isabella.r@mail.com', '3147770000', '1991-07-07', 'Santa Marta', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 75, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(21, '1010000016', 'Gabriel', 'Méndez Lopera', 'gabriel.m@mail.com', '3151110000', '1975-12-01', 'Popayán', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 1500, 'oro', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(22, '1010000017', 'Lucía', 'Vargas Polo', 'lucia.v@mail.com', '3169990000', '1999-05-29', 'Tunja', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 200, 'plata', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(23, '1010000018', 'Javier', 'Acosta Luna', 'javier.a@mail.com', '3178880000', '1986-03-24', 'Riohacha', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 5, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(24, '1010000019', 'Paula', 'Gil Osorio', 'paula.g@mail.com', '3186660000', '1994-11-17', 'Montería', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', '', 0, '', 'inactivo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(25, '1010000020', 'Mateo', 'Londoño Cruz', 'mateo.l@mail.com', '3193330000', '1988-02-09', 'Sincelejo', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 1100, 'oro', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(26, '1010000021', 'Daniela', 'Pardo Ríos', 'daniela.p@mail.com', '3201231234', '2002-06-08', 'Valledupar', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 100, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(27, '1010000022', 'Alejandro', 'Velasco Ruiz', 'alejandro.v@mail.com', '3219871234', '1984-10-21', 'Quibdó', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 300, 'plata', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(28, '1010000023', 'Andrea', 'Molina Rico', 'andrea.m@mail.com', '3225551234', '1997-08-02', 'Florencia', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', '', 0, '', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(29, '1010000024', 'Manuel', 'Ortega Torres', 'manuel.o@mail.com', '3234441234', '1979-04-19', 'Yopal', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 1300, 'oro', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(30, '1010000025', 'Natalia', 'Fuentes Cano', 'natalia.f@mail.com', '3247771234', '1990-09-11', 'San Andrés', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 30, 'bronce', 'activo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(31, '1010000026', 'Jorge', 'Guerra Duque', 'jorge.g@mail.com', '3251111234', '1982-01-27', 'Leticia', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 550, 'plata', 'inactivo', '2025-11-15 01:23:06', NULL, '2025-11-15 01:23:06', '2025-11-15 01:23:06'),
(32, '1010000027', 'Viviana', 'Mora Castro', 'viviana.m@mail.com', '3269991234', '1998-03-01', 'Bogotá', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 1050, 'oro', 'activo', '2025-11-15 01:23:07', NULL, '2025-11-15 01:23:07', '2025-11-15 01:23:07'),
(33, '1010000028', 'Héctor', 'Rojas Pérez', 'hector.r@mail.com', '3278881234', '1976-11-06', 'Medellín', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 175, 'bronce', 'activo', '2025-11-15 01:23:07', NULL, '2025-11-15 01:23:07', '2025-11-15 01:23:07'),
(34, '1010000029', 'Adriana', 'Díaz López', 'adriana.d@mail.com', '3286661234', '1995-12-30', 'Cali', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', '', 0, '', 'activo', '2025-11-15 01:23:07', NULL, '2025-11-15 01:23:07', '2025-11-15 01:23:07'),
(35, '1010000030', 'Sebastián', 'Vargas Gómez', 'sebastian.v@mail.com', '3293331234', '1981-07-13', 'Barranquilla', '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', 'cliente', 700, 'plata', 'activo', '2025-11-15 01:23:07', NULL, '2025-11-15 01:23:07', '2025-11-15 01:23:07');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_garantias_completas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_garantias_completas` (
`id` int(11)
,`fecha_inicio` date
,`fecha_vencimiento` date
,`tipo_cobertura` varchar(200)
,`estado` enum('activa','vencida','reclamada','cancelada')
,`dias_restantes` int(7)
,`tipo_servicio` varchar(10)
,`codigo_referencia` varchar(20)
,`usuario_id` int(11)
,`nombre_cliente` varchar(201)
,`email` varchar(150)
,`telefono` varchar(15)
,`monto_pedido` decimal(10,2)
,`precio_reparacion` decimal(10,2)
,`equipo` varchar(200)
,`servicio` varchar(200)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_usuarios`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_usuarios` (
`id` int(11)
,`identificacion` varchar(20)
,`nombres` varchar(100)
,`apellidos` varchar(100)
,`email` varchar(150)
,`telefono` varchar(15)
,`fecha_nacimiento` date
,`municipio` varchar(100)
,`rol` enum('admin','trabajador','cliente')
,`estado` enum('activo','inactivo','suspendido')
,`fecha_registro` timestamp
,`ultima_sesion` timestamp
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_usuario_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_usuario_completo` (
`id` int(11)
,`identificacion` varchar(20)
,`nombres` varchar(100)
,`apellidos` varchar(100)
,`email` varchar(150)
,`telefono` varchar(15)
,`fecha_nacimiento` date
,`municipio` varchar(100)
,`rol` enum('admin','trabajador','cliente')
,`estado` enum('activo','inactivo','suspendido')
,`puntos_fidelidad` int(11)
,`nivel_fidelidad` enum('bronce','plata','oro','platino')
,`fecha_registro` timestamp
,`ultima_sesion` timestamp
,`total_pedidos` bigint(21)
,`total_reparaciones` bigint(21)
,`total_favoritos` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_garantias_completas`
--
DROP TABLE IF EXISTS `vista_garantias_completas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_garantias_completas`  AS SELECT `g`.`id` AS `id`, `g`.`fecha_inicio` AS `fecha_inicio`, `g`.`fecha_vencimiento` AS `fecha_vencimiento`, `g`.`tipo_cobertura` AS `tipo_cobertura`, `g`.`estado` AS `estado`, to_days(`g`.`fecha_vencimiento`) - to_days(curdate()) AS `dias_restantes`, CASE WHEN `p`.`id` is not null THEN 'pedido' WHEN `r`.`id` is not null THEN 'reparacion' ELSE 'otro' END AS `tipo_servicio`, coalesce(`p`.`codigo`,`r`.`codigo`) AS `codigo_referencia`, coalesce(`p`.`usuario_id`,`r`.`usuario_id`) AS `usuario_id`, concat(`u`.`nombres`,' ',`u`.`apellidos`) AS `nombre_cliente`, `u`.`email` AS `email`, `u`.`telefono` AS `telefono`, `p`.`total` AS `monto_pedido`, `r`.`precio` AS `precio_reparacion`, `r`.`equipo` AS `equipo`, `r`.`servicio` AS `servicio` FROM (((`garantias` `g` left join `pedidos` `p` on(`g`.`pedido_id` = `p`.`id`)) left join `reparaciones` `r` on(`g`.`reparacion_id` = `r`.`id`)) left join `usuarios` `u` on(coalesce(`p`.`usuario_id`,`r`.`usuario_id`) = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_usuarios`
--
DROP TABLE IF EXISTS `vista_usuarios`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_usuarios`  AS SELECT `usuarios`.`id` AS `id`, `usuarios`.`identificacion` AS `identificacion`, `usuarios`.`nombres` AS `nombres`, `usuarios`.`apellidos` AS `apellidos`, `usuarios`.`email` AS `email`, `usuarios`.`telefono` AS `telefono`, `usuarios`.`fecha_nacimiento` AS `fecha_nacimiento`, `usuarios`.`municipio` AS `municipio`, `usuarios`.`rol` AS `rol`, `usuarios`.`estado` AS `estado`, `usuarios`.`fecha_registro` AS `fecha_registro`, `usuarios`.`ultima_sesion` AS `ultima_sesion` FROM `usuarios` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_usuario_completo`
--
DROP TABLE IF EXISTS `vista_usuario_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_usuario_completo`  AS SELECT `u`.`id` AS `id`, `u`.`identificacion` AS `identificacion`, `u`.`nombres` AS `nombres`, `u`.`apellidos` AS `apellidos`, `u`.`email` AS `email`, `u`.`telefono` AS `telefono`, `u`.`fecha_nacimiento` AS `fecha_nacimiento`, `u`.`municipio` AS `municipio`, `u`.`rol` AS `rol`, `u`.`estado` AS `estado`, `u`.`puntos_fidelidad` AS `puntos_fidelidad`, `u`.`nivel_fidelidad` AS `nivel_fidelidad`, `u`.`fecha_registro` AS `fecha_registro`, `u`.`ultima_sesion` AS `ultima_sesion`, count(distinct `p`.`id`) AS `total_pedidos`, count(distinct `r`.`id`) AS `total_reparaciones`, count(distinct `f`.`id`) AS `total_favoritos` FROM (((`usuarios` `u` left join `pedidos` `p` on(`u`.`id` = `p`.`usuario_id`)) left join `reparaciones` `r` on(`u`.`id` = `r`.`usuario_id`)) left join `favoritos` `f` on(`u`.`id` = `f`.`usuario_id`)) GROUP BY `u`.`id` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividad_usuario`
--
ALTER TABLE `actividad_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_actividad` (`usuario_id`),
  ADD KEY `idx_tipo` (`tipo_actividad`),
  ADD KEY `idx_fecha` (`fecha_actividad`);

--
-- Indices de la tabla `contacto_mensajes`
--
ALTER TABLE `contacto_mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha` (`fecha_creacion`);

--
-- Indices de la tabla `cupones`
--
ALTER TABLE `cupones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `cupones_usados`
--
ALTER TABLE `cupones_usados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cupon_id` (`cupon_id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `idx_usuario_cupon` (`usuario_id`,`cupon_id`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorito` (`usuario_id`,`producto_id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `idx_usuario_favorito` (`usuario_id`);

--
-- Indices de la tabla `garantias`
--
ALTER TABLE `garantias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedido` (`pedido_id`),
  ADD KEY `idx_reparacion` (`reparacion_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha` (`fecha_envio`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_usuario_pedido` (`usuario_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `reclamaciones_garantia`
--
ALTER TABLE `reclamaciones_garantia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_garantia` (`garantia_id`),
  ADD KEY `idx_estado` (`estado_reclamacion`);

--
-- Indices de la tabla `reparaciones`
--
ALTER TABLE `reparaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_ingreso` (`fecha_ingreso`),
  ADD KEY `idx_email_cliente` (`email_cliente`),
  ADD KEY `idx_telefono_cliente` (`telefono_cliente`);

--
-- Indices de la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_aprobado` (`aprobado`),
  ADD KEY `idx_estrellas` (`estrellas`);

--
-- Indices de la tabla `resenas_likes`
--
ALTER TABLE `resenas_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`resena_id`,`ip_address`);

--
-- Indices de la tabla `resenas_utilidad`
--
ALTER TABLE `resenas_utilidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_util` (`resena_id`,`ip_address`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_usuario` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_identificacion` (`identificacion`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_estado` (`estado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividad_usuario`
--
ALTER TABLE `actividad_usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `contacto_mensajes`
--
ALTER TABLE `contacto_mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cupones`
--
ALTER TABLE `cupones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cupones_usados`
--
ALTER TABLE `cupones_usados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `garantias`
--
ALTER TABLE `garantias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `reclamaciones_garantia`
--
ALTER TABLE `reclamaciones_garantia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reparaciones`
--
ALTER TABLE `reparaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `resenas_likes`
--
ALTER TABLE `resenas_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `resenas_utilidad`
--
ALTER TABLE `resenas_utilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividad_usuario`
--
ALTER TABLE `actividad_usuario`
  ADD CONSTRAINT `actividad_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cupones_usados`
--
ALTER TABLE `cupones_usados`
  ADD CONSTRAINT `cupones_usados_ibfk_1` FOREIGN KEY (`cupon_id`) REFERENCES `cupones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cupones_usados_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cupones_usados_ibfk_3` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `garantias`
--
ALTER TABLE `garantias`
  ADD CONSTRAINT `garantias_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `garantias_ibfk_2` FOREIGN KEY (`reparacion_id`) REFERENCES `reparaciones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reclamaciones_garantia`
--
ALTER TABLE `reclamaciones_garantia`
  ADD CONSTRAINT `reclamaciones_garantia_ibfk_1` FOREIGN KEY (`garantia_id`) REFERENCES `garantias` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reparaciones`
--
ALTER TABLE `reparaciones`
  ADD CONSTRAINT `fk_reparaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD CONSTRAINT `resenas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `resenas_likes`
--
ALTER TABLE `resenas_likes`
  ADD CONSTRAINT `resenas_likes_ibfk_1` FOREIGN KEY (`resena_id`) REFERENCES `resenas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resenas_utilidad`
--
ALTER TABLE `resenas_utilidad`
  ADD CONSTRAINT `resenas_utilidad_ibfk_1` FOREIGN KEY (`resena_id`) REFERENCES `resenas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
