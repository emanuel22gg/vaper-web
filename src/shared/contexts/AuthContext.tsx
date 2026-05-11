import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Permission, AuthContextType, RegisterData, UserRole, UsuarioDto, RolDto, RolPermisoDto, PermisoDto } from '@/shared/types';
import * as apiService from '@/shared/services/api';

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

      // 2. Buscar el usuario que coincida con correo/documento/username y contraseña
      const foundUserApi = apiUsers.find(u =>
        (u.correo === usernameOrEmail || u.numeroDocumento === usernameOrEmail || (u as any).username === usernameOrEmail) &&
        u.contraseña === password
      );

      if (!foundUserApi) {
        throw new Error('InvalidCredentials');
      }

      // 3. Verificar si el usuario está activo
      if (!foundUserApi.estadoUsuario) {
        if (foundUserApi.documentoUrl) {
          throw new Error('UserPendingApproval');
        }
        throw new Error('UserDeactivated');
      }

      // 4. Obtener roles y sus permisos
      const apiRoles = await apiService.getRoles();
      const foundRolApi = apiRoles.find(r => r.id === foundUserApi.rolId);

      if (!foundRolApi) {
        throw new Error('RoleNotFound');
      }

      // 5. Verificar si el rol está activo
      if (foundRolApi.estadoRol === false) {
        throw new Error('RoleDeactivated');
      }

      // 6. Mapear permisos del rol
      const apiRolPermisos = await apiService.getRolesPermisos();
      const apiPermisos = await apiService.getPermisos();
      const isAdmin =
        foundRolApi.nombreRol === 'Administrador' ||
        foundRolApi.nombreRol === 'Admin' ||
        foundRolApi.nombreRol === 'Super Administrador';

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
        username: (foundUserApi as any).username || foundUserApi.numeroDocumento || foundUserApi.correo.split('@')[0],
        email: foundUserApi.correo,
        firstName: foundUserApi.nombres,
        lastName: foundUserApi.apellidos,
        numeroDocumento: foundUserApi.numeroDocumento,
        tipoDocumento: foundUserApi.tipoDocumento,
        telefono: foundUserApi.telefono,
        ciudad: foundUserApi.ciudad,
        direccion: foundUserApi.direccion,
        barrio: foundUserApi.barrio,
        departamento: foundUserApi.departamento,
        fechaNacimiento: foundUserApi.fechaNacimiento,
        tipoCliente: foundUserApi.tipoCliente,
        role: role,
        isActive: foundUserApi.estadoUsuario,
        createdAt: new Date(foundUserApi.fechaNacimiento),
        lastLogin: new Date()
      };

      setUser(loggedUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));
      return true;
    } catch (error: any) {
      console.error('Error durante el login:', error);
      // Propagar el error para que el formulario pueda manejarlo específicamente
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '/';
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

      // 3. Crear el usuario en la API con estadoUsuario = false para requerir aprobación
      const newUsuarioApi: Omit<UsuarioDto, 'id'> = {
        nombres: userData.firstName,
        apellidos: userData.lastName,
        correo: userData.email,
        contraseña: userData.password,
        rolId: roleFound.id,
        estadoUsuario: false, // Inactivo por defecto, requiere validación de edad
        documentoUrl: userData.documentoUrl, // Guardar la URL del documento
        // Campos requeridos por la API con valores por defecto si no están en userData
        tipoDocumento: userData.tipoDocumento || 'CC',
        numeroDocumento: userData.username || '0000000000', // Usamos el username (documento) si existe
        telefono: userData.telefono || '',
        ciudad: userData.ciudad || '',
        departamento: userData.departamento || '',
        direccion: userData.direccion || '',
        barrio: userData.barrio || '',
        fechaNacimiento: userData.fechaNacimiento || new Date().toISOString().split('T')[0],
        tipoCliente: 'Minorista'
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

        const isAdmin =
          foundRolApi.nombreRol === 'Administrador' ||
          foundRolApi.nombreRol === 'Admin' ||
          foundRolApi.nombreRol === 'Super Administrador';
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
          lastName: currentUserApi.apellidos,
          numeroDocumento: currentUserApi.numeroDocumento,
          tipoDocumento: currentUserApi.tipoDocumento,
          telefono: currentUserApi.telefono,
          ciudad: currentUserApi.ciudad,
          direccion: currentUserApi.direccion,
          barrio: currentUserApi.barrio,
          departamento: currentUserApi.departamento,
          fechaNacimiento: currentUserApi.fechaNacimiento,
          tipoCliente: currentUserApi.tipoCliente
        };

        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refrescando sesión:', error);
    }
  };

  const updateUser = async (userData: User): Promise<boolean> => {
    try {
      const usuarioDto: UsuarioDto = {
        id: parseInt(userData.id),
        nombres: userData.firstName,
        apellidos: userData.lastName,
        correo: userData.email,
        contraseña: userData.password,
        rolId: parseInt(userData.role.id),
        estadoUsuario: userData.isActive,
        numeroDocumento: userData.numeroDocumento,
        tipoDocumento: userData.tipoDocumento,
        telefono: userData.telefono,
        ciudad: userData.ciudad,
        direccion: userData.direccion,
        barrio: userData.barrio,
        departamento: userData.departamento || '',
        fechaNacimiento: userData.fechaNacimiento,
        tipoCliente: userData.tipoCliente
      };

      await apiService.updateUsuario(usuarioDto.id, usuarioDto);
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    refreshSession,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
