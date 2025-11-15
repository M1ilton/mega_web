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
            obtenerResenas($conn);
            break;
            
        case 'POST':
            crearResena($conn);
            break;
            
        case 'PUT':
            actualizarResena($conn);
            break;
            
        case 'DELETE':
            eliminarResena($conn);
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

function obtenerResenas($conn) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                r.id,
                r.usuario_id,
                r.nombre,
                r.email,
                r.estrellas,
                r.servicio,
                r.comentario,
                r.verificado,
                r.aprobado,
                r.respuesta,
                r.fecha_respuesta,
                r.fecha_publicacion,
                r.ip_address,
                r.fecha_creacion,
                
                -- Información del usuario si existe
                u.nombres,
                u.apellidos,
                u.telefono,
                CONCAT(u.nombres, ' ', u.apellidos) as nombre_usuario,
                
                -- Contar likes
                (SELECT COUNT(*) FROM resenas_likes WHERE resena_id = r.id) as total_likes
                
            FROM resenas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.fecha_creacion DESC
        ");
        
        $stmt->execute();
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'resenas' => $resenas
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener reseñas: ' . $e->getMessage()
        ]);
    }
}

function crearResena($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Log para debugging
        error_log("Datos recibidos: " . json_encode($data));
        
        // Validar campos requeridos
        $camposRequeridos = ['nombre', 'email', 'estrellas', 'servicio', 'comentario'];
        foreach ($camposRequeridos as $campo) {
            if (empty($data[$campo])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "El campo '$campo' es obligatorio"
                ]);
                return;
            }
        }
        
        // Validar estrellas (1-5)
        if ($data['estrellas'] < 1 || $data['estrellas'] > 5) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Las estrellas deben estar entre 1 y 5'
            ]);
            return;
        }
        
        // Validar email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Email no válido'
            ]);
            return;
        }
        
        // Insertar reseña
        $stmt = $conn->prepare("
            INSERT INTO resenas 
            (usuario_id, nombre, email, estrellas, servicio, comentario, verificado, aprobado, respuesta, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['usuario_id'] ?? null,
            $data['nombre'],
            $data['email'],
            $data['estrellas'],
            $data['servicio'],
            $data['comentario'],
            $data['verificado'] ?? 0,
            $data['aprobado'] ?? 0,
            $data['respuesta'] ?? null,
            $_SERVER['REMOTE_ADDR'] ?? null
        ]);
        
        $id = $conn->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Reseña creada exitosamente',
            'id' => $id
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear reseña: ' . $e->getMessage()
        ]);
    }
}

function actualizarResena($conn) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de reseña no proporcionado'
            ]);
            return;
        }
        
        // Log para debugging
        error_log("Actualizando reseña ID: $id con datos: " . json_encode($data));
        
        // Construir query dinámicamente solo con campos presentes
        $campos = [];
        $valores = [];
        
        if (isset($data['nombre'])) {
            $campos[] = "nombre = ?";
            $valores[] = $data['nombre'];
        }
        if (isset($data['email'])) {
            $campos[] = "email = ?";
            $valores[] = $data['email'];
        }
        if (isset($data['estrellas'])) {
            if ($data['estrellas'] < 1 || $data['estrellas'] > 5) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Las estrellas deben estar entre 1 y 5'
                ]);
                return;
            }
            $campos[] = "estrellas = ?";
            $valores[] = $data['estrellas'];
        }
        if (isset($data['servicio'])) {
            $campos[] = "servicio = ?";
            $valores[] = $data['servicio'];
        }
        if (isset($data['comentario'])) {
            $campos[] = "comentario = ?";
            $valores[] = $data['comentario'];
        }
        if (isset($data['verificado'])) {
            $campos[] = "verificado = ?";
            $valores[] = $data['verificado'];
        }
        if (isset($data['aprobado'])) {
            $campos[] = "aprobado = ?";
            $valores[] = $data['aprobado'];
        }
        if (isset($data['respuesta'])) {
            $campos[] = "respuesta = ?";
            $valores[] = $data['respuesta'];
            $campos[] = "fecha_respuesta = NOW()";
        }
        
        if (empty($campos)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No hay campos para actualizar'
            ]);
            return;
        }
        
        $valores[] = $id;
        
        $sql = "UPDATE resenas SET " . implode(", ", $campos) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($valores);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Reseña actualizada exitosamente'
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
            'message' => 'Error al actualizar reseña: ' . $e->getMessage()
        ]);
    }
}

function eliminarResena($conn) {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de reseña no proporcionado'
            ]);
            return;
        }
        
        $stmt = $conn->prepare("DELETE FROM resenas WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Reseña eliminada exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Reseña no encontrada'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar reseña: ' . $e->getMessage()
        ]);
    }
}
?>