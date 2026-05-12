import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Role } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { toast } from "sonner";
import { Switch } from '@/shared/ui/switch';
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
} from '@/shared/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { RoleDetailDialog } from './RoleDetailDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Settings, ShieldCheck } from 'lucide-react';

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

  // Filtrar roles por búsqueda y ocultar 'Super Administrador'
  const filteredRoles = roles.filter(role =>
    role.name !== 'Super Administrador' &&
    (role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcular paginación para roles
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
  const maxVisiblePages = 10; // Mostrar máximo 10 páginas
  const displayPages = Math.max(totalPages, maxVisiblePages); // Siempre mostrar al menos 10 páginas
  const startIndex = (currentPage - 1) * rolesPerPage;
  const endIndex = startIndex + rolesPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  // Función para cambiar el estado del rol
  const handleToggleRoleStatus = async (role: Role) => {
    const isActivating = !role.isActive;

    // Mostramos el mensaje inmediatamente (UX optimista)
    toast.success(isActivating ? "Rol Activado" : "Rol Desactivado", {
      description: `El rol "${role.name}" ha sido ${isActivating ? 'activado' : 'desactivado'}.`,
      duration: 3000,
    });

    try {
      await toggleRoleStatus(role.id);
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "No se pudo cambiar el estado.",
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

    // Validación de nombre duplicado
    const nameExists = roles.some(role =>
      role.name.trim().toLowerCase() === newRole.name.trim().toLowerCase()
    );

    if (nameExists) {
      toast.error("Error de validación", {
        description: `Ya existe un rol con el nombre "${newRole.name.trim()}".`,
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

    // Validación de nombre duplicado (excluyendo el rol actual)
    const nameExists = roles.some(role =>
      role.id !== editingRole.id &&
      role.name.trim().toLowerCase() === editRole.name.trim().toLowerCase()
    );

    if (nameExists) {
      toast.error("Error de validación", {
        description: `Ya existe otro rol con el nombre "${editRole.name.trim()}".`,
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
      case 'Super Administrador': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Administrador': return <Shield className="h-4 w-4 text-amber-500" />;
      case 'Admin': return <Shield className="h-4 w-4 text-amber-500" />;
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
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
                <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Crear Nuevo Rol</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                      Define un nuevo rol y asigna los permisos correspondientes.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="p-8 space-y-10">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
                      <TabsTrigger 
                        value="basic" 
                        className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                      >
                        <Settings className="h-4 w-4" /> Información Básica
                      </TabsTrigger>
                      <TabsTrigger 
                        value="permissions" 
                        className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                      >
                        <ShieldCheck className="h-4 w-4" /> Permisos
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6 animate-in fade-in-50 duration-500">
                      <div className="space-y-4">
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

                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="role-active"
                            checked={newRole.isActive}
                            onCheckedChange={(checked: boolean) => setNewRole({ ...newRole, isActive: checked })}
                          />
                          <Label htmlFor="role-active">Rol activo</Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="permissions" className="space-y-6 animate-in fade-in-50 duration-500">
                      <div className="space-y-4">
                        <Label>Asignación de Permisos</Label>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Buscar permisos..."
                            value={permissionSearchTerm}
                            onChange={(e) => setPermissionSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <div className="h-[300px] overflow-y-auto border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/50">
                          {Object.keys(filteredCreatePermissions).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                              <Shield className="h-8 w-8 text-gray-300" />
                              <p className="text-sm">No se encontraron permisos</p>
                            </div>
                          ) : (
                            Object.entries(filteredCreatePermissions).map(([module, perms]) => (
                              <div key={module} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <h4 className="font-medium text-sm text-gray-900 mb-3 capitalize flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {module}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                                  {perms.map((permission) => (
                                    <div key={permission.id} className="flex items-start space-x-3 group cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors">
                                      <input
                                        type="checkbox"
                                        id={`new-${permission.id}`}
                                        checked={newRole.permissions.includes(permission.id)}
                                        onChange={() => handleTogglePermission(permission.id, true)}
                                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <div className="space-y-1 cursor-pointer" onClick={() => handleTogglePermission(permission.id, true)}>
                                        <Label htmlFor={`new-${permission.id}`} className="text-sm font-medium text-gray-700 group-hover:text-gray-900 cursor-pointer">
                                          {permission.name}
                                        </Label>
                                        {/* Assumes permission has description if we ever add it, will be graceful fallback */}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 mt-8 pt-6 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateRoleDialogOpen(false)}
                      className="w-full sm:w-auto sm:mr-3 h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateRole}
                      disabled={isLoading || !newRole.name.trim()}
                      className="w-full sm:w-auto h-10 px-6 bg-black hover:bg-gray-800 text-white font-medium border-none transition-all"
                    >
                      {isLoading ? "Creando..." : "Crear Rol"}
                    </Button>
                  </DialogFooter>
                </div>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <LoadingScreen message="Cargando roles..." />
                    </TableCell>
                  </TableRow>
                ) : currentRoles.map((role) => (
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
                          onCheckedChange={() => handleToggleRoleStatus(role)}
                          disabled={
                            isLoading ||
                            role.name === 'Super Administrador' ||
                            role.name === 'Administrador' || role.name === 'Admin'
                          }
                          title={
                            role.name === 'Super Administrador' || role.name === 'Administrador' || role.name === 'Admin'
                              ? "No se puede desactivar un rol esencial"
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
                          title={
                            role.name === 'Super Administrador'
                              ? 'No se puede editar el rol de Super Administrador'
                              : role.name.toLowerCase() === 'cliente'
                              ? 'No se puede editar el rol predeterminado de Cliente'
                              : 'Editar rol'
                          }
                          disabled={role.name === 'Super Administrador' || role.name.toLowerCase() === 'cliente'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                          title={
                            role.name === 'Super Administrador' ||
                            role.name === 'Administrador' ||
                            role.name === 'Admin' ||
                            role.name.toLowerCase() === 'cliente' ||
                            role.name.toLowerCase() === 'empleado'
                              ? 'No se puede eliminar un rol del sistema predeterminado'
                              : 'Eliminar rol'
                          }
                          disabled={
                            role.name === 'Super Administrador' ||
                            role.name === 'Administrador' ||
                            role.name === 'Admin' ||
                            role.name.toLowerCase() === 'cliente' ||
                            role.name.toLowerCase() === 'empleado'
                          }
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
              className="bg-black hover:bg-gray-800 text-white border-none"
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
