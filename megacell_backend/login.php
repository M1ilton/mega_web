<?php
/**
 * API Endpoint - Login de Usuarios
 * MegaCell - Con redirección por roles
 */

require_once 'config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}

// Obtener datos JSON del body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validar que se recibieron datos
if (!$data) {
    jsonResponse([
        'success' => false,
        'message' => 'No se recibieron datos válidos'
    ], 400);
}

// Validar campos requeridos
if (empty($data['identificacion']) || empty($data['contrasena'])) {
    jsonResponse([
        'success' => false,
        'message' => 'Identificación y contraseña son requeridos'
    ], 400);
}

$identificacion = sanitizar($data['identificacion']);
$contrasena = $data['contrasena'];
$recordarme = isset($data['rememberMe']) ? $data['rememberMe'] : false;

try {
    $db = getDB();
    
    // Buscar usuario por identificación
    $stmt = $db->prepare("
        SELECT id, identificacion, nombres, apellidos, email, telefono, 
               fecha_nacimiento, municipio, contrasena, rol, estado
        FROM usuarios 
        WHERE identificacion = :identificacion
    ");
    
    $stmt->execute(['identificacion' => $identificacion]);
    $usuario = $stmt->fetch();
    
    // Verificar si existe el usuario
    if (!$usuario) {
        jsonResponse([
            'success' => false,
            'message' => 'Credenciales incorrectas. Verifique su identificación y contraseña.'
        ], 401);
    }
    
    // Verificar estado del usuario
    if ($usuario['estado'] !== 'activo') {
        jsonResponse([
            'success' => false,
            'message' => 'Su cuenta está ' . $usuario['estado'] . '. Contacte al administrador.'
        ], 403);
    }
    
    // Verificar contraseña
    if (!password_verify($contrasena, $usuario['contrasena'])) {
        jsonResponse([
            'success' => false,
            'message' => 'Credenciales incorrectas. Verifique su identificación y contraseña.'
        ], 401);
    }
    
    // Contraseña correcta - Crear sesión
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_identificacion'] = $usuario['identificacion'];
    $_SESSION['usuario_nombres'] = $usuario['nombres'];
    $_SESSION['usuario_apellidos'] = $usuario['apellidos'];
    $_SESSION['usuario_email'] = $usuario['email'];
    $_SESSION['usuario_rol'] = $usuario['rol'];
    $_SESSION['ultima_actividad'] = time();
    
    // Si marcó "recordarme", extender la sesión
    if ($recordarme) {
        $_SESSION['recordarme'] = true;
        // Extender cookie de sesión a 30 días
        $cookieParams = session_get_cookie_params();
        setcookie(
            session_name(),
            session_id(),
            time() + (30 * 24 * 60 * 60), // 30 días
            $cookieParams['path'],
            $cookieParams['domain'],
            $cookieParams['secure'],
            $cookieParams['httponly']
        );
    }
    
    // Actualizar última sesión
    $stmt = $db->prepare("UPDATE usuarios SET ultima_sesion = NOW() WHERE id = :id");
    $stmt->execute(['id' => $usuario['id']]);
    
    // Determinar ruta de redirección según el rol
    $rutaRedireccion = '/'; // Por defecto (cliente)
    
    switch($usuario['rol']) {
        case 'admin':
        case 'trabajador':
            $rutaRedireccion = '/dashboard';
            break;
        case 'cliente':
            $rutaRedireccion = '/'; // home.jsx
            break;
    }
    
    // Responder con éxito
    jsonResponse([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'usuario' => [
            'id' => $usuario['id'],
            'identificacion' => $usuario['identificacion'],
            'nombres' => $usuario['nombres'],
            'apellidos' => $usuario['apellidos'],
            'email' => $usuario['email'],
            'telefono' => $usuario['telefono'],
            'municipio' => $usuario['municipio'],
            'rol' => $usuario['rol'],
            'fecha_nacimiento' => $usuario['fecha_nacimiento']
        ],
        'redirectTo' => $rutaRedireccion
    ], 200);
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
