<?php
/**
 * API para gestión de reparaciones
 */

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        obtenerReparaciones($db);
        break;
    case 'POST':
        crearReparacion($db);
        break;
    case 'PUT':
        actualizarReparacion($db);
        break;
    case 'DELETE':
        eliminarReparacion($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

function obtenerReparaciones($db) {
    try {
        $usuario_id = isset($_GET['usuario_id']) ? $_GET['usuario_id'] : null;
        $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
        
        $query = "SELECT r.*, 
                         CASE 
                            WHEN r.usuario_id IS NOT NULL THEN CONCAT(u.nombres, ' ', u.apellidos)
                            ELSE r.nombre_cliente
                         END as cliente_nombre,
                         CASE 
                            WHEN r.usuario_id IS NOT NULL THEN u.telefono
                            ELSE r.telefono_cliente
                         END as cliente_telefono
                  FROM reparaciones r 
                  LEFT JOIN usuarios u ON r.usuario_id = u.id
                  WHERE 1=1";
        
        $params = [];
        
        if ($usuario_id) {
            $query .= " AND r.usuario_id = :usuario_id";
            $params[':usuario_id'] = $usuario_id;
        }
        
        if ($estado) {
            $query .= " AND r.estado = :estado";
            $params[':estado'] = $estado;
        }
        
        $query .= " ORDER BY r.fecha_ingreso DESC";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $reparaciones = $stmt->fetchAll();
        
        // Formatear precios
        foreach ($reparaciones as &$reparacion) {
            $reparacion['precio'] = (float)$reparacion['precio'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $reparaciones,
            'count' => count($reparaciones)
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener reparaciones: ' . $e->getMessage()
        ]);
    }
}

function crearReparacion($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos requeridos
        if (!isset($data['equipo']) || empty($data['equipo'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Información del equipo requerida'
            ]);
            return;
        }
        
        if (!isset($data['servicio']) || empty($data['servicio'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Tipo de servicio requerido'
            ]);
            return;
        }
        
        if (!isset($data['nombre_cliente']) || empty($data['nombre_cliente'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Nombre del cliente requerido'
            ]);
            return;
        }
        
        if (!isset($data['telefono_cliente']) || empty($data['telefono_cliente'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Teléfono del cliente requerido'
            ]);
            return;
        }
        
        if (!isset($data['email_cliente']) || empty($data['email_cliente'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Email del cliente requerido'
            ]);
            return;
        }
        
        // Generar código único para la reparación
        $codigo = 'REP-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        // Verificar si el código ya existe
        $query_check = "SELECT id FROM reparaciones WHERE codigo = :codigo";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(':codigo', $codigo);
        $stmt_check->execute();
        
        // Si existe, generar otro código
        while ($stmt_check->fetch()) {
            $codigo = 'REP-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $stmt_check->execute(['codigo' => $codigo]);
        }
        
        // Insertar reparación
        $query = "INSERT INTO reparaciones 
                  (codigo, usuario_id, equipo, servicio, descripcion, precio, 
                   tiempo_estimado, estado, nombre_cliente, telefono_cliente, 
                   email_cliente, fecha_ingreso) 
                  VALUES 
                  (:codigo, :usuario_id, :equipo, :servicio, :descripcion, :precio, 
                   :tiempo_estimado, 'recibido', :nombre_cliente, :telefono_cliente, 
                   :email_cliente, NOW())";
        
        $stmt = $db->prepare($query);
        
        $usuario_id = isset($data['usuario_id']) && !empty($data['usuario_id']) ? $data['usuario_id'] : null;
        $precio = isset($data['precio']) ? $data['precio'] : 0;
        $tiempo_estimado = isset($data['tiempo_estimado']) ? $data['tiempo_estimado'] : 'Por definir';
        $descripcion = isset($data['descripcion']) ? $data['descripcion'] : '';
        
        $stmt->bindParam(':codigo', $codigo);
        $stmt->bindParam(':usuario_id', $usuario_id);
        $stmt->bindParam(':equipo', $data['equipo']);
        $stmt->bindParam(':servicio', $data['servicio']);
        $stmt->bindParam(':descripcion', $descripcion);
        $stmt->bindParam(':precio', $precio);
        $stmt->bindParam(':tiempo_estimado', $tiempo_estimado);
        $stmt->bindParam(':nombre_cliente', $data['nombre_cliente']);
        $stmt->bindParam(':telefono_cliente', $data['telefono_cliente']);
        $stmt->bindParam(':email_cliente', $data['email_cliente']);
        
        if ($stmt->execute()) {
            $reparacion_id = $db->lastInsertId();
            
            // Registrar actividad si hay usuario logueado
            if ($usuario_id) {
                $query_actividad = "INSERT INTO actividad_usuario 
                                   (usuario_id, tipo_actividad, descripcion) 
                                   VALUES 
                                   (:usuario_id, 'reparacion', :descripcion)";
                
                $descripcion_actividad = 'Reparación solicitada: ' . $codigo;
                $stmt_actividad = $db->prepare($query_actividad);
                $stmt_actividad->bindParam(':usuario_id', $usuario_id);
                $stmt_actividad->bindParam(':descripcion', $descripcion_actividad);
                $stmt_actividad->execute();
            }
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Reparación registrada exitosamente',
                'data' => [
                    'id' => $reparacion_id,
                    'codigo' => $codigo
                ]
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear reparación: ' . $e->getMessage()
        ]);
    }
}

