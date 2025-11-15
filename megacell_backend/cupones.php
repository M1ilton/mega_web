<?php
/**
 * API para gestión de cupones
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        obtenerCupones($db);
        break;
    case 'POST':
        validarCupon($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

function obtenerCupones($db) {
    try {
        $query = "SELECT id, codigo, descripcion, tipo_descuento, valor_descuento, 
                         fecha_inicio, fecha_expiracion, usos_maximos, activo
                  FROM cupones 
                  WHERE activo = 1 
                  AND fecha_expiracion >= CURDATE()
                  ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $cupones = $stmt->fetchAll();
        
        foreach ($cupones as &$cupon) {
            $cupon['valor_descuento'] = (float)$cupon['valor_descuento'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $cupones
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener cupones: ' . $e->getMessage()
        ]);
    }
}

function validarCupon($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['codigo'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Código de cupón requerido'
            ]);
            return;
        }
        
        $codigo = strtoupper(trim($data['codigo']));
        $usuario_id = isset($data['usuario_id']) ? $data['usuario_id'] : null;
        $total = isset($data['total']) ? $data['total'] : 0;
        
        // Buscar cupón
        $query = "SELECT * FROM cupones 
                  WHERE codigo = :codigo 
                  AND activo = 1 
                  AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
                  AND fecha_expiracion >= CURDATE()
                  LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':codigo', $codigo);
        $stmt->execute();
        
        $cupon = $stmt->fetch();
        
        if (!$cupon) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Cupón no válido o expirado'
            ]);
            return;
        }
        
        // Verificar usos totales
        $query_usos = "SELECT COUNT(*) as total_usos FROM cupones_usados WHERE cupon_id = :cupon_id";
        $stmt_usos = $db->prepare($query_usos);
        $stmt_usos->bindParam(':cupon_id', $cupon['id']);
        $stmt_usos->execute();
        $usos = $stmt_usos->fetch();
        
        if ($usos['total_usos'] >= $cupon['usos_maximos']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Este cupón ha alcanzado su límite de usos'
            ]);
            return;
        }
        
        // Verificar usos por usuario si se proporciona usuario_id
        if ($usuario_id) {
            $query_usos_usuario = "SELECT COUNT(*) as usos_usuario 
                                  FROM cupones_usados 
                                  WHERE cupon_id = :cupon_id 
                                  AND usuario_id = :usuario_id";
            $stmt_usos_usuario = $db->prepare($query_usos_usuario);
            $stmt_usos_usuario->bindParam(':cupon_id', $cupon['id']);
            $stmt_usos_usuario->bindParam(':usuario_id', $usuario_id);
            $stmt_usos_usuario->execute();
            $usos_usuario = $stmt_usos_usuario->fetch();
            
            if ($usos_usuario['usos_usuario'] >= $cupon['usos_por_usuario']) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya has usado este cupón el máximo de veces permitidas'
                ]);
                return;
            }
        }
        
        // Calcular descuento
        $descuento = 0;
        $descripcion_descuento = '';
        
        switch ($cupon['tipo_descuento']) {
            case 'porcentaje':
                $descuento = $total * ($cupon['valor_descuento'] / 100);
                $descripcion_descuento = $cupon['valor_descuento'] . '% de descuento';
                break;
            case 'fijo':
                $descuento = min($cupon['valor_descuento'], $total);
                $descripcion_descuento = '$' . number_format($cupon['valor_descuento'], 0) . ' de descuento';
                break;
            case 'envio_gratis':
                $descuento = 0; // El descuento de envío se maneja por separado
                $descripcion_descuento = 'Envío gratis';
                break;
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Cupón válido',
            'data' => [
                'id' => $cupon['id'],
                'codigo' => $cupon['codigo'],
                'descripcion' => $cupon['descripcion'],
                'tipo_descuento' => $cupon['tipo_descuento'],
                'valor_descuento' => (float)$cupon['valor_descuento'],
                'descuento_aplicado' => $descuento,
                'descripcion_descuento' => $descripcion_descuento,
                'nuevo_total' => $total - $descuento
            ]
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al validar cupón: ' . $e->getMessage()
        ]);
    }
}
?>
