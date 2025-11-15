<?php
/**
 * API Endpoint - Verificar Sesión
 * MegaCell
 */

require_once 'config.php';

// Permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse([
        'success' => false,
        'message' => 'Método no permitido'
    ], 405);
}

// Verificar si hay sesión activa
if (!validarSesion()) {
    jsonResponse([
        'success' => false,
        'authenticated' => false,
        'message' => 'No hay sesión activa'
    ], 401);
}

// Obtener datos del usuario actual
$usuario = getUsuarioActual();

if (!$usuario) {
    // Sesión inválida, destruirla
    session_unset();
    session_destroy();
    
    jsonResponse([
        'success' => false,
        'authenticated' => false,
        'message' => 'Sesión inválida'
    ], 401);
}

// Determinar ruta según el rol
$rutaRedireccion = '/';
switch($usuario['rol']) {
    case 'admin':
    case 'trabajador':
        $rutaRedireccion = '/dashboard';
        break;
    case 'cliente':
        $rutaRedireccion = '/';
        break;
}

// Responder con información del usuario
jsonResponse([
    'success' => true,
    'authenticated' => true,
    'usuario' => [
        'id' => $usuario['id'],
        'identificacion' => $usuario['identificacion'],
        'nombres' => $usuario['nombres'],
        'apellidos' => $usuario['apellidos'],
        'email' => $usuario['email'],
        'telefono' => $usuario['telefono'],
        'municipio' => $usuario['municipio'],
        'rol' => $usuario['rol'],
        'fecha_nacimiento' => $usuario['fecha_nacimiento']
    ],
    'redirectTo' => $rutaRedireccion
], 200);
