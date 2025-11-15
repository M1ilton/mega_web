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
            obtenerReparaciones($conn);
            break;
            
        case 'POST':
            crearReparacion($conn);
            break;
            
        case 'PUT':
            actualizarReparacion($conn);
            break;
            
        case 'DELETE':
            eliminarReparacion($conn);
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

function obtenerReparaciones($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.codigo,
                r.usuario_id,
                r.equipo,
                r.servicio,
                r.descripcion,
                r.precio,
                r.tiempo_estimado,
                r.estado,
                r.diagnostico,
                r.observaciones,
                r.nombre_cliente,
                r.telefono_cliente,
                r.email_cliente,
                r.fecha_ingreso,
                r.fecha_entrega,
                r.fecha_estimada_entrega,
                r.created_at,
                r.updated_at,
                u.nombres,
                u.apellidos,
                u.email as usuario_email,
                u.telefono as usuario_telefono
            FROM reparaciones r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.created_at DESC
        ");
        
        $stmt->execute();
        $reparaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'reparaciones' => $reparaciones
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener reparaciones: ' . $e->getMessage()
        ]);
    }
}

function crearReparacion($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos requeridos
        if (empty($data['nombre_cliente']) || empty($data['telefono_cliente']) || 
            empty($data['email_cliente']) || empty($data['equipo']) || 
            empty($data['servicio']) || empty($data['precio'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos obligatorios deben ser completados'
            ]);
            return;
        }
        
        // Generar código único
        $codigo = 'REP-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Verificar que el código sea único
        $stmtCheck = $conn->prepare("SELECT id FROM reparaciones WHERE codigo = ?");
        $stmtCheck->execute([$codigo]);
        
        while ($stmtCheck->fetch()) {
            $codigo = 'REP-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            $stmtCheck->execute([$codigo]);
        }
        
        // Calcular fecha estimada de entrega si no se proporciona
        $fecha_estimada = $data['fecha_estimada_entrega'] ?? null;
        if (empty($fecha_estimada)) {
            $fecha_estimada = date('Y-m-d H:i:s', strtotime('+3 days'));
        } else {
            $fecha_estimada = $fecha_estimada . ' 17:00:00';
        }
        
        // Insertar reparación
        $stmt = $conn->prepare("
            INSERT INTO reparaciones 
            (codigo, usuario_id, equipo, servicio, descripcion, precio, tiempo_estimado, 
             estado, nombre_cliente, telefono_cliente, email_cliente, fecha_ingreso, 
             fecha_estimada_entrega)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        ");
        
        $stmt->execute([
            $codigo,
            !empty($data['usuario_id']) ? $data['usuario_id'] : null,
            $data['equipo'],
            $data['servicio'],
            $data['descripcion'] ?? null,
            $data['precio'],
            $data['tiempo_estimado'] ?? null,
            $data['estado'] ?? 'recibido',
            $data['nombre_cliente'],
            $data['telefono_cliente'],
            $data['email_cliente'],
            $fecha_estimada
        ]);
        
        $id = $conn->lastInsertId();
        
        // Registrar actividad si el usuario está logueado
        if (!empty($data['usuario_id'])) {
            $stmtActividad = $conn->prepare("
                INSERT INTO actividad_usuario (usuario_id, tipo_actividad, descripcion)
                VALUES (?, 'reparacion', ?)
            ");
            $stmtActividad->execute([
                $data['usuario_id'],
                'Reparación solicitada: ' . $codigo
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Reparación creada exitosamente',
            'id' => $id,
            'codigo' => $codigo
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear reparación: ' . $e->getMessage()
        ]);
    }
}

function actualizarReparacion($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de reparación no proporcionado'
            ]);
            return;
        }
        
        // Preparar fecha estimada
        $fecha_estimada = $data['fecha_estimada_entrega'] ?? null;
        if (!empty($fecha_estimada) && strlen($fecha_estimada) == 10) {
            $fecha_estimada = $fecha_estimada . ' 17:00:00';
        }
        
        // Actualizar fecha de entrega si el estado es "entregado"
        $fecha_entrega = null;
        if ($data['estado'] == 'entregado') {
            $fecha_entrega = date('Y-m-d H:i:s');
        }
        
        // Actualizar reparación
        $stmt = $conn->prepare("
            UPDATE reparaciones 
            SET equipo = ?, 
                servicio = ?, 
                descripcion = ?, 
                precio = ?, 
                tiempo_estimado = ?, 
                estado = ?, 
                diagnostico = ?,
                observaciones = ?,
                nombre_cliente = ?,
                telefono_cliente = ?,
                email_cliente = ?,
                fecha_estimada_entrega = ?,
                fecha_entrega = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['equipo'],
            $data['servicio'],
            $data['descripcion'] ?? null,
            $data['precio'],
            $data['tiempo_estimado'] ?? null,
            $data['estado'] ?? 'recibido',
            $data['diagnostico'] ?? null,
            $data['observaciones'] ?? null,
            $data['nombre_cliente'],
            $data['telefono_cliente'],
            $data['email_cliente'],
            $fecha_estimada,
            $fecha_entrega,
            $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Reparación actualizada exitosamente'
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
            'message' => 'Error al actualizar reparación: ' . $e->getMessage()
        ]);
    }
}

function eliminarReparacion($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de reparación no proporcionado'
            ]);
            return;
        }
        
        // Verificar si tiene garantías asociadas
        $stmtCheck = $conn->prepare("SELECT COUNT(*) as total FROM garantias WHERE reparacion_id = ?");
        $stmtCheck->execute([$id]);
        $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No se puede eliminar la reparación porque tiene garantías asociadas'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("DELETE FROM reparaciones WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Reparación eliminada exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Reparación no encontrada'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar reparación: ' . $e->getMessage()
        ]);
    }
}
?>