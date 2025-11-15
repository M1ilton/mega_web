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
require_once 'config2.php';

try {
    $conn = new PDO("mysql:host=localhost;dbname=mega_web;charset=utf8mb4", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            obtenerProductos($conn);
            break;
            
        case 'POST':
            crearProducto($conn);
            break;
            
        case 'PUT':
            actualizarProducto($conn);
            break;
            
        case 'DELETE':
            eliminarProducto($conn);
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

function obtenerProductos($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                `id`,
                `nombre`,
                `descripcion`,
                `precio`,
                `categoria`,
                `stock`,
                `imagen_url`,
                `activo`,
                `created_at`,
                `updated_at`
            FROM `productos`
            ORDER BY `created_at` DESC
        ");
        
        $stmt->execute();
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'productos' => $productos
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener productos: ' . $e->getMessage()
        ]);
    }
}

function crearProducto($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos requeridos
        if (empty($data['nombre']) || empty($data['descripcion']) || 
            empty($data['precio']) || empty($data['categoria']) || 
            !isset($data['stock'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Validar que el precio sea numérico
        if (!is_numeric($data['precio']) || $data['precio'] < 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El precio debe ser un valor numérico válido'
            ]);
            return;
        }
        
        // Validar que el stock sea numérico
        if (!is_numeric($data['stock']) || $data['stock'] < 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El stock debe ser un valor numérico válido'
            ]);
            return;
        }
        
        // Insertar producto
        $stmt = $conn->prepare("
            INSERT INTO `productos` 
            (`nombre`, `descripcion`, `precio`, `categoria`, `stock`, `imagen_url`, `activo`)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ");
        
        $stmt->execute([
            $data['nombre'],
            $data['descripcion'],
            $data['precio'],
            $data['categoria'],
            $data['stock'],
            $data['imagen_url'] ?? null
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'id' => $conn->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear producto: ' . $e->getMessage()
        ]);
    }
}

function actualizarProducto($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de producto no proporcionado'
            ]);
            return;
        }
        
        // Validar campos requeridos
        if (empty($data['nombre']) || empty($data['descripcion']) || 
            empty($data['precio']) || empty($data['categoria']) || 
            !isset($data['stock'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Validar que el precio sea numérico
        if (!is_numeric($data['precio']) || $data['precio'] < 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El precio debe ser un valor numérico válido'
            ]);
            return;
        }
        
        // Validar que el stock sea numérico
        if (!is_numeric($data['stock']) || $data['stock'] < 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El stock debe ser un valor numérico válido'
            ]);
            return;
        }
        
        // Actualizar producto
        $stmt = $conn->prepare("
            UPDATE `productos` 
            SET `nombre` = ?, `descripcion` = ?, `precio` = ?, 
                `categoria` = ?, `stock` = ?, `imagen_url` = ?
            WHERE `id` = ?
        ");
        
        $stmt->execute([
            $data['nombre'],
            $data['descripcion'],
            $data['precio'],
            $data['categoria'],
            $data['stock'],
            $data['imagen_url'] ?? null,
            $id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Producto actualizado exitosamente'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar producto: ' . $e->getMessage()
        ]);
    }
}

function eliminarProducto($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de producto no proporcionado'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("DELETE FROM `productos` WHERE `id` = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Producto no encontrado'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar producto: ' . $e->getMessage()
        ]);
    }
}
?>