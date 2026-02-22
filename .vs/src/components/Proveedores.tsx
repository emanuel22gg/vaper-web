import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TablePagination } from './ui/TablePagination';
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { UniversalDeleteDialog } from "./UniversalDeleteDialog";
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

// Interface actualizada para Proveedor (sin régimen, con nombres separados)
interface Proveedor {
  id: string;
  codigo: string;
  tipoPersona: "natural" | "juridica";
  // Campos para persona natural (nombres separados)
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  // Campos para persona jurídica
  razonSocial?: string;
  nit?: string;
  representanteLegal?: string;
  // Campos comunes
  email: string;
  telefono: string;
  celular?: string;
  direccion: string;
  ciudad: string;
  pais: string;
  productos: string[];
  estado: "Activo" | "Inactivo";
  fechaRegistro: Date;
  ultimaCompra?: Date;
  totalCompras: number;
  banco?: string;
  numeroCuenta?: string;
  tipoCuenta?: string;
  contactoAdicional?: {
    nombre: string;
    cargo: string;
    telefono: string;
    email: string;
  };
  observaciones?: string;
}

// Datos simulados actualizados (sin régimen, con nombres separados)
const mockProveedores: Proveedor[] = [
  {
    id: "1",
    codigo: "PROV-001",
    tipoPersona: "juridica",
    razonSocial: "VapeMax Distribuciones SAS",
    nit: "900123456-1",
    representanteLegal: "Juan Pérez",
    email: "juan@vapemax.com",
    telefono: "+57 300 123 4567",
    celular: "+57 300 123 4567",
    direccion: "Calle 45 #23-15",
    ciudad: "Medellín",
    pais: "Colombia",
    productos: ["Desechables", "Líquidos"],
    estado: "Activo",
    fechaRegistro: new Date("2024-01-15"),
    ultimaCompra: new Date("2024-03-10"),
    totalCompras: 15200000,
    banco: "Bancolombia",
    numeroCuenta: "123456789",
    tipoCuenta: "Corriente",
    contactoAdicional: {
      nombre: "María López",
      cargo: "Gerente Comercial",
      telefono: "+57 310 987 6543",
      email: "maria.lopez@vapemax.com",
    },
    observaciones:
      "Proveedor confiable con excelente calidad de productos.",
  },
  {
    id: "2",
    codigo: "PROV-002",
    tipoPersona: "natural",
    nombres: "María González",
    apellidos: "Rodríguez Castro",
    cedula: "43123456",
    email: "maria.gonzalez@gmail.com",
    telefono: "+57 310 987 6543",
    celular: "+57 320 555 7777",
    direccion: "Carrera 70 #45-30",
    ciudad: "Medellín",
    pais: "Colombia",
    productos: ["Mods", "Accesorios", "Baterías"],
    estado: "Activo",
    fechaRegistro: new Date("2024-02-01"),
    ultimaCompra: new Date("2024-03-08"),
    totalCompras: 28500000,
    banco: "Banco de Bogotá",
    numeroCuenta: "987654321",
    tipoCuenta: "Ahorros",
    observaciones:
      "Especialista en productos premium, entrega rápida.",
  },
  {
    id: "3",
    codigo: "PROV-003",
    tipoPersona: "juridica",
    razonSocial: "Premium Vapes Ltd",
    nit: "700555999-3",
    representanteLegal: "Carlos Ramírez",
    email: "carlos@premiumvapes.com",
    telefono: "+57 320 555 7890",
    direccion: "Avenida El Poblado #12-34",
    ciudad: "Medellín",
    pais: "Colombia",
    productos: ["Pods", "Líquidos Premium"],
    estado: "Inactivo",
    fechaRegistro: new Date("2024-01-20"),
    ultimaCompra: new Date("2023-12-15"),
    totalCompras: 8900000,
    observaciones: "Proveedor temporalmente inactivo.",
  },
  {
    id: "4",
    codigo: "PROV-004",
    tipoPersona: "natural",
    nombres: "Luis Alberto",
    apellidos: "Martínez Suárez",
    cedula: "52789123",
    email: "luis.martinez@hotmail.com",
    telefono: "+57 315 888 9999",
    celular: "+57 315 888 9999",
    direccion: "Carrera 85 #50-20",
    ciudad: "Bogotá",
    pais: "Colombia",
    productos: ["Resistencias", "Atomizadores"],
    estado: "Activo",
    fechaRegistro: new Date("2024-02-15"),
    ultimaCompra: new Date("2024-03-15"),
    totalCompras: 12300000,
    banco: "Davivienda",
    numeroCuenta: "456789123",
    tipoCuenta: "Ahorros",
    observaciones: "Proveedor especializado en repuestos.",
  },
  {
    id: "5",
    codigo: "PROV-005",
    tipoPersona: "juridica",
    razonSocial: "TechVape Colombia Ltda",
    nit: "800444777-5",
    representanteLegal: "Ana Patricia Gómez",
    email: "ana@techvape.co",
    telefono: "+57 318 222 3333",
    direccion: "Zona Industrial #45-67",
    ciudad: "Cali",
    pais: "Colombia",
    productos: ["Dispositivos", "Accesorios"],
    estado: "Activo",
    fechaRegistro: new Date("2024-03-01"),
    ultimaCompra: new Date("2024-03-20"),
    totalCompras: 45600000,
    banco: "BBVA",
    numeroCuenta: "789123456",
    tipoCuenta: "Corriente",
    contactoAdicional: {
      nombre: "Roberto Silva",
      cargo: "Coordinador de Ventas",
      telefono: "+57 318 444 5555",
      email: "roberto@techvape.co",
    },
    observaciones:
      "Proveedor mayorista con excelente servicio.",
  },
  {
    id: "6",
    codigo: "PROV-006",
    tipoPersona: "natural",
    nombres: "Carmen Elena",
    apellidos: "Torres Vásquez",
    cedula: "65432198",
    email: "carmen.torres@gmail.com",
    telefono: "+57 312 777 8888",
    direccion: "Avenida 30 #15-25",
    ciudad: "Barranquilla",
    pais: "Colombia",
    productos: ["Líquidos Artesanales"],
    estado: "Activo",
    fechaRegistro: new Date("2024-01-25"),
    ultimaCompra: new Date("2024-03-12"),
    totalCompras: 8750000,
    banco: "Colpatria",
    numeroCuenta: "321654987",
    tipoCuenta: "Ahorros",
    observaciones: "Fabricante artesanal de líquidos premium.",
  },
  {
    id: "7",
    codigo: "PROV-007",
    tipoPersona: "juridica",
    razonSocial: "Global Smoke Solutions SAS",
    nit: "900888999-2",
    representanteLegal: "Andrés Felipe Castro",
    email: "andres@globalsmoke.com",
    telefono: "+57 314 111 2222",
    direccion: "Centro Empresarial Torre B #28-40",
    ciudad: "Medellín",
    pais: "Colombia",
    productos: ["Importaciones", "Marcas Internacionales"],
    estado: "Activo",
    fechaRegistro: new Date("2023-12-10"),
    ultimaCompra: new Date("2024-03-18"),
    totalCompras: 125000000,
    banco: "Banco Popular",
    numeroCuenta: "147258369",
    tipoCuenta: "Corriente",
    contactoAdicional: {
      nombre: "Sandra Milena López",
      cargo: "Gerente de Importaciones",
      telefono: "+57 314 333 4444",
      email: "sandra@globalsmoke.com",
    },
    observaciones:
      "Importador autorizado de marcas internacionales.",
  },
  {
    id: "8",
    codigo: "PROV-008",
    tipoPersona: "natural",
    nombres: "Diego Armando",
    apellidos: "Ruiz Moreno",
    cedula: "98765432",
    email: "diego.ruiz@outlook.com",
    telefono: "+57 317 555 6666",
    direccion: "Carrera 50 #80-15",
    ciudad: "Bucaramanga",
    pais: "Colombia",
    productos: ["Mods Mecánicos", "Drippers"],
    estado: "Inactivo",
    fechaRegistro: new Date("2024-02-20"),
    ultimaCompra: new Date("2024-02-28"),
    totalCompras: 5420000,
    banco: "Banco Agrario",
    numeroCuenta: "258147369",
    tipoCuenta: "Ahorros",
    observaciones:
      "Proveedor especializado en productos para vapeadores avanzados.",
  },
];

