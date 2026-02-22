-- ============================================
-- CONSULTAS ÚTILES PARA EL SISTEMA
-- Queries comunes para operaciones del día a día
-- ============================================

-- ============================================
-- CONSULTAS DE PERMISOS Y ROLES
-- ============================================

-- 1. Obtener todos los permisos de un rol específico
SELECT 
    r.nombre_rol,
    s.nombre_subproceso,
    s.codigo_subproceso,
    o.nombre_operacion,
    o.codigo_operacion,
    p.concedido
FROM permisos p
JOIN roles r ON p.id_rol = r.id_rol
JOIN subprocesos s ON p.id_subproceso = s.id_subproceso
JOIN operaciones o ON p.id_operacion = o.id_operacion
WHERE r.id_rol = 2  -- Cambiar por el ID del rol deseado
AND p.concedido = TRUE
ORDER BY s.orden, o.codigo_operacion;

-- 2. Verificar si un usuario tiene permiso específico
SELECT 
    u.nombre_completo,
    u.email,
    r.nombre_rol,
    s.nombre_subproceso,
    o.nombre_operacion,
    CASE WHEN p.concedido = TRUE THEN 'SÍ' ELSE 'NO' END AS tiene_permiso
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
LEFT JOIN permisos p ON r.id_rol = p.id_rol
LEFT JOIN subprocesos s ON p.id_subproceso = s.id_subproceso
LEFT JOIN operaciones o ON p.id_operacion = o.id_operacion
WHERE u.id_usuario = 1  -- ID del usuario
AND s.codigo_subproceso = 'VENTAS'  -- Subproceso a verificar
AND o.codigo_operacion = 'CREATE';  -- Operación a verificar

-- 3. Listar subprocesos accesibles por un usuario
SELECT DISTINCT
    s.nombre_subproceso,
    s.codigo_subproceso,
    s.icono,
    s.orden
FROM usuarios u
JOIN roles r ON u.id_rol = r.id_rol
JOIN permisos p ON r.id_rol = p.id_rol
JOIN subprocesos s ON p.id_subproceso = s.id_subproceso
WHERE u.id_usuario = 1  -- ID del usuario
AND p.concedido = TRUE
AND s.estado = 'Activo'
ORDER BY s.orden;

-- 4. Asignar permiso específico a un rol
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido, asignado_por)
VALUES (
    2,  -- ID del rol
    (SELECT id_subproceso FROM subprocesos WHERE codigo_subproceso = 'VENTAS'),
    (SELECT id_operacion FROM operaciones WHERE codigo_operacion = 'DELETE'),
    TRUE,
    1  -- ID del usuario que asigna el permiso
)
ON CONFLICT (id_rol, id_subproceso, id_operacion) 
DO UPDATE SET concedido = TRUE;

-- 5. Revocar permiso específico de un rol
UPDATE permisos
SET concedido = FALSE
WHERE id_rol = 2
AND id_subproceso = (SELECT id_subproceso FROM subprocesos WHERE codigo_subproceso = 'USUARIOS')
AND id_operacion = (SELECT id_operacion FROM operaciones WHERE codigo_operacion = 'DELETE');

-- ============================================
-- CONSULTAS DE VENTAS Y ESTADÍSTICAS
-- ============================================

-- 6. Ventas del mes actual
SELECT 
    COUNT(*) AS total_ventas,
    SUM(total) AS total_ingresos,
    AVG(total) AS promedio_venta,
    SUM(descuento) AS total_descuentos
FROM ventas
WHERE DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
AND estado = 'Completada';

