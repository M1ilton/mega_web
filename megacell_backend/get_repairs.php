<?php
/**
 * API Endpoint - Obtener Reparaciones del Usuario
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
    
    // Obtener reparaciones del usuario
    $stmt = $db->prepare("
        SELECT 
            codigo as id,
            equipo,
            servicio,
            DATE_FORMAT(fecha_ingreso, '%d/%m/%Y') as fecha,
            CASE estado
                WHEN 'completado' THEN 'Completado'
                WHEN 'en_proceso' THEN 'En proceso'
                WHEN 'en_diagnostico' THEN 'En diagnóstico'
                WHEN 'recibido' THEN 'Recibido'
                WHEN 'entregado' THEN 'Entregado'
                WHEN 'cancelado' THEN 'Cancelado'
            END as estado,
            precio,
            CASE estado
                WHEN 'completado' THEN 'success'
                WHEN 'en_proceso' THEN 'warning'
                WHEN 'en_diagnostico' THEN 'info'
                WHEN 'recibido' THEN 'secondary'
                WHEN 'entregado' THEN 'success'
                WHEN 'cancelado' THEN 'danger'
            END as estadoColor
        FROM reparaciones 
        WHERE usuario_id = :usuario_id
        ORDER BY fecha_ingreso DESC
    ");
    $stmt->execute(['usuario_id' => $usuario_id]);
    $reparaciones = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'reparaciones' => $reparaciones
    ], 200);
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
