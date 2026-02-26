import axios from 'axios';
import { Categoria, ImageneDto, UsuarioDto, RolDto, RolPermisoDto, PermisoDto, Producto, ProductoDto, VentaPedidoDto, DetalleVentaPedidoDto, DevolucionDto, DetalleDevolucionDto, DepartmentColombian, CityColombian, Proveedor, CompraDto } from '../types';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

const geographyApi = axios.create({
    baseURL: 'https://api-colombia.com/api/v1',
});

// Categories Service
export const getCategorias = async (): Promise<Categoria[]> => {
    const response = await api.get('/CategoriaProductoes');
    // Map API response to our internal Categoria type
    return response.data.map((item: any) => ({
        id: item.id,
        nombreCategoria: item.nombreCategoria,
        descripcion: item.descripcion,
        estado: item.estado,
        idImagen: item.idImagen
    }));
};

export const createCategoria = async (categoria: Omit<Categoria, 'id'>): Promise<Categoria> => {
    const response = await api.post('/CategoriaProductoes', {
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
        estado: categoria.estado,
        idImagen: categoria.idImagen
    });
    return response.data;
};

export const updateCategoria = async (id: number, categoria: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.put(`/CategoriaProductoes/${id}`, {
        id,
        nombreCategoria: categoria.nombreCategoria,
        descripcion: categoria.descripcion,
        estado: categoria.estado,
        idImagen: categoria.idImagen
    });
    return response.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
    await api.delete(`/CategoriaProductoes/${id}`);
};

