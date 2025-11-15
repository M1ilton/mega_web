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
            obtenerGarantias($conn);
            break;
            
        case 'POST':
            crearGarantia($conn);
            break;
            
        case 'PUT':
            actualizarGarantia($conn);
            break;
            
        case 'DELETE':
            eliminarGarantia($conn);
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

function obtenerGarantias($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                g.id,
                g.pedido_id,
                g.reparacion_id,
                g.fecha_inicio,
                g.fecha_vencimiento,
                g.tipo_cobertura,
                g.detalles_cobertura,
                g.estado,
                g.observaciones,
                g.created_at,
                g.updated_at,
                
                -- Generar código único
                CASE 
                    WHEN g.pedido_id IS NOT NULL THEN CONCAT('GAR-PED-', LPAD(g.pedido_id, 5, '0'))
                    WHEN g.reparacion_id IS NOT NULL THEN CONCAT('GAR-REP-', LPAD(g.reparacion_id, 5, '0'))
                    ELSE CONCAT('GAR-', LPAD(g.id, 5, '0'))
                END as codigo,
                
                -- Información del pedido
                p.codigo as pedido_codigo,
                p.usuario_id as pedido_usuario_id,
                
                -- Información de reparación
                r.codigo as reparacion_codigo,
                r.usuario_id as reparacion_usuario_id,
                r.equipo as reparacion_equipo,
                r.servicio as reparacion_servicio,
                r.precio as costo_reparacion,
                
                -- Información del usuario (desde pedido o reparación)
                COALESCE(
                    CONCAT(up.nombres, ' ', up.apellidos),
                    CONCAT(ur.nombres, ' ', ur.apellidos)
                ) as nombre_cliente,
                COALESCE(up.telefono, ur.telefono) as telefono,
                COALESCE(up.email, ur.email) as email,
                COALESCE(up.id, ur.id) as usuario_id,
                
                -- Campo producto (desde pedido o reparación)
                CASE 
                    WHEN g.pedido_id IS NOT NULL THEN 'Pedido de productos'
                    WHEN g.reparacion_id IS NOT NULL THEN r.equipo
                    ELSE 'Sin especificar'
                END as producto,
                
                -- Campo problema (desde tipo de cobertura o servicio)
                CASE 
                    WHEN g.reparacion_id IS NOT NULL THEN r.servicio
                    ELSE g.tipo_cobertura
                END as problema,
                
                g.fecha_inicio as fecha_reclamo
                
            FROM garantias g
            LEFT JOIN pedidos p ON g.pedido_id = p.id
            LEFT JOIN reparaciones r ON g.reparacion_id = r.id
            LEFT JOIN usuarios up ON p.usuario_id = up.id
            LEFT JOIN usuarios ur ON r.usuario_id = ur.id
            ORDER BY g.created_at DESC
        ");
        
        $stmt->execute();
        $garantias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'garantias' => $garantias
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener garantías: ' . $e->getMessage()
        ]);
    }
}

function crearGarantia($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Log para debugging
        error_log("Datos recibidos: " . json_encode($data));
        
        // Validar campos requeridos - SIMPLIFICADO
        if (empty($data['fecha_vencimiento'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'La fecha de vencimiento es obligatoria'
            ]);
            return;
        }
        
        // Obtener tipo_cobertura desde producto o tipo_cobertura
        $tipo_cobertura = !empty($data['tipo_cobertura']) 
            ? $data['tipo_cobertura'] 
            : (!empty($data['producto']) ? $data['producto'] : 'Cobertura general');
        
        // Obtener detalles_cobertura desde problema o detalles_cobertura
        $detalles_cobertura = !empty($data['detalles_cobertura']) 
            ? $data['detalles_cobertura'] 
            : (!empty($data['problema']) ? $data['problema'] : null);
        
        // Obtener observaciones desde solucion u observaciones
        $observaciones = !empty($data['observaciones']) 
            ? $data['observaciones'] 
            : (!empty($data['solucion']) ? $data['solucion'] : null);
        
        // Determinar si es pedido o reparación basado en el usuario
        $pedido_id = null;
        $reparacion_id = null;
        
        // Si viene un usuario_id, intentar encontrar una reparación o pedido
        if (!empty($data['usuario_id'])) {
            // Primero intentar encontrar una reparación reciente
            $stmtRep = $conn->prepare("
                SELECT id, precio FROM reparaciones 
                WHERE usuario_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmtRep->execute([$data['usuario_id']]);
            $reparacion = $stmtRep->fetch(PDO::FETCH_ASSOC);
            
            if ($reparacion) {
                $reparacion_id = $reparacion['id'];
            } else {
                // Si no hay reparación, buscar último pedido
                $stmtPed = $conn->prepare("
                    SELECT id FROM pedidos 
                    WHERE usuario_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ");
                $stmtPed->execute([$data['usuario_id']]);
                $pedido = $stmtPed->fetch(PDO::FETCH_ASSOC);
                
                if ($pedido) {
                    $pedido_id = $pedido['id'];
                }
            }
        }
        
        // Insertar garantía
        $stmt = $conn->prepare("
            INSERT INTO garantias 
            (pedido_id, reparacion_id, fecha_inicio, fecha_vencimiento, tipo_cobertura, detalles_cobertura, estado, observaciones)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $pedido_id,
            $reparacion_id,
            $data['fecha_vencimiento'],
            $tipo_cobertura,
            $detalles_cobertura,
            $data['estado'] ?? 'activa',
            $observaciones
        ]);
        
        $id = $conn->lastInsertId();
        
        // Generar código
        if ($pedido_id) {
            $codigo = 'GAR-PED-' . str_pad($pedido_id, 5, '0', STR_PAD_LEFT);
        } elseif ($reparacion_id) {
            $codigo = 'GAR-REP-' . str_pad($reparacion_id, 5, '0', STR_PAD_LEFT);
        } else {
            $codigo = 'GAR-' . str_pad($id, 5, '0', STR_PAD_LEFT);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Garantía creada exitosamente',
            'id' => $id,
            'codigo' => $codigo
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear garantía: ' . $e->getMessage()
        ]);
    }
}

function actualizarGarantia($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de garantía no proporcionado'
            ]);
            return;
        }
        
        // Log para debugging
        error_log("Actualizando garantía ID: $id con datos: " . json_encode($data));
        
        // Obtener valores con fallback
        $tipo_cobertura = !empty($data['tipo_cobertura']) 
            ? $data['tipo_cobertura'] 
            : (!empty($data['producto']) ? $data['producto'] : 'Cobertura general');
        
        $detalles_cobertura = !empty($data['detalles_cobertura']) 
            ? $data['detalles_cobertura'] 
            : (!empty($data['problema']) ? $data['problema'] : null);
        
        $observaciones = !empty($data['observaciones']) 
            ? $data['observaciones'] 
            : (!empty($data['solucion']) ? $data['solucion'] : null);
        
        // Actualizar garantía
        $stmt = $conn->prepare("
            UPDATE garantias 
            SET fecha_vencimiento = ?, 
                tipo_cobertura = ?, 
                detalles_cobertura = ?, 
                estado = ?, 
                observaciones = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['fecha_vencimiento'],
            $tipo_cobertura,
            $detalles_cobertura,
            $data['estado'] ?? 'activa',
            $observaciones,
            $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Garantía actualizada exitosamente'
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
            'message' => 'Error al actualizar garantía: ' . $e->getMessage()
        ]);
    }
}

function eliminarGarantia($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de garantía no proporcionado'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("DELETE FROM garantias WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Garantía eliminada exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Garantía no encontrada'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar garantía: ' . $e->getMessage()
        ]);
    }
}
?>