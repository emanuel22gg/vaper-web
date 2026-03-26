import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { TablePagination } from '@/shared/ui/TablePagination';
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Separator } from "@/shared/ui/separator";
import { toast } from "sonner";
import { UniversalDeleteDialog } from "@/shared/components/UniversalDeleteDialog";
import { getProveedores, createProveedor, updateProveedor, deleteProveedor, getCompras } from "@/shared/services/api";
import { Proveedor, CompraDto } from "@/shared/types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MoreVertical,
  UserCheck,
  Building2,
} from "lucide-react";



export const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [compras, setCompras] = useState<CompraDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] =
    useState(false);
  const [selectedProveedor, setSelectedProveedor] =
    useState<Proveedor | null>(null);
  const [
    tipoProveedorSeleccionado,
    setTipoProveedorSeleccionado,
  ] = useState<"natural" | "juridica">("natural");

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [proveedorToDelete, setProveedorToDelete] =
    useState<Proveedor | null>(null);

  // Estado para el diálogo de confirmación de creación
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState(false);

  // Estados para paginación - 5 elementos por página
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estado inicial actualizado (sin régimen, con nombres separados)
  const [newProveedor, setNewProveedor] = useState<
    Partial<Proveedor>
  >({
    codigo: "",
    tipoPersona: "natural",
    nombres: "",
    apellidos: "",
    cedula: "",
    razonSocial: "",
    nit: "",
    representanteLegal: "",
    email: "",
    telefono: "",
    celular: "",
    direccion: "",
    ciudad: "",
    pais: "Colombia",
    productos: [],
    estado: true,
  });

  // Filtrar proveedores con filtro adicional por tipo
  const filteredProveedores = proveedores.filter(
    (proveedor) => {
      const searchText =
        proveedor.tipoPersona === "natural"
          ? `${proveedor.nombres || ""} ${proveedor.apellidos || ""}`.trim()
          : proveedor.razonSocial || "";

      const matchesSearch =
        searchText
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (proveedor.codigo || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (proveedor.nit || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (proveedor.cedula || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        proveedor.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (proveedor.estado ? "Activo" : "Inactivo") === filterStatus;
      const matchesTipo =
        filterTipo === "all" ||
        proveedor.tipoPersona === filterTipo;

      return matchesSearch && matchesStatus && matchesTipo;
    },
  );

  // Calcular paginación
  const totalPages = Math.ceil(
    filteredProveedores.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProveedores = filteredProveedores.slice(
    startIndex,
    endIndex,
  );

  // Cargar proveedores al montar el componente
  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const [proveedoresData, comprasData] = await Promise.all([
        getProveedores(),
        getCompras(),
      ]);
      setProveedores(proveedoresData);
      setCompras(comprasData);
    } catch (error) {
      console.error("Error al cargar proveedores y compras:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los proveedores o las compras.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterTipo]);

  // Función para validar y mostrar confirmación
  const handleValidateAndShowConfirmation = () => {
    // Validaciones básicas
    const isPersonaNatural =
      tipoProveedorSeleccionado === "natural";

    if (isPersonaNatural) {
      if (
        !newProveedor.nombres ||
        !newProveedor.apellidos ||
        !newProveedor.cedula
      ) {
        toast.error("Campos requeridos", {
          description:
            "Por favor complete nombres, apellidos y cédula.",
        });
        return;
      }
    } else {
      if (
        !newProveedor.razonSocial ||
        !newProveedor.nit ||
        !newProveedor.representanteLegal
      ) {
        toast.error("Campos requeridos", {
          description:
            "Por favor complete razón social, NIT y representante legal.",
        });
        return;
      }
    }

    if (
      !newProveedor.email ||
      !newProveedor.telefono ||
      !newProveedor.direccion ||
      !newProveedor.ciudad
    ) {
      toast.error("Campos requeridos", {
        description:
          "Por favor complete email, teléfono, dirección y ciudad.",
      });
      return;
    }

    // Si todas las validaciones pasan, mostrar confirmación
    setIsConfirmDialogOpen(true);
  };

  // Funciones CRUD
  const handleCreateProveedor = async () => {
    try {
      const isNatural = tipoProveedorSeleccionado === "natural";
      const nombreCompleto = isNatural
        ? `${newProveedor.nombres || ""} ${newProveedor.apellidos || ""}`.trim()
        : newProveedor.razonSocial || "";

      // Construimos el DTO exacto que espera el controlador C#
      const proveedorACrear: Partial<Proveedor> = {
        ...newProveedor,
        tipoPersona: tipoProveedorSeleccionado,
        nombreCompletoORazonSocial: nombreCompleto,
        tipoDocumento: isNatural ? "C.C" : "NIT",
        numeroDocumento: isNatural ? newProveedor.cedula : newProveedor.nit,
        estado: true, // Siempre activo por defecto al crear
        // Aseguramos que los campos específicos estén mapeados
        nombres: isNatural ? newProveedor.nombres : undefined,
        apellidos: isNatural ? newProveedor.apellidos : undefined,
        cedula: isNatural ? newProveedor.cedula : undefined,
        razonSocial: !isNatural ? newProveedor.razonSocial : undefined,
        nit: !isNatural ? newProveedor.nit : newProveedor.cedula, // Usamos cédula como NIT si es natural
        representanteLegal: !isNatural ? newProveedor.representanteLegal : undefined
      };

      await createProveedor(proveedorACrear);

      await fetchProveedores();
      resetNewProveedorForm();
      setIsCreateDialogOpen(false);
      setIsConfirmDialogOpen(false);

      toast.success("Proveedor creado", {
        description: `${nombreCompleto} ha sido registrado exitosamente.`,
      });
    } catch (error) {
      console.error("Error al crear proveedor:", error);
      toast.error("Error", {
        description: "No se pudo crear el proveedor. Verifique que los datos sean correctos.",
      });
    }
  };

  const handleUpdateProveedor = async () => {
    if (selectedProveedor) {
      try {
        await updateProveedor(selectedProveedor.id, selectedProveedor);
        await fetchProveedores();
        setIsEditDialogOpen(false);
        setSelectedProveedor(null);

        toast.success("Proveedor actualizado", {
          description:
            "La información del proveedor ha sido actualizada correctamente.",
        });
      } catch (error) {
        console.error("Error al actualizar proveedor:", error);
        toast.error("Error", {
          description: "No se pudo actualizar el proveedor.",
        });
      }
    }
  };

  const handleDeleteProveedor = async () => {
    if (proveedorToDelete) {
      try {
        const nombreProveedor =
          proveedorToDelete.tipoPersona === "natural"
            ? `${proveedorToDelete.nombres || ""} ${proveedorToDelete.apellidos || ""}`.trim()
            : proveedorToDelete.razonSocial;

        await deleteProveedor(proveedorToDelete.id);
        await fetchProveedores();
        setIsDeleteDialogOpen(false);
        setProveedorToDelete(null);

        toast.success("Proveedor eliminado", {
          description: `${nombreProveedor} ha sido eliminado del sistema.`,
        });
      } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        toast.error("Error", {
          description: "No se pudo eliminar el proveedor.",
        });
      }
    }
  };

  const confirmDeleteProveedor = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor);
    setIsDeleteDialogOpen(true);
  };

  const handleChangeStatus = async (
    id: number,
    newStatus: boolean,
  ) => {
    try {
      const proveedor = proveedores.find((p) => p.id === id);
      if (proveedor) {
        await updateProveedor(id, {
          ...proveedor,
          estado: newStatus,
        });
        await fetchProveedores();
        toast.success("Estado actualizado", {
          description: `El proveedor ahora está ${newStatus ? "Activo" : "Inactivo"}.`,
        });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error", {
        description: "No se pudo cambiar el estado del proveedor.",
      });
    }
  };

  // Función de reset actualizada (sin régimen, con nombres separados)
  const resetNewProveedorForm = () => {
    setNewProveedor({
      codigo: "",
      tipoPersona: tipoProveedorSeleccionado,
      nombres: "",
      apellidos: "",
      cedula: "",
      razonSocial: "",
      nit: "",
      representanteLegal: "",
      email: "",
      telefono: "",
      celular: "",
      direccion: "",
      ciudad: "",
      pais: "Colombia",
      productos: [],
      estado: true,
    });
  };

  const openEditDialog = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsViewDialogOpen(true);
  };

  const getStatusIcon = (estado: boolean) => {
    if (estado) {
      return (
        <CheckCircle className="h-4 w-4 text-green-500" />
      );
    } else {
      return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === "natural" ? (
      <User className="h-3 w-3 text-blue-500" />
    ) : (
      <Building2 className="h-3 w-3 text-purple-500" />
    );
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Función actualizada para nombres separados
  const getNombreProveedor = (proveedor: Proveedor): string => {
    return proveedor.tipoPersona === "natural"
      ? `${proveedor.nombres || ""} ${proveedor.apellidos || ""}`.trim()
      : proveedor.razonSocial || "";
  };

  const getDocumentoProveedor = (
    proveedor: Proveedor,
  ): string => {
    return proveedor.tipoPersona === "natural"
      ? `CC: ${proveedor.cedula || "No especificada"}`
      : `NIT: ${proveedor.nit || "No especificado"}`;
  };

  const hasPurchases = (proveedorId: number) => {
    return compras.some((compra) => compra.proveedorId === proveedorId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Lista de Proveedores con botón integrado */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">
                Lista de Proveedores
              </CardTitle>
              <CardDescription>
                Gestiona proveedores personas naturales y
                jurídicas
              </CardDescription>
            </div>

            {/* Botón Nuevo Proveedor */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
                <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">
                      Registrar Nuevo Proveedor
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                      Selecciona el tipo de proveedor y completa la información.
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
                        <User className="h-4 w-4" /> Básico
                      </TabsTrigger>
                      <TabsTrigger 
                        value="contact" 
                        className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                      >
                        <MapPin className="h-4 w-4" /> Contacto y Domicilio
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-8 animate-in fade-in-50 duration-500">
                      <div className="space-y-2">
                        <Label>Tipo de Proveedor</Label>
                        <Select
                          value={tipoProveedorSeleccionado}
                          onValueChange={(value: "natural" | "juridica") => {
                            setTipoProveedorSeleccionado(value);
                            setNewProveedor({
                              ...newProveedor,
                              tipoPersona: value,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="natural">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" /> Persona Natural
                              </div>
                            </SelectItem>
                            <SelectItem value="juridica">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2" /> Persona Jurídica
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Formulario para Persona Natural */}
                      {tipoProveedorSeleccionado === "natural" && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                          <h3 className="text-sm font-medium flex items-center text-gray-700">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            Información de Persona Natural
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nombres">Nombres *</Label>
                              <Input
                                id="nombres"
                                value={newProveedor.nombres || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, nombres: e.target.value })}
                                placeholder="María González"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="apellidos">Apellidos *</Label>
                              <Input
                                id="apellidos"
                                value={newProveedor.apellidos || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, apellidos: e.target.value })}
                                placeholder="Rodríguez Castro"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cedula">Documento de identidad *</Label>
                            <Input
                              id="cedula"
                              value={newProveedor.cedula || ""}
                              onChange={(e) => setNewProveedor({ ...newProveedor, cedula: e.target.value })}
                              placeholder="43123456"
                            />
                          </div>
                        </div>
                      )}

                      {/* Formulario para Persona Jurídica */}
                      {tipoProveedorSeleccionado === "juridica" && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                          <h3 className="text-sm font-medium flex items-center text-gray-700">
                            <Building2 className="h-4 w-4 mr-2 text-purple-500" />
                            Información de Persona Jurídica
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="razonSocial">Razón Social *</Label>
                              <Input
                                id="razonSocial"
                                value={newProveedor.razonSocial || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, razonSocial: e.target.value })}
                                placeholder="VapeMax Distribuciones SAS"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nit">NIT *</Label>
                              <Input
                                id="nit"
                                value={newProveedor.nit || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, nit: e.target.value })}
                                placeholder="900123456-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="representanteLegal">Representante Legal *</Label>
                            <Input
                              id="representanteLegal"
                              value={newProveedor.representanteLegal || ""}
                              onChange={(e) => setNewProveedor({ ...newProveedor, representanteLegal: e.target.value })}
                              placeholder="Juan Pérez"
                            />
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-8 animate-in fade-in-50 duration-500">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                value={newProveedor.email || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, email: e.target.value })}
                                placeholder="contacto@ejemplo.com"
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="telefono"
                                value={newProveedor.telefono || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, telefono: e.target.value })}
                                placeholder="+57 300 123 4567"
                                className="pl-9"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección *</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="direccion"
                                value={newProveedor.direccion || ""}
                                onChange={(e) => setNewProveedor({ ...newProveedor, direccion: e.target.value })}
                                placeholder="Calle 45 #23-15"
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ciudad">Ciudad *</Label>
                            <Input
                              id="ciudad"
                              value={newProveedor.ciudad || ""}
                              onChange={(e) => setNewProveedor({ ...newProveedor, ciudad: e.target.value })}
                              placeholder="Medellín"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="observaciones">Observaciones</Label>
                          <Textarea
                            id="observaciones"
                            value={newProveedor.observaciones || ""}
                            onChange={(e) => setNewProveedor({ ...newProveedor, observaciones: e.target.value })}
                            placeholder="Notas adicionales sobre el proveedor..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="w-full sm:w-auto sm:mr-3 h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleValidateAndShowConfirmation}
                      className="w-full sm:w-auto h-10 px-6 bg-black hover:bg-gray-800 text-white font-medium border-none transition-all"
                    >
                      Crear Proveedor
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Inactivo">
                  Inactivos
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterTipo}
              onValueChange={setFilterTipo}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="juridica">
                  Jurídica
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de proveedores */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>NIT/CC</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProveedores.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(proveedor.tipoPersona)}
                        <span className="font-medium">
                          {getNombreProveedor(proveedor)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {proveedor.tipoPersona === "natural"
                          ? proveedor.cedula || "No especificada"
                          : proveedor.nit || "No especificado"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {proveedor.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {proveedor.telefono || "No especificado"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {proveedor.estado ? (
                          <Badge className="bg-black text-white hover:bg-black">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                            Inactivo
                          </Badge>
                        )}
                        <Switch
                          checked={proveedor.estado}
                          onCheckedChange={(checked: boolean) =>
                            handleChangeStatus(
                              proveedor.id,
                              checked
                            )
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openViewDialog(proveedor)
                          }
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEditDialog(proveedor)
                          }
                          title="Editar proveedor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${hasPurchases(proveedor.id)
                              ? "opacity-50 cursor-not-allowed"
                              : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }`}
                          title={
                            hasPurchases(proveedor.id)
                              ? "No se puede eliminar un proveedor con compras asociadas"
                              : "Eliminar proveedor"
                          }
                          onClick={() =>
                            confirmDeleteProveedor(proveedor)
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
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProveedores.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="proveedores"
          />
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para crear */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Creación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea crear este proveedor?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateProveedor}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo Ver Detalles */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
          <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles del Proveedor</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Perfil administrativo e información comercial detallada.
                </DialogDescription>
              </div>
              {selectedProveedor && (
                <Badge 
                  variant={selectedProveedor.estado ? "default" : "secondary"}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                    selectedProveedor.estado 
                    ? "bg-green-50 text-green-700 border-green-100" 
                    : "bg-gray-50 text-gray-600 border-gray-100"
                  }`}
                >
                  {selectedProveedor.estado ? "Proveedor Activo" : "Proveedor Inactivo"}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedProveedor && (
            <div className="p-8 space-y-10">
              {/* Cabecera de Identidad */}
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                  {selectedProveedor.tipoPersona === "natural" ? <User className="h-8 w-8" /> : <Building2 className="h-8 w-8" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {getNombreProveedor(selectedProveedor)}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="font-mono text-gray-400">CÓD: {selectedProveedor.codigo}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600 font-medium">
                      {selectedProveedor.tipoPersona === "natural" ? "Persona Natural" : "Empresa / Entidad"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Información de Identificación */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Identificación y Registro</h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {selectedProveedor.tipoPersona === "natural" ? (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Nombres y Apellidos</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedProveedor.nombres} {selectedProveedor.apellidos}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Cédula de Ciudadanía</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedProveedor.cedula || 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">Razón Social</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedProveedor.razonSocial}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-500">NIT</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedProveedor.nit}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs font-medium text-gray-500">Representante Legal</Label>
                        <p className="text-sm font-medium text-gray-900">{selectedProveedor.representanteLegal || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-100" />

              {/* Contacto */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Información de Contacto</h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">Correo Electrónico</Label>
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedProveedor.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">Teléfono Principal</Label>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {selectedProveedor.telefono}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs font-medium text-gray-500">Ubicación y Dirección</Label>
                    <p className="text-sm font-medium text-gray-900 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                      <span>{selectedProveedor.direccion}, {selectedProveedor.ciudad} ({selectedProveedor.pais})</span>
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              {/* Información Comercial */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Información Comercial y Bancaria</h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">Categoría de Productos</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedProveedor.productos?.map((p, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-bold text-gray-500 border-gray-200">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">Volumen de Compras</Label>
                    <p className="text-lg font-black text-gray-900">
                      ${(selectedProveedor.totalCompras || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                  {(selectedProveedor.banco || selectedProveedor.numeroCuenta) && (
                    <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-gray-400 uppercase">Banco / Entidad</Label>
                          <p className="text-sm font-semibold text-gray-800">{selectedProveedor.banco || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-gray-400 uppercase">Cuenta</Label>
                          <p className="text-sm font-mono font-bold text-gray-800">{selectedProveedor.numeroCuenta || 'N/A'}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{selectedProveedor.tipoCuenta || 'Ahorros'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              {selectedProveedor.observaciones && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Observaciones Internas</Label>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-100">
                    {selectedProveedor.observaciones}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="p-8 border-t border-gray-100 bg-white">
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
              className="h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200 w-full"
            >
              Cerrar Detalle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Proveedor */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto modal-scroll">
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>
              Modifica la información del proveedor
            </DialogDescription>
          </DialogHeader>

          {selectedProveedor && (
            <div className="space-y-6">
              {/* Información del tipo (no editable) */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {getTipoIcon(selectedProveedor.tipoPersona)}
                <div>
                  <h3 className="font-medium text-sm text-gray-600">
                    {selectedProveedor.tipoPersona === "natural"
                      ? "Persona Natural"
                      : "Persona Jurídica"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedProveedor.codigo}
                  </p>
                </div>
              </div>

              {/* Formulario específico según tipo */}
              {selectedProveedor.tipoPersona === "natural" ? (
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Información Personal
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-nombres">
                        Nombres *
                      </Label>
                      <Input
                        id="edit-nombres"
                        value={selectedProveedor.nombres || ""}
                        onChange={(e) =>
                          setSelectedProveedor({
                            ...selectedProveedor,
                            nombres: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-apellidos">
                        Apellidos *
                      </Label>
                      <Input
                        id="edit-apellidos"
                        value={
                          selectedProveedor.apellidos || ""
                        }
                        onChange={(e) =>
                          setSelectedProveedor({
                            ...selectedProveedor,
                            apellidos: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cedula">
                      Documento de identidad *
                    </Label>
                    <Input
                      id="edit-cedula"
                      value={selectedProveedor.cedula || ""}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          cedula: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Información Empresarial
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-razonSocial">
                        Razón Social *
                      </Label>
                      <Input
                        id="edit-razonSocial"
                        value={
                          selectedProveedor.razonSocial || ""
                        }
                        onChange={(e) =>
                          setSelectedProveedor({
                            ...selectedProveedor,
                            razonSocial: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-nit">NIT *</Label>
                      <Input
                        id="edit-nit"
                        value={selectedProveedor.nit || ""}
                        onChange={(e) =>
                          setSelectedProveedor({
                            ...selectedProveedor,
                            nit: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-representanteLegal">
                      Representante Legal *
                    </Label>
                    <Input
                      id="edit-representanteLegal"
                      value={
                        selectedProveedor.representanteLegal ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          representanteLegal: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h4 className="font-medium">
                  Información de Contacto
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedProveedor.email}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-telefono">
                      Teléfono *
                    </Label>
                    <Input
                      id="edit-telefono"
                      value={selectedProveedor.telefono}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-celular">
                      Celular
                    </Label>
                    <Input
                      id="edit-celular"
                      value={selectedProveedor.celular || ""}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          celular: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-direccion">
                      Dirección *
                    </Label>
                    <Input
                      id="edit-direccion"
                      value={selectedProveedor.direccion}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          direccion: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-ciudad">
                      Ciudad *
                    </Label>
                    <Input
                      id="edit-ciudad"
                      value={selectedProveedor.ciudad}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          ciudad: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-pais">País *</Label>
                  <Input
                    id="edit-pais"
                    value={selectedProveedor.pais}
                    onChange={(e) =>
                      setSelectedProveedor({
                        ...selectedProveedor,
                        pais: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Estado */}
              <div className="space-y-4">
                <h4 className="font-medium">Estado</h4>
                <div className="space-y-2">
                  <Label htmlFor="edit-estado">
                    Estado del Proveedor
                  </Label>
                  <Select
                    value={selectedProveedor.estado ? "true" : "false"}
                    onValueChange={(value: string) =>
                      setSelectedProveedor({
                        ...selectedProveedor,
                        estado: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        Activo
                      </SelectItem>
                      <SelectItem value="false">
                        Inactivo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Información Bancaria */}
              <div className="space-y-4">
                <h4 className="font-medium">
                  Información Bancaria (Opcional)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-banco">Banco</Label>
                    <Input
                      id="edit-banco"
                      value={selectedProveedor.banco || ""}
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          banco: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-numeroCuenta">
                      Número de Cuenta
                    </Label>
                    <Input
                      id="edit-numeroCuenta"
                      value={
                        selectedProveedor.numeroCuenta || ""
                      }
                      onChange={(e) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          numeroCuenta: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tipoCuenta">
                      Tipo de Cuenta
                    </Label>
                    <Select
                      value={selectedProveedor.tipoCuenta || ""}
                      onValueChange={(value: string) =>
                        setSelectedProveedor({
                          ...selectedProveedor,
                          tipoCuenta: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ahorros">
                          Ahorros
                        </SelectItem>
                        <SelectItem value="Corriente">
                          Corriente
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="edit-observaciones">
                  Observaciones
                </Label>
                <Textarea
                  id="edit-observaciones"
                  value={selectedProveedor.observaciones || ""}
                  onChange={(e) =>
                    setSelectedProveedor({
                      ...selectedProveedor,
                      observaciones: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Notas adicionales sobre el proveedor..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateProveedor} className="bg-black hover:bg-gray-800 text-white">
              Actualizar Proveedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <UniversalDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProveedor}
        title="Eliminar Proveedor"
        description={`¿Estás seguro de que deseas eliminar al proveedor "${proveedorToDelete ? getNombreProveedor(proveedorToDelete) : ""}"? Esta acción no se puede deshacer.`}
        itemName={
          proveedorToDelete
            ? getNombreProveedor(proveedorToDelete)
            : ""
        }
        itemType="Proveedor"
        isDisabled={proveedorToDelete ? hasPurchases(proveedorToDelete.id) : false}
        disableReason="Este proveedor tiene compras asociadas y no puede ser eliminado para mantener la integridad de los datos."
      />
    </div>
  );
};
