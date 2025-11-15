<?php
/**
 * API Endpoint - Gestión de Garantías
 * Crear, consultar y gestionar garantías
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        consultarGarantia($db);
        break;
    case 'POST':
        crearGarantia($db);
        break;
    case 'PUT':
        actualizarGarantia($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

function consultarGarantia($db) {
    try {
        $numero_factura = isset($_GET['numero_factura']) ? $_GET['numero_factura'] : null;
        
        if (!$numero_factura) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Número de factura requerido'
            ]);
            return;
        }
        
        // Buscar garantía asociada a pedidos
        $query_pedido = "SELECT 
                            g.*,
                            p.codigo as numero_factura,
                            p.fecha_pedido,
                            'pedido' as tipo_servicio,
                            CONCAT('Productos del pedido: ', p.productos) as producto_servicio,
                            u.nombres,
                            u.apellidos,
                            u.email,
                            u.telefono
                         FROM garantias g
                         INNER JOIN pedidos p ON g.pedido_id = p.id
                         LEFT JOIN usuarios u ON p.usuario_id = u.id
                         WHERE p.codigo = :numero_factura
                         LIMIT 1";
        
        $stmt = $db->prepare($query_pedido);
        $stmt->bindParam(':numero_factura', $numero_factura);
        $stmt->execute();
        
        $garantia = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Si no se encuentra en pedidos, buscar en reparaciones
        if (!$garantia) {
            $query_reparacion = "SELECT 
                                    g.*,
                                    r.codigo as numero_factura,
                                    r.fecha_ingreso as fecha_pedido,
                                    'reparacion' as tipo_servicio,
                                    CONCAT(r.equipo, ' - ', r.servicio) as producto_servicio,
                                    u.nombres,
                                    u.apellidos,
                                    u.email,
                                    u.telefono
                                 FROM garantias g
                                 INNER JOIN reparaciones r ON g.reparacion_id = r.id
                                 LEFT JOIN usuarios u ON r.usuario_id = u.id
                                 WHERE r.codigo = :numero_factura
                                 LIMIT 1";
            
            $stmt = $db->prepare($query_reparacion);
            $stmt->bindParam(':numero_factura', $numero_factura);
            $stmt->execute();
            
            $garantia = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        if (!$garantia) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'No se encontró una garantía asociada a este número de factura'
            ]);
            return;
        }
        
        // Calcular estado de la garantía
        $fecha_actual = new DateTime();
        $fecha_vencimiento = new DateTime($garantia['fecha_vencimiento']);
        $estado = ($fecha_actual <= $fecha_vencimiento) ? 'Activa' : 'Vencida';
        
        $dias_restantes = $fecha_actual->diff($fecha_vencimiento)->days;
        if ($fecha_actual > $fecha_vencimiento) {
            $dias_restantes = -$dias_restantes;
        }
        
        $resultado = [
            'success' => true,
            'data' => [
                'numeroFactura' => $garantia['numero_factura'],
                'producto' => $garantia['producto_servicio'],
                'fechaServicio' => date('d/m/Y', strtotime($garantia['fecha_pedido'])),
                'fechaVencimiento' => date('d/m/Y', strtotime($garantia['fecha_vencimiento'])),
                'estado' => $estado,
                'diasRestantes' => $dias_restantes,
                'cobertura' => $garantia['tipo_cobertura'],
                'detalles' => $garantia['detalles_cobertura'],
                'tipoServicio' => $garantia['tipo_servicio'],
                'cliente' => [
                    'nombre' => $garantia['nombres'] . ' ' . $garantia['apellidos'],
                    'email' => $garantia['email'],
                    'telefono' => $garantia['telefono']
                ]
            ]
        ];
        
        echo json_encode($resultado);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al consultar garantía: ' . $e->getMessage()
        ]);
    }
}

function crearGarantia($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos requeridos
        if (!isset($data['tipo']) || !isset($data['referencia_id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ]);
            return;
        }
        
        $db->beginTransaction();
        
        // Determinar duración de la garantía según el tipo
        $duracion_dias = 30; // Por defecto 30 días
        $tipo_cobertura = 'Defectos de fabricación y mano de obra';
        
        if ($data['tipo'] === 'reparacion') {
            $duracion_dias = isset($data['duracion_dias']) ? $data['duracion_dias'] : 30;
            $tipo_cobertura = 'Mano de obra y repuestos utilizados';
        } elseif ($data['tipo'] === 'producto') {
            $duracion_dias = isset($data['duracion_dias']) ? $data['duracion_dias'] : 90;
            $tipo_cobertura = 'Defectos de fabricación';
        }
        
        $fecha_inicio = date('Y-m-d');
        $fecha_vencimiento = date('Y-m-d', strtotime("+$duracion_dias days"));
        
        // Insertar garantía
        $query = "INSERT INTO garantias 
                  (pedido_id, reparacion_id, fecha_inicio, fecha_vencimiento, 
                   tipo_cobertura, detalles_cobertura, estado, created_at) 
                  VALUES 
                  (:pedido_id, :reparacion_id, :fecha_inicio, :fecha_vencimiento, 
                   :tipo_cobertura, :detalles_cobertura, 'activa', NOW())";
        
        $stmt = $db->prepare($query);
        
        $pedido_id = ($data['tipo'] === 'pedido') ? $data['referencia_id'] : null;
        $reparacion_id = ($data['tipo'] === 'reparacion') ? $data['referencia_id'] : null;
        $detalles = isset($data['detalles']) ? $data['detalles'] : 'Garantía estándar según política de la empresa';
        
        $stmt->bindParam(':pedido_id', $pedido_id);
        $stmt->bindParam(':reparacion_id', $reparacion_id);
        $stmt->bindParam(':fecha_inicio', $fecha_inicio);
        $stmt->bindParam(':fecha_vencimiento', $fecha_vencimiento);
        $stmt->bindParam(':tipo_cobertura', $tipo_cobertura);
        $stmt->bindParam(':detalles_cobertura', $detalles);
        
        if (!$stmt->execute()) {
            $db->rollBack();
            throw new Exception('Error al crear la garantía');
        }
        
        $garantia_id = $db->lastInsertId();
        
        $db->commit();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Garantía creada exitosamente',
            'data' => [
                'garantia_id' => $garantia_id,
                'fecha_inicio' => $fecha_inicio,
                'fecha_vencimiento' => $fecha_vencimiento,
                'duracion_dias' => $duracion_dias
            ]
        ]);
        
    } catch(Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear garantía: ' . $e->getMessage()
        ]);
    }
}

function actualizarGarantia($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id']) || !isset($data['estado'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ]);
            return;
        }
        
        $query = "UPDATE garantias 
                  SET estado = :estado,
                      observaciones = :observaciones,
                      updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':estado', $data['estado']);
        $observaciones = isset($data['observaciones']) ? $data['observaciones'] : null;
        $stmt->bindParam(':observaciones', $observaciones);
        $stmt->bindParam(':id', $data['id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Garantía actualizada exitosamente'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar garantía: ' . $e->getMessage()
        ]);
    }
}
?>