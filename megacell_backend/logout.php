<?php
/**
 * API Endpoint - Logout
 * MegaCell
 */

require_once 'config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}

// Verificar si hay sesión activa
if (!validarSesion()) {
    jsonResponse([
        'success' => false,
        'message' => 'No hay sesión activa'
    ], 401);
}

try {
    // Guardar el ID del usuario antes de destruir la sesión
    $usuarioId = $_SESSION['usuario_id'] ?? null;
    
    // Limpiar todas las variables de sesión
    $_SESSION = array();
    
    // Destruir la cookie de sesión
    if (isset($_COOKIE[session_name()])) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    
    // Destruir la sesión
    session_destroy();
    
    jsonResponse([
        'success' => true,
        'message' => 'Sesión cerrada exitosamente'
    ], 200);
    
} catch(Exception $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error al cerrar sesión: ' . $e->getMessage()
    ], 500);
}
