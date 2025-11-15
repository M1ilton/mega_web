<?php
/**
 * API para gestión de productos
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        obtenerProductos($db);
        break;
    case 'POST':
        crearProducto($db);
        break;
    case 'PUT':
        actualizarProducto($db);
        break;
    case 'DELETE':
        eliminarProducto($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

function obtenerProductos($db) {
    try {
        // Obtener parámetros de filtrado
        $categoria = isset($_GET['categoria']) ? $_GET['categoria'] : null;
        $busqueda = isset($_GET['busqueda']) ? $_GET['busqueda'] : null;
        $activo = isset($_GET['activo']) ? $_GET['activo'] : 1;
        
        $query = "SELECT id, nombre, descripcion, precio, categoria, stock, imagen_url, activo 
                  FROM productos 
                  WHERE activo = :activo";
        
        if ($categoria && $categoria != 'Todos') {
            $query .= " AND categoria = :categoria";
        }
        
        if ($busqueda) {
            $query .= " AND (nombre LIKE :busqueda OR descripcion LIKE :busqueda)";
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':activo', $activo);
        
        if ($categoria && $categoria != 'Todos') {
            $stmt->bindParam(':categoria', $categoria);
        }
        
        if ($busqueda) {
            $busqueda_param = '%' . $busqueda . '%';
            $stmt->bindParam(':busqueda', $busqueda_param);
        }
        
        $stmt->execute();
        $productos = $stmt->fetchAll();
        
        // Agregar rating aleatorio para simular reseñas
        foreach ($productos as &$producto) {
            $producto['rating'] = round(4.0 + (mt_rand(0, 10) / 10), 1);
            $producto['precio'] = (float)$producto['precio'];
            $producto['stock'] = (int)$producto['stock'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $productos,
            'count' => count($productos)
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener productos: ' . $e->getMessage()
        ]);
    }
}

function crearProducto($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['nombre']) || !isset($data['precio'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ]);
            return;
        }
        
        $query = "INSERT INTO productos (nombre, descripcion, precio, categoria, stock, imagen_url, activo) 
                  VALUES (:nombre, :descripcion, :precio, :categoria, :stock, :imagen_url, :activo)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':descripcion', $data['descripcion']);
        $stmt->bindParam(':precio', $data['precio']);
        $stmt->bindParam(':categoria', $data['categoria']);
        $stmt->bindParam(':stock', $data['stock']);
        $stmt->bindParam(':imagen_url', $data['imagen_url']);
        $activo = isset($data['activo']) ? $data['activo'] : 1;
        $stmt->bindParam(':activo', $activo);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'id' => $db->lastInsertId()
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear producto: ' . $e->getMessage()
        ]);
    }
}

function actualizarProducto($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID del producto requerido'
            ]);
            return;
        }
        
        $query = "UPDATE productos 
                  SET nombre = :nombre, 
                      descripcion = :descripcion, 
                      precio = :precio, 
                      categoria = :categoria, 
                      stock = :stock, 
                      imagen_url = :imagen_url,
                      activo = :activo
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $data['id']);
        $stmt->bindParam(':nombre', $data['nombre']);
        $stmt->bindParam(':descripcion', $data['descripcion']);
        $stmt->bindParam(':precio', $data['precio']);
        $stmt->bindParam(':categoria', $data['categoria']);
        $stmt->bindParam(':stock', $data['stock']);
        $stmt->bindParam(':imagen_url', $data['imagen_url']);
        $stmt->bindParam(':activo', $data['activo']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Producto actualizado exitosamente'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar producto: ' . $e->getMessage()
        ]);
    }
}

function eliminarProducto($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID del producto requerido'
            ]);
            return;
        }
        
        // Soft delete - solo marcamos como inactivo
        $query = "UPDATE productos SET activo = 0 WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar producto: ' . $e->getMessage()
        ]);
    }
}
?>
