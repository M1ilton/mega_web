<?php
/**
 * API Endpoint - Obtener información de seguimiento
 * Maneja seguimiento de pedidos y reparaciones
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

// Verificar conexión
if (!$db) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con la base de datos'
    ]);
    exit;
}

try {
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;
    $codigo = isset($_GET['codigo']) ? $_GET['codigo'] : null;
    
    if (!$tipo || !$codigo) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Faltan parámetros requeridos (tipo y codigo)'
        ]);
        exit;
    }
    
    if ($tipo === 'pedido') {
        obtenerSeguimientoPedido($db, $codigo);
    } elseif ($tipo === 'reparacion') {
        obtenerSeguimientoReparacion($db, $codigo);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Tipo de seguimiento no válido'
        ]);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor',
        'error' => $e->getMessage()
    ]);
}

function obtenerSeguimientoPedido($db, $codigo) {
    try {
        // Obtener información del pedido
        $query = "SELECT p.*, u.nombres, u.apellidos, u.email, u.telefono,
                  DATE_FORMAT(p.fecha_pedido, '%d/%m/%Y %h:%i %p') as fecha_formateada
                  FROM pedidos p 
                  LEFT JOIN usuarios u ON p.usuario_id = u.id
                  WHERE p.codigo = :codigo
                  LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':codigo', $codigo);
        $stmt->execute();
        
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$pedido) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Pedido no encontrado'
            ]);
            return;
        }
        
        // Calcular progreso basado en estado
        $progreso = 0;
        switch($pedido['estado']) {
            case 'pendiente':
                $progreso = 25;
                $estado_text = 'Pendiente de confirmación';
                break;
            case 'procesando':
                $progreso = 50;
                $estado_text = 'Pedido confirmado';
                break;
            case 'en_camino':
                $progreso = 75;
                $estado_text = 'En tránsito';
                break;
            case 'entregado':
                $progreso = 100;
                $estado_text = 'Entregado';
                break;
            case 'cancelado':
                $progreso = 0;
                $estado_text = 'Cancelado';
                break;
            default:
                $progreso = 25;
                $estado_text = 'Pendiente';
        }
        
        // Construir timeline
        $timeline = construirTimelinePedido($pedido['estado'], $pedido['fecha_pedido']);
        
        // Preparar respuesta
        $resultado = [
            'success' => true,
            'data' => [
                'tipo' => 'pedido',
                'numero' => $pedido['codigo'],
                'estado' => $estado_text,
                'progreso' => $progreso,
                'fecha' => date('d/m/Y', strtotime($pedido['fecha_pedido'])),
                'total' => floatval($pedido['total']),
                'cantidad_productos' => intval($pedido['productos']),
                'direccion_envio' => $pedido['direccion_envio'] ?? 'No especificada',
                'metodo_pago' => $pedido['metodo_pago'] ?? 'No especificado',
                'timeline' => $timeline,
                'cliente' => [
                    'nombre' => $pedido['nombres'] . ' ' . $pedido['apellidos'],
                    'email' => $pedido['email'],
                    'telefono' => $pedido['telefono']
                ]
            ]
        ];
        
        echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener seguimiento',
            'error' => $e->getMessage()
        ]);
    }
}

function obtenerSeguimientoReparacion($db, $codigo) {
    try {
        // Obtener información de la reparación
        $query = "SELECT r.*, u.nombres, u.apellidos, u.email, u.telefono,
                  DATE_FORMAT(r.fecha_ingreso, '%d/%m/%Y') as fecha_ingreso_formateada,
                  DATE_FORMAT(r.fecha_estimada_entrega, '%d/%m/%Y') as fecha_estimada_formateada
                  FROM reparaciones r 
                  LEFT JOIN usuarios u ON r.usuario_id = u.id
                  WHERE r.codigo = :codigo
                  LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':codigo', $codigo);
        $stmt->execute();
        
        $reparacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reparacion) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Reparación no encontrada'
            ]);
            return;
        }
        
        // Calcular progreso basado en estado
        $progreso = 0;
        switch($reparacion['estado']) {
            case 'recibido':
                $progreso = 20;
                $estado_text = 'Recibido';
                break;
            case 'en_diagnostico':
                $progreso = 40;
                $estado_text = 'En diagnóstico';
                break;
            case 'en_proceso':
                $progreso = 70;
                $estado_text = 'En proceso';
                break;
            case 'completado':
                $progreso = 90;
                $estado_text = 'Completado';
                break;
            case 'entregado':
                $progreso = 100;
                $estado_text = 'Entregado';
                break;
            case 'cancelado':
                $progreso = 0;
                $estado_text = 'Cancelado';
                break;
            default:
                $progreso = 20;
                $estado_text = 'Recibido';
        }
        
        // Construir timeline
        $timeline = construirTimelineReparacion($reparacion['estado'], $reparacion['fecha_ingreso']);
        
        // Usar datos del cliente de la tabla reparaciones si no hay usuario vinculado
        $nombre_cliente = $reparacion['nombres'] 
            ? $reparacion['nombres'] . ' ' . $reparacion['apellidos']
            : $reparacion['nombre_cliente'];
        $email_cliente = $reparacion['email'] ?? $reparacion['email_cliente'];
        $telefono_cliente = $reparacion['telefono'] ?? $reparacion['telefono_cliente'];
        
        // Preparar respuesta
        $resultado = [
            'success' => true,
            'data' => [
                'tipo' => 'reparacion',
                'numero' => $reparacion['codigo'],
                'estado' => $estado_text,
                'progreso' => $progreso,
                'equipo' => $reparacion['equipo'],
                'servicio' => $reparacion['servicio'],
                'descripcion_problema' => $reparacion['descripcion'] ?? $reparacion['diagnostico'] ?? 'Sin descripción',
                'tecnico' => 'Técnico Asignado',
                'fechaIngreso' => $reparacion['fecha_ingreso_formateada'],
                'fechaEstimada' => $reparacion['fecha_estimada_formateada'] ?? 'Por confirmar',
                'precio' => floatval($reparacion['precio']),
                'observaciones' => $reparacion['observaciones'] ?? '',
                'timeline' => $timeline,
                'cliente' => [
                    'nombre' => $nombre_cliente,
                    'email' => $email_cliente,
                    'telefono' => $telefono_cliente
                ]
            ]
        ];
        
        echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener seguimiento',
            'error' => $e->getMessage()
        ]);
    }
}

function construirTimelinePedido($estado_actual, $fecha_pedido) {
    $timeline = [];
    $fecha = new DateTime($fecha_pedido);
    
    // Evento 1: Pedido confirmado
    $timeline[] = [
        'fecha' => $fecha->format('d/m/Y h:i A'),
        'estado' => 'Pedido confirmado',
        'completado' => true
    ];
    
    // Evento 2: Pedido empacado
    if (in_array($estado_actual, ['procesando', 'en_camino', 'entregado'])) {
        $fecha->modify('+4 hours');
        $timeline[] = [
            'fecha' => $fecha->format('d/m/Y h:i A'),
            'estado' => 'Pedido empacado',
            'completado' => true
        ];
    } else {
        $timeline[] = [
            'fecha' => 'Pendiente',
            'estado' => 'Pedido empacado',
            'completado' => false
        ];
    }
    
    // Evento 3: En camino
    if (in_array($estado_actual, ['en_camino', 'entregado'])) {
        $fecha->modify('+1 day');
        $timeline[] = [
            'fecha' => $fecha->format('d/m/Y h:i A'),
            'estado' => 'En camino',
            'completado' => true
        ];
    } else {
        $timeline[] = [
            'fecha' => 'Pendiente',
            'estado' => 'En camino',
            'completado' => false
        ];
    }
    
    // Evento 4: Entregado
    if ($estado_actual === 'entregado') {
        $fecha->modify('+1 day');
        $timeline[] = [
            'fecha' => $fecha->format('d/m/Y h:i A'),
            'estado' => 'Entregado',
            'completado' => true
        ];
    } else {
        $fecha->modify('+1 day');
        $timeline[] = [
            'fecha' => 'Estimado: ' . $fecha->format('d/m/Y'),
            'estado' => 'Entregado',
            'completado' => false
        ];
    }
    
    return $timeline;
}

function construirTimelineReparacion($estado_actual, $fecha_ingreso) {
    $timeline = [];
    $fecha = new DateTime($fecha_ingreso);
    
    // Evento 1: Recepción del equipo
    $timeline[] = [
        'fecha' => $fecha->format('d/m/Y h:i A'),
        'estado' => 'Recepción del equipo',
        'completado' => true
    ];
    
    // Evento 2: Diagnóstico
    if (in_array($estado_actual, ['en_diagnostico', 'en_proceso', 'completado', 'entregado'])) {
        $fecha->modify('+3 hours');
        $timeline[] = [
            'fecha' => $fecha->format('d/m/Y h:i A'),
            'estado' => 'Diagnóstico completado',
            'completado' => true
        ];
    } else {
        $timeline[] = [
            'fecha' => 'Pendiente',
            'estado' => 'Diagnóstico completado',
            'completado' => false
        ];
    }
    
    // Evento 3: Reparación en proceso
    if (in_array($estado_actual, ['en_proceso', 'completado', 'entregado'])) {
        $fecha->modify('+1 day');
        $timeline[] = [
            'fecha' => $fecha->format('d/m/Y h:i A'),
            'estado' => 'Reparación en proceso',
            'completado' => true
        ];
    } else {
        $timeline[] = [
            'fecha' => 'Pendiente',
            'estado' => 'Reparación en proceso',
            'completado' => false
        ];
    }
    
    // Evento 4: Listo para retirar
    if (in_array($estado_actual, ['completado', 'entregado'])) {
        $fecha->modify('+1 day');
        $timeline[] = [
            'fecha' => $fecha->format('d/m/Y h:i A'),
            'estado' => 'Listo para retirar',
            'completado' => true
        ];
    } else {
        $fecha->modify('+2 days');
        $timeline[] = [
            'fecha' => 'Estimado: ' . $fecha->format('d/m/Y'),
            'estado' => 'Listo para retirar',
            'completado' => false
        ];
    }
    
    return $timeline;
}
?>