<?php
/**
 * API para gestión de mensajes de contacto
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
crearTablaContacto($db);

switch($method) {
    case 'GET':
        obtenerMensajes($db);
        break;
    case 'POST':
        enviarMensajeContacto($db);
        break;
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false, 
            'message' => 'Método no permitido'
        ], JSON_UNESCAPED_UNICODE);
        break;
}

function crearTablaContacto($db) {
    try {
        $query_create = "CREATE TABLE IF NOT EXISTS contacto_mensajes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            telefono VARCHAR(20) NOT NULL,
            asunto VARCHAR(100) NOT NULL,
            mensaje TEXT NOT NULL,
            estado ENUM('nuevo', 'leido', 'respondido') DEFAULT 'nuevo',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_estado (estado),
            INDEX idx_fecha (fecha_creacion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($query_create);
    } catch(PDOException $e) {
        error_log("Error creando tabla contacto: " . $e->getMessage());
    }
}

function obtenerMensajes($db) {
    try {
        $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
        
        $query = "SELECT * FROM contacto_mensajes";
        
        if ($estado && in_array($estado, ['nuevo', 'leido', 'respondido'])) {
            $query .= " WHERE estado = :estado";
        }
        
        $query .= " ORDER BY fecha_creacion DESC";
        
        $stmt = $db->prepare($query);
        
        if ($estado && in_array($estado, ['nuevo', 'leido', 'respondido'])) {
            $stmt->bindParam(':estado', $estado);
        }
        
        $stmt->execute();
        $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear fechas
        foreach ($mensajes as &$mensaje) {
            $fecha = new DateTime($mensaje['fecha_creacion']);
            $mensaje['fecha'] = $fecha->format('d/m/Y H:i');
        }
        
        // Obtener estadísticas
        $query_stats = "SELECT 
                           COUNT(*) as total,
                           SUM(CASE WHEN estado = 'nuevo' THEN 1 ELSE 0 END) as nuevos,
                           SUM(CASE WHEN estado = 'leido' THEN 1 ELSE 0 END) as leidos,
                           SUM(CASE WHEN estado = 'respondido' THEN 1 ELSE 0 END) as respondidos
                        FROM contacto_mensajes";
        
        $stmt_stats = $db->prepare($query_stats);
        $stmt_stats->execute();
        $stats = $stmt_stats->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $mensajes,
            'estadisticas' => [
                'total' => (int)$stats['total'],
                'nuevos' => (int)$stats['nuevos'],
                'leidos' => (int)$stats['leidos'],
                'respondidos' => (int)$stats['respondidos']
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener mensajes: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}

function enviarMensajeContacto($db) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar que se recibieron datos
        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No se recibieron datos'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Validar datos requeridos
        if (empty($data['nombre']) || empty($data['email']) || 
            empty($data['telefono']) || empty($data['asunto']) || 
            empty($data['mensaje'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos son requeridos'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Validar email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Email no válido'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Validar longitud del teléfono
        $telefono = preg_replace('/[^0-9]/', '', $data['telefono']);
        if (strlen($telefono) < 10) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Teléfono debe tener al menos 10 dígitos'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Validar longitud del mensaje
        if (strlen(trim($data['mensaje'])) < 10) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El mensaje debe tener al menos 10 caracteres'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Limpiar datos
        $nombre = trim($data['nombre']);
        $email = trim($data['email']);
        $telefono = trim($data['telefono']);
        $asunto = trim($data['asunto']);
        $mensaje = trim($data['mensaje']);
        
        // Insertar mensaje
        $query = "INSERT INTO contacto_mensajes 
                  (nombre, email, telefono, asunto, mensaje) 
                  VALUES 
                  (:nombre, :email, :telefono, :asunto, :mensaje)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':asunto', $asunto);
        $stmt->bindParam(':mensaje', $mensaje);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.',
                'data' => [
                    'id' => $db->lastInsertId()
                ]
            ], JSON_UNESCAPED_UNICODE);
            
            // Opcional: Aquí podrías enviar un email de notificación
            // enviarEmailNotificacion($nombre, $email, $asunto, $mensaje);
        } else {
            throw new Exception('Error al guardar el mensaje');
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar mensaje: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al procesar solicitud: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}

// Función opcional para enviar email de notificación
function enviarEmailNotificacion($nombre, $email, $asunto, $mensaje) {
    $to = "info@megacell.com"; // Cambia por tu email
    $subject = "Nuevo mensaje de contacto: " . $asunto;
    $body = "
        Nuevo mensaje de contacto:
        
        Nombre: $nombre
        Email: $email
        Asunto: $asunto
        
        Mensaje:
        $mensaje
    ";
    
    $headers = "From: noreply@megacell.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Descomentar para activar el envío de email
    // mail($to, $subject, $body, $headers);
}
?>