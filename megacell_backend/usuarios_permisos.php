<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Verificar que el usuario esté autenticado y sea admin o trabajador
if (!isset($_SESSION['usuario']) || !in_array($_SESSION['usuario']['rol'], ['admin', 'trabajador'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'No tienes permisos para acceder a esta funcionalidad'
    ]);
    exit();
}

// Conexión a la base de datos
require_once 'config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            obtenerUsuarios($conn);
            break;
            
        case 'POST':
            crearUsuario($conn);
            break;
            
        case 'PUT':
            actualizarUsuario($conn);
            break;
            
        case 'DELETE':
            eliminarUsuario($conn);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método no permitido'
            ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $e->getMessage()
    ]);
}

function obtenerUsuarios($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                id_usuario,
                nombres,
                apellidos,
                email,
                telefono,
                municipio,
                direccion,
                rol,
                fecha_registro
            FROM usuarios
            ORDER BY fecha_registro DESC
        ");
        
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'usuarios' => $usuarios
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener usuarios: ' . $e->getMessage()
        ]);
    }
}

function crearUsuario($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos requeridos
        if (empty($data['nombres']) || empty($data['apellidos']) || 
            empty($data['email']) || empty($data['telefono']) || 
            empty($data['contrasena']) || empty($data['rol'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Verificar si el email ya existe
        $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El correo electrónico ya está registrado'
            ]);
            return;
        }
        
        // Hash de la contraseña
        $contrasenaHash = password_hash($data['contrasena'], PASSWORD_DEFAULT);
        
        // Insertar usuario
        $stmt = $conn->prepare("
            INSERT INTO usuarios (nombres, apellidos, email, telefono, municipio, direccion, contrasena, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['nombres'],
            $data['apellidos'],
            $data['email'],
            $data['telefono'],
            $data['municipio'] ?? null,
            $data['direccion'] ?? null,
            $contrasenaHash,
            $data['rol']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'id_usuario' => $conn->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear usuario: ' . $e->getMessage()
        ]);
    }
}

function actualizarUsuario($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de usuario no proporcionado'
            ]);
            return;
        }
        
        // Validar campos requeridos
        if (empty($data['nombres']) || empty($data['apellidos']) || 
            empty($data['email']) || empty($data['telefono']) || empty($data['rol'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Verificar si el email ya existe para otro usuario
        $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?");
        $stmt->execute([$data['email'], $id]);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El correo electrónico ya está registrado por otro usuario'
            ]);
            return;
        }
        
        // Preparar la actualización
        if (!empty($data['contrasena'])) {
            // Si se proporciona contraseña, actualizarla también
            $contrasenaHash = password_hash($data['contrasena'], PASSWORD_DEFAULT);
            $stmt = $conn->prepare("
                UPDATE usuarios 
                SET nombres = ?, apellidos = ?, email = ?, telefono = ?, 
                    municipio = ?, direccion = ?, contrasena = ?, rol = ?
                WHERE id_usuario = ?
            ");
            
            $stmt->execute([
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['municipio'] ?? null,
                $data['direccion'] ?? null,
                $contrasenaHash,
                $data['rol'],
                $id
            ]);
        } else {
            // No actualizar la contraseña
            $stmt = $conn->prepare("
                UPDATE usuarios 
                SET nombres = ?, apellidos = ?, email = ?, telefono = ?, 
                    municipio = ?, direccion = ?, rol = ?
                WHERE id_usuario = ?
            ");
            
            $stmt->execute([
                $data['nombres'],
                $data['apellidos'],
                $data['email'],
                $data['telefono'],
                $data['municipio'] ?? null,
                $data['direccion'] ?? null,
                $data['rol'],
                $id
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar usuario: ' . $e->getMessage()
        ]);
    }
}

function eliminarUsuario($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de usuario no proporcionado'
            ]);
            return;
        }
        
        // No permitir eliminar al usuario actual
        if ($id == $_SESSION['usuario']['id_usuario']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No puedes eliminar tu propio usuario'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar usuario: ' . $e->getMessage()
        ]);
    }
}
?>