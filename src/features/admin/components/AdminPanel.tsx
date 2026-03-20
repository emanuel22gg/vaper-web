import React, { useState } from 'react';
import { useUsers } from '@/shared/hooks/useUsers';
import { User, Role, UserRole } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Switch } from '@/shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { TablePagination } from '@/shared/ui/TablePagination';
import {
  Users,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Shield,
  Crown,
  Briefcase,
  UserCircle,
  Search,
  Filter
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    users,
    roles,
    permissions,
    updateUser,
    deleteUser,
    createUser,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5); // Usuarios por página
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Estado simplificado para crear usuario (solo documento, nombre, apellido, correo)
  const [newUser, setNewUser] = useState({
    documento: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'Cliente' as UserRole,
    isActive: true
  });

  // Estado para editar usuario
  const [editUserData, setEditUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Cliente' as UserRole,
    isActive: true
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
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
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role.name === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleCreateUser = () => {
    const roleObj = roles.find(r => r.name === newUser.role) || roles[2];

    createUser({
      username: newUser.documento, // Usar documento como username
      email: newUser.email,
      password: 'temp123', // Contraseña temporal
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: roleObj,
      isActive: newUser.isActive
    });

    setNewUser({
      documento: '',
      firstName: '',
      lastName: '',
      email: '',
      role: 'Cliente',
      isActive: true
    });

    setIsCreateDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.name as UserRole,
      isActive: user.isActive
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      const roleObj = roles.find(r => r.name === editUserData.role) || editingUser.role;

      const updatedUser = {
        ...editingUser,
        firstName: editUserData.firstName,
        lastName: editUserData.lastName,
        email: editUserData.email,
        role: roleObj,
        isActive: editUserData.isActive
      };

      updateUser(updatedUser);
      setEditingUser(null);
      setIsEditUserDialogOpen(false);
      resetEditUserForm();
    }
  };

  const resetEditUserForm = () => {
    setEditUserData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Cliente',
      isActive: true
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser(userId);
    }
  };

  const toggleUserStatus = (user: User) => {
    updateUser({ ...user, isActive: !user.isActive });
  };

  const handleViewUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailDialogOpen(true);
  };

  // Funciones para gestión de roles
  const handleCreateRole = () => {
    try {
      const selectedPermissions = permissions.filter(p => newRole.permissions.includes(p.id));
      const roleData = {
        name: newRole.name,
        description: newRole.description,
        permissions: selectedPermissions,
        isActive: newRole.isActive
      };

      createRole(roleData);
      resetNewRoleForm();
      setIsCreateRoleDialogOpen(false);
    } catch (error) {
      alert('Error al crear el rol');
    }
  };

  const handleUpdateRole = () => {
    if (editingRole) {
      try {
        const selectedPermissions = permissions.filter(p =>
          newRole.permissions.includes(p.id)
        );

        const updatedRole = {
          ...editingRole,
          name: newRole.name,
          description: newRole.description,
          permissions: selectedPermissions,
          isActive: newRole.isActive
        };

        updateRole(updatedRole);
        setEditingRole(null);
        setIsEditRoleDialogOpen(false);
        resetNewRoleForm();
      } catch (error) {
        alert('Error al actualizar el rol');
      }
    }
  };

  const handleDeleteRole = (roleId: string) => {
    try {
      if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
        deleteRole(roleId);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
      isActive: role.isActive
    });
    setIsEditRoleDialogOpen(true);
  };

  const resetNewRoleForm = () => {
    setNewRole({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
  };

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRoleStats = () => {
    const stats = roles.map(role => ({
      role: role.name,
      count: users.filter(user => user.role.name === role.name).length,
      icon: getRoleIcon(role.name)
    }));
    return stats;
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
          </CardContent>
        </Card>

        {getRoleStats().map((stat) => (
          <Card key={stat.role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{stat.role}s</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Gestión de Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles y Permisos
          </TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra usuarios del sistema, roles y permisos
                  </CardDescription>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                      <DialogDescription>
                        Completa los datos básicos para crear un nuevo usuario en el sistema.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-documento">Documento</Label>
                        <Input
                          id="create-documento"
                          value={newUser.documento}
                          onChange={(e) => setNewUser({ ...newUser, documento: e.target.value })}
                          placeholder="Número de documento"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="create-firstName">Nombre</Label>
                          <Input
                            id="create-firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-lastName">Apellido</Label>
                          <Input
                            id="create-lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-email">Email</Label>
                        <Input
                          id="create-email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-role">Rol</Label>
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
                          onCheckedChange={(checked) => setNewUser({ ...newUser, isActive: checked })}
                        />
                        <Label htmlFor="create-active">Usuario Activo</Label>
                      </div>

                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                        <div className="mb-1">ℹ️ <strong>Información:</strong></div>
                        <div>• Se asignará una contraseña temporal "temp123"</div>
                        <div>• El documento se usará como nombre de usuario</div>
                      </div>
                    </div>

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

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}s
                      </SelectItem>
                    ))}
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
                                <div className="text-sm text-gray-500">@{user.username}</div>
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
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Eliminar usuario"
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
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                itemsPerPage={usersPerPage}
                onPageChange={handlePageChange}
                itemName="usuarios"
              />

              {/* Mostrar información de paginación */}
              <div className="text-sm text-gray-500 text-center">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dialog para editar usuario */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica la información del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Documento</Label>
                  <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                    @{editingUser.username} (No editable)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    onCheckedChange={(checked) => setEditUserData({ ...editUserData, isActive: checked })}
                  />
                  <Label>Usuario Activo</Label>
                </div>
              </div>
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalle del Usuario</DialogTitle>
              <DialogDescription>
                Información completa del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                    <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Documento</Label>
                    <p>@{selectedUser.username}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p>{selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Rol</Label>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(selectedUser.role.name)}
                      <span>{selectedUser.role.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Estado</Label>
                    <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                      {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Fecha de Registro</Label>
                    <p>{selectedUser.createdAt.toLocaleDateString()}</p>
                  </div>
                  {selectedUser.lastLogin && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Último Acceso</Label>
                      <p>{selectedUser.lastLogin.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Permisos del Rol</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2">
                    {selectedUser.role.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between text-sm py-1">
                        <span>{permission.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {permission.module}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDetailDialogOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={() => {
                setIsUserDetailDialogOpen(false);
                if (selectedUser) {
                  handleEditUser(selectedUser);
                }
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Roles Management */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Roles y Permisos</CardTitle>
                  <CardDescription>
                    Administra los roles del sistema y sus permisos asociados
                  </CardDescription>
                </div>

                <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Shield className="h-4 w-4 mr-2" />
                      Crear Rol
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

                      <div className="space-y-3">
                        <Label>Permisos del Rol</Label>
                        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                          <div className="space-y-3">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-3">
                                <Switch
                                  checked={newRole.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{permission.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {permission.module}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newRole.isActive}
                          onCheckedChange={(checked) => setNewRole({ ...newRole, isActive: checked })}
                        />
                        <Label>Rol Activo</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsCreateRoleDialogOpen(false);
                        resetNewRoleForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateRole}>
                        Crear Rol
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card key={role.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role.name)}
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={role.isActive ? "default" : "secondary"}>
                            {role.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Switch
                            checked={role.isActive}
                            onCheckedChange={() => toggleRoleStatus(role.id)}
                            size="sm"
                          />
                        </div>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm mb-2 flex items-center justify-between">
                            <span>Permisos ({role.permissions.length}):</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {role.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                <span className="truncate">{permission.name}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {permission.module}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Usuarios: <span className="font-semibold text-black">{users.filter(u => u.role.name === role.name).length}</span>
                            </div>
                            {users.filter(u => u.role.name === role.name).length === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dialog para Editar Rol */}
        <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Rol</DialogTitle>
              <DialogDescription>
                Modifica la configuración del rol y sus permisos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role-name">Nombre del Rol *</Label>
                <Input
                  id="edit-role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Ej: Supervisor, Gerente, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role-description">Descripción</Label>
                <Input
                  id="edit-role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe las responsabilidades de este rol"
                />
              </div>

              <div className="space-y-3">
                <Label>Permisos del Rol</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Switch
                          checked={newRole.permissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{permission.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {permission.module}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newRole.isActive}
                  onCheckedChange={(checked) => setNewRole({ ...newRole, isActive: checked })}
                />
                <Label>Rol Activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditRoleDialogOpen(false);
                resetNewRoleForm();
                setEditingRole(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateRole}>
                Actualizar Rol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};