-- 7. Comparativa de ventas mes actual vs mes anterior
WITH ventas_mes_actual AS (
    SELECT 
        COUNT(*) AS cantidad,
        SUM(total) AS total
    FROM ventas
    WHERE DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
    AND estado = 'Completada'
),
ventas_mes_anterior AS (
    SELECT 
        COUNT(*) AS cantidad,
        SUM(total) AS total
    FROM ventas
    WHERE DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND estado = 'Completada'
)
SELECT 
    vma.cantidad AS ventas_mes_actual,
    vman.cantidad AS ventas_mes_anterior,
    ROUND(((vma.cantidad::NUMERIC - vman.cantidad) / NULLIF(vman.cantidad, 0) * 100), 2) AS porcentaje_cambio_cantidad,
    vma.total AS total_mes_actual,
    vman.total AS total_mes_anterior,
    ROUND(((vma.total - vman.total) / NULLIF(vman.total, 0) * 100), 2) AS porcentaje_cambio_total
FROM ventas_mes_actual vma, ventas_mes_anterior vman;

-- 8. Top 10 productos más vendidos en el último mes
SELECT 
    p.nombre_producto,
    p.codigo_producto,
    cat.nombre_categoria,
    SUM(dv.cantidad) AS unidades_vendidas,
    SUM(dv.subtotal) AS ingresos_generados,
    ROUND(AVG(dv.precio_unitario), 2) AS precio_promedio
FROM detalle_ventas dv
JOIN ventas v ON dv.id_venta = v.id_venta
JOIN productos p ON dv.id_producto = p.id_producto
LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria
WHERE v.fecha_venta >= CURRENT_DATE - INTERVAL '30 days'
AND v.estado = 'Completada'
GROUP BY p.id_producto, p.nombre_producto, p.codigo_producto, cat.nombre_categoria
ORDER BY unidades_vendidas DESC
LIMIT 10;

-- 9. Top 5 clientes con más compras
SELECT 
    c.nombre_completo,
    c.numero_documento,
    c.email,
    COUNT(v.id_venta) AS total_compras,
    SUM(v.total) AS total_gastado,
    ROUND(AVG(v.total), 2) AS promedio_compra
FROM clientes c
JOIN ventas v ON c.id_cliente = v.id_cliente
WHERE v.estado = 'Completada'
GROUP BY c.id_cliente, c.nombre_completo, c.numero_documento, c.email
ORDER BY total_gastado DESC
LIMIT 5;

-- 10. Ventas por método de pago (últimos 30 días)
SELECT 
    COALESCE(metodo_pago, 'Sin especificar') AS metodo_pago,
    COUNT(*) AS cantidad_transacciones,
    SUM(total) AS total_recaudado,
    ROUND(SUM(total) * 100.0 / (SELECT SUM(total) FROM ventas WHERE fecha_venta >= CURRENT_DATE - INTERVAL '30 days' AND estado = 'Completada'), 2) AS porcentaje
FROM ventas
WHERE fecha_venta >= CURRENT_DATE - INTERVAL '30 days'
AND estado = 'Completada'
GROUP BY metodo_pago
ORDER BY total_recaudado DESC;

-- ============================================
-- CONSULTAS DE INVENTARIO Y PRODUCTOS
-- ============================================

-- 11. Productos con stock bajo (menor al mínimo)
SELECT 
    p.codigo_producto,
    p.nombre_producto,
    cat.nombre_categoria,
    p.stock_actual,
    p.stock_minimo,
    p.stock_minimo - p.stock_actual AS unidades_faltantes,
    p.precio_compra,
    (p.stock_minimo - p.stock_actual) * p.precio_compra AS costo_reposicion
FROM productos p
LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria
WHERE p.stock_actual < p.stock_minimo
AND p.estado = 'Activo'
ORDER BY unidades_faltantes DESC;

-- 12. Valor total del inventario por categoría
SELECT 
    cat.nombre_categoria,
    COUNT(p.id_producto) AS total_productos,
    SUM(p.stock_actual) AS total_unidades,
    SUM(p.stock_actual * p.precio_compra) AS valor_inventario_compra,
    SUM(p.stock_actual * p.precio_venta) AS valor_inventario_venta,
    SUM(p.stock_actual * (p.precio_venta - p.precio_compra)) AS ganancia_potencial
FROM categorias cat
LEFT JOIN productos p ON cat.id_categoria = p.id_categoria
WHERE p.estado = 'Activo'
GROUP BY cat.id_categoria, cat.nombre_categoria
ORDER BY valor_inventario_venta DESC;

