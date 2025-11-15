<?php
/**
 * API Endpoint - Cambiar Contraseña
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

// Verificar sesión
if (!validarSesion()) {
    jsonResponse([
        'success' => false,
        'message' => 'Sesión no válida'
    ], 401);
}

// Obtener datos JSON del body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    jsonResponse([
        'success' => false,
        'message' => 'No se recibieron datos válidos'
    ], 400);
}

// Validar campos requeridos
if (empty($data['contrasena_actual']) || empty($data['contrasena_nueva']) || empty($data['contrasena_confirmacion'])) {
    jsonResponse([
        'success' => false,
        'message' => 'Todos los campos son requeridos'
    ], 400);
}

// Validar que la nueva contraseña y la confirmación coincidan
if ($data['contrasena_nueva'] !== $data['contrasena_confirmacion']) {
    jsonResponse([
        'success' => false,
        'message' => 'Las contraseñas nuevas no coinciden'
    ], 400);
}

// Validar longitud de la nueva contraseña
if (strlen($data['contrasena_nueva']) < 6) {
    jsonResponse([
        'success' => false,
        'message' => 'La nueva contraseña debe tener al menos 6 caracteres'
    ], 400);
}

try {
    $db = getDB();
    $usuario_id = $_SESSION['usuario_id'];
    
    // Obtener contraseña actual del usuario
    $stmt = $db->prepare("SELECT contrasena FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $usuario_id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        jsonResponse([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ], 404);
    }
    
    // Verificar que la contraseña actual sea correcta
    if (!password_verify($data['contrasena_actual'], $usuario['contrasena'])) {
        jsonResponse([
            'success' => false,
            'message' => 'La contraseña actual es incorrecta'
        ], 401);
    }
    
    // Hashear la nueva contraseña
    $nueva_contrasena_hash = password_hash($data['contrasena_nueva'], PASSWORD_DEFAULT);
    
    // Actualizar contraseña
    $stmt = $db->prepare("UPDATE usuarios SET contrasena = :contrasena WHERE id = :id");
    $resultado = $stmt->execute([
        'contrasena' => $nueva_contrasena_hash,
        'id' => $usuario_id
    ]);
    
    if ($resultado) {
        // Registrar actividad
        $stmt = $db->prepare("
            INSERT INTO actividad_usuario (usuario_id, tipo_actividad, descripcion) 
            VALUES (:usuario_id, 'contrasena_cambiada', 'Contraseña actualizada')
        ");
        $stmt->execute(['usuario_id' => $usuario_id]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ], 200);
    } else {
        jsonResponse([
            'success' => false,
            'message' => 'Error al actualizar la contraseña'
        ], 500);
    }
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
