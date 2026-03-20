# Base de Datos - Sistema de Gestión Empresarial

## 📋 Descripción General

Este script contiene el esquema completo de la base de datos para un sistema de gestión empresarial con control de permisos granular basado en 14 subprocesos y operaciones CRUD.

## 🗂️ Estructura de la Base de Datos

### **Módulo de Autenticación y Permisos**

#### **Tabla: roles**
Almacena los roles de usuario del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_rol | SERIAL | Identificador único del rol |
| nombre_rol | VARCHAR(50) | Nombre del rol (Administrador, Empleado, Cliente) |
| descripcion | TEXT | Descripción del rol |
| estado | VARCHAR(20) | Estado del rol (Activo/Inactivo) |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de última actualización |

#### **Tabla: usuarios**
Almacena la información de los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_usuario | SERIAL | Identificador único del usuario |
| nombre_completo | VARCHAR(100) | Nombre completo del usuario |
| tipo_documento | VARCHAR(5) | Tipo de documento (T.I, C.C) |
| numero_documento | VARCHAR(20) | Número de documento único |
| email | VARCHAR(100) | Email único del usuario |
| telefono | VARCHAR(20) | Teléfono de contacto |
| direccion | TEXT | Dirección física |
| password_hash | VARCHAR(255) | Hash de la contraseña |
| id_rol | INTEGER | Relación con roles |
| estado | VARCHAR(20) | Estado del usuario (Activo/Inactivo) |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de última actualización |
| ultimo_acceso | TIMESTAMP | Fecha del último acceso |

#### **Tabla: subprocesos**
Define los 14 módulos/subprocesos del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_subproceso | SERIAL | Identificador único del subproceso |
| nombre_subproceso | VARCHAR(100) | Nombre del subproceso |
| codigo_subproceso | VARCHAR(50) | Código único del subproceso |
| descripcion | TEXT | Descripción del subproceso |
| icono | VARCHAR(50) | Icono para la interfaz |
| orden | INTEGER | Orden de visualización |
| estado | VARCHAR(20) | Estado (Activo/Inactivo) |

**Los 14 subprocesos definidos:**
1. USUARIOS - Gestión de Usuarios
2. ROLES - Gestión de Roles
3. PRODUCTOS - Gestión de Productos
4. CATEGORIAS - Gestión de Categorías
5. CLIENTES - Gestión de Clientes
6. PROVEEDORES - Gestión de Proveedores
7. VENTAS - Gestión de Ventas
8. COMPRAS - Gestión de Compras
9. COTIZACIONES - Gestión de Cotizaciones
10. PEDIDOS - Gestión de Pedidos
11. ABONOS - Gestión de Abonos
12. DEVOLUCIONES - Gestión de Devoluciones
13. NOTAS_CREDITO - Gestión de Notas de Crédito
14. DASHBOARD - Dashboard y Reportes

#### **Tabla: operaciones**
Define las operaciones CRUD granulares disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_operacion | SERIAL | Identificador único de la operación |
| nombre_operacion | VARCHAR(50) | Nombre de la operación |
| codigo_operacion | VARCHAR(20) | Código único (CREATE, READ, UPDATE, DELETE, EXPORT, ANNUL, APPROVE) |
| descripcion | TEXT | Descripción de la operación |
| estado | VARCHAR(20) | Estado (Activo/Inactivo) |

**Operaciones definidas:**
- **CREATE** - Crear nuevos registros
- **READ** - Visualizar y consultar registros
- **UPDATE** - Modificar registros existentes
- **DELETE** - Eliminar registros
- **EXPORT** - Exportar datos a diferentes formatos
- **ANNUL** - Anular transacciones
- **APPROVE** - Aprobar documentos o transacciones

#### **Tabla: permisos**
Matriz de permisos que relaciona roles, subprocesos y operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_permiso | SERIAL | Identificador único del permiso |
| id_rol | INTEGER | Relación con roles |
| id_subproceso | INTEGER | Relación con subprocesos |
| id_operacion | INTEGER | Relación con operaciones |
| concedido | BOOLEAN | Indica si el permiso está concedido |
| fecha_asignacion | TIMESTAMP | Fecha de asignación |
| asignado_por | INTEGER | Usuario que asignó el permiso |