// Images Service
export const uploadImage = async (file: File): Promise<ImageneDto> => {
    const formData = new FormData();
    formData.append('imagen', file);
    // formData.append('productoId', '0'); // Optional based on our analysis

    const response = await api.post('/Imagenes/subir', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getImage = async (id: number): Promise<ImageneDto> => {
    const response = await api.get(`/Imagenes/${id}`);
    return response.data;
};

export const getAllImages = async (): Promise<ImageneDto[]> => {
    const response = await api.get('/Imagenes');
    return response.data;
};

// Users Service
export const getUsuarios = async (): Promise<UsuarioDto[]> => {
    const response = await api.get('/Usuarios');
    return response.data;
};

export const createUsuario = async (usuario: Omit<UsuarioDto, 'id'>): Promise<UsuarioDto> => {
    const response = await api.post('/Usuarios', usuario);
    return response.data;
};

export const updateUsuario = async (id: number, usuario: UsuarioDto): Promise<UsuarioDto> => {
    const response = await api.put(`/Usuarios/${id}`, {
        ...usuario,
        id
    });
    return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
    await api.delete(`/Usuarios/${id}`);
};

// Roles & Permissions Service
export const getRoles = async (): Promise<RolDto[]> => {
    const response = await api.get('/Roles');
    return response.data;
};

export const getRolesPermisos = async (): Promise<RolPermisoDto[]> => {
    const response = await api.get('/RolesPermisoes');
    return response.data;
};

export const getPermisos = async (): Promise<PermisoDto[]> => {
    const response = await api.get('/Permisoes');
    return response.data;
};

// Roles Service
export const createRol = async (rol: Omit<RolDto, 'id'>): Promise<RolDto> => {
    const response = await api.post('/Roles', rol);
    return response.data;
};

export const updateRol = async (id: number, rol: RolDto): Promise<RolDto> => {
    const response = await api.put(`/Roles/${id}`, rol);
    return response.data;
};

export const deleteRol = async (id: number): Promise<void> => {
    await api.delete(`/Roles/${id}`);
};

// RolesPermisos Service
export const createRolPermiso = async (rolPermiso: RolPermisoDto): Promise<RolPermisoDto> => {
    const response = await api.post('/RolesPermisoes', rolPermiso);
    return response.data;
};

export const deleteRolPermiso = async (id: number): Promise<void> => {
    await api.delete(`/RolesPermisoes/${id}`);
};

// Password Recovery Service
export const forgotPassword = async (request: { correo: string }): Promise<void> => {
    try {
        // Coincidimos exactamente con lo que envía la app móvil (que funciona)
        await api.post('/Usuarios/ForgotPassword', {
            correo: request.correo.trim()
        });
    } catch (error) {
        console.error('Error en forgotPassword service:', error);
        throw error;
    }
};

export const resetPassword = async (request: { correo: string; codigo: string; nuevaContraseña: string }): Promise<void> => {
    try {
        await api.post('/Usuarios/ResetPassword', {
            ...request,
            correo: request.correo.trim()
        });
    } catch (error) {
        console.error('Error en resetPassword service:', error);
        throw error;
    }
};

// Products Service
export const getProductos = async (): Promise<Producto[]> => {
    const response = await api.get('/Productoes');
    return response.data;
};

export const createProducto = async (producto: ProductoDto): Promise<Producto> => {
    const response = await api.post('/Productoes', producto);
    return response.data;
};

export const updateProducto = async (id: number, producto: ProductoDto): Promise<Producto> => {
    const response = await api.put(`/Productoes/${id}`, {
        ...producto,
        id
    });
    return response.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
    await api.delete(`/Productoes/${id}`);
};

// VentaPedidos Service
export const getVentaPedidos = async (): Promise<VentaPedidoDto[]> => {
    const response = await api.get('/VentaPedidos');
    return response.data;
};

export const getVentaPedidoById = async (id: number): Promise<VentaPedidoDto> => {
    const response = await api.get(`/VentaPedidos/${id}`);
    return response.data;
};

export const getEstados = async (): Promise<any[]> => {
    const response = await api.get('/Estadoes');
    return response.data;
};

export const getDetalleVentaPedidos = async (): Promise<any[]> => {
    const response = await api.get('/DetalleVentaPedidoes');
    return response.data;
};

export const createVentaPedido = async (ventaPedido: VentaPedidoDto): Promise<any> => {
    console.log("POST /VentaPedidos Payload:", JSON.stringify(ventaPedido));
    const response = await api.post('/VentaPedidos', ventaPedido);
    console.log("POST /VentaPedidos Response:", response.data);
    return response.data;
};

export const createDetalleVentaPedido = async (detalle: DetalleVentaPedidoDto): Promise<any> => {
    console.log("POST /DetalleVentaPedidoes Payload:", JSON.stringify(detalle));
    const response = await api.post('/DetalleVentaPedidoes', detalle);
    console.log("POST /DetalleVentaPedidoes Response:", response.data);
    return response.data;
};

// --- SERVICIOS DE DEVOLUCIONES ---

export const getDevoluciones = async (): Promise<DevolucionDto[]> => {
    const response = await api.get('/Devoluciones');
    return response.data;
};

export const createDevolucion = async (devolucion: DevolucionDto): Promise<any> => {
    console.log("POST /Devoluciones Payload:", JSON.stringify(devolucion));
    const response = await api.post('/Devoluciones', devolucion);
    return response.data;
};

export const updateDevolucion = async (id: number, devolucion: DevolucionDto): Promise<DevolucionDto> => {
    const response = await api.put(`/Devoluciones/${id}`, {
        ...devolucion,
        id
    });
    return response.data;
};

export const getDetalleDevoluciones = async (): Promise<DetalleDevolucionDto[]> => {
    const response = await api.get('/DetalleDevoluciones');
    return response.data;
};

export const createDetalleDevolucion = async (detalle: DetalleDevolucionDto): Promise<any> => {
    console.log("POST /DetalleDevoluciones Payload:", JSON.stringify(detalle));
    const response = await api.post('/DetalleDevoluciones', detalle);
    return response.data;
};

export const updateVentaPedido = async (id: number, ventaPedido: VentaPedidoDto): Promise<VentaPedidoDto> => {
    const response = await api.put(`/VentaPedidos/${id}`, {
        ...ventaPedido,
        id
    });
    return response.data;
};

export const deleteVentaPedido = async (id: number): Promise<void> => {
    await api.delete(`/VentaPedidos/${id}`);
};

// Search Usuarios by Documento (for Clients)
export const getUsuarioByDocumento = async (documento: string): Promise<UsuarioDto | null> => {
    const response = await api.get('/Usuarios');
    const usuarios: UsuarioDto[] = response.data;
    return usuarios.find(u => u.numeroDocumento === documento) || null;
};

// Colombian Geography Services
export const getDepartments = async (): Promise<DepartmentColombian[]> => {
    const response = await geographyApi.get('/Department');
    return response.data;
};

export const getCitiesByDepartment = async (departmentId: number): Promise<CityColombian[]> => {
    const response = await geographyApi.get(`/Department/${departmentId}/cities`);
    return response.data;
};

// Proveedores Service
export const getProveedores = async (): Promise<Proveedor[]> => {
    const response = await api.get('/Proveedores');
    return response.data;
};

export const createProveedor = async (proveedor: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await api.post('/Proveedores', proveedor);
    return response.data;
};

export const updateProveedor = async (id: number, proveedor: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await api.put(`/Proveedores/${id}`, {
        ...proveedor,
        id
    });
    return response.data;
};

export const deleteProveedor = async (id: number): Promise<void> => {
    await api.delete(`/Proveedores/${id}`);
};

// Compras Service
export const getCompras = async (): Promise<CompraDto[]> => {
    const response = await api.get('/Compras');
    return response.data;
};

export const getCompraById = async (id: number): Promise<CompraDto> => {
    const response = await api.get(`/Compras/${id}`);
    return response.data;
};

export const createCompra = async (compra: CompraDto): Promise<CompraDto> => {
    const response = await api.post('/Compras', compra);
    return response.data;
};

export const updateCompra = async (id: number, compra: CompraDto): Promise<CompraDto> => {
    const response = await api.put(`/Compras/${id}`, {
        ...compra,
        id
    });
    return response.data;
};

export const deleteCompra = async (id: number): Promise<void> => {
    await api.delete(`/Compras/${id}`);
};
