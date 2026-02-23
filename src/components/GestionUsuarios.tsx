import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { User, UserRole } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from "sonner";
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { Switch } from './ui/switch';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { ScrollArea } from './ui/scroll-area';
import {
  Users,

  Eye,
  Edit,
  Trash2,
  Crown,
  Briefcase,
  UserCircle,
  Search,
  Filter,
  Plus
} from 'lucide-react';

export const GestionUsuarios: React.FC = () => {
  const {
    users,
    roles,
    updateUser,
    deleteUser,
    createUser
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Nuevo filtro de estado
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Usuarios por página
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Estados para el dialog de confirmación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Estado simplificado para crear usuario (solo documento, nombre, apellido, correo)
  const [newUser, setNewUser] = useState({
    documento: '',
    tipoDocumento: 'C.C' as string,
    firstName: '',
    lastName: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: '',
    role: 'Cliente' as UserRole,
    isActive: true
  });

  // Estado para editar usuario - AHORA INCLUYE DOCUMENTO EDITABLE
  const [editUserData, setEditUserData] = useState({
    documento: '',
    firstName: '',
    lastName: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: '',
    tipoDocumento: 'C.C' as string,
    role: 'Cliente' as UserRole,
    isActive: true
  });

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Administrador': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Empleado': return <Briefcase className="h-4 w-4 text-blue-500" />;
      default: return <UserCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.numeroDocumento && user.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role.name === roleFilter;

    const matchesStatus = statusFilter === 'all' || user.isActive === (statusFilter === 'active');

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const maxVisiblePages = 10; // Mostrar máximo 10 páginas
  const displayPages = Math.max(totalPages, maxVisiblePages); // Siempre mostrar al menos 10 páginas
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleCreateUser = async () => {
    const roleObj = roles.find(r => r.name === newUser.role) || roles[2];

    await createUser({
      username: newUser.documento,
      email: newUser.email,
      password: 'temp123',
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      numeroDocumento: newUser.documento,
      tipoDocumento: newUser.tipoDocumento,
      telefono: newUser.telefono,
      ciudad: newUser.ciudad || 'N/A',
      direccion: newUser.direccion,
      barrio: newUser.barrio,
      fechaNacimiento: newUser.fechaNacimiento,
      role: roleObj,
      isActive: newUser.isActive
    });

    // Toast de confirmación de creación
    toast.success("Usuario creado", {
      description: `${newUser.firstName} ${newUser.lastName} ha sido creado exitosamente con el rol ${newUser.role}.`,
      duration: 4000,
    });

    setNewUser({
      documento: '',
      tipoDocumento: 'C.C',
      firstName: '',
      lastName: '',
      email: '',
      telefono: '',
      ciudad: '',
      direccion: '',
      barrio: '',
      fechaNacimiento: '',
      role: 'Cliente',
      isActive: true
    });

    setIsCreateDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      documento: user.numeroDocumento || user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      telefono: user.telefono || '',
      ciudad: user.ciudad || '',
      direccion: user.direccion || '',
      barrio: user.barrio || '',
      fechaNacimiento: user.fechaNacimiento || '',
      tipoDocumento: user.tipoDocumento || 'C.C',
      role: user.role.name as UserRole,
      isActive: user.isActive
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      const roleObj = roles.find(r => r.name === editUserData.role) || editingUser.role;

      const updatedUser: User = {
        ...editingUser,
        username: editUserData.documento,
        firstName: editUserData.firstName,
        lastName: editUserData.lastName,
        email: editUserData.email,
        numeroDocumento: editUserData.documento,
        tipoDocumento: editUserData.tipoDocumento,
        telefono: editUserData.telefono,
        ciudad: editUserData.ciudad || 'N/A',
        direccion: editUserData.direccion,
        barrio: editUserData.barrio,
        fechaNacimiento: editUserData.fechaNacimiento,
        role: roleObj,
        isActive: editUserData.isActive
      };

      await updateUser(updatedUser);
      setEditingUser(null);
      setIsEditUserDialogOpen(false);
      resetEditUserForm();

      // Toast de confirmación de éxito
      toast.success("Usuario actualizado", {
        description: `Los datos de ${updatedUser.firstName} ${updatedUser.lastName} han sido actualizados correctamente.`,
        duration: 3000,
      });
    }
  };

  const resetEditUserForm = () => {
    setEditUserData({
      documento: '',
      firstName: '',
      lastName: '',
      email: '',
      telefono: '',
      ciudad: '',
      direccion: '',
      barrio: '',
      fechaNacimiento: '',
      tipoDocumento: 'C.C',
      role: 'Cliente',
      isActive: true
    });
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);

      // Toast de confirmación de eliminación
      toast.success("Usuario eliminado", {
        description: `${userToDelete.firstName} ${userToDelete.lastName} ha sido eliminado del sistema.`,
        duration: 3000,
      });

      setUserToDelete(null);
    }
  };

  const toggleUserStatus = async (user: User) => {
    // Restricción: No se pueden desactivar administradores
    if (user.role.name === 'Administrador') {
      toast.error("Acción no permitida", {
        description: "No se puede desactivar a un usuario con el rol de Administrador.",
      });
      return;
    }

    try {
      await updateUser({ ...user, isActive: !user.isActive });
      toast.success("Estado actualizado", {
        description: `El usuario ${user.firstName} ${user.lastName} ahora está ${!user.isActive ? 'activo' : 'inactivo'}.`,
        duration: 2000,
      });
    } catch (error) {
      toast.error("Error al actualizar estado", {
        description: "No se pudo cambiar el estado del usuario. Intenta nuevamente.",
      });
    }
  };

  const handleViewUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailDialogOpen(true);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRoleStats = () => {
    const stats = roles.map(role => ({
      role: role.name,
      count: users.filter(user => user.role.name === role.name).length,
      icon: getRoleIcon(role.name)
    }));
    return stats;
  };

  return (
    <div className="space-y-6">
      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios del sistema y sus roles asignados
              </CardDescription>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Completa los datos básicos para crear un nuevo usuario en el sistema.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="create-tipoDocumento">Tipo de Documento *</Label>
                        <Select
                          value={newUser.tipoDocumento}
                          onValueChange={(value: 'T.I' | 'C.C') => setNewUser({ ...newUser, tipoDocumento: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="T.I">Tarjeta de Identidad (T.I)</SelectItem>
                            <SelectItem value="C.C">Cédula de Ciudadanía (C.C)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-documento">Número de Documento *</Label>
                        <Input
                          id="create-documento"
                          value={newUser.documento}
                          onChange={(e) => setNewUser({ ...newUser, documento: e.target.value })}
                          placeholder="Número de documento"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="create-firstName">Nombre *</Label>
                        <Input
                          id="create-firstName"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-lastName">Apellido *</Label>
                        <Input
                          id="create-lastName"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-fechaNacimiento">Fecha de Nacimiento *</Label>
                      <Input
                        id="create-fechaNacimiento"
                        type="date"
                        value={newUser.fechaNacimiento}
                        onChange={(e) => setNewUser({ ...newUser, fechaNacimiento: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-email">Email *</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-telefono">Teléfono *</Label>
                      <Input
                        id="create-telefono"
                        value={newUser.telefono}
                        onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                        placeholder="Número de teléfono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-ciudad">Ciudad *</Label>
                      <Input
                        id="create-ciudad"
                        value={newUser.ciudad}
                        onChange={(e) => setNewUser({ ...newUser, ciudad: e.target.value })}
                        placeholder="Ciudad"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-direccion">Dirección *</Label>
                      <Input
                        id="create-direccion"
                        value={newUser.direccion}
                        onChange={(e) => setNewUser({ ...newUser, direccion: e.target.value })}
                        placeholder="Dirección"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-barrio">Barrio *</Label>
                      <Input
                        id="create-barrio"
                        value={newUser.barrio}
                        onChange={(e) => setNewUser({ ...newUser, barrio: e.target.value })}
                        placeholder="Barrio"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-role">Rol *</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.filter(role => role.isActive).map((role) => (
                            <SelectItem key={role.id} value={role.name as UserRole}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="create-active"
                        checked={newUser.isActive}
                        onCheckedChange={(checked: boolean) => setNewUser({ ...newUser, isActive: checked })}
                      />
                      <Label htmlFor="create-active">Usuario Activo</Label>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <div className="mb-1">ℹ️ <strong>Información:</strong></div>
                      <div>• Se asignará una contraseña temporal "temp123"</div>
                      <div>• El documento se usará como nombre de usuario</div>
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Crear Usuario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div>
                            <div>{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role.name)}
                        <span>{user.role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleUserStatus(user)}
                          size="sm"
                          disabled={user.role.name === 'Administrador'}
                          title={user.role.name === 'Administrador' ? 'No se puede desactivar un administrador' : ''}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUserDetail(user)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          title={user.role.name === 'Administrador' ? 'No se puede eliminar un administrador' : 'Eliminar usuario'}
                          disabled={user.role.name === 'Administrador'}
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
                    onClick={() => currentPage > 1 && handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: displayPages }, (_, i) => i + 1).map((page) => {
                  const hasContent = page <= totalPages;
                  const isCurrentPage = currentPage === page;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
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
                    onClick={() => currentPage < totalPages && handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Mostrar información de paginación */}
          <div className="text-sm text-gray-500 text-center">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
          </div>
        </CardContent>
      </Card>

      {/* Dialog para editar usuario - CON DOCUMENTO EDITABLE */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tipoDocumento">Tipo de Documento</Label>
                    <Select
                      value={editUserData.tipoDocumento}
                      onValueChange={(value: 'T.I' | 'C.C') => setEditUserData({ ...editUserData, tipoDocumento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="T.I">Tarjeta de Identidad (T.I)</SelectItem>
                        <SelectItem value="C.C">Cédula de Ciudadanía (C.C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-documento">Número de Documento</Label>
                    <Input
                      id="edit-documento"
                      value={editUserData.documento}
                      onChange={(e) => setEditUserData({ ...editUserData, documento: e.target.value })}
                      placeholder="Número de documento"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">Nombre</Label>
                    <Input
                      id="edit-firstName"
                      value={editUserData.firstName}
                      onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">Apellido</Label>
                    <Input
                      id="edit-lastName"
                      value={editUserData.lastName}
                      onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-telefono">Teléfono</Label>
                  <Input
                    id="edit-telefono"
                    value={editUserData.telefono}
                    onChange={(e) => setEditUserData({ ...editUserData, telefono: e.target.value })}
                    placeholder="Número de teléfono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ciudad">Ciudad</Label>
                  <Input
                    id="edit-ciudad"
                    value={editUserData.ciudad}
                    onChange={(e) => setEditUserData({ ...editUserData, ciudad: e.target.value })}
                    placeholder="Ciudad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-direccion">Dirección</Label>
                  <Input
                    id="edit-direccion"
                    value={editUserData.direccion}
                    onChange={(e) => setEditUserData({ ...editUserData, direccion: e.target.value })}
                    placeholder="Dirección"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-barrio">Barrio</Label>
                  <Input
                    id="edit-barrio"
                    value={editUserData.barrio}
                    onChange={(e) => setEditUserData({ ...editUserData, barrio: e.target.value })}
                    placeholder="Barrio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="edit-fechaNacimiento"
                    type="date"
                    value={editUserData.fechaNacimiento}
                    onChange={(e) => setEditUserData({ ...editUserData, fechaNacimiento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select
                    value={editUserData.role}
                    onValueChange={(value: UserRole) => setEditUserData({ ...editUserData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(role => role.isActive).map((role) => (
                        <SelectItem key={role.id} value={role.name as UserRole}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editUserData.isActive}
                    onCheckedChange={(checked: boolean) => setEditUserData({ ...editUserData, isActive: checked })}
                    disabled={editUserData.role === 'Administrador'}
                  />
                  <Label>Usuario Activo {editUserData.role === 'Administrador' && "(No modificable para Administradores)"}</Label>
                </div>

                <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <div className="mb-1">⚠️ <strong>Atención:</strong></div>
                  <div>• Cambiar el documento actualizará el nombre de usuario</div>
                  <div>• Asegúrate de que el nuevo documento sea correcto</div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditUserDialogOpen(false);
              setEditingUser(null);
              resetEditUserForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>
              Actualizar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalle del usuario */}
      <Dialog open={isUserDetailDialogOpen} onOpenChange={setIsUserDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detalle del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Tipo de Documento</Label>
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                      {selectedUser.tipoDocumento === 'T.I' ? 'Tarjeta de Identidad (T.I)' :
                        selectedUser.tipoDocumento === 'C.C' ? 'Cédula de Ciudadanía (C.C)' :
                          'C.C (Por defecto)'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Número de Documento</Label>
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-700 font-mono">
                      {selectedUser.numeroDocumento || selectedUser.username}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                      {selectedUser.firstName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Apellido</Label>
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                      {selectedUser.lastName}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    {selectedUser.fechaNacimiento ? new Date(selectedUser.fechaNacimiento).toLocaleDateString() : 'No registrada'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    {selectedUser.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    {selectedUser.telefono || 'No registrado'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Ciudad</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    {selectedUser.ciudad || 'No registrada'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Dirección</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    {selectedUser.direccion || 'No registrada'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Barrio</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    {selectedUser.barrio || 'No registrado'}
                  </div>
                </div>



                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Rol</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(selectedUser.role.name)}
                      <span>{selectedUser.role.name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                      {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDetailDialogOpen(false)}>
              Cerrar
            </Button>
            {selectedUser && (
              <Button onClick={() => {
                setIsUserDetailDialogOpen(false);
                handleEditUser(selectedUser);
              }}>
                Editar Usuario
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteUser}
        title="Eliminar Usuario"
        description="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        itemName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ''}
        itemType="usuario"
      />
    </div>
  );
};