**Restricción única:** (id_rol, id_subproceso, id_operacion)

---

### **Módulo de Catálogos**

#### **Tabla: categorias**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_categoria | SERIAL | Identificador único |
| nombre_categoria | VARCHAR(100) | Nombre único de la categoría |
| descripcion | TEXT | Descripción de la categoría |
| estado | VARCHAR(20) | Activo/Inactivo |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de actualización |
| creado_por | INTEGER | Usuario que creó el registro |

#### **Tabla: productos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_producto | SERIAL | Identificador único |
| codigo_producto | VARCHAR(50) | Código único del producto |
| nombre_producto | VARCHAR(200) | Nombre del producto |
| descripcion | TEXT | Descripción del producto |
| id_categoria | INTEGER | Relación con categorías |
| precio_compra | DECIMAL(10,2) | Precio de compra |
| precio_venta | DECIMAL(10,2) | Precio de venta |
| stock_actual | INTEGER | Stock actual |
| stock_minimo | INTEGER | Stock mínimo |
| imagen_url | TEXT | URL de la imagen |
| estado | VARCHAR(20) | Activo/Inactivo |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de actualización |
| creado_por | INTEGER | Usuario que creó el registro |

#### **Tabla: clientes**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_cliente | SERIAL | Identificador único |
| nombre_completo | VARCHAR(100) | Nombre completo |
| tipo_documento | VARCHAR(5) | T.I o C.C |
| numero_documento | VARCHAR(20) | Número de documento único |
| email | VARCHAR(100) | Email del cliente |
| telefono | VARCHAR(20) | Teléfono |
| direccion | TEXT | Dirección |
| ciudad | VARCHAR(100) | Ciudad |
| estado | VARCHAR(20) | Activo/Inactivo |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de actualización |
| creado_por | INTEGER | Usuario que creó el registro |

#### **Tabla: proveedores**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_proveedor | SERIAL | Identificador único |
| nombre_empresa | VARCHAR(200) | Nombre de la empresa |
| nit | VARCHAR(20) | NIT único |
| nombre_contacto | VARCHAR(100) | Nombre del contacto |
| email | VARCHAR(100) | Email |
| telefono | VARCHAR(20) | Teléfono |
| direccion | TEXT | Dirección |
| ciudad | VARCHAR(100) | Ciudad |
| estado | VARCHAR(20) | Activo/Inactivo |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de actualización |
| creado_por | INTEGER | Usuario que creó el registro |

---

### **Módulo Transaccional**

#### **Tabla: ventas**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_venta | SERIAL | Identificador único |
| numero_venta | VARCHAR(50) | Número único de venta |
| fecha_venta | TIMESTAMP | Fecha de la venta |
| id_cliente | INTEGER | Relación con clientes |
| id_usuario | INTEGER | Usuario que realizó la venta |
| subtotal | DECIMAL(10,2) | Subtotal |
| descuento | DECIMAL(10,2) | Descuento aplicado |
| impuesto | DECIMAL(10,2) | Impuesto |
| total | DECIMAL(10,2) | Total de la venta |
| estado | VARCHAR(20) | Completada/Anulada |
| metodo_pago | VARCHAR(50) | Método de pago |
| observaciones | TEXT | Observaciones |

#### **Tabla: detalle_ventas**
Detalles de productos vendidos en cada venta.

#### **Tabla: compras**
Similar a ventas, pero para compras a proveedores.

#### **Tabla: detalle_compras**
Detalles de productos comprados.

#### **Tabla: cotizaciones**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| estado | VARCHAR(20) | **Solo 2 estados: Aprobada/Anulada** |
| validez_dias | INTEGER | Días de validez de la cotización |

#### **Tabla: pedidos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| saldo_pendiente | DECIMAL(10,2) | Saldo pendiente de pago |
| estado | VARCHAR(20) | Pendiente/Completado/Anulado |
| fecha_entrega | DATE | Fecha programada de entrega |

