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
            obtenerPedidos($conn);
            break;
            
        case 'POST':
            crearPedido($conn);
            break;
            
        case 'PUT':
            actualizarPedido($conn);
            break;
            
        case 'DELETE':
            eliminarPedido($conn);
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

function obtenerPedidos($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                p.id,
                p.codigo,
                p.usuario_id,
                p.fecha_pedido,
                p.estado,
                p.total,
                p.productos,
                p.direccion_envio,
                p.metodo_pago,
                p.created_at,
                p.updated_at,
                u.nombres,
                u.apellidos,
                u.email,
                u.telefono,
                CONCAT(u.nombres, ' ', u.apellidos) as nombre_cliente
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.created_at DESC
        ");
        
        $stmt->execute();
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'pedidos' => $pedidos
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener pedidos: ' . $e->getMessage()
        ]);
    }
}

function crearPedido($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos requeridos
        if (empty($data['usuario_id']) || empty($data['total']) || 
            empty($data['direccion_envio'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Generar código único
        $codigo = 'PED-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Verificar que el código sea único
        $stmtCheck = $conn->prepare("SELECT id FROM pedidos WHERE codigo = ?");
        $stmtCheck->execute([$codigo]);
        
        while ($stmtCheck->fetch()) {
            $codigo = 'PED-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            $stmtCheck->execute([$codigo]);
        }
        
        // Insertar pedido
        $stmt = $conn->prepare("
            INSERT INTO pedidos 
            (codigo, usuario_id, fecha_pedido, estado, total, productos, 
             direccion_envio, metodo_pago)
            VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $codigo,
            $data['usuario_id'],
            $data['estado'] ?? 'pendiente',
            $data['total'],
            $data['productos'] ?? 1,
            $data['direccion_envio'],
            $data['metodo_pago'] ?? 'efectivo'
        ]);
        
        $id = $conn->lastInsertId();
        
        // Registrar actividad
        $stmtActividad = $conn->prepare("
            INSERT INTO actividad_usuario (usuario_id, tipo_actividad, descripcion)
            VALUES (?, 'pedido', ?)
        ");
        $stmtActividad->execute([
            $data['usuario_id'],
            'Pedido realizado: ' . $codigo
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Pedido creado exitosamente',
            'id' => $id,
            'codigo' => $codigo
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear pedido: ' . $e->getMessage()
        ]);
    }
}

function actualizarPedido($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de pedido no proporcionado'
            ]);
            return;
        }
        
        // Actualizar pedido
        $stmt = $conn->prepare("
            UPDATE pedidos 
            SET estado = ?, 
                total = ?, 
                productos = ?, 
                direccion_envio = ?, 
                metodo_pago = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['estado'] ?? 'pendiente',
            $data['total'],
            $data['productos'] ?? 1,
            $data['direccion_envio'],
            $data['metodo_pago'] ?? 'efectivo',
            $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Pedido actualizado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'No se realizaron cambios'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar pedido: ' . $e->getMessage()
        ]);
    }
}

function eliminarPedido($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de pedido no proporcionado'
            ]);
            return;
        }
        
        // Verificar si tiene garantías asociadas
        $stmtCheck = $conn->prepare("SELECT COUNT(*) as total FROM garantias WHERE pedido_id = ?");
        $stmtCheck->execute([$id]);
        $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No se puede eliminar el pedido porque tiene garantías asociadas'
            ]);
            return;
        }
        
        // Verificar si tiene cupones usados asociados
        $stmtCupones = $conn->prepare("DELETE FROM cupones_usados WHERE pedido_id = ?");
        $stmtCupones->execute([$id]);
        
        // Eliminar pedido
        $stmt = $conn->prepare("DELETE FROM pedidos WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Pedido eliminado exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Pedido no encontrado'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar pedido: ' . $e->getMessage()
        ]);
    }
}
?>