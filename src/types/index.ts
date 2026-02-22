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
  tipo: 'Minorista' | 'Mayorista';
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

export type UserRole = 'Administrador' | 'Empleado' | 'Cliente';

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
  direccion: string;
  barrio: string;
  fechaNacimiento: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface RegisterData {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  refreshSession: () => Promise<void>;
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
  fechaNacimiento: string;
  estadoUsuario: boolean;
  rolId: number;
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

