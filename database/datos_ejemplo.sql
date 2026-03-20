-- ============================================
-- DATOS DE EJEMPLO PARA PRUEBAS
-- Sistema de Gestión Empresarial
-- ============================================

-- IMPORTANTE: Este script asume que ya se ejecutó schema.sql
-- y que existe la estructura básica de la base de datos

-- ============================================
-- CATEGORÍAS DE PRODUCTOS
-- ============================================

INSERT INTO categorias (nombre_categoria, descripcion, estado, creado_por) VALUES
('Vaporizadores Desechables', 'Vaporizadores de un solo uso, prácticos y portátiles', 'Activo', 1),
('Vaporizadores Recargables', 'Dispositivos de vapeo recargables de alta calidad', 'Activo', 1),
('Líquidos y E-liquids', 'Líquidos para vapeo con diversos sabores', 'Activo', 1),
('Accesorios', 'Accesorios y repuestos para vaporizadores', 'Activo', 1),
('Kits Completos', 'Kits todo-en-uno para principiantes', 'Activo', 1),
('Resistencias y Coils', 'Resistencias de repuesto para diversos modelos', 'Activo', 1);

-- ============================================
-- PRODUCTOS
-- ============================================

INSERT INTO productos (codigo_producto, nombre_producto, descripcion, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo, estado, creado_por) VALUES
-- Vaporizadores Desechables
('VP-DES-001', 'Vaper Desechable Puff 600', 'Vaporizador desechable con 600 puffs, sabor menta', 1, 8000.00, 15000.00, 50, 10, 'Activo', 1),
('VP-DES-002', 'Vaper Desechable Puff 1500', 'Vaporizador desechable con 1500 puffs, sabor frutas tropicales', 1, 15000.00, 28000.00, 35, 10, 'Activo', 1),
('VP-DES-003', 'Vaper Desechable Ice Blast', 'Vaporizador desechable sabor hielo, 800 puffs', 1, 10000.00, 18000.00, 45, 10, 'Activo', 1),
('VP-DES-004', 'Vaper Desechable Mango Tango', 'Sabor mango intenso, 1000 puffs', 1, 12000.00, 22000.00, 28, 8, 'Activo', 1),
('VP-DES-005', 'Vaper Desechable Berry Mix', 'Mezcla de frutos rojos, 1200 puffs', 1, 13000.00, 24000.00, 32, 10, 'Activo', 1),

-- Vaporizadores Recargables
('VP-REC-001', 'Vaper Pod System X200', 'Pod system recargable con batería de 1000mAh', 2, 45000.00, 89000.00, 15, 5, 'Activo', 1),
('VP-REC-002', 'Vaper Mod Box 80W', 'Mod box regulable hasta 80W con display OLED', 2, 85000.00, 165000.00, 8, 3, 'Activo', 1),
('VP-REC-003', 'Vaper Starter Kit Pro', 'Kit completo para principiantes con cargador', 2, 55000.00, 105000.00, 12, 5, 'Activo', 1),
('VP-REC-004', 'Vaper AIO Elite', 'Todo en uno con tanque de 2ml', 2, 38000.00, 72000.00, 20, 5, 'Activo', 1),

-- Líquidos y E-liquids
('LIQ-001', 'E-liquid Menta Fresca 30ml', 'Líquido sabor menta, nicotina 3mg', 3, 12000.00, 25000.00, 60, 15, 'Activo', 1),
('LIQ-002', 'E-liquid Fresa 30ml', 'Líquido sabor fresa, nicotina 6mg', 3, 12000.00, 25000.00, 55, 15, 'Activo', 1),
('LIQ-003', 'E-liquid Vainilla 30ml', 'Líquido sabor vainilla, nicotina 0mg', 3, 11000.00, 23000.00, 48, 12, 'Activo', 1),
('LIQ-004', 'E-liquid Café 30ml', 'Líquido sabor café, nicotina 3mg', 3, 13000.00, 27000.00, 40, 12, 'Activo', 1),
('LIQ-005', 'E-liquid Mix Tropical 50ml', 'Líquido sabor frutas tropicales, nicotina 6mg', 3, 20000.00, 38000.00, 35, 10, 'Activo', 1),

