<?php
/**
 * API Endpoint - Obtener Cupones del Usuario
 * MegaCell
 */

require_once 'config.php';

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}

// Verificar sesión
if (!validarSesion()) {
    jsonResponse([
        'success' => false,
        'message' => 'Sesión no válida'
    ], 401);
}

try {
    $db = getDB();
    $usuario_id = $_SESSION['usuario_id'];
    
    // Obtener cupones activos
    $stmt = $db->prepare("
        SELECT 
            c.id,
            c.codigo,
            c.descripcion,
            CASE c.tipo_descuento
                WHEN 'porcentaje' THEN CONCAT(c.valor_descuento, '%')
                WHEN 'fijo' THEN CONCAT('$', FORMAT(c.valor_descuento, 0))
                WHEN 'envio_gratis' THEN 'Envío gratis'
            END as descuento,
            DATE_FORMAT(c.fecha_expiracion, '%d/%m/%Y') as valido,
            c.tipo_descuento,
            c.valor_descuento,
            IFNULL(usos.total_usos, 0) as veces_usado,
            c.usos_por_usuario,
            CASE 
                WHEN IFNULL(usos.total_usos, 0) >= c.usos_por_usuario THEN TRUE
                ELSE FALSE
            END as usado
        FROM cupones c
        LEFT JOIN (
            SELECT cupon_id, COUNT(*) as total_usos
            FROM cupones_usados
            WHERE usuario_id = :usuario_id
            GROUP BY cupon_id
        ) usos ON c.id = usos.cupon_id
        WHERE c.activo = TRUE 
        AND c.fecha_expiracion >= CURDATE()
        ORDER BY c.fecha_expiracion ASC
    ");
    $stmt->execute(['usuario_id' => $usuario_id]);
    $cupones = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'cupones' => $cupones
    ], 200);
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