export const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] =
    useState<Proveedor[]>(mockProveedores);
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
    estado: "Activo",
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
        proveedor.codigo
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        proveedor.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        proveedor.estado === filterStatus;
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
  const handleCreateProveedor = () => {
    const codigo = `PROV-${String(proveedores.length + 1).padStart(3, "0")}`;
    const nuevoProveedor: Proveedor = {
      ...(newProveedor as Proveedor),
      id: String(proveedores.length + 1),
      codigo,
      fechaRegistro: new Date(),
      totalCompras: 0,
      tipoPersona: tipoProveedorSeleccionado,
    };

    setProveedores([...proveedores, nuevoProveedor]);
    resetNewProveedorForm();
    setIsCreateDialogOpen(false);
    setIsConfirmDialogOpen(false);

    const nombreProveedor =
      tipoProveedorSeleccionado === "natural"
        ? `${newProveedor.nombres || ""} ${newProveedor.apellidos || ""}`.trim()
        : newProveedor.razonSocial;

    toast.success("Proveedor creado", {
      description: `${nombreProveedor} ha sido registrado exitosamente.`,
    });
  };

  const handleUpdateProveedor = () => {
    if (selectedProveedor) {
      setProveedores(
        proveedores.map((p) =>
          p.id === selectedProveedor.id ? selectedProveedor : p,
        ),
      );
      setIsEditDialogOpen(false);
      setSelectedProveedor(null);

      toast.success("Proveedor actualizado", {
        description:
          "La información del proveedor ha sido actualizada correctamente.",
      });
    }
  };

  const handleDeleteProveedor = () => {
    if (proveedorToDelete) {
      const nombreProveedor =
        proveedorToDelete.tipoPersona === "natural"
          ? `${proveedorToDelete.nombres || ""} ${proveedorToDelete.apellidos || ""}`.trim()
          : proveedorToDelete.razonSocial;

      setProveedores(
        proveedores.filter(
          (p) => p.id !== proveedorToDelete.id,
        ),
      );
      setIsDeleteDialogOpen(false);
      setProveedorToDelete(null);

      toast.success("Proveedor eliminado", {
        description: `${nombreProveedor} ha sido eliminado del sistema.`,
      });
    }
  };

  const confirmDeleteProveedor = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor);
    setIsDeleteDialogOpen(true);
  };

  const handleChangeStatus = (
    id: string,
    newStatus: "Activo" | "Inactivo",
  ) => {
    setProveedores(
      proveedores.map((p) =>
        p.id === id ? { ...p, estado: newStatus } : p,
      ),
    );

    const proveedor = proveedores.find((p) => p.id === id);
    const nombreProveedor =
      proveedor?.tipoPersona === "natural"
        ? `${proveedor.nombres || ""} ${proveedor.apellidos || ""}`.trim()
        : proveedor?.razonSocial;

    toast.success("Estado actualizado", {
      description: `${nombreProveedor} ahora está ${newStatus.toLowerCase()}.`,
    });
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
      estado: "Activo",
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

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Activo":
        return (
          <CheckCircle className="h-4 w-4 text-green-500" />
        );
      case "Inactivo":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === "natural" ? (
      <User className="h-3 w-3 text-blue-500" />
    ) : (
      <Building2 className="h-3 w-3 text-purple-500" />
    );
  };

  const formatDate = (date: Date): string => {
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
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Registrar Nuevo Proveedor
                  </DialogTitle>
                  <DialogDescription>
                    Selecciona el tipo de proveedor y completa
                    la información correspondiente.
                  </DialogDescription>
                </DialogHeader>

                {/* Selector de tipo de proveedor */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Proveedor</Label>
                    <Select
                      value={tipoProveedorSeleccionado}
                      onValueChange={(
                        value: "natural" | "juridica",
                      ) => {
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
                            <User className="h-4 w-4 mr-2" />
                            Persona Natural
                          </div>
                        </SelectItem>
                        <SelectItem value="juridica">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            Persona Jurídica
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Formulario para Persona Natural */}
                  {tipoProveedorSeleccionado === "natural" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        Información de Persona Natural
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombres">
                            Nombres *
                          </Label>
                          <Input
                            id="nombres"
                            value={newProveedor.nombres || ""}
                            onChange={(e) =>
                              setNewProveedor({
                                ...newProveedor,
                                nombres: e.target.value,
                              })
                            }
                            placeholder="María González"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apellidos">
                            Apellidos *
                          </Label>
                          <Input
                            id="apellidos"
                            value={newProveedor.apellidos || ""}
                            onChange={(e) =>
                              setNewProveedor({
                                ...newProveedor,
                                apellidos: e.target.value,
                              })
                            }
                            placeholder="Rodríguez Castro"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula *</Label>
                        <Input
                          id="cedula"
                          value={newProveedor.cedula || ""}
                          onChange={(e) =>
                            setNewProveedor({
                              ...newProveedor,
                              cedula: e.target.value,
                            })
                          }
                          placeholder="43123456"
                        />
                      </div>
                    </div>
                  )}

                  {/* Formulario para Persona Jurídica */}
                  {tipoProveedorSeleccionado === "juridica" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-purple-500" />
                        Información de Persona Jurídica
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="razonSocial">
                              Razón Social *
                            </Label>
                            <Input
                              id="razonSocial"
                              value={
                                newProveedor.razonSocial || ""
                              }
                              onChange={(e) =>
                                setNewProveedor({
                                  ...newProveedor,
                                  razonSocial: e.target.value,
                                })
                              }
                              placeholder="VapeMax Distribuciones SAS"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nit">NIT *</Label>
                            <Input
                              id="nit"
                              value={newProveedor.nit || ""}
                              onChange={(e) =>
                                setNewProveedor({
                                  ...newProveedor,
                                  nit: e.target.value,
                                })
                              }
                              placeholder="900123456-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="representanteLegal">
                            Representante Legal *
                          </Label>
                          <Input
                            id="representanteLegal"
                            value={
                              newProveedor.representanteLegal ||
                              ""
                            }
                            onChange={(e) =>
                              setNewProveedor({
                                ...newProveedor,
                                representanteLegal:
                                  e.target.value,
                              })
                            }
                            placeholder="Juan Pérez"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Información de contacto común */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Información de Contacto
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newProveedor.email || ""}
                          onChange={(e) =>
                            setNewProveedor({
                              ...newProveedor,
                              email: e.target.value,
                            })
                          }
                          placeholder="contacto@ejemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">
                          Teléfono *
                        </Label>
                        <Input
                          id="telefono"
                          value={newProveedor.telefono || ""}
                          onChange={(e) =>
                            setNewProveedor({
                              ...newProveedor,
                              telefono: e.target.value,
                            })
                          }
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">
                        Dirección *
                      </Label>
                      <Input
                        id="direccion"
                        value={newProveedor.direccion || ""}
                        onChange={(e) =>
                          setNewProveedor({
                            ...newProveedor,
                            direccion: e.target.value,
                          })
                        }
                        placeholder="Calle 45 #23-15"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad *</Label>
                      <Input
                        id="ciudad"
                        value={newProveedor.ciudad || ""}
                        onChange={(e) =>
                          setNewProveedor({
                            ...newProveedor,
                            ciudad: e.target.value,
                          })
                        }
                        placeholder="Medellín"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observaciones">
                        Observaciones
                      </Label>
                      <Textarea
                        id="observaciones"
                        value={newProveedor.observaciones || ""}
                        onChange={(e) =>
                          setNewProveedor({
                            ...newProveedor,
                            observaciones: e.target.value,
                          })
                        }
                        placeholder="Notas adicionales sobre el proveedor..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleValidateAndShowConfirmation}
                  >
                    Crear Proveedor
                  </Button>
                </DialogFooter>
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
                      <div className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
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
                        {proveedor.estado === "Activo" ? (
                          <Badge className="bg-black text-white hover:bg-black">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                            Inactivo
                          </Badge>
                        )}
                        <Switch
                          checked={proveedor.estado === "Activo"}
                          onCheckedChange={(checked) =>
                            handleChangeStatus(
                              proveedor.id,
                              checked ? "Activo" : "Inactivo"
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar proveedor"
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
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto modal-scroll">
          <DialogHeader>
            <DialogTitle>Detalles del Proveedor</DialogTitle>
            <DialogDescription>
              Información completa del proveedor
            </DialogDescription>
          </DialogHeader>

          {selectedProveedor && (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {getTipoIcon(selectedProveedor.tipoPersona)}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getNombreProveedor(selectedProveedor)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProveedor.codigo} •{" "}
                      {getDocumentoProveedor(selectedProveedor)}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge
                      variant={
                        selectedProveedor.estado === "Activo"
                          ? "default"
                          : "secondary"
                      }
                      className={`${selectedProveedor.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {getStatusIcon(selectedProveedor.estado)}
                      <span className="ml-1">
                        {selectedProveedor.estado}
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Datos específicos del tipo */}
                {selectedProveedor.tipoPersona === "natural" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Nombres
                      </Label>
                      <p className="text-sm">
                        {selectedProveedor.nombres ||
                          "No especificado"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Apellidos
                      </Label>
                      <p className="text-sm">
                        {selectedProveedor.apellidos ||
                          "No especificado"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Cédula
                      </Label>
                      <p className="text-sm">
                        {selectedProveedor.cedula ||
                          "No especificada"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Razón Social
                      </Label>
                      <p className="text-sm">
                        {selectedProveedor.razonSocial ||
                          "No especificada"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        NIT
                      </Label>
                      <p className="text-sm">
                        {selectedProveedor.nit ||
                          "No especificado"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Representante Legal
                      </Label>
                      <p className="text-sm">
                        {selectedProveedor.representanteLegal ||
                          "No especificado"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Información de Contacto
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Email
                    </Label>
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {selectedProveedor.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Teléfono
                    </Label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selectedProveedor.telefono}
                    </p>
                  </div>
                  {selectedProveedor.celular && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Celular
                      </Label>
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {selectedProveedor.celular}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Dirección
                    </Label>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {selectedProveedor.direccion}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Ciudad
                    </Label>
                    <p className="text-sm">
                      {selectedProveedor.ciudad}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      País
                    </Label>
                    <p className="text-sm">
                      {selectedProveedor.pais}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información Comercial */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Información Comercial
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Productos
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProveedor.productos.map(
                        (producto, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {producto}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Total Compras
                    </Label>
                    <p className="text-sm font-semibold text-green-700">
                      $
                      {selectedProveedor.totalCompras.toLocaleString(
                        "es-CO",
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Fecha Registro
                    </Label>
                    <p className="text-sm">
                      {formatDate(
                        selectedProveedor.fechaRegistro,
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Última Compra
                    </Label>
                    <p className="text-sm">
                      {selectedProveedor.ultimaCompra
                        ? formatDate(
                          selectedProveedor.ultimaCompra,
                        )
                        : "Sin compras"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Bancaria */}
              {(selectedProveedor.banco ||
                selectedProveedor.numeroCuenta) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Información Bancaria
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProveedor.banco && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Banco
                            </Label>
                            <p className="text-sm">
                              {selectedProveedor.banco}
                            </p>
                          </div>
                        )}
                        {selectedProveedor.numeroCuenta && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Número de Cuenta
                            </Label>
                            <p className="text-sm">
                              {selectedProveedor.numeroCuenta}
                            </p>
                          </div>
                        )}
                        {selectedProveedor.tipoCuenta && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Tipo de Cuenta
                            </Label>
                            <p className="text-sm">
                              {selectedProveedor.tipoCuenta}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

              {/* Contacto Adicional */}
              {selectedProveedor.contactoAdicional && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Contacto Adicional
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Nombre
                        </Label>
                        <p className="text-sm">
                          {
                            selectedProveedor.contactoAdicional
                              .nombre
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Cargo
                        </Label>
                        <p className="text-sm">
                          {
                            selectedProveedor.contactoAdicional
                              .cargo
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Teléfono
                        </Label>
                        <p className="text-sm">
                          {
                            selectedProveedor.contactoAdicional
                              .telefono
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Email
                        </Label>
                        <p className="text-sm">
                          {
                            selectedProveedor.contactoAdicional
                              .email
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Observaciones */}
              {selectedProveedor.observaciones && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      Observaciones
                    </Label>
                    <p className="text-sm p-3 bg-gray-50 rounded-lg">
                      {selectedProveedor.observaciones}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
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
                      Cédula *
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

                <div className="grid grid-cols-2 gap-4">
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
                    value={selectedProveedor.estado}
                    onValueChange={(
                      value: "Activo" | "Inactivo",
                    ) =>
                      setSelectedProveedor({
                        ...selectedProveedor,
                        estado: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">
                        Activo
                      </SelectItem>
                      <SelectItem value="Inactivo">
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
                      onValueChange={(value) =>
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
            <Button onClick={handleUpdateProveedor}>
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
      />
    </div>
  );
};
