import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { Separator } from '@/shared/ui/separator';
import { TablePagination } from '@/shared/ui/TablePagination';
import { ClientEditDialog } from "./ClientEditDialog";
import { ClientDetailDialog } from "./ClientDetailDialog";
import { toast } from "sonner";
import { cn } from "@/shared/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/shared/ui/command";
import { UsuarioDto, DepartmentColombian, CityColombian, VentaPedidoDto, DevolucionDto } from '@/shared/types';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getDepartments, getCitiesByDepartment, getVentaPedidos, getDevoluciones } from '@/shared/services/api';
import { UniversalDeleteDialog } from '@/shared/components/UniversalDeleteDialog';
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
  ShoppingBag,
  RefreshCw,
  CheckCircle,
  XCircle,
  Ban,
  Filter,
  UserPlus,
  Loader2,
  Check,
  ChevronsUpDown,
  Shield
} from 'lucide-react';

// Eliminados mockClientes para usar API real

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<UsuarioDto[]>([]);
  const [ventas, setVentas] = useState<VentaPedidoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Errores de validación en tiempo real
  const [numDocError, setNumDocError] = useState<string | null>(null);
  const [editNumDocError, setEditNumDocError] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<UsuarioDto | null>(null);
  const [editingCliente, setEditingCliente] = useState<UsuarioDto | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<UsuarioDto | null>(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [clientToValidate, setClientToValidate] = useState<UsuarioDto | null>(null);

  // Estados para Geografía
  const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
  const [cities, setCities] = useState<CityColombian[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isDeptPopoverOpen, setIsDeptPopoverOpen] = useState(false);
  const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);

  // Estados para Dirección Estructurada (Creación)
  const [addrParts, setAddrParts] = useState({
    tipoVia: '',
    viaPrincipal: '',
    viaSecundaria: '',
    placa: ''
  });

  // Tipos de Vía Estándar
  const tiposVia = ['Calle', 'Carrera', 'Transversal', 'Diagonal', 'Circular', 'Avenida', 'Pasaje'];


  const [newCliente, setNewCliente] = useState<Partial<UsuarioDto>>({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    barrio: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    fechaNacimiento: new Date().toISOString().split('T')[0],
    rolId: 3, // Rol de Cliente
    estadoUsuario: true,
    tipoCliente: 'Minorista',
    departamento: ''
  });

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      // Ordenar alfabéticamente
      const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(sortedData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    if (selectedDepartment) {
      const fetchCities = async () => {
        try {
          const dept = departments.find(d => d.name === selectedDepartment);
          if (dept) {
            const data = await getCitiesByDepartment(dept.id);
            // Ordenar alfabéticamente
            const sortedCities = [...data].sort((a, b) => a.name.localeCompare(b.name));
            setCities(sortedCities);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedDepartment, departments]);

  // Efecto para concatenar dirección de creación
  useEffect(() => {
    const { tipoVia, viaPrincipal, viaSecundaria, placa } = addrParts;
    if (tipoVia && viaPrincipal && viaSecundaria && placa) {
      const fullAddr = `${tipoVia} ${viaPrincipal} # ${viaSecundaria}-${placa}`;
      setNewCliente(prev => ({ ...prev, direccion: fullAddr }));
    }
  }, [addrParts]);

  // Validación de documento en tiempo real (Creación)
  useEffect(() => {
    const doc = newCliente.numeroDocumento?.trim();
    if (doc && doc.length > 3) {
      const exists = clientes.some(c => c.numeroDocumento === doc);
      setNumDocError(exists ? `⚠️ Esta cédula ya está registrada a otro cliente.` : null);
    } else {
      setNumDocError(null);
    }
  }, [newCliente.numeroDocumento, clientes]);

  // Validación de documento en tiempo real (Edición)
  useEffect(() => {
    const doc = editingCliente?.numeroDocumento?.trim();
    if (doc && doc.length > 3 && editingCliente) {
      const exists = clientes.some(c => c.numeroDocumento === doc && c.id !== editingCliente.id);
      setEditNumDocError(exists ? `⚠️ Esta cédula ya pertenece a otro cliente.` : null);
    } else {
      setEditNumDocError(null);
    }
  }, [editingCliente?.numeroDocumento, editingCliente?.id, clientes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usuariosData, ventasData] = await Promise.all([
        getUsuarios(),
        getVentaPedidos()
      ]);
      setClientes(usuariosData.sort((a, b) => (b.id || 0) - (a.id || 0)));
      setVentas(ventasData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  const filteredClientes = clientes.filter(cliente => {
    const nombres = (cliente.nombres || '').toLowerCase();
    const apellidos = (cliente.apellidos || '').toLowerCase();
    const correo = (cliente.correo || '').toLowerCase();
    const documento = (cliente.numeroDocumento || '');

    const matchesSearch = nombres.includes(searchTerm.toLowerCase()) ||
      apellidos.includes(searchTerm.toLowerCase()) ||
      correo.includes(searchTerm.toLowerCase()) ||
      documento.includes(searchTerm);

    // Nota: filterType (Mayorista/Minorista) es solo visual por ahora
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'Activo' && cliente.estadoUsuario) ||
      (filterStatus === 'Inactivo' && !cliente.estadoUsuario);

    return matchesSearch && matchesStatus && cliente.rolId === 3;
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
  const validateCliente = (data: Partial<UsuarioDto>, isEdit = false, originalId?: number): boolean => {
    const { nombres, apellidos, correo, telefono, numeroDocumento, fechaNacimiento, ciudad, direccion } = data;

    // 1. Campos Obligatorios
    if (!nombres || !apellidos || !correo || !telefono || !numeroDocumento || !ciudad || !direccion) {
      toast.error("Por favor, complete todos los campos obligatorios (*)");
      return false;
    }

    // 2. Formato de Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      toast.error("El formato del correo electrónico no es válido");
      return false;
    }

    // 3. Documento Numérico
    if (!/^\d+$/.test(numeroDocumento)) {
      toast.error("El número de documento debe contener solo dígitos");
      return false;
    }

    // 4. Teléfono Numérico y Longitud
    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      toast.error("El teléfono debe tener al menos 7 dígitos numéricos");
      return false;
    }

    // 5. Mayoría de Edad (18+)
    if (fechaNacimiento) {
      const birthDate = new Date(fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toast.error("El cliente debe ser mayor de 18 años");
        return false;
      }
    }

    // 6. Duplicados (Cédula y Correo)
    const normalizedDoc = numeroDocumento.trim();
    const normalizedEmail = correo.trim().toLowerCase();

    const duplicateDoc = clientes.find(c =>
      c.numeroDocumento === normalizedDoc && (!isEdit || c.id !== originalId)
    );
    if (duplicateDoc) {
      toast.error(`Ya existe un cliente con el documento ${normalizedDoc}`);
      return false;
    }

    const duplicateEmail = clientes.find(c =>
      c.correo.toLowerCase() === normalizedEmail && (!isEdit || c.id !== originalId)
    );
    if (duplicateEmail) {
      toast.error(`El correo ${normalizedEmail} ya está registrado`);
      return false;
    }

    return true;
  };

  const handleCreateCliente = async () => {
    if (!validateCliente(newCliente)) return;

    try {
      setLoading(true);
      const dataToSave = {
        ...newCliente,
        rolId: 3, // Forzamos rol de cliente
        estadoUsuario: true,
        username: newCliente.numeroDocumento, // Seteamos el usuario como el número de documento
        contraseña: newCliente.numeroDocumento // Seteamos la contraseña como el número de documento
      } as UsuarioDto;

      console.log("CREANDO CLIENTE (Payload):", JSON.stringify(dataToSave, null, 2));
      await createUsuario(dataToSave);
      toast.success('Cliente creado correctamente. El usuario y la contraseña para iniciar sesión es su número de documento.', {
        duration: 6000,
        icon: '👤'
      });
      fetchData();
      resetNewClienteForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error al crear el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCliente = (cliente: UsuarioDto) => {
    setSelectedCliente(cliente);
    setIsViewDialogOpen(true);
  };

  const handleEditCliente = (cliente: UsuarioDto) => {
    setEditingCliente(cliente);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCliente = async () => {
    if (clienteToDelete) {
      try {
        setLoading(true);
        await deleteUsuario(clienteToDelete.id);
        toast.success('Cliente eliminado exitosamente');
        fetchData();
        setIsDeleteDialogOpen(false);
        setClienteToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Error al eliminar el cliente");
      } finally {
        setLoading(false);
      }
    }
  };

  const openDeleteDialog = (cliente: UsuarioDto) => {
    setClienteToDelete(cliente);
    setIsDeleteDialogOpen(true);
  };

  const resetNewClienteForm = () => {
    setNewCliente({
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      barrio: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      fechaNacimiento: new Date().toISOString().split('T')[0],
      rolId: 3,
      estadoUsuario: true,
      tipoCliente: 'Minorista',
      departamento: ''
    });
    setAddrParts({ tipoVia: '', viaPrincipal: '', viaSecundaria: '', placa: '' });
    setSelectedDepartment('');
  };

  const handleToggleEstado = async (clienteId: number, isActive: boolean) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      try {
        const updatedCliente = { ...cliente, estadoUsuario: isActive };
        await updateUsuario(clienteId, updatedCliente);
        toast.success(`${cliente.nombres} ${isActive ? 'activado' : 'desactivado'} exitosamente`);
        fetchData();
      } catch (error) {
        console.error("Error toggling user status:", error);
        toast.error("Error al cambiar el estado");
      }
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

  const getStatusIcon = (estado: boolean) => {
    return estado ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-500" />;
  };

  const hasSales = (clienteId: number) => {
    return ventas.some(v => v.usuarioId === clienteId);
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full lg:w-auto">
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
                        <Label htmlFor="nombre">Nombres *</Label>
                        <Input
                          id="nombre"
                          value={newCliente.nombres || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, nombres: e.target.value })}
                          placeholder="Ana"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellidos *</Label>
                        <Input
                          id="apellido"
                          value={newCliente.apellidos || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, apellidos: e.target.value })}
                          placeholder="García"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="tipoDocumento">Tipo Documento</Label>
                        <Select
                          value={newCliente.tipoDocumento || 'CC'}
                          onValueChange={(value: string) => setNewCliente({ ...newCliente, tipoDocumento: value as any })}
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
                          className={cn(numDocError ? "border-red-500 focus-visible:ring-red-500" : "")}
                        />
                        {numDocError && (
                          <p className="text-[10px] font-bold text-red-600 bg-red-50 p-1 rounded border border-red-100 animate-in fade-in slide-in-from-top-1">
                            {numDocError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaNacimiento">Fecha Nacimiento</Label>
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        value={newCliente.fechaNacimiento || ''}
                        onChange={(e) => setNewCliente({ ...newCliente, fechaNacimiento: e.target.value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newCliente.correo || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, correo: e.target.value })}
                          placeholder="ana.garcia@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={newCliente.telefono || ''}
                          onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })}
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Departamento *</Label>
                        <Popover open={isDeptPopoverOpen} onOpenChange={setIsDeptPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isDeptPopoverOpen}
                              className="w-full justify-between"
                            >
                              {selectedDepartment
                                ? departments.find((dept) => dept.name === selectedDepartment)?.name
                                : "Seleccionar Departamento"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar departamento..." />
                              <CommandList>
                                <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                                <CommandGroup>
                                  {departments.map((dept) => (
                                    <CommandItem
                                      key={dept.id}
                                      value={dept.name}
                                      onSelect={() => {
                                        setSelectedDepartment(dept.name);
                                        setNewCliente({ ...newCliente, departamento: dept.name });
                                        setIsDeptPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedDepartment === dept.name ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {dept.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Ciudad *</Label>
                        <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isCityPopoverOpen}
                              className="w-full justify-between"
                              disabled={!selectedDepartment}
                            >
                              {newCliente.ciudad
                                ? cities.find((city) => city.name === newCliente.ciudad)?.name
                                : "Seleccionar Ciudad"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar ciudad..." />
                              <CommandList>
                                <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                                <CommandGroup>
                                  {cities.map((city) => (
                                    <CommandItem
                                      key={city.id}
                                      value={city.name}
                                      onSelect={() => {
                                        setNewCliente({ ...newCliente, ciudad: city.name });
                                        setIsCityPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          newCliente.ciudad === city.name ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {city.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barrio">Barrio</Label>
                      <Input
                        id="barrio"
                        value={newCliente.barrio || ''}
                        onChange={(e) => setNewCliente({ ...newCliente, barrio: e.target.value })}
                        placeholder="El Poblado"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-blue-600 font-semibold">Dirección Estructural *</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo Vía</Label>
                          <Select
                            value={addrParts.tipoVia}
                            onValueChange={(val: string) => setAddrParts({ ...addrParts, tipoVia: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposVia.map(tipo => (
                                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">N° Principal</Label>
                          <Input
                            placeholder="67"
                            value={addrParts.viaPrincipal}
                            onChange={(e) => setAddrParts({ ...addrParts, viaPrincipal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">N° Secundario</Label>
                          <div className="flex items-center">
                            <span className="mr-1 text-gray-500">#</span>
                            <Input
                              placeholder="102"
                              value={addrParts.viaSecundaria}
                              onChange={(e) => setAddrParts({ ...addrParts, viaSecundaria: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">N° Placa</Label>
                          <div className="flex items-center">
                            <span className="mr-1 text-gray-500">-</span>
                            <Input
                              placeholder="25"
                              value={addrParts.placa}
                              onChange={(e) => setAddrParts({ ...addrParts, placa: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded border text-sm italic text-gray-600">
                        Vista previa: {newCliente.direccion || 'Ingrese los campos de dirección'}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="commercial" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo Cliente *</Label>
                      <Select
                        value={newCliente.tipoCliente || 'Minorista'}
                        onValueChange={(val: 'Minorista' | 'Mayorista') => setNewCliente({ ...newCliente, tipoCliente: val })}
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

                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-black hover:bg-gray-800 text-white border-none" onClick={handleCreateCliente} disabled={!newCliente.nombres || !newCliente.apellidos || !newCliente.correo || loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
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
                  <TableHead>Tipo Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="font-medium">{cliente.nombres} {cliente.apellidos}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cliente.tipoDocumento}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cliente.numeroDocumento}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(cliente.tipoCliente || 'Minorista')}>
                        {cliente.tipoCliente || 'Minorista'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{cliente.correo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            cliente.estadoUsuario
                              ? "bg-black text-white border-black"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-200"
                          }
                        >
                          {cliente.estadoUsuario ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Switch
                          checked={cliente.estadoUsuario}
                          onCheckedChange={(checked: boolean) => handleToggleEstado(cliente.id, checked)}
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
                          className={`${hasSales(cliente.id)
                            ? "opacity-50 cursor-not-allowed"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }`}
                          title={
                            hasSales(cliente.id)
                              ? "No se puede eliminar un cliente con ventas asociadas"
                              : "Eliminar cliente"
                          }
                          onClick={() => openDeleteDialog(cliente)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {cliente.documentoUrl && !cliente.estadoUsuario && (
                           <Button
                             variant="outline"
                             size="sm"
                             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                             onClick={() => {
                               setClientToValidate(cliente);
                               setIsValidationDialogOpen(true);
                             }}
                             title="Validar Documento"
                           >
                             <Shield className="h-4 w-4" />
                           </Button>
                        )}
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

      {/* Modal de Detalle */}
      <ClientDetailDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        cliente={selectedCliente}
        onEdit={handleEditCliente}
        onRefresh={fetchData}
      />

      {/* Modal de Edición */}
      <ClientEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        cliente={editingCliente}
        onSuccess={fetchData}
      />

      {/* Modal de Validación Directa */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validar Documento de Cliente</DialogTitle>
            <DialogDescription>
              Revisa el comprobante de identidad adjunto para aprobar o rechazar al cliente.
            </DialogDescription>
          </DialogHeader>
          {clientToValidate && clientToValidate.documentoUrl && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm">
                  <span className="text-gray-500 font-medium">Fecha de Nacimiento declarada: </span>
                  <span className="font-bold text-gray-900">
                    {clientToValidate.fechaNacimiento ? new Date(clientToValidate.fechaNacimiento).toLocaleDateString() : 'No registrada'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 font-medium">Documento: </span>
                  <span className="font-bold text-gray-900">{clientToValidate.numeroDocumento}</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex justify-center p-4">
                  <img 
                      src={clientToValidate.documentoUrl} 
                      alt="Documento de Identidad" 
                      className="w-full object-contain hover:scale-110 transition-transform duration-300 cursor-zoom-in"
                  />
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-lg"
                      onClick={async () => {
                          try {
                              setLoading(true);
                              await deleteUsuario(clientToValidate.id);
                              toast.success('Cliente rechazado y eliminado.');
                              setIsValidationDialogOpen(false);
                              fetchData();
                          } catch (error) {
                              toast.error('Error al eliminar cliente');
                          } finally {
                              setLoading(false);
                          }
                      }}
                      disabled={loading}
                  >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Rechazar (Eliminar)
                  </Button>
                  <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                      onClick={async () => {
                          try {
                              setLoading(true);
                              const updatedClient = { ...clientToValidate, estadoUsuario: true, documentoUrl: "" };
                              await updateUsuario(clientToValidate.id, updatedClient);
                              toast.success('Cliente aprobado y activado correctamente.');
                              setIsValidationDialogOpen(false);
                              fetchData();
                          } catch (error) {
                              toast.error('Error al aprobar cliente');
                          } finally {
                              setLoading(false);
                          }
                      }}
                      disabled={loading}
                  >
                      <Shield className="w-5 h-5 mr-2" />
                      Aprobar y Activar
                  </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <UniversalDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCliente}
        title="Eliminar Cliente"
        description={`¿Estás seguro de que deseas eliminar al cliente "${clienteToDelete?.nombres} ${clienteToDelete?.apellidos}"? Esta acción no se puede deshacer.`}
        itemName={clienteToDelete ? `${clienteToDelete.nombres} ${clienteToDelete.apellidos}` : ''}
        itemType="Cliente"
        isDisabled={clienteToDelete ? hasSales(clienteToDelete.id) : false}
        disableReason="Este cliente tiene historial de ventas y no puede ser eliminado."
      />
    </div>
  );
};