function actualizarReparacion($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de la reparación requerido'
            ]);
            return;
        }
        
        // Construir query dinámicamente según campos enviados
        $campos_actualizables = ['equipo', 'servicio', 'descripcion', 'precio', 
                                'tiempo_estimado', 'estado', 'nombre_cliente', 
                                'telefono_cliente', 'email_cliente', 'diagnostico', 
                                'observaciones'];
        
        $set_clause = [];
        $params = [':id' => $data['id']];
        
        foreach ($campos_actualizables as $campo) {
            if (isset($data[$campo])) {
                $set_clause[] = "$campo = :$campo";
                $params[":$campo"] = $data[$campo];
            }
        }
        
        if (empty($set_clause)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No hay campos para actualizar'
            ]);
            return;
        }
        
        // Si se actualiza el estado a 'entregado', registrar fecha de entrega
        if (isset($data['estado']) && $data['estado'] === 'entregado') {
            $set_clause[] = "fecha_entrega = NOW()";
        }
        
        $query = "UPDATE reparaciones SET " . implode(', ', $set_clause) . " WHERE id = :id";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            // Registrar actividad si hay usuario asociado
            $query_usuario = "SELECT usuario_id FROM reparaciones WHERE id = :id";
            $stmt_usuario = $db->prepare($query_usuario);
            $stmt_usuario->bindParam(':id', $data['id']);
            $stmt_usuario->execute();
            $reparacion = $stmt_usuario->fetch();
            
            if ($reparacion && $reparacion['usuario_id']) {
                $query_actividad = "INSERT INTO actividad_usuario 
                                   (usuario_id, tipo_actividad, descripcion) 
                                   VALUES 
                                   (:usuario_id, 'reparacion', :descripcion)";
                
                $descripcion_actividad = 'Reparación actualizada';
                if (isset($data['estado'])) {
                    $descripcion_actividad = 'Estado de reparación actualizado a: ' . $data['estado'];
                }
                
                $stmt_actividad = $db->prepare($query_actividad);
                $stmt_actividad->bindParam(':usuario_id', $reparacion['usuario_id']);
                $stmt_actividad->bindParam(':descripcion', $descripcion_actividad);
                $stmt_actividad->execute();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Reparación actualizada exitosamente'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar reparación: ' . $e->getMessage()
        ]);
    }
}

function eliminarReparacion($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de la reparación requerido'
            ]);
            return;
        }
        
        // Soft delete - cambiar estado a cancelado
        $query = "UPDATE reparaciones SET estado = 'cancelado' WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Reparación cancelada exitosamente'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al cancelar reparación: ' . $e->getMessage()
        ]);
    }
}
?>