-- Accesorios
('ACC-001', 'Cable Cargador USB-C', 'Cable de carga rápida para vaporizadores', 4, 3000.00, 8000.00, 80, 20, 'Activo', 1),
('ACC-002', 'Estuche Protector Premium', 'Estuche de transporte resistente', 4, 8000.00, 18000.00, 25, 8, 'Activo', 1),
('ACC-003', 'Boquillas Desechables (Pack 10)', 'Pack de 10 boquillas higiénicas', 4, 4000.00, 10000.00, 50, 15, 'Activo', 1),
('ACC-004', 'Limpiador de Tanques', 'Kit de limpieza para tanques de vapeo', 4, 6000.00, 14000.00, 30, 10, 'Activo', 1),

-- Kits Completos
('KIT-001', 'Kit Starter Completo', 'Vaper recargable + 2 líquidos + cargador', 5, 70000.00, 135000.00, 10, 3, 'Activo', 1),
('KIT-002', 'Kit Premium Experience', 'Mod + 3 líquidos + resistencias + estuche', 5, 120000.00, 225000.00, 5, 2, 'Activo', 1),
('KIT-003', 'Kit Principiante Basic', 'Pod + 1 líquido + cargador', 5, 55000.00, 98000.00, 8, 3, 'Activo', 1),

-- Resistencias y Coils
('RES-001', 'Resistencia 0.6 Ohm (Pack 5)', 'Pack de 5 resistencias compatibles', 6, 15000.00, 32000.00, 40, 12, 'Activo', 1),
('RES-002', 'Resistencia 1.0 Ohm (Pack 5)', 'Pack de 5 resistencias MTL', 6, 15000.00, 32000.00, 35, 12, 'Activo', 1),
('RES-003', 'Coil Mesh 0.4 Ohm (Pack 3)', 'Pack de 3 coils mesh para vapeo DTL', 6, 18000.00, 38000.00, 28, 10, 'Activo', 1);

-- ============================================
-- CLIENTES
-- ============================================

INSERT INTO clientes (nombre_completo, tipo_documento, numero_documento, email, telefono, direccion, ciudad, estado, creado_por) VALUES
('Juan Carlos Pérez', 'C.C', '1001234567', 'juan.perez@email.com', '3101234567', 'Calle 10 #20-30', 'Bogotá', 'Activo', 1),
('María Fernanda López', 'C.C', '1002345678', 'maria.lopez@email.com', '3112345678', 'Carrera 15 #25-40', 'Medellín', 'Activo', 1),
('Carlos Andrés Martínez', 'C.C', '1003456789', 'carlos.martinez@email.com', '3123456789', 'Avenida 5 #12-15', 'Cali', 'Activo', 1),
('Ana María Rodríguez', 'C.C', '1004567890', 'ana.rodriguez@email.com', '3134567890', 'Calle 8 #18-22', 'Barranquilla', 'Activo', 1),
('Pedro José García', 'C.C', '1005678901', 'pedro.garcia@email.com', '3145678901', 'Carrera 20 #30-45', 'Cartagena', 'Activo', 1),
('Laura Sofía Hernández', 'C.C', '1006789012', 'laura.hernandez@email.com', '3156789012', 'Calle 12 #15-18', 'Bucaramanga', 'Activo', 1),
('Diego Fernando Díaz', 'C.C', '1007890123', 'diego.diaz@email.com', '3167890123', 'Avenida 7 #20-25', 'Pereira', 'Activo', 1),
('Valentina Gómez', 'C.C', '1008901234', 'valentina.gomez@email.com', '3178901234', 'Carrera 10 #12-14', 'Manizales', 'Activo', 1),
('Andrés Felipe Torres', 'T.I', '1009012345', 'andres.torres@email.com', '3189012345', 'Calle 5 #8-10', 'Armenia', 'Activo', 1),
('Camila Andrea Vargas', 'T.I', '1010123456', 'camila.vargas@email.com', '3190123456', 'Carrera 8 #10-12', 'Ibagué', 'Activo', 1);

-- ============================================
-- PROVEEDORES
-- ============================================

