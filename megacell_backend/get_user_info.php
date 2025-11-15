<?php
/**
 * API Endpoint - Obtener Información Completa del Usuario
 * MegaCell
 */

require_once 'config.php';

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}

// Verificar sesión
if (!validarSesion()) {
    jsonResponse([
        'success' => false,
        'message' => 'Sesión no válida'
    ], 401);
}

try {
    $db = getDB();
    $usuario_id = $_SESSION['usuario_id'];
    
    // Obtener información completa del usuario
    $stmt = $db->prepare("
        SELECT 
            id,
            identificacion,
            nombres,
            apellidos,
            email,
            telefono,
            fecha_nacimiento,
            municipio,
            rol,
            estado,
            puntos_fidelidad,
            nivel_fidelidad,
            fecha_registro,
            ultima_sesion
        FROM usuarios 
        WHERE id = :id
    ");
    $stmt->execute(['id' => $usuario_id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        jsonResponse([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ], 404);
    }
    
    // Contar pedidos
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM pedidos WHERE usuario_id = :id");
    $stmt->execute(['id' => $usuario_id]);
    $total_pedidos = $stmt->fetch()['total'];
    
    // Contar reparaciones
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM reparaciones WHERE usuario_id = :id");
    $stmt->execute(['id' => $usuario_id]);
    $total_reparaciones = $stmt->fetch()['total'];
    
    // Contar favoritos
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM favoritos WHERE usuario_id = :id");
    $stmt->execute(['id' => $usuario_id]);
    $total_favoritos = $stmt->fetch()['total'];
    
    // Formatear fecha de registro
    $fecha_registro_obj = new DateTime($usuario['fecha_registro']);
    $fecha_registro_formateada = $fecha_registro_obj->format('d \d\e F, Y');
    
    // Traducir mes al español
    $meses = [
        'January' => 'Enero', 'February' => 'Febrero', 'March' => 'Marzo',
        'April' => 'Abril', 'May' => 'Mayo', 'June' => 'Junio',
        'July' => 'Julio', 'August' => 'Agosto', 'September' => 'Septiembre',
        'October' => 'Octubre', 'November' => 'Noviembre', 'December' => 'Diciembre'
    ];
    
    $fecha_registro_formateada = str_replace(
        array_keys($meses),
        array_values($meses),
        $fecha_registro_formateada
    );
    
    // Responder con toda la información
    jsonResponse([
        'success' => true,
        'usuario' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombres'],
            'apellido' => $usuario['apellidos'],
            'nombres' => $usuario['nombres'],
            'apellidos' => $usuario['apellidos'],
            'email' => $usuario['email'],
            'telefono' => $usuario['telefono'],
            'identificacion' => $usuario['identificacion'],
            'municipio' => $usuario['municipio'],
            'fecha_nacimiento' => $usuario['fecha_nacimiento'],
            'rol' => $usuario['rol'],
            'estado' => $usuario['estado'],
            'puntos_fidelidad' => (int)$usuario['puntos_fidelidad'],
            'nivel_fidelidad' => $usuario['nivel_fidelidad'],
            'fecha_registro' => $fecha_registro_formateada,
            'ultima_sesion' => $usuario['ultima_sesion']
        ],
        'estadisticas' => [
            'total_pedidos' => (int)$total_pedidos,
            'total_reparaciones' => (int)$total_reparaciones,
            'total_favoritos' => (int)$total_favoritos
        ]
    ], 200);
    
} catch(PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], 500);
}