#### **Tabla: abonos**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| monto_abono | DECIMAL(10,2) | Monto del abono |
| metodo_pago | VARCHAR(50) | **Solo Efectivo o Transferencia** |
| estado | VARCHAR(20) | **Solo 2 estados: Registrado/Anulado** |
| anulado_por | INTEGER | Usuario que anuló |
| fecha_anulacion | TIMESTAMP | Fecha de anulación |
| motivo_anulacion | TEXT | Motivo de anulación |

**Importante:** Se eliminaron los métodos de pago PSE, Nequi, Daviplata y tarjetas.

#### **Tabla: devoluciones**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_venta | INTEGER | Relación con la venta original |
| total_devolucion | DECIMAL(10,2) | Total devuelto |
| estado | VARCHAR(20) | Procesada/Anulada |
| motivo | TEXT | Motivo de la devolución |

#### **Tabla: detalle_devoluciones**
Detalles de productos devueltos.

#### **Tabla: notas_credito**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_devolucion | INTEGER | Relación con devolución |
| monto_credito | DECIMAL(10,2) | Monto del crédito |
| saldo_disponible | DECIMAL(10,2) | Saldo disponible |
| estado | VARCHAR(20) | Disponible/Utilizada/Anulada |

---

### **Módulo de Auditoría**

#### **Tabla: auditoria_login**
Registra todos los intentos de inicio de sesión.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_auditoria_login | SERIAL | Identificador único |
| id_usuario | INTEGER | Usuario que intenta acceder |
| email_intento | VARCHAR(100) | Email usado en el intento |
| exitoso | BOOLEAN | Si fue exitoso o no |
| direccion_ip | VARCHAR(45) | IP del intento |
| user_agent | TEXT | Navegador/dispositivo |
| fecha_intento | TIMESTAMP | Fecha del intento |

#### **Tabla: auditoria_operaciones**
Registra todas las operaciones CRUD realizadas en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_auditoria | SERIAL | Identificador único |
| id_usuario | INTEGER | Usuario que realizó la operación |
| tabla_afectada | VARCHAR(100) | Tabla modificada |
| id_registro | INTEGER | ID del registro afectado |
| operacion | VARCHAR(20) | CREATE/READ/UPDATE/DELETE |
| datos_anteriores | JSONB | Datos antes del cambio |
| datos_nuevos | JSONB | Datos después del cambio |
| direccion_ip | VARCHAR(45) | IP del usuario |
| fecha_operacion | TIMESTAMP | Fecha de la operación |

---

## 🔗 Relaciones Principales

### Diagrama de Relaciones

```
roles (1) ----< (N) usuarios
roles (1) ----< (N) permisos

permisos (N) >---- (1) subprocesos
permisos (N) >---- (1) operaciones

categorias (1) ----< (N) productos

ventas (1) ----< (N) detalle_ventas
ventas (N) >---- (1) clientes
ventas (N) >---- (1) usuarios

compras (1) ----< (N) detalle_compras
compras (N) >---- (1) proveedores
compras (N) >---- (1) usuarios

pedidos (1) ----< (N) detalle_pedidos
pedidos (1) ----< (N) abonos
pedidos (N) >---- (1) clientes

devoluciones (1) ----< (N) detalle_devoluciones
devoluciones (N) >---- (1) ventas
devoluciones (1) ----< (1) notas_credito
```

---

## 🔄 Triggers y Funciones Automáticas

### 1. **actualizar_fecha_actualizacion()**
Actualiza automáticamente el campo `fecha_actualizacion` cuando se modifica un registro.

**Aplicado en:**
- usuarios
- roles
- productos
- categorias
- clientes
- proveedores

### 2. **actualizar_stock_venta()**
Reduce automáticamente el stock cuando se registra una venta.

**Trigger:** `trigger_stock_venta` en `detalle_ventas`

### 3. **actualizar_stock_compra()**
Aumenta automáticamente el stock cuando se registra una compra.

**Trigger:** `trigger_stock_compra` en `detalle_compras`

### 4. **actualizar_saldo_pedido()**
Reduce el saldo pendiente del pedido cuando se registra un abono.

**Trigger:** `trigger_saldo_pedido` en `abonos`

---

## 📊 Vistas Predefinidas

