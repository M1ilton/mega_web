<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Error al conectar con la base de datos");
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            obtenerPedidos($db);
            break;
        case 'POST':
            crearPedido($db);
            break;
        case 'PUT':
            actualizarEstadoPedido($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            break;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $e->getMessage()
    ]);
}

function obtenerPedidos($db) {
    try {
        $usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : null;
        
        $query = "SELECT p.*, u.nombres, u.apellidos, u.email, u.telefono 
                  FROM pedidos p 
                  LEFT JOIN usuarios u ON p.usuario_id = u.id";
        
        if ($usuario_id) {
            $query .= " WHERE p.usuario_id = :usuario_id";
        }
        
        $query .= " ORDER BY p.fecha_pedido DESC";
        
        $stmt = $db->prepare($query);
        
        if ($usuario_id) {
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($pedidos as &$pedido) {
            $pedido['total'] = (float)$pedido['total'];
            $pedido['productos'] = (int)$pedido['productos'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $pedidos,
            'count' => count($pedidos)
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener pedidos: ' . $e->getMessage()
        ]);
    }
}

function crearPedido($db) {
    try {
        $rawData = file_get_contents("php://input");
        error_log("Datos recibidos: " . $rawData); // Para debugging
        
        $data = json_decode($rawData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Error al procesar datos JSON: ' . json_last_error_msg()
            ]);
            return;
        }
        
        // Validar datos requeridos
        if (!isset($data['carrito']) || empty($data['carrito'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El carrito está vacío'
            ]);
            return;
        }
        
        if (!isset($data['datosEnvio']) || empty($data['datosEnvio'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos de envío'
            ]);
            return;
        }
        
        $db->beginTransaction();
        
        // Calcular total y cantidad de productos
        $total = 0;
        $cantidad_productos = 0;
        
        foreach ($data['carrito'] as $item) {
            $precio = floatval($item['precio']);
            $cantidad = intval($item['cantidad']);
            $total += $precio * $cantidad;
            $cantidad_productos += $cantidad;
        }
        
        // Aplicar descuento de cupón si existe
        $descuento = 0;
        $cupon_id = null;
        
        if (isset($data['cupon']) && !empty($data['cupon'])) {
            $cuponInfo = validarCupon($db, $data['cupon']);
            if ($cuponInfo) {
                $cupon_id = intval($cuponInfo['id']);
                if ($cuponInfo['tipo_descuento'] == 'porcentaje') {
                    $descuento = $total * (floatval($cuponInfo['valor_descuento']) / 100);
                } else if ($cuponInfo['tipo_descuento'] == 'fijo') {
                    $descuento = floatval($cuponInfo['valor_descuento']);
                }
                $total -= $descuento;
            }
        }
        
        // Generar código único para el pedido
        $codigo = 'PED-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        // Buscar o crear usuario basado en email
        $usuario_id = obtenerOCrearUsuario($db, $data['datosEnvio']);
        
        // Crear dirección de envío
        $direccion_completa = $data['datosEnvio']['direccion'] . ', ' . 
                             $data['datosEnvio']['ciudad'];
        
        // Insertar pedido
        $metodo_pago = $data['datosEnvio']['metodoPago'];
        
        $query = "INSERT INTO pedidos 
                  (codigo, usuario_id, estado, total, productos, direccion_envio, metodo_pago, fecha_pedido) 
                  VALUES 
                  (:codigo, :usuario_id, 'pendiente', :total, :productos, :direccion_envio, :metodo_pago, NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':codigo', $codigo, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':total', $total);
        $stmt->bindParam(':productos', $cantidad_productos, PDO::PARAM_INT);
        $stmt->bindParam(':direccion_envio', $direccion_completa, PDO::PARAM_STR);
        $stmt->bindParam(':metodo_pago', $metodo_pago, PDO::PARAM_STR);
        
        if (!$stmt->execute()) {
            $db->rollBack();
            throw new Exception('Error al crear el pedido en la base de datos');
        }
        
        $pedido_id = $db->lastInsertId();
        
        // Actualizar stock de productos
        foreach ($data['carrito'] as $item) {
            $producto_id = intval($item['id']);
            $cantidad = intval($item['cantidad']);
            
            $query_stock = "UPDATE productos 
                           SET stock = stock - :cantidad 
                           WHERE id = :producto_id AND stock >= :cantidad";
            
            $stmt_stock = $db->prepare($query_stock);
            $stmt_stock->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
            $stmt_stock->bindParam(':producto_id', $producto_id, PDO::PARAM_INT);
            
            if (!$stmt_stock->execute() || $stmt_stock->rowCount() == 0) {
                $db->rollBack();
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Stock insuficiente para ' . $item['nombre']
                ]);
                return;
            }
        }
        
        // Registrar uso de cupón si existe
        if ($cupon_id) {
            $query_cupon = "INSERT INTO cupones_usados (cupon_id, usuario_id, pedido_id) 
                           VALUES (:cupon_id, :usuario_id, :pedido_id)";
            $stmt_cupon = $db->prepare($query_cupon);
            $stmt_cupon->bindParam(':cupon_id', $cupon_id, PDO::PARAM_INT);
            $stmt_cupon->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt_cupon->bindParam(':pedido_id', $pedido_id, PDO::PARAM_INT);
            $stmt_cupon->execute();
        }
        
        // Registrar actividad del usuario
        $query_actividad = "INSERT INTO actividad_usuario 
                           (usuario_id, tipo_actividad, descripcion) 
                           VALUES 
                           (:usuario_id, 'pedido', :descripcion)";
        
        $descripcion = 'Pedido realizado: ' . $codigo;
        $stmt_actividad = $db->prepare($query_actividad);
        $stmt_actividad->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt_actividad->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
        $stmt_actividad->execute();
        
        $db->commit();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Pedido creado exitosamente',
            'data' => [
                'pedido_id' => $pedido_id,
                'codigo' => $codigo,
                'total' => $total,
                'descuento' => $descuento
            ]
        ]);
        
    } catch(Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Error en crearPedido: " . $e->getMessage()); // Para debugging
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear pedido: ' . $e->getMessage()
        ]);
    }
}