INSERT INTO proveedores (nombre_empresa, nit, nombre_contacto, email, telefono, direccion, ciudad, estado, creado_por) VALUES
('Distribuidora VapeMaster S.A.S', '900123456-1', 'Roberto Sánchez', 'ventas@vapemaster.com', '6013001234', 'Calle 100 #50-20', 'Bogotá', 'Activo', 1),
('Importadora CloudTech Ltda', '900234567-2', 'Patricia Moreno', 'contacto@cloudtech.com', '6043002345', 'Carrera 45 #30-15', 'Medellín', 'Activo', 1),
('Vape Solutions Colombia', '900345678-3', 'Miguel Ángel Ruiz', 'info@vapesolutions.co', '6023003456', 'Avenida 3N #25-40', 'Cali', 'Activo', 1),
('E-Liquids Distribuciones', '900456789-4', 'Sandra Milena Castro', 'pedidos@eliquids.com', '6053004567', 'Calle 80 #40-35', 'Barranquilla', 'Activo', 1);

-- ============================================
-- USUARIOS ADICIONALES (Empleados)
-- ============================================

-- Nota: Las contraseñas deben ser hasheadas en la aplicación real
-- Aquí usamos un hash de ejemplo

INSERT INTO usuarios (nombre_completo, tipo_documento, numero_documento, email, telefono, direccion, password_hash, id_rol, estado) VALUES
('Carlos Vendedor Uno', 'C.C', '1020304050', 'vendedor1@sistema.com', '3201234567', 'Calle 20 #30-40', '$2b$10$examplehash1', 2, 'Activo'),
('Diana Vendedora Dos', 'C.C', '1030405060', 'vendedor2@sistema.com', '3212345678', 'Carrera 25 #35-45', '$2b$10$examplehash2', 2, 'Activo'),
('José Empleado Tres', 'C.C', '1040506070', 'empleado3@sistema.com', '3223456789', 'Avenida 10 #15-20', '$2b$10$examplehash3', 2, 'Activo');

-- ============================================
-- VENTAS DE EJEMPLO
-- ============================================

-- Venta 1
INSERT INTO ventas (numero_venta, fecha_venta, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, metodo_pago, observaciones)
VALUES ('VEN-2025-0001', '2025-10-01 10:30:00', 1, 1, 58000.00, 3000.00, 0, 55000.00, 'Completada', 'Efectivo', 'Cliente prefiere menta');

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(1, 1, 2, 15000.00, 1000.00, 29000.00),
(1, 10, 1, 25000.00, 0, 25000.00);

-- Venta 2
INSERT INTO ventas (numero_venta, fecha_venta, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, metodo_pago)
VALUES ('VEN-2025-0002', '2025-10-02 14:15:00', 2, 2, 165000.00, 5000.00, 0, 160000.00, 'Completada', 'Transferencia');

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(2, 7, 1, 165000.00, 5000.00, 160000.00);

-- Venta 3
INSERT INTO ventas (numero_venta, fecha_venta, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, metodo_pago)
VALUES ('VEN-2025-0003', '2025-10-03 11:20:00', 3, 1, 94000.00, 0, 0, 94000.00, 'Completada', 'Efectivo');

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(3, 2, 2, 28000.00, 0, 56000.00),
(3, 11, 1, 25000.00, 0, 25000.00),
(3, 15, 1, 8000.00, 0, 8000.00);

-- Venta 4
INSERT INTO ventas (numero_venta, fecha_venta, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, metodo_pago)
VALUES ('VEN-2025-0004', '2025-10-05 16:45:00', 4, 2, 135000.00, 0, 0, 135000.00, 'Completada', 'Transferencia');

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(4, 20, 1, 135000.00, 0, 135000.00);

-- Venta 5
INSERT INTO ventas (numero_venta, fecha_venta, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, metodo_pago)
VALUES ('VEN-2025-0005', '2025-10-07 09:30:00', 5, 1, 68000.00, 2000.00, 0, 66000.00, 'Completada', 'Efectivo');

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(5, 3, 3, 18000.00, 0, 54000.00),
(5, 17, 1, 10000.00, 0, 10000.00);

-- ============================================
-- COMPRAS DE EJEMPLO
-- ============================================

-- Compra 1
INSERT INTO compras (numero_compra, fecha_compra, id_proveedor, id_usuario, subtotal, impuesto, total, estado, observaciones)
VALUES ('COM-2025-0001', '2025-09-15 08:00:00', 1, 1, 800000.00, 152000.00, 952000.00, 'Completada', 'Pedido mensual de vaporizadores desechables');

INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
VALUES 
(1, 1, 100, 8000.00, 800000.00);

-- Compra 2
INSERT INTO compras (numero_compra, fecha_compra, id_proveedor, id_usuario, subtotal, impuesto, total, estado)
VALUES ('COM-2025-0002', '2025-09-20 10:30:00', 2, 1, 900000.00, 171000.00, 1071000.00, 'Completada');

INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
VALUES 
(2, 6, 20, 45000.00, 900000.00);

-- Compra 3
INSERT INTO compras (numero_compra, fecha_compra, id_proveedor, id_usuario, subtotal, impuesto, total, estado)
VALUES ('COM-2025-0003', '2025-09-25 14:00:00', 4, 1, 720000.00, 136800.00, 856800.00, 'Completada');

INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal)
VALUES 
(3, 10, 60, 12000.00, 720000.00);

-- ============================================
-- COTIZACIONES DE EJEMPLO
-- ============================================

-- Cotización 1 (Aprobada)
INSERT INTO cotizaciones (numero_cotizacion, fecha_cotizacion, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, validez_dias, observaciones)
VALUES ('COT-2025-0001', '2025-10-10 11:00:00', 6, 1, 225000.00, 0, 0, 225000.00, 'Aprobada', 15, 'Cliente interesado en kit premium');

