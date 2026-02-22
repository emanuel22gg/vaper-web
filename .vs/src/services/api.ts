import axios from 'axios';
import { Categoria, ImageneDto, UsuarioDto, RolDto, RolPermisoDto, PermisoDto } from '../types';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
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