-- 13. Productos sin ventas en los últimos 60 días
SELECT 
    p.codigo_producto,
    p.nombre_producto,
    cat.nombre_categoria,
    p.stock_actual,
    p.precio_venta,
    p.fecha_creacion
FROM productos p
LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria
LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
LEFT JOIN ventas v ON dv.id_venta = v.id_venta AND v.fecha_venta >= CURRENT_DATE - INTERVAL '60 days'
WHERE p.estado = 'Activo'
AND v.id_venta IS NULL
ORDER BY p.stock_actual DESC;

-- 14. Movimientos de inventario (entradas y salidas)
SELECT 
    p.nombre_producto,
    p.codigo_producto,
    'VENTA' AS tipo_movimiento,
    dv.cantidad AS cantidad,
    v.fecha_venta AS fecha,
    v.numero_venta AS numero_documento
FROM detalle_ventas dv
JOIN ventas v ON dv.id_venta = v.id_venta
JOIN productos p ON dv.id_producto = p.id_producto
WHERE v.fecha_venta >= CURRENT_DATE - INTERVAL '30 days'
AND v.estado = 'Completada'
UNION ALL
SELECT 
    p.nombre_producto,
    p.codigo_producto,
    'COMPRA' AS tipo_movimiento,
    dc.cantidad AS cantidad,
    c.fecha_compra AS fecha,
    c.numero_compra AS numero_documento
FROM detalle_compras dc
JOIN compras c ON dc.id_compra = c.id_compra
JOIN productos p ON dc.id_producto = p.id_producto
WHERE c.fecha_compra >= CURRENT_DATE - INTERVAL '30 days'
AND c.estado = 'Completada'
ORDER BY fecha DESC;

-- ============================================
-- CONSULTAS DE PEDIDOS Y ABONOS
-- ============================================

-- 15. Pedidos con saldo pendiente
SELECT 
    ped.numero_pedido,
    ped.fecha_pedido,
    c.nombre_completo AS cliente,
    c.telefono,
    ped.total,
    ped.saldo_pendiente,
    ped.total - ped.saldo_pendiente AS total_abonado,
    ROUND((ped.total - ped.saldo_pendiente) * 100.0 / ped.total, 2) AS porcentaje_pagado,
    ped.estado
FROM pedidos ped
JOIN clientes c ON ped.id_cliente = c.id_cliente
WHERE ped.saldo_pendiente > 0
AND ped.estado != 'Anulado'
ORDER BY ped.fecha_pedido ASC;

-- 16. Historial de abonos de un pedido específico
SELECT 
    a.numero_abono,
    a.fecha_abono,
    a.monto_abono,
    a.metodo_pago,
    a.estado,
    u.nombre_completo AS registrado_por,
    a.observaciones
FROM abonos a
JOIN usuarios u ON a.id_usuario = u.id_usuario
WHERE a.id_pedido = 1  -- ID del pedido
ORDER BY a.fecha_abono DESC;

-- 17. Total de abonos por método de pago (último mes)
SELECT 
    metodo_pago,
    COUNT(*) AS cantidad_abonos,
    SUM(monto_abono) AS total_recaudado
FROM abonos
WHERE fecha_abono >= CURRENT_DATE - INTERVAL '30 days'
AND estado = 'Registrado'
GROUP BY metodo_pago
ORDER BY total_recaudado DESC;

-- 18. Pedidos próximos a vencer (con fecha de entrega cercana)
SELECT 
    ped.numero_pedido,
    ped.fecha_pedido,
    ped.fecha_entrega,
    ped.fecha_entrega - CURRENT_DATE AS dias_restantes,
    c.nombre_completo AS cliente,
    c.telefono,
    ped.total,
    ped.saldo_pendiente,
    ped.estado
FROM pedidos ped
JOIN clientes c ON ped.id_cliente = c.id_cliente
WHERE ped.fecha_entrega BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
AND ped.estado = 'Pendiente'
ORDER BY ped.fecha_entrega ASC;