INSERT INTO detalle_cotizaciones (id_cotizacion, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(1, 21, 1, 225000.00, 0, 225000.00);

-- Cotización 2 (Anulada)
INSERT INTO cotizaciones (numero_cotizacion, fecha_cotizacion, id_cliente, id_usuario, subtotal, descuento, impuesto, total, estado, validez_dias, observaciones)
VALUES ('COT-2025-0002', '2025-10-12 15:30:00', 7, 2, 98000.00, 0, 0, 98000.00, 'Anulada', 15, 'Cliente decidió no comprar');

INSERT INTO detalle_cotizaciones (id_cotizacion, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(2, 22, 1, 98000.00, 0, 98000.00);

-- ============================================
-- PEDIDOS DE EJEMPLO
-- ============================================

-- Pedido 1 (Completado)
INSERT INTO pedidos (numero_pedido, fecha_pedido, id_cliente, id_usuario, subtotal, descuento, impuesto, total, saldo_pendiente, estado, fecha_entrega, observaciones)
VALUES ('PED-2025-0001', '2025-10-08 10:00:00', 1, 1, 135000.00, 0, 0, 135000.00, 0, 'Completado', '2025-10-15', 'Entrega confirmada');

INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(1, 20, 1, 135000.00, 0, 135000.00);

-- Pedido 2 (Pendiente con abonos)
INSERT INTO pedidos (numero_pedido, fecha_pedido, id_cliente, id_usuario, subtotal, descuento, impuesto, total, saldo_pendiente, estado, fecha_entrega)
VALUES ('PED-2025-0002', '2025-10-15 14:30:00', 2, 2, 225000.00, 0, 0, 225000.00, 125000.00, 'Pendiente', '2025-10-25');

INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(2, 21, 1, 225000.00, 0, 225000.00);

-- Pedido 3 (Pendiente sin abonos)
INSERT INTO pedidos (numero_pedido, fecha_pedido, id_cliente, id_usuario, subtotal, descuento, impuesto, total, saldo_pendiente, estado, fecha_entrega)
VALUES ('PED-2025-0003', '2025-10-18 09:00:00', 3, 1, 165000.00, 0, 0, 165000.00, 165000.00, 'Pendiente', '2025-10-30');

INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, descuento, subtotal)
VALUES 
(3, 7, 1, 165000.00, 0, 165000.00);

-- ============================================
-- ABONOS DE EJEMPLO
-- ============================================

-- Abonos para el pedido 1 (ya completado)
INSERT INTO abonos (numero_abono, fecha_abono, id_pedido, id_usuario, monto_abono, metodo_pago, estado, observaciones)
VALUES 
('ABO-2025-0001', '2025-10-08 11:00:00', 1, 1, 70000.00, 'Efectivo', 'Registrado', 'Primer abono del pedido'),
('ABO-2025-0002', '2025-10-12 15:00:00', 1, 1, 65000.00, 'Transferencia', 'Registrado', 'Abono final - pedido completado');

-- Abonos para el pedido 2 (pendiente)
INSERT INTO abonos (numero_abono, fecha_abono, id_pedido, id_usuario, monto_abono, metodo_pago, estado, observaciones)
VALUES 
('ABO-2025-0003', '2025-10-15 16:00:00', 2, 2, 50000.00, 'Efectivo', 'Registrado', 'Abono inicial del 22%'),
('ABO-2025-0004', '2025-10-20 10:30:00', 2, 2, 50000.00, 'Transferencia', 'Registrado', 'Segundo abono');

-- Abono anulado de ejemplo
INSERT INTO abonos (numero_abono, fecha_abono, id_pedido, id_usuario, monto_abono, metodo_pago, estado, observaciones, anulado_por, fecha_anulacion, motivo_anulacion)
VALUES 
('ABO-2025-0005', '2025-10-21 14:00:00', 2, 2, 30000.00, 'Efectivo', 'Anulado', 'Abono ingresado por error', 1, '2025-10-21 14:30:00', 'Error en el monto ingresado');

-- ============================================
-- DEVOLUCIONES DE EJEMPLO
-- ============================================

-- Devolución 1
INSERT INTO devoluciones (numero_devolucion, fecha_devolucion, id_venta, id_usuario, total_devolucion, estado, motivo, observaciones)
VALUES ('DEV-2025-0001', '2025-10-08 16:00:00', 1, 1, 15000.00, 'Procesada', 'Producto defectuoso', 'Cliente reporta que no enciende');

INSERT INTO detalle_devoluciones (id_devolucion, id_producto, cantidad, precio_unitario, subtotal)
VALUES 
(1, 1, 1, 15000.00, 15000.00);

-- ============================================
-- NOTAS DE CRÉDITO DE EJEMPLO
-- ============================================

-- Nota de crédito generada por la devolución 1
INSERT INTO notas_credito (numero_nota_credito, fecha_nota_credito, id_devolucion, id_cliente, id_usuario, monto_credito, saldo_disponible, estado, observaciones)
VALUES ('NC-2025-0001', '2025-10-08 16:30:00', 1, 1, 1, 15000.00, 15000.00, 'Disponible', 'Crédito disponible por devolución de producto defectuoso');

-- ============================================
-- AUDITORÍA DE LOGIN (Ejemplos)
-- ============================================

INSERT INTO auditoria_login (id_usuario, email_intento, exitoso, direccion_ip, user_agent, fecha_intento) VALUES
(1, 'admin@sistema.com', true, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-10-01 08:00:00'),
(2, 'vendedor1@sistema.com', true, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-10-01 08:30:00'),
(NULL, 'usuario_falso@email.com', false, '192.168.1.150', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-10-01 09:00:00'),
(3, 'vendedor2@sistema.com', true, '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '2025-10-02 08:15:00'),
(1, 'admin@sistema.com', true, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2025-10-05 07:45:00');

-- ============================================
-- RESUMEN DE DATOS INSERTADOS
-- ============================================

-- Categorías: 6
-- Productos: 24
-- Clientes: 10
-- Proveedores: 4
-- Usuarios adicionales: 3 (total 4 con admin)
-- Ventas: 5 con detalles
-- Compras: 3 con detalles
-- Cotizaciones: 2 (1 aprobada, 1 anulada)
-- Pedidos: 3 (1 completado, 2 pendientes)
-- Abonos: 5 (4 registrados, 1 anulado)
-- Devoluciones: 1 con detalle
-- Notas de Crédito: 1
-- Auditoría Login: 5 registros

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Verificar total de registros insertados
SELECT 'Categorias' AS tabla, COUNT(*) AS registros FROM categorias
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Ventas', COUNT(*) FROM ventas
UNION ALL
SELECT 'Compras', COUNT(*) FROM compras
UNION ALL
SELECT 'Cotizaciones', COUNT(*) FROM cotizaciones
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'Abonos', COUNT(*) FROM abonos
UNION ALL
SELECT 'Devoluciones', COUNT(*) FROM devoluciones
UNION ALL
SELECT 'Notas de Credito', COUNT(*) FROM notas_credito;

-- ============================================
-- FIN DEL SCRIPT DE DATOS DE EJEMPLO
-- ============================================
