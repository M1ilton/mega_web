<?php
/**
 * API Endpoint - Obtener Actividad Reciente del Usuario
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
    
    // Limitar las actividades (parámetro opcional)
    $limite = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    // Obtener actividad reciente del usuario
    $stmt = $db->prepare("
        SELECT 
            id,
            tipo_actividad,
            descripcion,
            DATE_FORMAT(fecha_actividad, '%d/%m/%Y %h:%i %p') as fecha,
            CASE tipo_actividad
                WHEN 'login' THEN '✅'
                WHEN 'logout' THEN '🚪'
                WHEN 'pedido' THEN '📦'
                WHEN 'reparacion' THEN '🔧'
                WHEN 'perfil_actualizado' THEN '👤'
                WHEN 'contrasena_cambiada' THEN '🔒'
                WHEN 'favorito_agregado' THEN '❤️'
                ELSE '📝'
            END as icon,
            CASE tipo_actividad
                WHEN 'login' THEN 'Inicio de sesión exitoso'
                WHEN 'logout' THEN 'Sesión cerrada'
                WHEN 'pedido' THEN 'Pedido realizado'
                WHEN 'reparacion' THEN 'Reparación solicitada'
                WHEN 'perfil_actualizado' THEN 'Perfil actualizado'
                WHEN 'contrasena_cambiada' THEN 'Contraseña actualizada'
                WHEN 'favorito_agregado' THEN 'Favorito agregado'
                ELSE descripcion
            END as text
        FROM actividad_usuario
        WHERE usuario_id = :usuario_id
        ORDER BY fecha_actividad DESC
        LIMIT :limite
    ");
    $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
    $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
    $stmt->execute();
    $actividades = $stmt->fetchAll();
    
    jsonResponse([
        'success' => true,
        'actividades' => $actividades
    ], 200);
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