function actualizarEstadoPedido($db) {
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
        
        $query = "UPDATE pedidos SET estado = :estado WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':estado', $data['estado'], PDO::PARAM_STR);
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Estado del pedido actualizado'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar pedido: ' . $e->getMessage()
        ]);
    }
}

function obtenerOCrearUsuario($db, $datosEnvio) {
    // Buscar usuario por email
    $query = "SELECT id FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $email = $datosEnvio['email'];
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario) {
        return intval($usuario['id']);
    }
    
    // Crear nuevo usuario si no existe
    // Separar nombre completo en nombres y apellidos
    $nombreCompleto = explode(' ', $datosEnvio['nombre']);
    $nombres = $nombreCompleto[0];
    $apellidos = isset($nombreCompleto[1]) ? implode(' ', array_slice($nombreCompleto, 1)) : 'Sin apellido';
    
    // Generar identificación temporal
    $identificacion_temp = 'TEMP-' . time() . rand(1000, 9999);
    
    // Generar fecha de nacimiento por defecto
    $fecha_nacimiento = date('Y-m-d', strtotime('-18 years'));
    
    $telefono = $datosEnvio['telefono'];
    $ciudad = $datosEnvio['ciudad'];
    
    $query = "INSERT INTO usuarios 
              (identificacion, nombres, apellidos, email, telefono, municipio, rol, estado, contrasena, fecha_nacimiento) 
              VALUES 
              (:identificacion, :nombres, :apellidos, :email, :telefono, :municipio, 'cliente', 'activo', '', :fecha_nacimiento)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':identificacion', $identificacion_temp, PDO::PARAM_STR);
    $stmt->bindParam(':nombres', $nombres, PDO::PARAM_STR);
    $stmt->bindParam(':apellidos', $apellidos, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':telefono', $telefono, PDO::PARAM_STR);
    $stmt->bindParam(':municipio', $ciudad, PDO::PARAM_STR);
    $stmt->bindParam(':fecha_nacimiento', $fecha_nacimiento, PDO::PARAM_STR);
    
    $stmt->execute();
    
    return intval($db->lastInsertId());
}

function validarCupon($db, $codigo) {
    $query = "SELECT * FROM cupones 
              WHERE codigo = :codigo 
              AND activo = 1 
              AND fecha_expiracion >= CURDATE()
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $codigo_param = $codigo;
    $stmt->bindParam(':codigo', $codigo_param, PDO::PARAM_STR);
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>