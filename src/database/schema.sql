-- ============================================
-- SCRIPT DE BASE DE DATOS - SISTEMA DE GESTIÓN EMPRESARIAL
-- Sistema de permisos basado en 14 subprocesos con operaciones granulares
-- ============================================

-- ============================================
-- TABLAS BASE: ROLES Y USUARIOS
-- ============================================

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(5) NOT NULL CHECK (tipo_documento IN ('T.I', 'C.C')),
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol) ON DELETE RESTRICT,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- ============================================
-- TABLAS DE PERMISOS: SUBPROCESOS Y OPERACIONES
-- ============================================

CREATE TABLE subprocesos (
    id_subproceso SERIAL PRIMARY KEY,
    nombre_subproceso VARCHAR(100) NOT NULL UNIQUE,
    codigo_subproceso VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    orden INTEGER,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operaciones (
    id_operacion SERIAL PRIMARY KEY,
    nombre_operacion VARCHAR(50) NOT NULL,
    codigo_operacion VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permisos (
    id_permiso SERIAL PRIMARY KEY,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol) ON DELETE CASCADE,
    id_subproceso INTEGER NOT NULL REFERENCES subprocesos(id_subproceso) ON DELETE CASCADE,
    id_operacion INTEGER NOT NULL REFERENCES operaciones(id_operacion) ON DELETE CASCADE,
    concedido BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INTEGER REFERENCES usuarios(id_usuario),
    UNIQUE (id_rol, id_subproceso, id_operacion)
);

-- ============================================
-- TABLAS DE CATÁLOGOS
-- ============================================

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    codigo_producto VARCHAR(50) UNIQUE,
    nombre_producto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    id_categoria INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    precio_compra DECIMAL(10, 2) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    imagen_url TEXT,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(5) NOT NULL CHECK (tipo_documento IN ('T.I', 'C.C')),
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    nombre_contacto VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id_usuario)
);

-- ============================================
-- TABLAS TRANSACCIONALES: VENTAS
-- ============================================

CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    numero_venta VARCHAR(50) UNIQUE NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuesto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Completada' CHECK (estado IN ('Completada', 'Anulada')),
    metodo_pago VARCHAR(50),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_ventas (
    id_detalle_venta SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS TRANSACCIONALES: COMPRAS
-- ============================================

CREATE TABLE compras (
    id_compra SERIAL PRIMARY KEY,
    numero_compra VARCHAR(50) UNIQUE NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    subtotal DECIMAL(10, 2) NOT NULL,
    impuesto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Completada' CHECK (estado IN ('Completada', 'Anulada')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INTEGER NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS TRANSACCIONALES: COTIZACIONES
-- ============================================

CREATE TABLE cotizaciones (
    id_cotizacion SERIAL PRIMARY KEY,
    numero_cotizacion VARCHAR(50) UNIQUE NOT NULL,
    fecha_cotizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuesto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Aprobada' CHECK (estado IN ('Aprobada', 'Anulada')),
    validez_dias INTEGER DEFAULT 15,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_cotizaciones (
    id_detalle_cotizacion SERIAL PRIMARY KEY,
    id_cotizacion INTEGER NOT NULL REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS TRANSACCIONALES: PEDIDOS
-- ============================================

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    impuesto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    saldo_pendiente DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Completado', 'Anulado')),
    fecha_entrega DATE,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_pedidos (
    id_detalle_pedido SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS TRANSACCIONALES: ABONOS
-- ============================================

CREATE TABLE abonos (
    id_abono SERIAL PRIMARY KEY,
    numero_abono VARCHAR(50) UNIQUE NOT NULL,
    fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    monto_abono DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Transferencia')),
    estado VARCHAR(20) DEFAULT 'Registrado' CHECK (estado IN ('Registrado', 'Anulado')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anulado_por INTEGER REFERENCES usuarios(id_usuario),
    fecha_anulacion TIMESTAMP,
    motivo_anulacion TEXT
);

-- ============================================
-- TABLAS TRANSACCIONALES: DEVOLUCIONES
-- ============================================

CREATE TABLE devoluciones (
    id_devolucion SERIAL PRIMARY KEY,
    numero_devolucion VARCHAR(50) UNIQUE NOT NULL,
    fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_venta INTEGER REFERENCES ventas(id_venta) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    total_devolucion DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Procesada' CHECK (estado IN ('Procesada', 'Anulada')),
    motivo TEXT,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_devoluciones (
    id_detalle_devolucion SERIAL PRIMARY KEY,
    id_devolucion INTEGER NOT NULL REFERENCES devoluciones(id_devolucion) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS TRANSACCIONALES: NOTAS DE CRÉDITO
-- ============================================

CREATE TABLE notas_credito (
    id_nota_credito SERIAL PRIMARY KEY,
    numero_nota_credito VARCHAR(50) UNIQUE NOT NULL,
    fecha_nota_credito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_devolucion INTEGER REFERENCES devoluciones(id_devolucion) ON DELETE RESTRICT,
    id_cliente INTEGER REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    monto_credito DECIMAL(10, 2) NOT NULL,
    saldo_disponible DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Utilizada', 'Anulada')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLAS DE AUDITORÍA Y LOGS
-- ============================================

CREATE TABLE auditoria_login (
    id_auditoria_login SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    email_intento VARCHAR(100),
    exitoso BOOLEAN,
    direccion_ip VARCHAR(45),
    user_agent TEXT,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auditoria_operaciones (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    tabla_afectada VARCHAR(100),
    id_registro INTEGER,
    operacion VARCHAR(20) CHECK (operacion IN ('CREATE', 'READ', 'UPDATE', 'DELETE')),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    direccion_ip VARCHAR(45),
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_documento ON usuarios(numero_documento);
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

-- Índices para permisos
CREATE INDEX idx_permisos_rol ON permisos(id_rol);
CREATE INDEX idx_permisos_subproceso ON permisos(id_subproceso);
CREATE INDEX idx_permisos_operacion ON permisos(id_operacion);

-- Índices para productos
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_codigo ON productos(codigo_producto);
CREATE INDEX idx_productos_estado ON productos(estado);

-- Índices para clientes
CREATE INDEX idx_clientes_documento ON clientes(numero_documento);
CREATE INDEX idx_clientes_estado ON clientes(estado);

-- Índices para ventas
CREATE INDEX idx_ventas_numero ON ventas(numero_venta);
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_ventas_usuario ON ventas(id_usuario);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_estado ON ventas(estado);

-- Índices para compras
CREATE INDEX idx_compras_numero ON compras(numero_compra);
CREATE INDEX idx_compras_proveedor ON compras(id_proveedor);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);

-- Índices para pedidos
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);

-- Índices para abonos
CREATE INDEX idx_abonos_pedido ON abonos(id_pedido);
CREATE INDEX idx_abonos_fecha ON abonos(fecha_abono);
CREATE INDEX idx_abonos_estado ON abonos(estado);

-- ============================================
-- DATOS INICIALES: OPERACIONES CRUD
-- ============================================

INSERT INTO operaciones (nombre_operacion, codigo_operacion, descripcion) VALUES
('Crear', 'CREATE', 'Crear nuevos registros'),
('Leer', 'READ', 'Visualizar y consultar registros'),
('Actualizar', 'UPDATE', 'Modificar registros existentes'),
('Eliminar', 'DELETE', 'Eliminar registros'),
('Exportar', 'EXPORT', 'Exportar datos a diferentes formatos'),
('Anular', 'ANNUL', 'Anular transacciones'),
('Aprobar', 'APPROVE', 'Aprobar documentos o transacciones');

-- ============================================
-- DATOS INICIALES: 14 SUBPROCESOS
-- ============================================

INSERT INTO subprocesos (nombre_subproceso, codigo_subproceso, descripcion, icono, orden) VALUES
('Gestión de Usuarios', 'USUARIOS', 'Administración de usuarios del sistema', 'Users', 1),
('Gestión de Roles', 'ROLES', 'Administración de roles y permisos', 'Shield', 2),
('Gestión de Productos', 'PRODUCTOS', 'Administración del catálogo de productos', 'Package', 3),
('Gestión de Categorías', 'CATEGORIAS', 'Administración de categorías de productos', 'FolderTree', 4),
('Gestión de Clientes', 'CLIENTES', 'Administración de clientes', 'UserCheck', 5),
('Gestión de Proveedores', 'PROVEEDORES', 'Administración de proveedores', 'Truck', 6),
('Gestión de Ventas', 'VENTAS', 'Registro y control de ventas', 'ShoppingCart', 7),
('Gestión de Compras', 'COMPRAS', 'Registro y control de compras', 'ShoppingBag', 8),
('Gestión de Cotizaciones', 'COTIZACIONES', 'Administración de cotizaciones', 'FileText', 9),
('Gestión de Pedidos', 'PEDIDOS', 'Administración de pedidos', 'ClipboardList', 10),
('Gestión de Abonos', 'ABONOS', 'Registro de abonos a pedidos', 'DollarSign', 11),
('Gestión de Devoluciones', 'DEVOLUCIONES', 'Procesamiento de devoluciones', 'RotateCcw', 12),
('Gestión de Notas de Crédito', 'NOTAS_CREDITO', 'Administración de notas de crédito', 'CreditCard', 13),
('Dashboard y Reportes', 'DASHBOARD', 'Visualización de estadísticas y reportes', 'BarChart3', 14);

-- ============================================
-- DATOS INICIALES: ROLES PREDEFINIDOS
-- ============================================

INSERT INTO roles (nombre_rol, descripcion, estado) VALUES
('Administrador', 'Acceso completo a todas las funcionalidades del sistema', 'Activo'),
('Empleado', 'Acceso limitado a funciones operativas', 'Activo'),
('Cliente', 'Acceso solo a la tienda online', 'Activo');

-- ============================================
-- PERMISOS PREDEFINIDOS: ADMINISTRADOR (Acceso Total)
-- ============================================

-- El Administrador tiene todos los permisos en todos los subprocesos
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido)
SELECT 1, s.id_subproceso, o.id_operacion, TRUE
FROM subprocesos s
CROSS JOIN operaciones o;

-- ============================================
-- PERMISOS PREDEFINIDOS: EMPLEADO (Acceso Limitado)
-- ============================================

-- Empleado puede LEER todos los módulos
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido)
SELECT 2, s.id_subproceso, o.id_operacion, TRUE
FROM subprocesos s
CROSS JOIN operaciones o
WHERE o.codigo_operacion = 'READ';

-- Empleado puede CREAR, ACTUALIZAR en módulos operativos
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido)
SELECT 2, s.id_subproceso, o.id_operacion, TRUE
FROM subprocesos s
CROSS JOIN operaciones o
WHERE s.codigo_subproceso IN ('PRODUCTOS', 'CATEGORIAS', 'CLIENTES', 'PROVEEDORES', 'VENTAS', 'COMPRAS', 'COTIZACIONES', 'PEDIDOS', 'ABONOS', 'DEVOLUCIONES', 'NOTAS_CREDITO')
AND o.codigo_operacion IN ('CREATE', 'UPDATE');

-- Empleado puede EXPORTAR y ANULAR
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido)
SELECT 2, s.id_subproceso, o.id_operacion, TRUE
FROM subprocesos s
CROSS JOIN operaciones o
WHERE s.codigo_subproceso IN ('VENTAS', 'COMPRAS', 'COTIZACIONES', 'PEDIDOS', 'ABONOS', 'DEVOLUCIONES')
AND o.codigo_operacion IN ('EXPORT', 'ANNUL');

-- Empleado puede ver Dashboard
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido)
SELECT 2, s.id_subproceso, o.id_operacion, TRUE
FROM subprocesos s
CROSS JOIN operaciones o
WHERE s.codigo_subproceso = 'DASHBOARD'
AND o.codigo_operacion IN ('READ', 'EXPORT');

-- ============================================
-- PERMISOS PREDEFINIDOS: CLIENTE (Solo Tienda)
-- ============================================

-- Cliente solo puede ver productos y categorías
INSERT INTO permisos (id_rol, id_subproceso, id_operacion, concedido)
SELECT 3, s.id_subproceso, o.id_operacion, TRUE
FROM subprocesos s
CROSS JOIN operaciones o
WHERE s.codigo_subproceso IN ('PRODUCTOS', 'CATEGORIAS')
AND o.codigo_operacion = 'READ';

-- ============================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- ============================================

-- Password: Admin123! (debe ser hasheado en la aplicación)
INSERT INTO usuarios (nombre_completo, tipo_documento, numero_documento, email, telefono, password_hash, id_rol, estado)
VALUES 
('Administrador del Sistema', 'C.C', '1234567890', 'admin@sistema.com', '3001234567', '$2b$10$hashedpassword', 1, 'Activo');

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con fecha_actualizacion
CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_roles
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_categorias
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_proveedores
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para actualizar stock de productos al registrar ventas
CREATE OR REPLACE FUNCTION actualizar_stock_venta()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos 
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_venta
    AFTER INSERT ON detalle_ventas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_venta();

-- Función para actualizar stock de productos al registrar compras
CREATE OR REPLACE FUNCTION actualizar_stock_compra()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos 
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id_producto = NEW.id_producto;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_compra
    AFTER INSERT ON detalle_compras
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_compra();

-- Función para actualizar saldo pendiente de pedidos al registrar abonos
CREATE OR REPLACE FUNCTION actualizar_saldo_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'Registrado' THEN
        UPDATE pedidos 
        SET saldo_pendiente = saldo_pendiente - NEW.monto_abono
        WHERE id_pedido = NEW.id_pedido;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saldo_pedido
    AFTER INSERT ON abonos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_saldo_pedido();

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista de ventas con detalles
CREATE OR REPLACE VIEW vista_ventas_detalladas AS
SELECT 
    v.id_venta,
    v.numero_venta,
    v.fecha_venta,
    c.nombre_completo AS cliente,
    c.numero_documento AS documento_cliente,
    u.nombre_completo AS vendedor,
    v.subtotal,
    v.descuento,
    v.impuesto,
    v.total,
    v.estado,
    v.metodo_pago
FROM ventas v
LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
JOIN usuarios u ON v.id_usuario = u.id_usuario;

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT 
    p.id_producto,
    p.nombre_producto,
    p.codigo_producto,
    cat.nombre_categoria,
    SUM(dv.cantidad) AS total_vendido,
    SUM(dv.subtotal) AS total_ingresos
FROM productos p
JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
JOIN ventas v ON dv.id_venta = v.id_venta
LEFT JOIN categorias cat ON p.id_categoria = cat.id_categoria
WHERE v.estado = 'Completada'
GROUP BY p.id_producto, p.nombre_producto, p.codigo_producto, cat.nombre_categoria
ORDER BY total_vendido DESC;

-- Vista de stock por categoría
CREATE OR REPLACE VIEW vista_stock_por_categoria AS
SELECT 
    cat.id_categoria,
    cat.nombre_categoria,
    COUNT(p.id_producto) AS total_productos,
    SUM(p.stock_actual) AS stock_total,
    SUM(p.stock_actual * p.precio_compra) AS valor_inventario
FROM categorias cat
LEFT JOIN productos p ON cat.id_categoria = p.id_categoria
WHERE p.estado = 'Activo'
GROUP BY cat.id_categoria, cat.nombre_categoria
ORDER BY stock_total DESC;

-- Vista de pedidos con abonos
CREATE OR REPLACE VIEW vista_pedidos_con_abonos AS
SELECT 
    ped.id_pedido,
    ped.numero_pedido,
    ped.fecha_pedido,
    c.nombre_completo AS cliente,
    ped.total,
    ped.saldo_pendiente,
    COUNT(a.id_abono) AS total_abonos,
    COALESCE(SUM(CASE WHEN a.estado = 'Registrado' THEN a.monto_abono ELSE 0 END), 0) AS total_abonado,
    ped.estado
FROM pedidos ped
LEFT JOIN clientes c ON ped.id_cliente = c.id_cliente
LEFT JOIN abonos a ON ped.id_pedido = a.id_pedido
GROUP BY ped.id_pedido, ped.numero_pedido, ped.fecha_pedido, c.nombre_completo, ped.total, ped.saldo_pendiente, ped.estado;

-- Vista de resumen de permisos por rol
CREATE OR REPLACE VIEW vista_permisos_por_rol AS
SELECT 
    r.nombre_rol,
    s.nombre_subproceso,
    o.nombre_operacion,
    p.concedido
FROM permisos p
JOIN roles r ON p.id_rol = r.id_rol
JOIN subprocesos s ON p.id_subproceso = s.id_subproceso
JOIN operaciones o ON p.id_operacion = o.id_operacion
WHERE p.concedido = TRUE
ORDER BY r.nombre_rol, s.orden, o.codigo_operacion;

-- ============================================
-- COMENTARIOS EN TABLAS (DOCUMENTACIÓN)
-- ============================================

COMMENT ON TABLE roles IS 'Roles de usuarios del sistema con permisos asociados';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema con autenticación y roles asignados';
COMMENT ON TABLE subprocesos IS 'Los 14 módulos/subprocesos del sistema de gestión';
COMMENT ON TABLE operaciones IS 'Operaciones CRUD granulares disponibles en el sistema';
COMMENT ON TABLE permisos IS 'Matriz de permisos que relaciona roles, subprocesos y operaciones';
COMMENT ON TABLE productos IS 'Catálogo de productos de vaporizadores';
COMMENT ON TABLE categorias IS 'Categorías para organizar productos';
COMMENT ON TABLE ventas IS 'Registro de ventas realizadas';
COMMENT ON TABLE compras IS 'Registro de compras a proveedores';
COMMENT ON TABLE cotizaciones IS 'Cotizaciones con estados: Aprobada o Anulada';
COMMENT ON TABLE pedidos IS 'Pedidos de clientes con control de abonos';
COMMENT ON TABLE abonos IS 'Abonos a pedidos con estados: Registrado o Anulado';
COMMENT ON TABLE devoluciones IS 'Devoluciones de productos de ventas';
COMMENT ON TABLE notas_credito IS 'Notas de crédito generadas por devoluciones';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
