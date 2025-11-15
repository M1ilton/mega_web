<?php
/**
 * API Endpoint - Actualizar Perfil del Usuario
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

try {
    $db = getDB();
    $usuario_id = $_SESSION['usuario_id'];
    
    // Campos actualizables
    $campos_actualizables = [];
    $valores = ['id' => $usuario_id];
    
    // Validar y preparar campos
    if (!empty($data['nombres'])) {
        $campos_actualizables[] = "nombres = :nombres";
        $valores['nombres'] = sanitizar($data['nombres']);
    }
    
    if (!empty($data['apellidos'])) {
        $campos_actualizables[] = "apellidos = :apellidos";
        $valores['apellidos'] = sanitizar($data['apellidos']);
    }
    
    if (!empty($data['email'])) {
        $email = sanitizar($data['email']);
        if (!validarEmail($email)) {
            jsonResponse([
                'success' => false,
                'message' => 'Correo electrónico no válido'
            ], 400);
        }
        
        // Verificar que el email no esté en uso por otro usuario
        $stmt = $db->prepare("SELECT id FROM usuarios WHERE email = :email AND id != :usuario_id");
        $stmt->execute(['email' => $email, 'usuario_id' => $usuario_id]);
        if ($stmt->fetch()) {
            jsonResponse([
                'success' => false,
                'message' => 'Este correo electrónico ya está en uso'
            ], 409);
        }
        
        $campos_actualizables[] = "email = :email";
        $valores['email'] = $email;
    }
    
    if (!empty($data['telefono'])) {
        $campos_actualizables[] = "telefono = :telefono";
        $valores['telefono'] = sanitizar($data['telefono']);
    }
    
    if (!empty($data['municipio'])) {
        $campos_actualizables[] = "municipio = :municipio";
        $valores['municipio'] = sanitizar($data['municipio']);
    }
    
    if (!empty($data['fecha_nacimiento'])) {
        $campos_actualizables[] = "fecha_nacimiento = :fecha_nacimiento";
        $valores['fecha_nacimiento'] = $data['fecha_nacimiento'];
    }
    
    if (empty($campos_actualizables)) {
        jsonResponse([
            'success' => false,
            'message' => 'No se proporcionaron campos para actualizar'
        ], 400);
    }
    
    // Construir y ejecutar query de actualización
    $sql = "UPDATE usuarios SET " . implode(", ", $campos_actualizables) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $resultado = $stmt->execute($valores);
    
    if ($resultado) {
        // Registrar actividad
        $stmt = $db->prepare("
            INSERT INTO actividad_usuario (usuario_id, tipo_actividad, descripcion) 
            VALUES (:usuario_id, 'perfil_actualizado', 'Perfil actualizado')
        ");
        $stmt->execute(['usuario_id' => $usuario_id]);
        
        // Obtener datos actualizados
        $stmt = $db->prepare("
            SELECT id, identificacion, nombres, apellidos, email, telefono, 
                   fecha_nacimiento, municipio, rol
            FROM usuarios 
            WHERE id = :id
        ");
        $stmt->execute(['id' => $usuario_id]);
        $usuario_actualizado = $stmt->fetch();
        
        // Actualizar sesión
        $_SESSION['usuario_nombres'] = $usuario_actualizado['nombres'];
        $_SESSION['usuario_apellidos'] = $usuario_actualizado['apellidos'];
        $_SESSION['usuario_email'] = $usuario_actualizado['email'];
        
        jsonResponse([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'usuario' => $usuario_actualizado
        ], 200);
    } else {
        jsonResponse([
            'success' => false,
            'message' => 'Error al actualizar el perfil'
        ], 500);
    }
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
