// Tipos para clientes
export interface Cliente {
  id: string;
  codigo?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  celular?: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  pais: string;
  fechaNacimiento?: Date;
  tipoDocumento: 'CC' | 'CE' | 'NIT' | 'PP';
  numeroDocumento: string;
  tipoCliente?: 'Minorista' | 'Mayorista' | null;
  descuento?: number; // Descuento en porcentaje para clientes Mayoristas
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: Date;
  totalCompras: number;
  cantidadOrdenes: number;
  ultimaCompra?: Date;
  genero?: 'Masculino' | 'Femenino' | 'Otro';
  recibePromociones: boolean;
  observaciones?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export type UserRole = 'Super Administrador' | 'Administrador' | 'Empleado' | 'Cliente';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  numeroDocumento: string;
  tipoDocumento: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  barrio: string;
  departamento?: string;
  fechaNacimiento: string;
  tipoCliente?: 'Minorista' | 'Mayorista' | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  documentoUrl?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
  documentoUrl?: string;
  telefono?: string;
  departamento?: string;
  ciudad?: string;
  barrio?: string;
  direccion?: string;
  fechaNacimiento?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  updateUser: (userData: User) => Promise<boolean>;
}

export interface CambioEstadoCategoria {
  id: number;
  fechaCambio: string;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo: string;
  usuario: string;
}


export interface Categoria {
  id: number;
  nombreCategoria: string;
  descripcion: string;
  estado: boolean;
  idImagen?: number;
  imagen?: string;
}

export interface CategoriaFormData {
  nombreCategoria: string;
  descripcion: string;
  estado: boolean;
  imageFile?: File;
  idImagen?: number;
  previewUrl?: string;
}

export interface ImageneDto {
  idImagen: number;
  urlimagen: string;
  productoId?: number;
}

// DTOs de la API
export interface UsuarioDto {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  contraseña?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  barrio: string;
  departamento: string;
  fechaNacimiento: string;
  estadoUsuario: boolean;
  rolId: number;
  tipoCliente?: 'Minorista' | 'Mayorista' | null;
  username?: string;
  documentoUrl?: string; // Para validar la mayoría de edad
}

export interface RolDto {
  id: number;
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean | null;
}

export interface PermisoDto {
  id: number;
  nombrePermiso: string;
  descripcion: string;
  modulo: string;
  estado: boolean;
}

export interface RolPermisoDto {
  id: number;
  rolId: number;
  permisoId: number;
  permiso?: PermisoDto;
  rol?: RolDto;
}

export interface ForgotPasswordRequest {
  correo: string;
}

export interface ResetPasswordRequest {
  correo: string;
  codigo: string;
  nuevaContraseña: string;
}


export interface Producto {
  id: number;
  nombreProducto: string;
  precio: number;
  stock: number;
  categoriaId: number;
  descripcion: string;
  idImagen?: number;
  estado: boolean;
  categoria?: Categoria;
  imagen?: string;
}

export interface ProductoDto {
  id?: number;
  nombreProducto: string;
  precio: number;
  stock: number;
  categoriaId: number;
  descripcion: string;
  idImagen?: number;
  estado: boolean;
}

export interface DetalleVentaPedidoDto {
  id?: number;
  ventaPedidoId?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaAbonoDto {
  id: number;
  ventaPedidoId: number;
  monto: number;
  saldoRestante: number;
  fecha: string;
  metodoPago: string;
  estado: boolean;
}

export interface VentaPedidoDto {
  id?: number;
  usuarioId: number;
  estadoId: number;
  fechaCreacion?: string;
  fechaEntrega?: string;
  metodoPago: string;
  direccionEntrega: string;
  ciudadEntrega: string;
  departamentoEntrega: string;
  //barrio?: string;
  observaciones?: string;
  comprobanteUrl?: string;
  plazoAbonos: number | null;
  subtotal: number;
  envio: number;
  total: number;
  vigenciaDevolucion?: number;
  tipoVenta: string; // "Pedido" o "Venta"
  detalleVenta_Pedido?: DetalleVentaPedidoDto[]; // Conexión con la tabla detalleVenta_Pedido
}

export interface DevolucionDto {
  id?: number;
  ventaPedidoId: number;
  fechaDevolucion: string;
  motivo?: string;
  descripcion?: string; // Mapeo para la base de datos
  estadoId: number; // 5 = Aceptada, 3/4 = Anulada/Cancelada
  montoTotal: number;
}

export interface DetalleDevolucionDto {
  id?: number;
  devolucionId: number;
  detalleVentaPedidoId: number;
  cantidad: number;
  motivo?: string; // Por qué se devuelve el producto (defectuoso)
}

export interface DepartmentColombian {
  id: number;
  name: string;
  description: string;
  cityCount: number;
}

export interface CityColombian {
  id: number;
  name: string;
  description: string;
  surface: number;
  population: number;
  postalCode: string;
  departmentId: number;
  department: any;
}
export interface Proveedor {
  id: number;
  codigo?: string;
  tipoPersona: 'natural' | 'juridica';
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  razonSocial?: string;
  nit?: string;
  celular?: string;
  pais?: string;
  productos?: string[];
  fechaRegistro?: string;
  ultimaCompra?: string;
  totalCompras?: number;
  banco?: string;
  numeroCuenta?: string;
  tipoCuenta?: string;
  contactoAdicional?: {
    nombre: string;
    cargo: string;
    telefono: string;
    email: string;
  };
  observaciones?: string;

  // Campos del Controlador C#
  nombreCompletoORazonSocial?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  representanteLegal?: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: boolean; // Cambiado a boolean para coincidir con el backend

  // Campos adicionales del modelo C#
  metodoPagoPreferido?: string;
  latitud?: number;
  longitud?: number;
  informacionAdicional?: string;
}

export interface DetalleCompraDto {
  id?: number;
  compraId?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  // Navegación opcional (si se requiere mostrar nombres en UI)
  producto?: any;
}

export interface CompraDto {
  id?: number;
  numeroCompra?: string;
  numeroFactura?: string;
  fechaCompra: string;
  fechaRegistro?: string;
  proveedorId: number;
  subtotal: number;
  total: number;
  estado: number;
  observaciones?: string;
  fechaCreacion?: string;
  detalleCompras?: DetalleCompraDto[];
}
export interface DetalleCotizacionDto {
  id?: number;
  cotizacionId?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  nombreProducto?: string;
}

export interface CotizacionDto {
  id?: number;
  nombreUsuario: string;
  fecha?: string;
  total: number;
  subtotal: number;
  descuento: number;
  vigencia?: number;
  estadoId: number;
  detalleCotizaciones?: DetalleCotizacionDto[];
}