### 1. **vista_ventas_detalladas**
Muestra ventas con información de cliente y vendedor.

### 2. **vista_productos_mas_vendidos**
Top de productos por cantidad vendida e ingresos generados.

### 3. **vista_stock_por_categoria**
Resumen de inventario agrupado por categoría.

### 4. **vista_pedidos_con_abonos**
Pedidos con su historial de abonos y saldos.

### 5. **vista_permisos_por_rol**
Matriz completa de permisos por rol.

---

## 🎯 Permisos por Rol Predefinidos

### **Administrador**
✅ Acceso TOTAL a todos los subprocesos y operaciones

### **Empleado**
✅ **READ** en todos los módulos  
✅ **CREATE, UPDATE** en módulos operativos (Productos, Categorías, Clientes, Proveedores, Ventas, Compras, Cotizaciones, Pedidos, Abonos, Devoluciones, Notas de Crédito)  
✅ **EXPORT, ANNUL** en módulos transaccionales (Ventas, Compras, Cotizaciones, Pedidos, Abonos, Devoluciones)  
✅ **READ, EXPORT** en Dashboard  
❌ **DELETE** (sin permisos)  
❌ **Gestión de Usuarios y Roles** (solo lectura)

### **Cliente**
✅ **READ** solo en Productos y Categorías (vista de tienda online)  
❌ Sin acceso al panel administrativo

---

## 🚀 Instalación y Uso

### Requisitos
- PostgreSQL 12 o superior
- Usuario con permisos para crear bases de datos

### Instalación

```bash
# 1. Crear la base de datos
createdb gestion_empresarial

# 2. Ejecutar el script de esquema
psql -d gestion_empresarial -f schema.sql

# 3. (Opcional) Cargar datos de prueba
psql -d gestion_empresarial -f datos_prueba.sql
```

### Usuario Administrador por Defecto

```
Email: admin@sistema.com
Password: Admin123! (debe ser hasheado en la aplicación)
Documento: C.C 1234567890
```

⚠️ **Importante:** Cambiar la contraseña inmediatamente después de la primera instalación.

---

## 📈 Índices para Optimización

El script incluye índices estratégicos en:

- **Usuarios:** email, documento, rol, estado
- **Permisos:** rol, subproceso, operación
- **Productos:** categoría, código, estado
- **Ventas:** número, cliente, usuario, fecha, estado
- **Pedidos:** número, cliente, estado, fecha
- **Abonos:** pedido, fecha, estado

---

## 🔧 Mantenimiento

### Limpieza de Auditoría
Se recomienda limpiar los registros de auditoría antiguos periódicamente:

```sql
-- Eliminar auditorías de más de 6 meses
DELETE FROM auditoria_login WHERE fecha_intento < CURRENT_DATE - INTERVAL '6 months';
DELETE FROM auditoria_operaciones WHERE fecha_operacion < CURRENT_DATE - INTERVAL '6 months';
```

### Backup de Permisos
Antes de modificar permisos, crear un respaldo:

```bash
pg_dump -t permisos -t roles -t subprocesos -t operaciones gestion_empresarial > backup_permisos.sql
```

---

## 📝 Notas Importantes

1. **Integridad Referencial:** Todas las tablas tienen restricciones de clave foránea con políticas `ON DELETE` apropiadas.

2. **Campos de Auditoría:** Todas las tablas principales incluyen `fecha_creacion`, `fecha_actualizacion` y `creado_por`.

3. **Estados Simplificados:**
   - Cotizaciones: Solo **Aprobada** o **Anulada**
   - Abonos: Solo **Registrado** o **Anulado**

4. **Métodos de Pago en Abonos:** Solo **Efectivo** y **Transferencia**

5. **Tipos de Documento:** Solo **T.I** (Tarjeta de Identidad) y **C.C** (Cédula de Ciudadanía)

6. **Sin Funcionalidad de Proveedores en Productos:** Los productos NO tienen relación directa con proveedores.

---

## 📞 Soporte

Para consultas sobre el esquema de base de datos, consulta el archivo `queries.sql` que contiene 30 consultas útiles predefinidas para operaciones comunes.

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Compatibilidad:** PostgreSQL 12+