-- ============================================
-- CONSULTAS DE DEVOLUCIONES Y NOTAS DE CRÉDITO
-- ============================================

-- 19. Resumen de devoluciones del mes
SELECT 
    COUNT(*) AS total_devoluciones,
    SUM(total_devolucion) AS monto_total_devuelto,
    ROUND(AVG(total_devolucion), 2) AS promedio_devolucion
FROM devoluciones
WHERE DATE_TRUNC('month', fecha_devolucion) = DATE_TRUNC('month', CURRENT_DATE)
AND estado = 'Procesada';

-- 20. Productos más devueltos
SELECT 
    p.nombre_producto,
    p.codigo_producto,
    cat.nombre_categoria,
    SUM(dd.cantidad) AS total_devoluciones,
    SUM(dd.subtotal) AS monto_total
FROM detalle_devoluciones dd
JOIN productos p ON dd.id_producto = p.id_producto
LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria
JOIN devoluciones d ON dd.id_devolucion = d.id_devolucion
WHERE d.estado = 'Procesada'
AND d.fecha_devolucion >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.id_producto, p.nombre_producto, p.codigo_producto, cat.nombre_categoria
ORDER BY total_devoluciones DESC
LIMIT 10;

-- 21. Notas de crédito disponibles por cliente
SELECT 
    c.nombre_completo,
    c.numero_documento,
    nc.numero_nota_credito,
    nc.fecha_nota_credito,
    nc.monto_credito,
    nc.saldo_disponible,
    nc.estado
FROM notas_credito nc
JOIN clientes c ON nc.id_cliente = c.id_cliente
WHERE nc.estado = 'Disponible'
AND nc.saldo_disponible > 0
ORDER BY c.nombre_completo, nc.fecha_nota_credito;

-- ============================================
-- CONSULTAS DE COMPRAS Y PROVEEDORES
-- ============================================

-- 22. Resumen de compras del mes
SELECT 
    COUNT(*) AS total_compras,
    SUM(total) AS total_gastado,
    AVG(total) AS promedio_compra
FROM compras
WHERE DATE_TRUNC('month', fecha_compra) = DATE_TRUNC('month', CURRENT_DATE)
AND estado = 'Completada';

-- 23. Top proveedores con más transacciones
SELECT 
    prov.nombre_empresa,
    prov.nit,
    prov.nombre_contacto,
    prov.telefono,
    COUNT(c.id_compra) AS total_compras,
    SUM(c.total) AS total_comprado,
    ROUND(AVG(c.total), 2) AS promedio_compra
FROM proveedores prov
JOIN compras c ON prov.id_proveedor = c.id_proveedor
WHERE c.estado = 'Completada'
GROUP BY prov.id_proveedor, prov.nombre_empresa, prov.nit, prov.nombre_contacto, prov.telefono
ORDER BY total_comprado DESC
LIMIT 10;

-- ============================================
-- CONSULTAS DE REPORTES PARA DASHBOARD
-- ============================================

