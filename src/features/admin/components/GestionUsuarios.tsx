import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { User, Role, UserRole, Permission, UsuarioDto } from '@/shared/types';
import { getDepartments } from '@/shared/services/api';
import { Button } from '@/shared/ui/button';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { ClientEditDialog } from '@/features/clients/components/ClientEditDialog';
import { ClientDetailDialog } from '@/features/clients/components/ClientDetailDialog';
import { toast } from "sonner";
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { Switch } from '@/shared/ui/switch';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Users,
  Shield,
  Eye,
  Edit,
  Trash2,
  Crown,
  Briefcase,
  UserCircle,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  UserPlus,
  Info,
  MapPin,
  Phone,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { Separator } from '@/shared/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

export const GestionUsuarios: React.FC = () => {
  const {
    users,
    roles,
    updateUser,
    deleteUser,
    createUser,
    isLoading,
    fetchUsers // Added fetchUsers to refresh data after client edit
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Nuevo filtro de estado
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5); // Usuarios por página
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isClientDetailDialogOpen, setIsClientDetailDialogOpen] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<UsuarioDto | null>(null);

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
    departamento: '',
    fechaNacimiento: '',
    role: 'Empleado' as UserRole,
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
    departamento: '', // Campo requerido en UsuarioDto
    fechaNacimiento: '',
    tipoDocumento: 'C.C' as string,
    role: 'Empleado' as UserRole,
    isActive: true
  });

  // Estados para Modal de Cliente (Edición Especial)
  const [isClientEditDialogOpen, setIsClientEditDialogOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<UsuarioDto | null>(null);

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Super Administrador': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Administrador': return <Shield className="h-4 w-4 text-amber-500" />;
      case 'Empleado': return <Briefcase className="h-4 w-4 text-blue-500" />;
      default: return <UserCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const isOlderThan18 = (birthDate: string): boolean => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 18;
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
    try {
      const roleObj = roles.find(r => r.name === newUser.role);

      if (!roleObj) {
        toast.error("Error al crear usuario", {
          description: "El rol seleccionado no es válido.",
        });
        return;
      }
      // Restricción: No se puede crear más de un Super Administrador
      if (newUser.role === 'Super Administrador') {
        toast.error("Error al crear usuario", {
          description: "No se puede crear otro Super Administrador. Solo se permite uno en el sistema.",
        });
        return;
      }

      // Validar duplicados (correo y documento)
      const duplicateEmail = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
      const duplicateDoc = users.find(u => u.numeroDocumento === newUser.documento);

      if (duplicateEmail) {
        toast.error("Error al crear usuario", {
          description: `Ya existe un usuario con el correo ${newUser.email}.`,
        });
        return;
      }

      if (duplicateDoc) {
        toast.error("Error al crear usuario", {
          description: `Ya existe un usuario con el documento ${newUser.documento}.`,
        });
        return;
      }

      if (!isOlderThan18(newUser.fechaNacimiento)) {
        toast.error("Error al crear usuario", {
          description: "El usuario debe ser mayor de edad (18 años).",
        });
        return;
      }

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
        departamento: '',
        fechaNacimiento: '',
        role: 'Empleado',
        isActive: true
      });

      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error("Error al crear usuario", {
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado al intentar crear el usuario.",
      });
    }
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
      departamento: '', // Campo requerido en UsuarioDto
      fechaNacimiento: user.fechaNacimiento || '',
      tipoDocumento: user.tipoDocumento || 'C.C',
      role: user.role.name as UserRole,
      isActive: user.isActive
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      try {
        const roleObj = roles.find(r => r.name === editUserData.role) || editingUser.role;

        // Validar duplicados (correo y documento) excluyendo al usuario actual
        const duplicateEmail = users.find(u => u.id !== editingUser.id && u.email.toLowerCase() === editUserData.email.toLowerCase());
        const duplicateDoc = users.find(u => u.id !== editingUser.id && u.numeroDocumento === editUserData.documento);

        if (duplicateEmail) {
          toast.error("Error al actualizar usuario", {
            description: `Ya existe otro usuario con el correo ${editUserData.email}.`,
          });
          return;
        }

        if (duplicateDoc) {
          toast.error("Error al actualizar usuario", {
            description: `Ya existe otro usuario con el documento ${editUserData.documento}.`,
          });
          return;
        }

        if (!isOlderThan18(editUserData.fechaNacimiento)) {
          toast.error("Error al actualizar usuario", {
            description: "La fecha de nacimiento indica que el usuario es menor de edad (18 años).",
          });
          return;
        }

        // Restricción: No se puede activar un usuario si su rol está desactivado
        const isActivating = editUserData.isActive && !editingUser.isActive;
        const isStayingActive = editUserData.isActive && editingUser.isActive;
        
        if ((isActivating || isStayingActive) && !roleObj.isActive) {
          toast.error("Acción no permitida", {
            description: `No se puede mantener activo al usuario porque el rol "${roleObj.name}" está desactivado.`,
          });
          return;
        }

        if (roleObj.name === 'Super Administrador') {
          toast.error("Acción no permitida", {
            description: "No se puede asignar el rol de Super Administrador a un usuario existente.",
          });
          return;
        }

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
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        toast.error("Error al actualizar usuario", {
          description: error instanceof Error ? error.message : "Ocurrió un error inesperado al intentar actualizar el usuario.",
        });
      }
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
      departamento: '',
      fechaNacimiento: '',
      tipoDocumento: 'C.C',
      role: 'Empleado',
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
    // Restricción: No se pueden desactivar super administradores
    if (user.role.name === 'Super Administrador') {
      toast.error("Acción no permitida", {
        description: "No se puede desactivar a un usuario con el rol de Super Administrador.",
      });
      return;
    }

    // Restricción: No se puede activar un usuario si su rol está desactivado
    const isActivating = !user.isActive;
    if (isActivating && !user.role.isActive) {
      toast.error("Acción no permitida", {
        description: `No se puede activar al usuario porque el rol "${user.role.name}" está desactivado.`,
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

  const handleViewUser = (user: User) => {
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
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
                <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                      Completa los datos para crear un nuevo usuario en el sistema.
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
                        <UserIcon className="h-4 w-4" /> Información Personal
                      </TabsTrigger>
                      <TabsTrigger 
                        value="contact" 
                        className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                      >
                        <MapPin className="h-4 w-4" /> Contactos y Rol
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-8 animate-in fade-in-50 duration-500">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-firstName">Nombres *</Label>
                            <Input
                              id="create-firstName"
                              value={newUser.firstName}
                              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-lastName">Apellidos *</Label>
                            <Input
                              id="create-lastName"
                              value={newUser.lastName}
                              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                          <Label htmlFor="create-fechaNacimiento">Fecha de Nacimiento *</Label>
                          <Input
                            id="create-fechaNacimiento"
                            type="date"
                            value={newUser.fechaNacimiento}
                            onChange={(e) => setNewUser({ ...newUser, fechaNacimiento: e.target.value })}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-8 animate-in fade-in-50 duration-500">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-email">Email *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="create-email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-telefono">Teléfono *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="create-telefono"
                                value={newUser.telefono}
                                onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                                placeholder="Número de teléfono"
                                className="pl-9"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-ciudad">Ciudad *</Label>
                            <Input
                              id="create-ciudad"
                              value={newUser.ciudad}
                              onChange={(e) => setNewUser({ ...newUser, ciudad: e.target.value })}
                              placeholder="Medellín"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-direccion">Dirección *</Label>
                            <Input
                              id="create-direccion"
                              value={newUser.direccion}
                              onChange={(e) => setNewUser({ ...newUser, direccion: e.target.value })}
                              placeholder="Calle..."
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
                        </div>
                        
                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                {roles.filter(role => role.isActive && role.name !== 'Cliente' && role.name !== 'Super Administrador').map((role) => (
                                  <SelectItem key={role.id} value={role.name as UserRole}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-500 mt-1 px-1">
                              * Los clientes se gestionan desde el módulo de Clientes.
                            </p>
                          </div>
                          <div className="space-y-2 flex flex-col justify-center">
                            <div className="flex items-center space-x-2 mt-4">
                              <Switch
                                id="create-active"
                                checked={newUser.isActive}
                                onCheckedChange={(checked: boolean) => setNewUser({ ...newUser, isActive: checked })}
                              />
                              <Label htmlFor="create-active">Usuario Activo</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)} 
                      disabled={isLoading}
                      className="w-full sm:w-auto sm:mr-3 h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateUser} 
                      disabled={isLoading}
                      className="w-full sm:w-auto h-10 px-6 bg-black hover:bg-gray-800 text-white font-medium border-none transition-all"
                    >
                      {isLoading ? "Creando..." : "Crear Usuario"}
                    </Button>
                  </DialogFooter>
                </div>
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
                  <TableHead>Documento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <LoadingScreen message="Cargando usuarios..." />
                    </TableCell>
                  </TableRow>
                ) : currentUsers.map((user) => (
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
                      <div className="text-sm font-medium">
                        <Badge variant="outline" className="mr-1 text-[10px] px-1 h-4">
                          {user.tipoDocumento}
                        </Badge>
                        {user.numeroDocumento}
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
                        {user.isActive ? (
                          <Badge className="bg-black text-white hover:bg-black">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                            Inactivo
                          </Badge>
                        )}
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleUserStatus(user)}
                          size="sm"
                          disabled={user.role.name === 'Super Administrador'}
                          title={user.role.name === 'Super Administrador' ? 'No se puede desactivar un super administrador' : ''}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Ver detalle
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                disabled={user.role.name === 'Super Administrador'}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {user.role.name === 'Super Administrador'
                                ? "No se puede editar un super administrador"
                                : user.role.name === 'Cliente'
                                  ? "Editar información detallada del cliente"
                                  : "Editar usuario"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.role.name === 'Super Administrador'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {user.role.name === 'Super Administrador' ? 'No se puede eliminar un super administrador' : 'Eliminar usuario'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                  />
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
                      {roles.filter(role => role.isActive && role.name !== 'Super Administrador').map((role) => (
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
                    disabled={editUserData.role === 'Super Administrador'}
                  />
                  <Label>Usuario Activo {editUserData.role === 'Super Administrador' && "(No modificable para Super Administradores)"}</Label>
                </div>

              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditUserDialogOpen(false);
              setEditingUser(null);
              resetEditUserForm();
            }} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={isLoading}>
              {isLoading ? "Actualizando..." : "Actualizar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalle del usuario */}
      <Dialog open={isUserDetailDialogOpen} onOpenChange={setIsUserDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
          <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalle del Usuario</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Información de perfil y privilegios de acceso al sistema.
                </DialogDescription>
              </div>
              {selectedUser && (
                <Badge 
                  variant={selectedUser.isActive ? "default" : "secondary"}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                    selectedUser.isActive 
                    ? "bg-blue-50 text-blue-700 border-blue-100" 
                    : "bg-gray-50 text-gray-600 border-gray-100"
                  }`}
                >
                  {selectedUser.isActive ? "Usuario Activo" : "Usuario Desactivado"}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="p-8 space-y-10">
              {/* Perfil Principal */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                  <UserIcon className="h-10 w-10 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-[11px] font-bold text-gray-600 uppercase tracking-tight">
                      {getRoleIcon(selectedUser.role.name)}
                      {selectedUser.role.name}
                    </div>
                    <span className="text-sm font-mono text-gray-400">
                      ID: {selectedUser.numeroDocumento || selectedUser.username}
                    </span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
                  <TabsTrigger 
                    value="info" 
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                  >
                    <Info className="h-4 w-4" /> Información Personal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ubicacion" 
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                  >
                    <MapPin className="h-4 w-4" /> Ubicación
                  </TabsTrigger>
                  {selectedUser?.documentoUrl && (
                    <TabsTrigger 
                      value="documento" 
                      className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                    >
                      <Shield className="h-4 w-4" /> Documento (Validación)
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5" /> Identidad y Contacto
                    </h4>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Tipo de Documento</Label>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedUser.tipoDocumento === 'T.I' ? 'Tarjeta de Identidad (T.I)' :
                            selectedUser.tipoDocumento === 'C.C' ? 'Cédula de Ciudadanía (C.C)' : 'Cédula de Ciudadanía'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Fecha de Nacimiento</Label>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedUser.fechaNacimiento ? new Date(selectedUser.fechaNacimiento).toLocaleDateString() : 'No registrada'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Correo Electrónico</Label>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Teléfono</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.telefono || 'No registrado'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ubicacion" className="space-y-8 animate-in fade-in-50 duration-500">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> Domicilio
                    </h4>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Ciudad</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.ciudad || 'No registrada'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Barrio</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.barrio || 'No registrado'}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs font-medium text-gray-500">Dirección</Label>
                        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 mt-1">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">
                            {selectedUser.direccion || 'No registrada'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {selectedUser?.documentoUrl && (
                  <TabsContent value="documento" className="space-y-8 animate-in fade-in-50 duration-500">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" /> Comprobante de Identidad
                      </h4>
                      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Fecha de Nacimiento declarada: </span>
                          <span className="font-bold text-gray-900">
                            {selectedUser.fechaNacimiento ? new Date(selectedUser.fechaNacimiento).toLocaleDateString() : 'No registrada'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Documento: </span>
                          <span className="font-bold text-gray-900">{selectedUser.numeroDocumento || selectedUser.username}</span>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex justify-center p-4">
                        <img 
                          src={selectedUser.documentoUrl} 
                          alt="Documento de Identidad" 
                          className="max-w-full max-h-[400px] object-contain rounded-md shadow-sm"
                        />
                      </div>
                      {!selectedUser.isActive && (
                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                          <Button 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                               setIsUserDetailDialogOpen(false);
                               setUserToDelete(selectedUser);
                               setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Rechazar y Eliminar
                          </Button>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={async () => {
                               try {
                                 const updatedUser = { ...selectedUser, isActive: true, documentoUrl: "" };
                                 await updateUser(updatedUser);
                                 setIsUserDetailDialogOpen(false);
                                 toast.success('Cliente aprobado y activado correctamente. El documento ha sido eliminado por seguridad y espacio.');
                               } catch (error) {
                                 toast.error('Error al aprobar usuario');
                               }
                            }}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Aprobar y Activar
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}

          <DialogFooter className="p-8 border-t border-gray-100 bg-white gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsUserDetailDialogOpen(false)}
              className="h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200"
            >
              Cerrar
            </Button>
            {selectedUser && (
              <Button 
                onClick={() => {
                  setIsUserDetailDialogOpen(false);
                  handleEditUser(selectedUser);
                }}
                className="h-10 px-6 bg-gray-900 text-white font-medium hover:bg-black transition-all flex-1 sm:flex-none"
              >
                Editar Información
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
        isDisabled={isLoading || (userToDelete?.role.name === 'Super Administrador')}
        disableReason={userToDelete?.role.name === 'Super Administrador' ? "No se puede eliminar al Super Administrador" : undefined}
      />

      <ClientEditDialog
        isOpen={isClientEditDialogOpen}
        onOpenChange={setIsClientEditDialogOpen}
        cliente={selectedClientForEdit}
        onSuccess={fetchUsers}
      />

      {/* Client Detail Dialog */}
      <ClientDetailDialog
        isOpen={isClientDetailDialogOpen}
        onOpenChange={setIsClientDetailDialogOpen}
        cliente={selectedClientForDetail}
        onEdit={(client) => {
          setSelectedClientForEdit(client);
          setIsClientEditDialogOpen(true);
        }}
      />
    </div>
  );
};
