<?php
/**
 * Configuración de conexión a la base de datos
 * MegaCell - Sistema de Autenticación
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');          // Cambiar según tu configuración
define('DB_PASS', '');              // Cambiar según tu configuración
define('DB_NAME', 'mega_web');
define('DB_CHARSET', 'utf8mb4');

// Configuración de sesiones
define('SESSION_LIFETIME', 3600 * 24); // 24 horas
ini_set('session.cookie_lifetime', SESSION_LIFETIME);
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Clase de conexión a la base de datos
class Database {
    private static $instance = null;
    private $conn;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch(PDOException $e) {
            die(json_encode([
                'success' => false,
                'message' => 'Error de conexión a la base de datos: ' . $e->getMessage()
            ]));
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    // Prevenir clonación
    private function __clone() {}
    
    // Prevenir deserialización
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Función auxiliar para obtener la conexión
function getDB() {
    return Database::getInstance()->getConnection();
}

// Headers CORS para permitir peticiones desde el frontend
header('Access-Control-Allow-Origin: http://localhost:5173'); // Cambiar según tu puerto de React
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función para responder en JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Función para validar sesión
function validarSesion() {
    if (!isset($_SESSION['usuario_id']) || !isset($_SESSION['usuario_identificacion'])) {
        return false;
    }
    
    // Verificar expiración de sesión
    if (isset($_SESSION['ultima_actividad'])) {
        $tiempoInactivo = time() - $_SESSION['ultima_actividad'];
        if ($tiempoInactivo > SESSION_LIFETIME) {
            session_unset();
            session_destroy();
            return false;
        }
    }
    
    // Actualizar última actividad
    $_SESSION['ultima_actividad'] = time();
    return true;
}

// Función para obtener datos del usuario actual
function getUsuarioActual() {
    if (!validarSesion()) {
        return null;
    }
    
    try {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT id, identificacion, nombres, apellidos, email, telefono, 
                   fecha_nacimiento, municipio, rol, estado, fecha_registro, ultima_sesion
            FROM usuarios 
            WHERE id = :id AND estado = 'activo'
        ");
        $stmt->execute(['id' => $_SESSION['usuario_id']]);
        return $stmt->fetch();
    } catch(PDOException $e) {
        return null;
    }
}

// Función para verificar rol
function tieneRol($roles_permitidos) {
    if (!validarSesion()) {
        return false;
    }
    
    $usuario = getUsuarioActual();
    if (!$usuario) {
        return false;
    }
    
    if (is_array($roles_permitidos)) {
        return in_array($usuario['rol'], $roles_permitidos);
    }
    
    return $usuario['rol'] === $roles_permitidos;
}

// Función para sanitizar entrada
function sanitizar($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Función para validar email
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}
