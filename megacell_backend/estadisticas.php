<?php
// estadisticas.php - Obtener estadísticas para el dashboard

require_once 'config2.php';



try {
    $pdo = conectarDB();
    
    if (!$pdo) {
        responderJSON([
            'success' => false,
            'message' => 'Error de conexión a la base de datos'
        ], 500);
    }
    
    // Total de usuarios
    $stmtUsuarios = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'activo'");
    $totalUsuarios = $stmtUsuarios->fetch()['total'];
    
    // Total de productos
    $stmtProductos = $pdo->query("SELECT COUNT(*) as total FROM productos WHERE activo = 1");
    $totalProductos = $stmtProductos->fetch()['total'];
    
    // Total de pedidos
    $stmtPedidos = $pdo->query("SELECT COUNT(*) as total FROM pedidos");
    $totalPedidos = $stmtPedidos->fetch()['total'];
    
    // Total de reparaciones
    $stmtReparaciones = $pdo->query("SELECT COUNT(*) as total FROM reparaciones");
    $totalReparaciones = $stmtReparaciones->fetch()['total'];
    
    // Ventas totales
    $stmtVentasTotales = $pdo->query("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM pedidos 
        WHERE estado != 'cancelado'
    ");
    $ventasTotales = $stmtVentasTotales->fetch()['total'];
    
    // Ventas del mes actual
    $stmtVentasMes = $pdo->query("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM pedidos 
        WHERE MONTH(fecha_pedido) = MONTH(CURRENT_DATE())
        AND YEAR(fecha_pedido) = YEAR(CURRENT_DATE())
        AND estado != 'cancelado'
    ");
    $ventasMesActual = $stmtVentasMes->fetch()['total'];
    
    // Pedidos por estado
    $stmtPedidosEstado = $pdo->query("
        SELECT estado, COUNT(*) as total 
        FROM pedidos 
        GROUP BY estado
        ORDER BY 
            CASE estado
                WHEN 'pendiente' THEN 1
                WHEN 'procesando' THEN 2
                WHEN 'en_camino' THEN 3
                WHEN 'entregado' THEN 4
                WHEN 'cancelado' THEN 5
            END
    ");
    $pedidosPorEstado = $stmtPedidosEstado->fetchAll();
    
    // Actividad reciente (últimas 10 actividades)
    $stmtActividad = $pdo->query("
        SELECT 
            a.id,
            a.tipo_actividad,
            a.descripcion,
            a.fecha_actividad,
            u.nombres,
            u.apellidos
        FROM actividad_usuario a
        INNER JOIN usuarios u ON a.usuario_id = u.id
        ORDER BY a.fecha_actividad DESC
        LIMIT 10
    ");
    $actividadReciente = $stmtActividad->fetchAll();
    
    // Productos más vendidos (top 5)
    $stmtProductosTop = $pdo->query("
        SELECT 
            p.id,
            p.nombre,
            p.precio,
            COUNT(*) as ventas
        FROM productos p
        INNER JOIN favoritos f ON p.id = f.producto_id
        GROUP BY p.id, p.nombre, p.precio
        ORDER BY ventas DESC
        LIMIT 5
    ");
    $productosTop = $stmtProductosTop->fetchAll();
    
    // Reparaciones por estado
    $stmtReparacionesEstado = $pdo->query("
        SELECT estado, COUNT(*) as total 
        FROM reparaciones 
        GROUP BY estado
    ");
    $reparacionesPorEstado = $stmtReparacionesEstado->fetchAll();
    
    responderJSON([
        'success' => true,
        'data' => [
            'total_usuarios' => $totalUsuarios,
            'total_productos' => $totalProductos,
            'total_pedidos' => $totalPedidos,
            'total_reparaciones' => $totalReparaciones,
            'ventas_totales' => $ventasTotales,
            'ventas_mes_actual' => $ventasMesActual,
            'pedidos_por_estado' => $pedidosPorEstado,
            'actividad_reciente' => $actividadReciente,
            'productos_top' => $productosTop,
            'reparaciones_por_estado' => $reparacionesPorEstado
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error en estadisticas: " . $e->getMessage());
    responderJSON([
        'success' => false,
        'message' => 'Error al obtener estadísticas'
    ], 500);
}
?>