import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Permission, AuthContextType, RegisterData, UserRole, UsuarioDto, RolDto, RolPermisoDto, PermisoDto } from '../types';
import * as apiService from '../services/api';

// Las funciones de carga de datos reales se manejarán dentro del AuthProvider

// Las funciones de carga de datos reales se manejarán dentro del AuthProvider

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Convertir fechas de string a Date si es necesario
      if (parsedUser.createdAt && typeof parsedUser.createdAt === 'string') {
        parsedUser.createdAt = new Date(parsedUser.createdAt);
      }
      if (parsedUser.lastLogin && typeof parsedUser.lastLogin === 'string') {
        parsedUser.lastLogin = new Date(parsedUser.lastLogin);
      }
      setUser(parsedUser);
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      // 1. Obtener todos los usuarios de la API
      const apiUsers = await apiService.getUsuarios();

      // 2. Buscar el usuario que coincida con correo/username y contraseña
      const foundUserApi = apiUsers.find(u =>
        (u.correo === usernameOrEmail || (u as any).username === usernameOrEmail) &&
        u.contraseña === password &&
        u.estadoUsuario
      );

      if (foundUserApi) {
        // 3. Obtener roles y sus permisos
        const apiRoles = await apiService.getRoles();
        const apiRolPermisos = await apiService.getRolesPermisos();

        const foundRolApi = apiRoles.find(r => r.id === foundUserApi.rolId);

        if (!foundRolApi) return false;

        // 4. Mapear permisos del rol - Obtener detalles de todos los permisos primero para mayor seguridad
        const apiPermisos = await apiService.getPermisos();
        const isAdmin = foundRolApi.nombreRol === 'Administrador' || foundRolApi.nombreRol === 'Admin';

        const rolePermissions: Permission[] = isAdmin
          ? apiPermisos.map(p => ({
            id: p.id.toString(),
            name: p.nombrePermiso,
            description: p.descripcion || '',
            module: p.modulo || 'General'
          }))
          : apiRolPermisos
            .filter(rp => rp.rolId === foundUserApi.rolId)
            .map(rp => {
              const permisoInfo = apiPermisos.find(p => p.id === rp.permisoId);
              return {
                id: rp.permisoId.toString(),
                name: permisoInfo?.nombrePermiso || rp.permiso?.nombrePermiso || 'Sin nombre',
                description: permisoInfo?.descripcion || rp.permiso?.descripcion || '',
                module: permisoInfo?.modulo || rp.permiso?.modulo || 'General'
              };
            });

        const role: Role = {
          id: foundRolApi.id.toString(),
          name: foundRolApi.nombreRol,
          description: foundRolApi.descripcion,
          permissions: rolePermissions,
          isActive: foundRolApi.estadoRol === true || foundRolApi.estadoRol === null
        };

        const loggedUser: User = {
          id: foundUserApi.id.toString(),
          username: foundUserApi.correo.split('@')[0], // Fallback if no username
          email: foundUserApi.correo,
          firstName: foundUserApi.nombres,
          lastName: foundUserApi.apellidos,
          role: role,
          isActive: foundUserApi.estadoUsuario,
          createdAt: new Date(foundUserApi.fechaNacimiento), // Or any other date field
          lastLogin: new Date()
        };

        setUser(loggedUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // 1. Verificar si ya existe el usuario
      const apiUsers = await apiService.getUsuarios();
      const existingUser = apiUsers.find(u =>
        u.correo === userData.email
      );

      if (existingUser) {
        return false;
      }

      // 2. Obtener roles para encontrar el ID
      const apiRoles = await apiService.getRoles();
      const roleFound = apiRoles.find(r => r.nombreRol === userData.role) || apiRoles.find(r => r.nombreRol === 'Cliente');

      if (!roleFound) return false;

      // 3. Crear el usuario en la API
      const newUsuarioApi: Omit<UsuarioDto, 'id'> = {
        nombres: userData.firstName,
        apellidos: userData.lastName,
        correo: userData.email,
        contraseña: userData.password,
        rolId: roleFound.id,
        estadoUsuario: true,
        // Campos requeridos por la API con valores por defecto si no están en userData
        tipoDocumento: 'CC',
        numeroDocumento: '0000000000',
        telefono: '0000000000',
        ciudad: 'Desconocida',
        direccion: 'Desconocida',
        barrio: 'Desconocido',
        fechaNacimiento: new Date().toISOString().split('T')[0]
      };

      await apiService.createUsuario(newUsuarioApi);
      return true;
    } catch (error) {
      console.error('Error durante el registro:', error);
      return false;
    }
  };

  const refreshSession = async (): Promise<void> => {
    if (!user) return;
    try {
      const apiUsers = await apiService.getUsuarios();
      const currentUserApi = apiUsers.find(u => u.id.toString() === user.id);

      if (currentUserApi) {
        const apiRoles = await apiService.getRoles();
        const apiRolPermisos = await apiService.getRolesPermisos();
        const apiPermisos = await apiService.getPermisos();

        const foundRolApi = apiRoles.find(r => r.id === currentUserApi.rolId);
        if (!foundRolApi) return;

        const isAdmin = foundRolApi.nombreRol === 'Administrador' || foundRolApi.nombreRol === 'Admin';
        const rolePermissions: Permission[] = isAdmin
          ? apiPermisos.map(p => ({
            id: p.id.toString(),
            name: p.nombrePermiso,
            description: p.descripcion || '',
            module: p.modulo || 'General'
          }))
          : apiRolPermisos
            .filter(rp => rp.rolId === currentUserApi.rolId)
            .map(rp => {
              const permisoInfo = apiPermisos.find(p => p.id === rp.permisoId);
              return {
                id: rp.permisoId.toString(),
                name: permisoInfo?.nombrePermiso || rp.permiso?.nombrePermiso || 'Sin nombre',
                description: permisoInfo?.descripcion || rp.permiso?.descripcion || '',
                module: permisoInfo?.modulo || rp.permiso?.modulo || 'General'
              };
            });

        const role: Role = {
          id: foundRolApi.id.toString(),
          name: foundRolApi.nombreRol,
          description: foundRolApi.descripcion,
          permissions: rolePermissions,
          isActive: foundRolApi.estadoRol === true || foundRolApi.estadoRol === null
        };

        const updatedUser: User = {
          ...user,
          role: role,
          isActive: currentUserApi.estadoUsuario,
          firstName: currentUserApi.nombres,
          lastName: currentUserApi.apellidos
        };

        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refrescando sesión:', error);
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
