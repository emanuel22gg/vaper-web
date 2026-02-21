import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Role } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from "sonner";
import { Switch } from './ui/switch';
import {
  Shield,
  Crown,
  Briefcase,
  UserCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
  Search
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { RoleDetailDialog } from './RoleDetailDialog';

export const GestionRoles: React.FC = () => {
  const {
    users,
    roles,
    permissions,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    isLoading
  } = useUsers();

  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesPerPage] = useState(10); // Roles por página

  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para búsqueda de permisos
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [editPermissionSearchTerm, setEditPermissionSearchTerm] = useState('');

  // Estados para dialogs de confirmación y detalle
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [roleToView, setRoleToView] = useState<Role | null>(null);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    isActive: true,
    permissions: [] as string[]
  });

  const [editRole, setEditRole] = useState({
    name: '',
    description: '',
    isActive: true,
    permissions: [] as string[]
  });

  // Filtrar roles por búsqueda
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación para roles
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
  const maxVisiblePages = 10; // Mostrar máximo 10 páginas
  const displayPages = Math.max(totalPages, maxVisiblePages); // Siempre mostrar al menos 10 páginas
  const startIndex = (currentPage - 1) * rolesPerPage;
  const endIndex = startIndex + rolesPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  // Función para cambiar el estado del rol
  const handleToggleRoleStatus = async (roleId: string, roleName: string, currentStatus: boolean) => {
    try {
      await toggleRoleStatus(roleId);
      toast.success("Estado actualizado", {
        description: `El rol "${roleName}" ha sido ${!currentStatus ? 'activado' : 'desactivado'}.`,
        duration: 3000,
      });
    } catch (error: any) {
      toast.error("Error al actualizar estado", {
        description: error.message || "No se pudo actualizar el estado del rol.",
        duration: 3000,
      });
    }
  };

  // Función para ver detalle del rol
  const handleViewRoleDetail = (role: Role) => {
    setRoleToView(role);
    setDetailDialogOpen(true);
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error("Error de validación", {
        description: "El nombre del rol es obligatorio.",
        duration: 3000,
      });
      return;
    }

    const rolePermissions = permissions.filter(p => newRole.permissions.includes(p.id));

    const role: Omit<Role, 'id'> = {
      name: newRole.name.trim(),
      description: newRole.description.trim(),
      isActive: newRole.isActive,
      permissions: rolePermissions
    };

    try {
      await createRole(role);

      // Limpiar formulario
      setNewRole({
        name: '',
        description: '',
        isActive: true,
        permissions: []
      });

      // Limpiar búsqueda de permisos
      setPermissionSearchTerm('');

      setIsCreateRoleDialogOpen(false);

      // Toast de confirmación
      toast.success("Rol creado", {
        description: `El rol "${role.name}" ha sido creado exitosamente.`,
        duration: 3000,
      });
    } catch (error: any) {
      toast.error("Error al crear el rol", {
        description: error.message || "No se pudo crear el rol. Intenta nuevamente.",
        duration: 3000,
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditRole({
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: role.permissions.map(p => p.id)
    });
    // Limpiar búsqueda al abrir el modal de edición
    setEditPermissionSearchTerm('');
    setIsEditRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !editRole.name.trim()) {
      toast.error("Error de validación", {
        description: "El nombre del rol es obligatorio.",
        duration: 3000,
      });
      return;
    }

    const rolePermissions = permissions.filter(p => editRole.permissions.includes(p.id));

    const updatedRole: Role = {
      ...editingRole,
      name: editRole.name.trim(),
      description: editRole.description.trim(),
      isActive: editRole.isActive,
      permissions: rolePermissions
    };

    try {
      await updateRole(updatedRole);
      setEditingRole(null);
      // Limpiar búsqueda de permisos
      setEditPermissionSearchTerm('');
      setIsEditRoleDialogOpen(false);

      // Toast de confirmación
      toast.success("Rol actualizado", {
        description: `El rol "${updatedRole.name}" ha sido actualizado correctamente.`,
        duration: 3000,
      });
    } catch (error: any) {
      toast.error("Error al actualizar el rol", {
        description: error.message || "No se pudo actualizar el rol. Intenta nuevamente.",
        duration: 3000,
      });
    }
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(roleToDelete.id);

        // Toast de confirmación de eliminación
        toast.success("Rol eliminado", {
          description: `El rol "${roleToDelete.name}" ha sido eliminado del sistema.`,
          duration: 3000,
        });

        setRoleToDelete(null);
      } catch (error: any) {
        toast.error("Error al eliminar el rol", {
          description: error.message || "No se pudo eliminar el rol. Intenta nuevamente.",
          duration: 3000,
        });
      }
    }
  };

  const handleTogglePermission = (permissionId: string, isCreating: boolean = false) => {
    if (isCreating) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(id => id !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    } else {
      setEditRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(id => id !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    }
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Administrador': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Empleado': return <Briefcase className="h-4 w-4 text-blue-500" />;
      default: return <UserCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Agrupar permisos por módulo para mostrar organizadamente
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const module = permission.module;
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, typeof permissions>);

  // Filtrar permisos para crear rol basado en búsqueda
  const filterPermissions = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return groupedPermissions;
    }

    const filtered: Record<string, typeof permissions> = {};
    Object.entries(groupedPermissions).forEach(([module, perms]) => {
      const filteredPerms = perms.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredPerms.length > 0) {
        filtered[module] = filteredPerms;
      }
    });
    return filtered;
  };

  const filteredCreatePermissions = filterPermissions(permissionSearchTerm);
  const filteredEditPermissions = filterPermissions(editPermissionSearchTerm);

  // Contar usuarios por rol
  const getUserCountByRole = (roleName: string) => {
    return users.filter(user => user.role.name === roleName).length;
  };

  return (
    <div className="space-y-6">
      {/* Roles Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestión de Roles y Permisos</CardTitle>
              <CardDescription>
                Administra los roles del sistema y sus permisos asociados
              </CardDescription>
            </div>

            <Dialog
              open={isCreateRoleDialogOpen}
              onOpenChange={(open: boolean) => {
                setIsCreateRoleDialogOpen(open);
                // Limpiar búsqueda cuando se cierra el modal
                if (!open) {
                  setPermissionSearchTerm('');
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Rol
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Rol</DialogTitle>
                  <DialogDescription>
                    Define un nuevo rol y asigna los permisos correspondientes.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Nombre del Rol *</Label>
                    <Input
                      id="role-name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="Ej: Supervisor, Gerente, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-description">Descripción</Label>
                    <Input
                      id="role-description"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      placeholder="Describe las responsabilidades de este rol"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="role-active"
                      checked={newRole.isActive}
                      onCheckedChange={(checked: boolean) => setNewRole({ ...newRole, isActive: checked })}
                    />
                    <Label htmlFor="role-active">Rol activo</Label>
                  </div>

                  <div className="space-y-3">
                    <Label>Permisos del Rol</Label>

                    {/* Búsqueda de permisos */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar permisos..."
                        value={permissionSearchTerm}
                        onChange={(e) => setPermissionSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-3">
                      {Object.keys(filteredCreatePermissions).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No se encontraron permisos que coincidan con la búsqueda
                        </p>
                      ) : (
                        Object.entries(filteredCreatePermissions).map(([module, perms]) => (
                          <div key={module}>
                            <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">{module}</h4>
                            <div className="grid grid-cols-1 gap-2 ml-3">
                              {perms.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`new-${permission.id}`}
                                    checked={newRole.permissions.includes(permission.id)}
                                    onChange={() => handleTogglePermission(permission.id, true)}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`new-${permission.id}`} className="text-sm">
                                    {permission.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateRole}
                    disabled={isLoading || !newRole.name.trim()}
                  >
                    {isLoading ? "Creando..." : "Crear Rol"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Búsqueda de roles */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Tabla de roles simplificada */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(role.name)}
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {role.isActive ? (
                          <Badge className="bg-black text-white hover:bg-black">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                            Inactivo
                          </Badge>
                        )}
                        <Switch
                          checked={role.isActive}
                          onCheckedChange={() => handleToggleRoleStatus(role.id, role.name, role.isActive)}
                          disabled={
                            isLoading || 
                            role.name === 'Administrador' || 
                            role.name === 'Admin' || 
                            (role.isActive && getUserCountByRole(role.name) > 0)
                          }
                          title={
                            role.name === 'Administrador' || role.name === 'Admin' 
                              ? "No se puede desactivar un rol administrativo" 
                              : (role.isActive && getUserCountByRole(role.name) > 0)
                                ? `El rol "${role.name}" tiene ${getUserCountByRole(role.name)} usuarios asignados. Reasigna los usuarios antes de desactivarlo.`
                                : ""
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRoleDetail(role)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          title={role.name === 'Administrador' || role.name === 'Admin' ? 'No se puede editar el rol de Administrador' : 'Editar rol'}
                          disabled={role.name === 'Administrador' || role.name === 'Admin'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                          title={role.name === 'Administrador' || role.name === 'Admin' ? 'No se puede eliminar un administrador' : 'Eliminar rol'}
                          disabled={role.name === 'Administrador' || role.name === 'Admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="default"
                    onClick={() => currentPage > 1 && handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  >
                    Anterior
                  </PaginationPrevious>
                </PaginationItem>

                {Array.from({ length: displayPages }, (_, i) => i + 1).map((page) => {
                  const hasContent = page <= totalPages;
                  const isCurrentPage = currentPage === page;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        size="icon"
                        onClick={() => hasContent && handlePageChange(page)}
                        isActive={isCurrentPage}
                        className={`
                          ${hasContent ? 'cursor-pointer' : 'pointer-events-none opacity-30 text-gray-400'} 
                          ${isCurrentPage && hasContent ? '' : ''}
                          ${!hasContent ? 'bg-gray-100 border-gray-200' : ''}
                        `}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    size="default"
                    onClick={() => currentPage < totalPages && handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  >
                    Siguiente
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Mostrar información de paginación */}
          <div className="text-sm text-gray-500 text-center mt-2">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredRoles.length)} de {filteredRoles.length} roles
          </div>
        </CardContent>
      </Card>

      {/* Dialog para editar rol */}
      <Dialog
        open={isEditRoleDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsEditRoleDialogOpen(open);
          // Limpiar búsqueda cuando se cierra el modal
          if (!open) {
            setEditPermissionSearchTerm('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifica la información y permisos del rol seleccionado.
            </DialogDescription>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role-name">Nombre del Rol *</Label>
                <Input
                  id="edit-role-name"
                  value={editRole.name}
                  onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role-description">Descripción</Label>
                <Input
                  id="edit-role-description"
                  value={editRole.description}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-role-active"
                  checked={editRole.isActive}
                  onCheckedChange={(checked: boolean) => setEditRole({ ...editRole, isActive: checked })}
                />
                <Label htmlFor="edit-role-active">Rol activo</Label>
              </div>

              <div className="space-y-3">
                <Label>Permisos del Rol</Label>

                {/* Búsqueda de permisos */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar permisos..."
                    value={editPermissionSearchTerm}
                    onChange={(e) => setEditPermissionSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-3">
                  {Object.keys(filteredEditPermissions).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No se encontraron permisos que coincidan con la búsqueda
                    </p>
                  ) : (
                    Object.entries(filteredEditPermissions).map(([module, perms]) => (
                      <div key={module}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">{module}</h4>
                        <div className="grid grid-cols-1 gap-2 ml-3">
                          {perms.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-${permission.id}`}
                                checked={editRole.permissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(permission.id, false)}
                                className="rounded"
                              />
                              <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-none"
              onClick={handleUpdateRole}
              disabled={isLoading || !editRole.name.trim()}
            >
              {isLoading ? "Actualizando..." : "Actualizar Rol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar rol */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteRole}
        title="Eliminar Rol"
        description="¿Estás seguro de que quieres eliminar este rol? Esta acción no se puede deshacer."
        itemName={roleToDelete?.name || ''}
        itemType="rol"
        isDisabled={roleToDelete ? getUserCountByRole(roleToDelete.name) > 0 : false}
        disableReason={roleToDelete ? `El rol "${roleToDelete.name}" tiene usuarios asignados. Reasigna los usuarios antes de eliminarlo.` : undefined}
      />

      {/* Dialog para ver detalle del rol */}
      <RoleDetailDialog
        role={roleToView}
        isOpen={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};