-- 24. Resumen general del negocio (dashboard principal)
WITH ventas_mes AS (
    SELECT 
        COUNT(*) AS total_ventas,
        SUM(total) AS ingresos
    FROM ventas
    WHERE DATE_TRUNC('month', fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
    AND estado = 'Completada'
),
compras_mes AS (
    SELECT 
        COUNT(*) AS total_compras,
        SUM(total) AS gastos
    FROM compras
    WHERE DATE_TRUNC('month', fecha_compra) = DATE_TRUNC('month', CURRENT_DATE)
    AND estado = 'Completada'
),
inventario AS (
    SELECT 
        COUNT(*) AS total_productos,
        SUM(stock_actual) AS total_unidades,
        SUM(stock_actual * precio_venta) AS valor_inventario
    FROM productos
    WHERE estado = 'Activo'
),
clientes_nuevos AS (
    SELECT COUNT(*) AS total_clientes_nuevos
    FROM clientes
    WHERE DATE_TRUNC('month', fecha_creacion) = DATE_TRUNC('month', CURRENT_DATE)
)
SELECT 
    vm.total_ventas,
    vm.ingresos,
    cm.total_compras,
    cm.gastos,
    vm.ingresos - cm.gastos AS ganancia_neta,
    inv.total_productos,
    inv.total_unidades,
    inv.valor_inventario,
    cn.total_clientes_nuevos
FROM ventas_mes vm, compras_mes cm, inventario inv, clientes_nuevos cn;

-- 25. Ventas por día (últimos 30 días) - para gráfico
SELECT 
    DATE(fecha_venta) AS fecha,
    COUNT(*) AS cantidad_ventas,
    SUM(total) AS total_ventas
FROM ventas
WHERE fecha_venta >= CURRENT_DATE - INTERVAL '30 days'
AND estado = 'Completada'
GROUP BY DATE(fecha_venta)
ORDER BY fecha;

-- 26. Ganancia vs gastos por mes (últimos 6 meses) - para gráfico
WITH meses AS (
    SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
        DATE_TRUNC('month', CURRENT_DATE),
        '1 month'::interval
    ) AS mes
),
ventas_por_mes AS (
    SELECT 
        DATE_TRUNC('month', fecha_venta) AS mes,
        SUM(total) AS ingresos
    FROM ventas
    WHERE estado = 'Completada'
    GROUP BY DATE_TRUNC('month', fecha_venta)
),
compras_por_mes AS (
    SELECT 
        DATE_TRUNC('month', fecha_compra) AS mes,
        SUM(total) AS gastos
    FROM compras
    WHERE estado = 'Completada'
    GROUP BY DATE_TRUNC('month', fecha_compra)
)
SELECT 
    TO_CHAR(m.mes, 'Mon YYYY') AS periodo,
    COALESCE(v.ingresos, 0) AS ingresos,
    COALESCE(c.gastos, 0) AS gastos,
    COALESCE(v.ingresos, 0) - COALESCE(c.gastos, 0) AS ganancia
FROM meses m
LEFT JOIN ventas_por_mes v ON m.mes = v.mes
LEFT JOIN compras_por_mes c ON m.mes = c.mes
ORDER BY m.mes;

-- ============================================
-- CONSULTAS DE AUDITORÍA
-- ============================================

-- 27. Últimos inicios de sesión
SELECT 
    u.nombre_completo,
    u.email,
    al.exitoso,
    al.direccion_ip,
    al.fecha_intento
FROM auditoria_login al
LEFT JOIN usuarios u ON al.id_usuario = u.id_usuario
ORDER BY al.fecha_intento DESC
LIMIT 50;

-- 28. Operaciones recientes por usuario
SELECT 
    u.nombre_completo,
    ao.tabla_afectada,
    ao.operacion,
    ao.fecha_operacion
FROM auditoria_operaciones ao
JOIN usuarios u ON ao.id_usuario = u.id_usuario
WHERE ao.fecha_operacion >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY ao.fecha_operacion DESC
LIMIT 100;

-- ============================================
-- CONSULTAS DE MANTENIMIENTO
-- ============================================

-- 29. Limpiar datos de auditoría antiguos (más de 6 meses)
DELETE FROM auditoria_login
WHERE fecha_intento < CURRENT_DATE - INTERVAL '6 months';

DELETE FROM auditoria_operaciones
WHERE fecha_operacion < CURRENT_DATE - INTERVAL '6 months';

-- 30. Backup de permisos de un rol
SELECT 
    r.nombre_rol,
    s.codigo_subproceso,
    o.codigo_operacion,
    p.concedido
FROM permisos p
JOIN roles r ON p.id_rol = r.id_rol
JOIN subprocesos s ON p.id_subproceso = s.id_subproceso
JOIN operaciones o ON p.id_operacion = o.id_operacion
WHERE r.id_rol = 2;  -- ID del rol a respaldar

-- ============================================
-- FIN DE CONSULTAS ÚTILES
-- ============================================
