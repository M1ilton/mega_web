<?php
/**
 * API para gestión de reseñas
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Crear tabla si no existe
crearTablasResenas($db);

switch($method) {
    case 'GET':
        obtenerResenas($db);
        break;
    case 'POST':
        crearResena($db);
        break;
    case 'PUT':
        actualizarLike($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

function crearTablasResenas($db) {
    try {
        $query_resenas = "CREATE TABLE IF NOT EXISTS resenas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(150),
            estrellas INT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
            servicio VARCHAR(200) NOT NULL,
            comentario TEXT NOT NULL,
            verificado BOOLEAN DEFAULT FALSE,
            respuesta TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_estrellas (estrellas),
            INDEX idx_fecha (fecha_creacion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $query_likes = "CREATE TABLE IF NOT EXISTS resenas_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            resena_id INT NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_like (resena_id, ip_address),
            FOREIGN KEY (resena_id) REFERENCES resenas(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($query_resenas);
        $db->exec($query_likes);
        
    } catch(PDOException $e) {
        // Tabla ya existe o error al crear
        error_log("Error creando tablas: " . $e->getMessage());
    }
}

function obtenerResenas($db) {
    try {
        $estrellas = isset($_GET['estrellas']) ? $_GET['estrellas'] : null;
        
        $query = "SELECT r.*, 
                         COUNT(DISTINCT l.id) as total_likes
                  FROM resenas r
                  LEFT JOIN resenas_likes l ON r.id = l.resena_id";
        
        if ($estrellas && $estrellas !== 'todas') {
            $query .= " WHERE r.estrellas = :estrellas";
        }
        
        $query .= " GROUP BY r.id ORDER BY r.fecha_creacion DESC";
        
        $stmt = $db->prepare($query);
        
        if ($estrellas && $estrellas !== 'todas') {
            $stmt->bindParam(':estrellas', $estrellas, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estadísticas
        $query_stats = "SELECT 
                           COUNT(*) as total_resenas,
                           COALESCE(AVG(estrellas), 0) as promedio_general,
                           SUM(CASE WHEN estrellas = 5 THEN 1 ELSE 0 END) as cinco_estrellas,
                           SUM(CASE WHEN estrellas = 4 THEN 1 ELSE 0 END) as cuatro_estrellas,
                           SUM(CASE WHEN estrellas = 3 THEN 1 ELSE 0 END) as tres_estrellas,
                           SUM(CASE WHEN estrellas = 2 THEN 1 ELSE 0 END) as dos_estrellas,
                           SUM(CASE WHEN estrellas = 1 THEN 1 ELSE 0 END) as una_estrella
                        FROM resenas";
        
        $stmt_stats = $db->prepare($query_stats);
        $stmt_stats->execute();
        $stats = $stmt_stats->fetch(PDO::FETCH_ASSOC);
        
        // Formatear fechas y datos
        foreach ($resenas as &$resena) {
            $fecha = new DateTime($resena['fecha_creacion']);
            $resena['fecha'] = $fecha->format('d/m/Y');
            $resena['estrellas'] = (int)$resena['estrellas'];
            $resena['verificado'] = (bool)$resena['verificado'];
            $resena['total_likes'] = (int)$resena['total_likes'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $resenas,
            'estadisticas' => [
                'totalResenas' => (int)$stats['total_resenas'],
                'promedioGeneral' => round((float)$stats['promedio_general'], 1),
                'distribucion' => [
                    5 => (int)$stats['cinco_estrellas'],
                    4 => (int)$stats['cuatro_estrellas'],
                    3 => (int)$stats['tres_estrellas'],
                    2 => (int)$stats['dos_estrellas'],
                    1 => (int)$stats['una_estrella']
                ]
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener reseñas: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}

function crearResena($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos
        if (!isset($data['nombre']) || !isset($data['estrellas']) || 
            !isset($data['servicio']) || !isset($data['comentario'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Validar estrellas
        if ($data['estrellas'] < 1 || $data['estrellas'] > 5) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Las estrellas deben estar entre 1 y 5'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        $query = "INSERT INTO resenas 
                  (nombre, email, estrellas, servicio, comentario) 
                  VALUES 
                  (:nombre, :email, :estrellas, :servicio, :comentario)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nombre', $data['nombre']);
        $email = isset($data['email']) ? $data['email'] : null;
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':estrellas', $data['estrellas'], PDO::PARAM_INT);
        $stmt->bindParam(':servicio', $data['servicio']);
        $stmt->bindParam(':comentario', $data['comentario']);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => '¡Gracias por tu reseña! Será publicada después de ser revisada.',
                'data' => [
                    'id' => $db->lastInsertId()
                ]
            ], JSON_UNESCAPED_UNICODE);
        } else {
            throw new Exception('Error al crear reseña');
        }
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear reseña: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}

function actualizarLike($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['resena_id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de reseña requerido'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        $ip = $_SERVER['REMOTE_ADDR'];
        
        // Verificar si ya dio like
        $query_check = "SELECT id FROM resenas_likes 
                       WHERE resena_id = :resena_id AND ip_address = :ip";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(':resena_id', $data['resena_id'], PDO::PARAM_INT);
        $stmt_check->bindParam(':ip', $ip);
        $stmt_check->execute();
        
        if ($stmt_check->fetch()) {
            // Quitar like
            $query_delete = "DELETE FROM resenas_likes 
                           WHERE resena_id = :resena_id AND ip_address = :ip";
            $stmt_delete = $db->prepare($query_delete);
            $stmt_delete->bindParam(':resena_id', $data['resena_id'], PDO::PARAM_INT);
            $stmt_delete->bindParam(':ip', $ip);
            $stmt_delete->execute();
            
            $mensaje = 'Like removido';
        } else {
            // Agregar like
            $query_insert = "INSERT INTO resenas_likes (resena_id, ip_address) 
                           VALUES (:resena_id, :ip)";
            $stmt_insert = $db->prepare($query_insert);
            $stmt_insert->bindParam(':resena_id', $data['resena_id'], PDO::PARAM_INT);
            $stmt_insert->bindParam(':ip', $ip);
            $stmt_insert->execute();
            
            $mensaje = 'Like agregado';
        }
        
        // Obtener total de likes
        $query_count = "SELECT COUNT(*) as total FROM resenas_likes 
                       WHERE resena_id = :resena_id";
        $stmt_count = $db->prepare($query_count);
        $stmt_count->bindParam(':resena_id', $data['resena_id'], PDO::PARAM_INT);
        $stmt_count->execute();
        $total = $stmt_count->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => $mensaje,
            'data' => [
                'total_likes' => (int)$total['total']
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar like: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>