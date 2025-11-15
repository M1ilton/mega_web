<?php
/**
 * API Endpoint - Obtener Favoritos del Usuario
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
    
    // Obtener favoritos del usuario con información del producto
    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.nombre,
            p.precio,
            p.categoria,
            f.fecha_agregado
        FROM favoritos f
        INNER JOIN productos p ON f.producto_id = p.id
        WHERE f.usuario_id = :usuario_id AND p.activo = TRUE
        ORDER BY f.fecha_agregado DESC
    ");
    $stmt->execute(['usuario_id' => $usuario_id]);
    $favoritos = $stmt->fetchAll();
    
    // Agregar iconos según la categoría
    foreach ($favoritos as &$favorito) {
        switch ($favorito['categoria']) {
            case 'accesorios':
                $favorito['icon'] = 'Zap';
                break;
            case 'repuestos':
                $favorito['icon'] = 'Wrench';
                break;
            case 'equipos':
                $favorito['icon'] = 'Smartphone';
                break;
            default:
                $favorito['icon'] = 'Package';
        }
    }
    
    jsonResponse([
        'success' => true,
        'favoritos' => $favoritos
    ], 200);
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
