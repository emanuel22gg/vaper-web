import { useState, useEffect } from 'react';
import { User, Role, Permission } from '../types';
import * as apiService from '../services/api';
import { useAuth } from './useAuth';

// Hook para acceder a la lista de usuarios (para admin)
export const useUsers = () => {
    const { refreshSession } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const [apiUsers, apiRoles, apiRolPermisos, apiPermisos] = await Promise.all([
                apiService.getUsuarios(),
                apiService.getRoles(),
                apiService.getRolesPermisos(),
                apiService.getPermisos()
            ]);

            const mappedPermissions: Permission[] = apiPermisos.map(p => ({
                id: p.id.toString(),
                name: p.nombrePermiso,
                description: p.descripcion || '',
                module: p.modulo || 'General'
            }));

            setAvailablePermissions(mappedPermissions);

            const mappedRoles: Role[] = apiRoles.map(r => {
                const isAdmin = r.nombreRol === 'Administrador' || r.nombreRol === 'Admin';
                return {
                    id: r.id.toString(),
                    name: r.nombreRol,
                    description: r.descripcion,
                    isActive: r.estadoRol === true || r.estadoRol === null,
                    permissions: isAdmin
                        ? mappedPermissions
                        : apiRolPermisos
                            .filter(rp => rp.rolId === r.id)
                            .map(rp => {
                                const permisoInfo = apiPermisos.find(p => p.id === rp.permisoId);
                                return {
                                    id: rp.permisoId.toString(),
                                    name: permisoInfo?.nombrePermiso || rp.permiso?.nombrePermiso || 'Sin nombre',
                                    description: permisoInfo?.descripcion || rp.permiso?.descripcion || '',
                                    module: permisoInfo?.modulo || rp.permiso?.modulo || 'General'
                                };
                            })
                };
            });

            const mappedUsers: User[] = apiUsers.map(u => {
                const userRole = mappedRoles.find(r => r.id === u.rolId.toString()) || mappedRoles[0];
                return {
                    id: u.id.toString(),
                    username: u.correo.split('@')[0],
                    email: u.correo,
                    firstName: u.nombres,
                    lastName: u.apellidos,
                    role: userRole,
                    isActive: u.estadoUsuario,
                    createdAt: new Date(u.fechaNacimiento)
                };
            });

            setUsers(mappedUsers);
            setAvailableRoles(mappedRoles);

            console.log('API Roles result:', apiRoles);
            console.log('Permisos cargados:', mappedPermissions.map(p => p.name));
            console.log('Roles cargados:', mappedRoles.map(r => ({ name: r.name, isActive: r.isActive, permissions: r.permissions.map(p => p.name) })));
        } catch (error) {
            console.error('Error cargando usuarios y roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        users,
        roles: availableRoles,
        permissions: availablePermissions,
        isLoading,
        updateUser: async (updatedUser: User) => {
            console.log('Updating user:', updatedUser);
            loadData();
        },
        deleteUser: async (userId: string) => {
            console.log('Deleting user:', userId);
            loadData();
        },
        createUser: async (userData: Omit<User, 'id' | 'createdAt'>) => {
            console.log('Creating user:', userData);
            loadData();
        },
        createRole: async (roleData: Omit<Role, 'id'>) => {
            try {
                // 1. Crear el rol en la base de datos
                const newRolApi = await apiService.createRol({
                    nombreRol: roleData.name,
                    descripcion: roleData.description,
                    estadoRol: roleData.isActive
                });

                // 2. Asociar permisos
                const permissionPromises = roleData.permissions.map(p =>
                    apiService.createRolPermiso({
                        id: 0,
                        rolId: newRolApi.id,
                        permisoId: parseInt(p.id)
                    })
                );

                await Promise.all(permissionPromises);

                await loadData();
                return { ...roleData, id: newRolApi.id.toString() } as Role;
            } catch (error) {
                console.error('Error al crear rol:', error);
                throw error;
            }
        },
        updateRole: async (updatedRole: Role) => {
            try {
                // 1. Actualizar datos básicos del rol
                await apiService.updateRol(parseInt(updatedRole.id), {
                    id: parseInt(updatedRole.id),
                    nombreRol: updatedRole.name,
                    descripcion: updatedRole.description,
                    estadoRol: updatedRole.isActive
                });

                // 2. Sincronizar permisos
                const allRolesPermisos = await apiService.getRolesPermisos();
                const rolesPermisosForThisRole = allRolesPermisos.filter(rp => rp.rolId === parseInt(updatedRole.id));
                const currentPermIds = rolesPermisosForThisRole.map(rp => rp.permisoId.toString());

                const targetPermIds = updatedRole.permissions.map(p => p.id);

                // Permisos a añadir
                const toAdd = targetPermIds.filter(id => !currentPermIds.includes(id));
                // Permisos a eliminar
                const toRemove = currentPermIds.filter(id => !targetPermIds.includes(id));

                const addPromises = toAdd.map(id =>
                    apiService.createRolPermiso({
                        id: 0,
                        rolId: parseInt(updatedRole.id),
                        permisoId: parseInt(id)
                    })
                );

                const removePromises = toRemove.map(permId => {
                    const record = rolesPermisosForThisRole.find(rp => rp.permisoId.toString() === permId);
                    return record ? apiService.deleteRolPermiso(record.id) : Promise.resolve();
                });

                await Promise.all([...addPromises, ...removePromises]);

                await loadData();
                await refreshSession();
            } catch (error) {
                console.error('Error al actualizar rol:', error);
                throw error;
            }
        },
        deleteRole: async (roleId: string) => {
            try {
                const usersWithRole = users.filter(u => u.role.id === roleId);
                if (usersWithRole.length > 0) {
                    throw new Error('No se puede eliminar un rol que está siendo usado por usuarios');
                }

                await apiService.deleteRol(parseInt(roleId));
                await loadData();
            } catch (error) {
                console.error('Error al eliminar rol:', error);
                throw error;
            }
        },
        toggleRoleStatus: async (roleId: string) => {
            const role = availableRoles.find(r => r.id === roleId);
            if (!role) return;

            // Si se intenta desactivar, verificar si hay usuarios asignados
            if (role.isActive) {
                const usersWithRole = users.filter(u => u.role.id === roleId);
                if (usersWithRole.length > 0) {
                    throw new Error(`No se puede desactivar el rol "${role.name}" porque tiene ${usersWithRole.length} usuarios asignados.`);
                }
            }

            // Optimistic Update
            setAvailableRoles(prev => prev.map(r =>
                r.id === roleId ? { ...r, isActive: !r.isActive } : r
            ));

            try {
                await apiService.updateRol(parseInt(roleId), {
                    id: parseInt(roleId),
                    nombreRol: role.name,
                    descripcion: role.description,
                    estadoRol: !role.isActive
                });
                // Reload in background without showing loading spinner
                await loadData(false);
                await refreshSession();
            } catch (error) {
                // Revert on error
                setAvailableRoles(prev => prev.map(r =>
                    r.id === roleId ? { ...r, isActive: !r.isActive } : r
                ));
                console.error('Error al cambiar estado del rol:', error);
                throw error;
            }
        }
    };
};
