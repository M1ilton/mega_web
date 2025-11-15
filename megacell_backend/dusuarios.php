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

// Conexión a la base de datos
try {
    $conn = new PDO("mysql:host=localhost;dbname=mega_web;charset=utf8mb4", "root", "");
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
                id,
                identificacion,
                nombres,
                apellidos,
                email,
                telefono,
                fecha_nacimiento,
                municipio,
                rol,
                puntos_fidelidad,
                nivel_fidelidad,
                estado,
                fecha_registro,
                ultima_sesion,
                CONCAT(nombres, ' ', apellidos) as nombre_completo
            FROM usuarios
            WHERE estado = 'activo'
            ORDER BY nombres ASC
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
        if (empty($data['identificacion']) || empty($data['nombres']) || 
            empty($data['apellidos']) || empty($data['email']) || 
            empty($data['telefono']) || empty($data['contrasena'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Verificar si el usuario ya existe
        $stmtCheck = $conn->prepare("
            SELECT id FROM usuarios 
            WHERE identificacion = ? OR email = ?
        ");
        $stmtCheck->execute([$data['identificacion'], $data['email']]);
        
        if ($stmtCheck->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Ya existe un usuario con esta identificación o email'
            ]);
            return;
        }
        
        // Hash de la contraseña
        $contrasenaHash = password_hash($data['contrasena'], PASSWORD_BCRYPT);
        
        // Insertar usuario
        $stmt = $conn->prepare("
            INSERT INTO usuarios 
            (identificacion, nombres, apellidos, email, telefono, 
             fecha_nacimiento, municipio, contrasena, rol, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
        ");
        
        $stmt->execute([
            $data['identificacion'],
            $data['nombres'],
            $data['apellidos'],
            $data['email'],
            $data['telefono'],
            $data['fecha_nacimiento'] ?? null,
            $data['municipio'] ?? '',
            $contrasenaHash,
            $data['rol'] ?? 'cliente'
        ]);
        
        $id = $conn->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'id' => $id
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
        
        // Construir la consulta de actualización
        $campos = [];
        $valores = [];
        
        if (isset($data['nombres'])) {
            $campos[] = "nombres = ?";
            $valores[] = $data['nombres'];
        }
        if (isset($data['apellidos'])) {
            $campos[] = "apellidos = ?";
            $valores[] = $data['apellidos'];
        }
        if (isset($data['email'])) {
            $campos[] = "email = ?";
            $valores[] = $data['email'];
        }
        if (isset($data['telefono'])) {
            $campos[] = "telefono = ?";
            $valores[] = $data['telefono'];
        }
        if (isset($data['fecha_nacimiento'])) {
            $campos[] = "fecha_nacimiento = ?";
            $valores[] = $data['fecha_nacimiento'];
        }
        if (isset($data['municipio'])) {
            $campos[] = "municipio = ?";
            $valores[] = $data['municipio'];
        }
        if (isset($data['rol'])) {
            $campos[] = "rol = ?";
            $valores[] = $data['rol'];
        }
        if (isset($data['estado'])) {
            $campos[] = "estado = ?";
            $valores[] = $data['estado'];
        }
        
        // Si se proporciona una nueva contraseña
        if (!empty($data['contrasena'])) {
            $campos[] = "contrasena = ?";
            $valores[] = password_hash($data['contrasena'], PASSWORD_BCRYPT);
        }
        
        if (empty($campos)) {
            echo json_encode([
                'success' => true,
                'message' => 'No hay cambios para actualizar'
            ]);
            return;
        }
        
        $valores[] = $id;
        
        $sql = "UPDATE usuarios SET " . implode(", ", $campos) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($valores);
        
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
        
        // Verificar si tiene pedidos o reparaciones asociadas
        $stmtCheck = $conn->prepare("
            SELECT 
                (SELECT COUNT(*) FROM pedidos WHERE usuario_id = ?) as total_pedidos,
                (SELECT COUNT(*) FROM reparaciones WHERE usuario_id = ?) as total_reparaciones
        ");
        $stmtCheck->execute([$id, $id]);
        $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total_pedidos'] > 0 || $result['total_reparaciones'] > 0) {
            // En lugar de eliminar, desactivar el usuario
            $stmt = $conn->prepare("UPDATE usuarios SET estado = 'inactivo' WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Usuario desactivado exitosamente (tiene pedidos o reparaciones asociadas)'
            ]);
        } else {
            // Eliminar el usuario si no tiene relaciones
            $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
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