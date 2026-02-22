import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { TablePagination } from './ui/TablePagination';
import { toast } from "sonner";
import { Cliente } from '../types';
import { UniversalDeleteDialog } from './UniversalDeleteDialog';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Ban,
  Filter,
  UserPlus
} from 'lucide-react';

// Datos simulados
const mockClientes: Cliente[] = [
  {
    id: '1',
    codigo: 'CLI-001',
    nombre: 'Ana',
    apellido: 'García',
    email: 'ana.garcia@email.com',
    telefono: '+57 300 111 2222',
    celular: '+57 300 111 2222',
    direccion: 'Carrera 65 #45-30',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1990-05-15'),
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    tipo: 'Minorista',
    estado: 'Activo',
    fechaRegistro: new Date('2023-01-15'),
    totalCompras: 1250000,
    cantidadOrdenes: 28,
    ultimaCompra: new Date('2024-03-10'),
    genero: 'Femenino',
    recibePromociones: true,
    observaciones: 'Cliente activo, excelente historial de compras.'
  },
  {
    id: '2',
    codigo: 'CLI-002',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '+57 310 333 4444',
    celular: '+57 310 333 4444',
    direccion: 'Calle 50 #20-15',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1985-08-22'),
    tipoDocumento: 'CC',
    numeroDocumento: '2345678901',
    tipo: 'Mayorista',
    estado: 'Activo',
    fechaRegistro: new Date('2023-03-20'),
    totalCompras: 2800000,
    cantidadOrdenes: 45,
    ultimaCompra: new Date('2024-03-08'),
    genero: 'Masculino',
    recibePromociones: true,
    observaciones: 'Cliente mayorista con excelente capacidad de pago.'
  },
  {
    id: '3',
    codigo: 'CLI-003',
    nombre: 'Lucia',
    apellido: 'Martínez',
    email: 'lucia.martinez@email.com',
    telefono: '+57 320 555 6666',
    direccion: 'Avenida Las Palmas #15-45',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1995-12-03'),
    tipoDocumento: 'CC',
    numeroDocumento: '3456789012',
    tipo: 'Minorista',
    estado: 'Activo',
    fechaRegistro: new Date('2024-01-10'),
    totalCompras: 450000,
    cantidadOrdenes: 12,
    ultimaCompra: new Date('2024-03-05'),
    genero: 'Femenino',
    recibePromociones: true,
    observaciones: 'Cliente activa, muy participativa.'
  },
  {
    id: '4',
    codigo: 'CLI-004',
    nombre: 'Pedro',
    apellido: 'López',
    email: 'pedro.lopez@email.com',
    telefono: '+57 315 444 5555',
    celular: '+57 315 444 5555',
    direccion: 'Carrera 80 #50-25',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1992-07-18'),
    tipoDocumento: 'CC',
    numeroDocumento: '4567890123',
    tipo: 'Minorista',
    estado: 'Activo',
    fechaRegistro: new Date('2023-05-12'),
    totalCompras: 750000,
    cantidadOrdenes: 18,
    ultimaCompra: new Date('2024-03-15'),
    genero: 'Masculino',
    recibePromociones: true,
    observaciones: 'Cliente regular con compras constantes.'
  },
  {
    id: '5',
    codigo: 'CLI-005',
    nombre: 'Sofia',
    apellido: 'Hernández',
    email: 'sofia.hernandez@email.com',
    telefono: '+57 318 777 8888',
    direccion: 'Calle 25 #40-10',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1988-11-25'),
    tipoDocumento: 'CC',
    numeroDocumento: '5678901234',
    tipo: 'Mayorista',
    estado: 'Activo',
    fechaRegistro: new Date('2023-08-30'),
    totalCompras: 3200000,
    cantidadOrdenes: 52,
    ultimaCompra: new Date('2024-03-20'),
    genero: 'Femenino',
    recibePromociones: false,
    observaciones: 'Cliente mayorista VIP, excelente volumen de compras.'
  },
  {
    id: '6',
    codigo: 'CLI-006',
    nombre: 'Miguel',
    apellido: 'Torres',
    email: 'miguel.torres@email.com',
    telefono: '+57 312 999 0000',
    celular: '+57 312 999 0000',
    direccion: 'Avenida 33 #15-20',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1993-04-08'),
    tipoDocumento: 'CC',
    numeroDocumento: '6789012345',
    tipo: 'Minorista',
    estado: 'Inactivo',
    fechaRegistro: new Date('2023-09-15'),
    totalCompras: 320000,
    cantidadOrdenes: 8,
    ultimaCompra: new Date('2024-01-10'),
    genero: 'Masculino',
    recibePromociones: true,
    observaciones: 'Cliente inactivo, no ha realizado compras recientes.'
  },
  {
    id: '7',
    codigo: 'CLI-007',
    nombre: 'Isabella',
    apellido: 'Ramírez',
    email: 'isabella.ramirez@email.com',
    telefono: '+57 316 123 4567',
    celular: '+57 316 123 4567',
    direccion: 'Calle 70 #25-30',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fechaNacimiento: new Date('1991-09-12'),
    tipoDocumento: 'CC',
    numeroDocumento: '7890123456',
    tipo: 'Mayorista',
    estado: 'Suspendido',
    fechaRegistro: new Date('2023-04-18'),
    totalCompras: 1800000,
    cantidadOrdenes: 25,
    ultimaCompra: new Date('2024-02-20'),
    genero: 'Femenino',
    recibePromociones: false,
    observaciones: 'Cliente suspendido por pagos pendientes.'
  }
];

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  const [newCliente, setNewCliente] = useState<Partial<Cliente>>({
    codigo: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    tipo: 'Minorista',
    estado: 'Activo',
    recibePromociones: true
  });

  // Filtrar clientes
  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.numeroDocumento.includes(searchTerm);

    const matchesType = filterType === 'all' || cliente.tipo === filterType;
    const matchesStatus = filterStatus === 'all' || cliente.estado === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClientes = filteredClientes.slice(startIndex, endIndex);

  // Resetear página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  // Funciones CRUD
  const handleCreateCliente = () => {
    const nuevoCliente: Cliente = {
      ...newCliente as Cliente,
      id: String(clientes.length + 1),
      fechaRegistro: new Date(),
      totalCompras: 0,
      cantidadOrdenes: 0
    };

    setClientes([...clientes, nuevoCliente]);
    resetNewClienteForm();
    setIsCreateDialogOpen(false);
    toast.success('Cliente creado exitosamente');
  };

  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsViewDialogOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCliente = () => {
    if (editingCliente) {
      setClientes(clientes.map(c =>
        c.id === editingCliente.id ? editingCliente : c
      ));
      setIsEditDialogOpen(false);
      setEditingCliente(null);
      toast.success('Cliente actualizado exitosamente');
    }
  };

  const handleDeleteCliente = () => {
    if (clienteToDelete) {
      setClientes(clientes.filter(c => c.id !== clienteToDelete.id));
      setIsDeleteDialogOpen(false);
      setClienteToDelete(null);
      toast.success('Cliente eliminado exitosamente');
    }
  };

  const openDeleteDialog = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setIsDeleteDialogOpen(true);
  };

  const resetNewClienteForm = () => {
    setNewCliente({
      codigo: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      celular: '',
      direccion: '',
      ciudad: '',
      pais: 'Colombia',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      tipo: 'Minorista',
      estado: 'Activo',
      recibePromociones: true
    });
  };

  // Función para cambiar el estado con switch (Activo/Inactivo)
  const handleToggleEstado = (clienteId: string, isActive: boolean) => {
    const nuevoEstado = isActive ? 'Activo' : 'Inactivo';
    setClientes(clientes.map(cliente =>
      cliente.id === clienteId
        ? { ...cliente, estado: nuevoEstado as 'Activo' | 'Inactivo' | 'Suspendido' }
        : cliente
    ));

    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      toast.success(`${cliente.nombre} ${cliente.apellido} ${isActive ? 'activado' : 'desactivado'} exitosamente`);
    }
  };

  // Funciones de estilo y utilidad
  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Mayorista': return 'bg-blue-500 text-white';
      case 'Minorista': return 'bg-green-600 text-white';
      default: return 'bg-gray-400 text-black';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Activo': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Inactivo': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'Suspendido': return <Ban className="h-4 w-4 text-red-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>
                Administra la información de tus clientes y su historial de compras
              </CardDescription>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                  <DialogDescription>
                    Completa la información del cliente para registrarlo en el sistema.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="contact">Contacto</TabsTrigger>
                    <TabsTrigger value="commercial">Comercial</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={newCliente.nombre || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, nombre: e.target.value })}
                          placeholder="Ana"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido *</Label>
                        <Input
                          id="apellido"
                          value={newCliente.apellido || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, apellido: e.target.value })}
                          placeholder="García"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="tipoDocumento">Tipo Documento</Label>
                        <Select
                          value={newCliente.tipoDocumento || 'CC'}
                          onValueChange={(value) => setNewCliente({ ...newCliente, tipoDocumento: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CC">Cédula</SelectItem>
                            <SelectItem value="CE">Cédula Extranjería</SelectItem>
                            <SelectItem value="NIT">NIT</SelectItem>
                            <SelectItem value="PP">Pasaporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="numeroDocumento">Número Documento *</Label>
                        <Input
                          id="numeroDocumento"
                          value={newCliente.numeroDocumento || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, numeroDocumento: e.target.value })}
                          placeholder="1234567890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">Fecha Nacimiento</Label>
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        value={newCliente.fechaNacimiento?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setNewCliente({ ...newCliente, fechaNacimiento: new Date(e.target.value) })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCliente.email || ''}
                        onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })}
                        placeholder="ana.garcia@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={newCliente.telefono || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })}
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="celular">Celular</Label>
                        <Input
                          id="celular"
                          value={newCliente.celular || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, celular: e.target.value })}
                          placeholder="+57 310 123 4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input
                        id="direccion"
                        value={newCliente.direccion || ''}
                        onChange={(e) => setNewCliente({ ...newCliente, direccion: e.target.value })}
                        placeholder="Carrera 65 #45-30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad *</Label>
                        <Input
                          id="ciudad"
                          value={newCliente.ciudad || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, ciudad: e.target.value })}
                          placeholder="Medellín"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento *</Label>
                        <Input
                          id="departamento"
                          value={newCliente.departamento || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, departamento: e.target.value })}
                          placeholder="Antioquia"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="commercial" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo Cliente *</Label>
                      <Select
                        value={newCliente.tipo || 'Minorista'}
                        onValueChange={(value) => setNewCliente({ ...newCliente, tipo: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Minorista">Minorista</SelectItem>
                          <SelectItem value="Mayorista">Mayorista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newCliente.tipo === 'Mayorista' && (
                      <div className="space-y-2">
                        <Label htmlFor="descuento">Descuento (%) *</Label>
                        <Input
                          id="descuento"
                          type="number"
                          min="0"
                          max="100"
                          value={newCliente.descuento || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, descuento: Number(e.target.value) })}
                          placeholder="Ej: 15"
                        />
                        <p className="text-sm text-gray-500">Porcentaje de descuento para este cliente mayorista</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="recibePromociones"
                        checked={newCliente.recibePromociones || false}
                        onCheckedChange={(checked) => setNewCliente({ ...newCliente, recibePromociones: checked })}
                      />
                      <Label htmlFor="recibePromociones">Recibe promociones</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" onClick={handleCreateCliente} disabled={!newCliente.nombre || !newCliente.apellido || !newCliente.email}>
                    Crear Cliente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar clientes por nombre, email o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Minorista">Minorista</SelectItem>
                  <SelectItem value="Mayorista">Mayorista</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clients Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo Documento</TableHead>
                  <TableHead>Número Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="font-medium">{cliente.nombre} {cliente.apellido}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cliente.tipoDocumento}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cliente.numeroDocumento}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cliente.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(cliente.tipo)} text-white`}>
                        {cliente.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            cliente.estado === "Activo"
                              ? "bg-black text-white border-black"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-200"
                          }
                        >
                          {cliente.estado}
                        </Badge>
                        <Switch
                          checked={cliente.estado === 'Activo'}
                          onCheckedChange={(checked) => handleToggleEstado(cliente.id, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCliente(cliente)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCliente(cliente)}
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Eliminar cliente"
                          onClick={() => openDeleteDialog(cliente)}
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

          {/* Paginación - Siempre visible */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClientes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="clientes"
          />
        </CardContent>
      </Card>

      {/* Modal Ver Detalles Completo */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto modal-scroll">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa y detallada del cliente
            </DialogDescription>
          </DialogHeader>

          {selectedCliente && (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
                <TabsTrigger value="commercial">Comercial</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>

              {/* Pestaña Información Básica */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Identificación</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedCliente.estado)}
                      <Badge className={`${getTypeColor(selectedCliente.tipo)} text-white`}>
                        {selectedCliente.tipo}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estado</Label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedCliente.estado)}
                        <span className={`font-semibold ${selectedCliente.estado === 'Activo' ? 'text-green-600' :
                            selectedCliente.estado === 'Inactivo' ? 'text-gray-500' :
                              'text-red-500'
                          }`}>
                          {selectedCliente.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                    <p className="font-semibold">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Género</Label>
                    <p>{selectedCliente.genero || 'No especificado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tipo de Documento</Label>
                    <p>{selectedCliente.tipoDocumento === 'CC' ? 'Cédula de Ciudadanía' :
                      selectedCliente.tipoDocumento === 'CE' ? 'Cédula de Extranjería' :
                        selectedCliente.tipoDocumento === 'NIT' ? 'NIT' :
                          selectedCliente.tipoDocumento === 'PP' ? 'Pasaporte' :
                            selectedCliente.tipoDocumento}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Número de Documento</Label>
                    <p className="font-mono">{selectedCliente.numeroDocumento}</p>
                  </div>
                </div>

                {selectedCliente.fechaNacimiento && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</Label>
                    <p>{selectedCliente.fechaNacimiento.toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Registro</Label>
                  <p>{selectedCliente.fechaRegistro?.toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </TabsContent>

              {/* Pestaña Contacto */}
              <TabsContent value="contact" className="space-y-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="font-semibold">{selectedCliente.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Teléfono Principal</Label>
                        <p className="font-semibold">{selectedCliente.telefono}</p>
                      </div>
                    </div>

                    {selectedCliente.celular && selectedCliente.celular !== selectedCliente.telefono && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-purple-500" />
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Celular</Label>
                          <p className="font-semibold">{selectedCliente.celular}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Dirección
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Dirección Completa</Label>
                      <p className="font-semibold">{selectedCliente.direccion}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Ciudad</Label>
                        <p>{selectedCliente.ciudad}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">País</Label>
                        <p>{selectedCliente.pais}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña Comercial */}
              <TabsContent value="commercial" className="space-y-6 mt-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información Comercial</h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Cliente</Label>
                      <div className="mt-1">
                        <Badge className={`${getTypeColor(selectedCliente.tipo)} text-white text-sm px-3 py-1`}>
                          {selectedCliente.tipo}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Recibe Promociones</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Switch checked={selectedCliente.recibePromociones} disabled />
                        <span className={selectedCliente.recibePromociones ? 'text-green-600' : 'text-gray-500'}>
                          {selectedCliente.recibePromociones ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCliente.tipo === 'Mayorista' && selectedCliente.descuento && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-gray-500">Descuento Especial</Label>
                    <p className="mt-1 text-2xl font-bold text-yellow-600">{selectedCliente.descuento}%</p>
                  </div>
                )}
              </TabsContent>

              {/* Pestaña Historial */}
              <TabsContent value="history" className="space-y-6 mt-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Historial de Compras</h3>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <Label className="text-sm font-medium text-gray-500">Total Compras</Label>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedCliente.totalCompras?.toLocaleString('es-CO') || '0'}
                      </p>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-medium text-gray-500">Número de Órdenes</Label>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedCliente.cantidadOrdenes || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-medium text-gray-500">Promedio por Orden</Label>
                      <p className="text-2xl font-bold text-purple-600">
                        ${selectedCliente.cantidadOrdenes && selectedCliente.totalCompras ?
                          Math.round(selectedCliente.totalCompras / selectedCliente.cantidadOrdenes).toLocaleString('es-CO') : '0'}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Última Compra</Label>
                      <p className="font-semibold">
                        {selectedCliente.ultimaCompra?.toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) || 'Sin compras registradas'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cliente desde</Label>
                      <p className="font-semibold">
                        {selectedCliente.fechaRegistro?.toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Estado del Cliente</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedCliente.estado)}
                      <span className={`font-semibold ${selectedCliente.estado === 'Activo' ? 'text-green-600' :
                          selectedCliente.estado === 'Inactivo' ? 'text-gray-500' :
                            'text-red-500'
                        }`}>
                        {selectedCliente.estado}
                      </span>
                    </div>
                    <Badge className={`${getTypeColor(selectedCliente.tipo)} text-white`}>
                      {selectedCliente.tipo}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedCliente) {
                handleEditCliente(selectedCliente);
              }
            }}>
              Editar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente seleccionado.
            </DialogDescription>
          </DialogHeader>

          {editingCliente && (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
                <TabsTrigger value="commercial">Comercial</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nombre">Nombre *</Label>
                    <Input
                      id="edit-nombre"
                      value={editingCliente.nombre || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-apellido">Apellido *</Label>
                    <Input
                      id="edit-apellido"
                      value={editingCliente.apellido || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, apellido: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tipoDocumento">Tipo Documento</Label>
                    <Select
                      value={editingCliente.tipoDocumento || 'CC'}
                      onValueChange={(value) => setEditingCliente({ ...editingCliente, tipoDocumento: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula</SelectItem>
                        <SelectItem value="CE">Cédula Extranjería</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                        <SelectItem value="PP">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-numeroDocumento">Número Documento *</Label>
                    <Input
                      id="edit-numeroDocumento"
                      value={editingCliente.numeroDocumento || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, numeroDocumento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fechaNacimiento">Fecha Nacimiento</Label>
                    <Input
                      id="edit-fechaNacimiento"
                      type="date"
                      value={editingCliente.fechaNacimiento?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, fechaNacimiento: new Date(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCliente.email || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, email: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-telefono">Teléfono *</Label>
                    <Input
                      id="edit-telefono"
                      value={editingCliente.telefono || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-celular">Celular</Label>
                    <Input
                      id="edit-celular"
                      value={editingCliente.celular || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, celular: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-direccion">Dirección *</Label>
                  <Input
                    id="edit-direccion"
                    value={editingCliente.direccion || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, direccion: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-ciudad">Ciudad *</Label>
                    <Input
                      id="edit-ciudad"
                      value={editingCliente.ciudad || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, ciudad: e.target.value })}
                      placeholder="Medellín"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-departamento">Departamento *</Label>
                    <Input
                      id="edit-departamento"
                      value={editingCliente.departamento || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, departamento: e.target.value })}
                      placeholder="Antioquia"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="commercial" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tipo">Tipo Cliente *</Label>
                  <Select
                    value={editingCliente.tipo || 'Minorista'}
                    onValueChange={(value) => setEditingCliente({ ...editingCliente, tipo: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minorista">Minorista</SelectItem>
                      <SelectItem value="Mayorista">Mayorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingCliente.tipo === 'Mayorista' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-descuento">Descuento (%) *</Label>
                    <Input
                      id="edit-descuento"
                      type="number"
                      min="0"
                      max="100"
                      value={editingCliente.descuento || ''}
                      onChange={(e) => setEditingCliente({ ...editingCliente, descuento: Number(e.target.value) })}
                      placeholder="Ej: 15"
                    />
                    <p className="text-sm text-gray-500">Porcentaje de descuento para este cliente mayorista</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-estado">Estado *</Label>
                  <Select
                    value={editingCliente.estado || 'Activo'}
                    onValueChange={(value) => setEditingCliente({ ...editingCliente, estado: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-recibePromociones"
                    checked={editingCliente.recibePromociones || false}
                    onCheckedChange={(checked) => setEditingCliente({ ...editingCliente, recibePromociones: checked })}
                  />
                  <Label htmlFor="edit-recibePromociones">Recibe promociones</Label>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" onClick={handleUpdateCliente}>
              Actualizar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <UniversalDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCliente}
        title="Eliminar Cliente"
        description={`¿Estás seguro de que deseas eliminar al cliente "${clienteToDelete?.nombre} ${clienteToDelete?.apellido}"? Esta acción no se puede deshacer.`}
        itemName={clienteToDelete ? `${clienteToDelete.nombre} ${clienteToDelete.apellido}` : ''}
        itemType="Cliente"
      />
    </div>
  );
};
