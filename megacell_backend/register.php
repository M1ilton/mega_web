<?php
/**
 * API Endpoint - Registro de Usuarios
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
$camposRequeridos = [
    'identificacion', 'nombres', 'apellidos', 'email', 
    'telefono', 'fechaNacimiento', 'municipio', 'contrasena'
];

$errores = [];

foreach ($camposRequeridos as $campo) {
    if (empty($data[$campo])) {
        $errores[] = "El campo $campo es requerido";
    }
}

if (!empty($errores)) {
    jsonResponse([
        'success' => false,
        'message' => 'Datos incompletos',
        'errors' => $errores
    ], 400);
}

// Sanitizar datos
$identificacion = sanitizar($data['identificacion']);
$nombres = sanitizar($data['nombres']);
$apellidos = sanitizar($data['apellidos']);
$email = sanitizar($data['email']);
$telefono = sanitizar($data['telefono']);
$fechaNacimiento = sanitizar($data['fechaNacimiento']);
$municipio = sanitizar($data['municipio']);
$contrasena = $data['contrasena'];

// Validaciones específicas
if (strlen($identificacion) < 6) {
    $errores[] = "La identificación debe tener al menos 6 caracteres";
}

if (strlen($nombres) < 3) {
    $errores[] = "Los nombres deben tener al menos 3 caracteres";
}

if (strlen($apellidos) < 3) {
    $errores[] = "Los apellidos deben tener al menos 3 caracteres";
}

if (!validarEmail($email)) {
    $errores[] = "El correo electrónico no es válido";
}

if (strlen($telefono) < 10) {
    $errores[] = "El teléfono debe tener al menos 10 dígitos";
}

if (strlen($contrasena) < 6) {
    $errores[] = "La contraseña debe tener al menos 6 caracteres";
}

// Validar edad (mayor de 18)
$fechaNac = new DateTime($fechaNacimiento);
$hoy = new DateTime();
$edad = $hoy->diff($fechaNac)->y;

if ($edad < 18) {
    $errores[] = "Debes ser mayor de 18 años para registrarte";
}

if (!empty($errores)) {
    jsonResponse([
        'success' => false,
        'message' => 'Errores de validación',
        'errors' => $errores
    ], 400);
}

try {
    $db = getDB();
    
    // Verificar si ya existe la identificación
    $stmt = $db->prepare("SELECT id FROM usuarios WHERE identificacion = :identificacion");
    $stmt->execute(['identificacion' => $identificacion]);
    
    if ($stmt->fetch()) {
        jsonResponse([
            'success' => false,
            'message' => 'Esta identificación ya está registrada'
        ], 409);
    }
    
    // Verificar si ya existe el email
    $stmt = $db->prepare("SELECT id FROM usuarios WHERE email = :email");
    $stmt->execute(['email' => $email]);
    
    if ($stmt->fetch()) {
        jsonResponse([
            'success' => false,
            'message' => 'Este correo electrónico ya está registrado'
        ], 409);
    }
    
    // Hashear la contraseña
    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
    
    // Insertar usuario (por defecto como cliente)
    $stmt = $db->prepare("
        INSERT INTO usuarios (
            identificacion, nombres, apellidos, email, telefono, 
            fecha_nacimiento, municipio, contrasena, rol
        ) VALUES (
            :identificacion, :nombres, :apellidos, :email, :telefono,
            :fecha_nacimiento, :municipio, :contrasena, 'cliente'
        )
    ");
    
    $resultado = $stmt->execute([
        'identificacion' => $identificacion,
        'nombres' => $nombres,
        'apellidos' => $apellidos,
        'email' => $email,
        'telefono' => $telefono,
        'fecha_nacimiento' => $fechaNacimiento,
        'municipio' => $municipio,
        'contrasena' => $contrasenaHash
    ]);
    
    if ($resultado) {
        $usuarioId = $db->lastInsertId();
        
        // Crear sesión automáticamente después del registro
        $_SESSION['usuario_id'] = $usuarioId;
        $_SESSION['usuario_identificacion'] = $identificacion;
        $_SESSION['usuario_nombres'] = $nombres;
        $_SESSION['usuario_apellidos'] = $apellidos;
        $_SESSION['usuario_email'] = $email;
        $_SESSION['usuario_rol'] = 'cliente';
        $_SESSION['ultima_actividad'] = time();
        
        // Actualizar última sesión
        $stmt = $db->prepare("UPDATE usuarios SET ultima_sesion = NOW() WHERE id = :id");
        $stmt->execute(['id' => $usuarioId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'usuario' => [
                'id' => $usuarioId,
                'identificacion' => $identificacion,
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'email' => $email,
                'telefono' => $telefono,
                'municipio' => $municipio,
                'rol' => 'cliente'
            ]
        ], 201);
    } else {
        jsonResponse([
            'success' => false,
            'message' => 'Error al registrar el usuario'
        ], 500);
    }
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
