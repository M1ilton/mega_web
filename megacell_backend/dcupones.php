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
            obtenerCupones($conn);
            break;
            
        case 'POST':
            crearCupon($conn);
            break;
            
        case 'PUT':
            actualizarCupon($conn);
            break;
            
        case 'DELETE':
            eliminarCupon($conn);
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

function obtenerCupones($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                c.id,
                c.codigo,
                c.descripcion,
                c.tipo_descuento,
                c.valor_descuento,
                c.fecha_inicio,
                c.fecha_expiracion,
                c.usos_maximos,
                c.usos_por_usuario,
                c.activo,
                c.created_at,
                
                -- Contar usos del cupón
                COALESCE(COUNT(cu.id), 0) as total_usos
                
            FROM cupones c
            LEFT JOIN cupones_usados cu ON c.id = cu.cupon_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        ");
        
        $stmt->execute();
        $cupones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'cupones' => $cupones
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener cupones: ' . $e->getMessage()
        ]);
    }
}

function crearCupon($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Log para debugging
        error_log("Datos recibidos: " . json_encode($data));
        
        // Validar campos requeridos
        if (empty($data['codigo'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El código del cupón es obligatorio'
            ]);
            return;
        }
        
        // Validar que el código no exista
        $stmtCheck = $conn->prepare("SELECT id FROM cupones WHERE codigo = ?");
        $stmtCheck->execute([$data['codigo']]);
        if ($stmtCheck->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El código del cupón ya existe'
            ]);
            return;
        }
        
        // Validar tipo de descuento
        $tiposPermitidos = ['porcentaje', 'fijo', 'envio_gratis'];
        if (!in_array($data['tipo_descuento'], $tiposPermitidos)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Tipo de descuento no válido'
            ]);
            return;
        }
        
        // Validar valor de descuento
        if ($data['tipo_descuento'] !== 'envio_gratis') {
            if (empty($data['valor_descuento']) || $data['valor_descuento'] <= 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El valor del descuento debe ser mayor a 0'
                ]);
                return;
            }
            
            if ($data['tipo_descuento'] === 'porcentaje' && $data['valor_descuento'] > 100) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El porcentaje no puede ser mayor a 100'
                ]);
                return;
            }
        }
        
        // Validar fechas
        if (empty($data['fecha_inicio']) || empty($data['fecha_expiracion'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Las fechas de inicio y expiración son obligatorias'
            ]);
            return;
        }
        
        if ($data['fecha_expiracion'] < $data['fecha_inicio']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'La fecha de expiración debe ser posterior a la fecha de inicio'
            ]);
            return;
        }
        
        // Insertar cupón
        $stmt = $conn->prepare("
            INSERT INTO cupones 
            (codigo, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_expiracion, usos_maximos, usos_por_usuario, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $valor = ($data['tipo_descuento'] === 'envio_gratis') ? 0 : $data['valor_descuento'];
        
        $stmt->execute([
            strtoupper($data['codigo']),
            $data['descripcion'] ?? null,
            $data['tipo_descuento'],
            $valor,
            $data['fecha_inicio'],
            $data['fecha_expiracion'],
            $data['usos_maximos'] ?? 100,
            $data['usos_por_usuario'] ?? 1,
            $data['activo'] ?? 1
        ]);
        
        $id = $conn->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Cupón creado exitosamente',
            'id' => $id
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear cupón: ' . $e->getMessage()
        ]);
    }
}

function actualizarCupon($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de cupón no proporcionado'
            ]);
            return;
        }
        
        // Log para debugging
        error_log("Actualizando cupón ID: $id con datos: " . json_encode($data));
        
        // Validar que el cupón existe
        $stmtCheck = $conn->prepare("SELECT id FROM cupones WHERE id = ?");
        $stmtCheck->execute([$id]);
        if (!$stmtCheck->fetch()) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Cupón no encontrado'
            ]);
            return;
        }
        
        // Validar código único (si se está cambiando)
        if (!empty($data['codigo'])) {
            $stmtCheck = $conn->prepare("SELECT id FROM cupones WHERE codigo = ? AND id != ?");
            $stmtCheck->execute([$data['codigo'], $id]);
            if ($stmtCheck->fetch()) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El código del cupón ya existe'
                ]);
                return;
            }
        }
        
        // Validar valor de descuento si se proporciona
        if (isset($data['valor_descuento']) && $data['tipo_descuento'] !== 'envio_gratis') {
            if ($data['valor_descuento'] <= 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El valor del descuento debe ser mayor a 0'
                ]);
                return;
            }
            
            if ($data['tipo_descuento'] === 'porcentaje' && $data['valor_descuento'] > 100) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'El porcentaje no puede ser mayor a 100'
                ]);
                return;
            }
        }
        
        // Validar fechas si se proporcionan
        if (!empty($data['fecha_inicio']) && !empty($data['fecha_expiracion'])) {
            if ($data['fecha_expiracion'] < $data['fecha_inicio']) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'La fecha de expiración debe ser posterior a la fecha de inicio'
                ]);
                return;
            }
        }
        
        // Actualizar cupón
        $valor = ($data['tipo_descuento'] === 'envio_gratis') ? 0 : ($data['valor_descuento'] ?? null);
        
        $stmt = $conn->prepare("
            UPDATE cupones 
            SET codigo = ?,
                descripcion = ?,
                tipo_descuento = ?,
                valor_descuento = ?,
                fecha_inicio = ?,
                fecha_expiracion = ?,
                usos_maximos = ?,
                usos_por_usuario = ?,
                activo = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            strtoupper($data['codigo']),
            $data['descripcion'] ?? null,
            $data['tipo_descuento'],
            $valor,
            $data['fecha_inicio'],
            $data['fecha_expiracion'],
            $data['usos_maximos'] ?? 100,
            $data['usos_por_usuario'] ?? 1,
            $data['activo'] ?? 1,
            $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Cupón actualizado exitosamente'
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
            'message' => 'Error al actualizar cupón: ' . $e->getMessage()
        ]);
    }
}

function eliminarCupon($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de cupón no proporcionado'
            ]);
            return;
        }
        
        // Verificar si el cupón tiene usos registrados
        $stmtCheck = $conn->prepare("SELECT COUNT(*) as total FROM cupones_usados WHERE cupon_id = ?");
        $stmtCheck->execute([$id]);
        $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            // En lugar de eliminar, desactivar el cupón
            $stmt = $conn->prepare("UPDATE cupones SET activo = 0 WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'El cupón fue desactivado porque tiene usos registrados'
            ]);
        } else {
            // Eliminar cupón si no tiene usos
            $stmt = $conn->prepare("DELETE FROM cupones WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Cupón eliminado exitosamente'
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cupón no encontrado'
                ]);
            }
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar cupón: ' . $e->getMessage()
        ]);
    }
}
?>