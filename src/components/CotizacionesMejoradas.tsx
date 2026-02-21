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
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  XCircle,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Download,
  Minus,
} from "lucide-react";

// Interfaces para tipado
interface Cliente {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  empresa?: string;
}

interface ProductoDisponible {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
}

interface ProductoCotizacion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  categoria: string;
  disponible: boolean;
}

interface CambioEstadoCotizacion {
  id: number;
  fechaCambio: string;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo: string;
  usuario: string;
}

interface CondicionesPago {
  tipoPago: "contado" | "credito";
  plazoCredito?: number;
  metodoPago: string[];
  observaciones?: string;
}

interface PoliticasCancelacion {
  permiteCancelacion: boolean;
  tiempoLimite?: number;
  penalizacion?: number;
  condicionesEspeciales?: string;
}

interface Cotizacion {
  id: number;
  fechaCotizacion: string;
  fechaVigencia: string;
  fechaRespuesta?: string;
  cliente: Cliente;
  productos: ProductoCotizacion[];
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: "aceptada" | "anulada";
  condicionesPago: CondicionesPago;
  politicasCancelacion: PoliticasCancelacion;
  observaciones?: string;
  creadoPor: string;
  cambiosEstado: CambioEstadoCotizacion[];
  fechaCreacion: string;
  fechaActualizacion: string;
  motivoAnulacion?: string;
}

// Datos simulados
const clientesDisponibles: Cliente[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    documento: "1234567890",
    email: "juan.perez@email.com",
    telefono: "+57 300 123 4567",
    empresa: "Distribuidora El Sol",
  },
  {
    id: 2,
    nombre: "María González",
    documento: "9876543210",
    email: "maria.gonzalez@email.com",
    telefono: "+57 310 234 5678",
    empresa: "Comercial Luna",
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    documento: "5551234567",
    email: "carlos.rodriguez@email.com",
    telefono: "+57 320 345 6789",
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    documento: "7778889990",
    email: "ana.martinez@email.com",
    telefono: "+57 315 456 7890",
    empresa: "Vapeadores Pro",
  },
  {
    id: 5,
    nombre: "Luis Hernández",
    documento: "3334445556",
    email: "luis.hernandez@email.com",
    telefono: "+57 325 567 8901",
  },
];

const productosDisponibles: ProductoDisponible[] = [
  {
    id: 1,
    codigo: "VD001",
    nombre: "Vape Desechable Cherry 2000 puffs",
    descripcion:
      "Vapeador desechable sabor cereza con 2000 inhalaciones aproximadas",
    precio: 25000,
    categoria: "Vapes Desechables",
    stock: 50,
  },
  {
    id: 2,
    codigo: "PR001",
    nombre: "Pod System Premium 80W",
    descripcion:
      "Sistema de pod recargable con batería de larga duración",
    precio: 80000,
    categoria: "Vapes Recargables",
    stock: 20,
  },
  {
    id: 3,
    codigo: "VD002",
    nombre: "Vape Desechable Mango 1500 puffs",
    descripcion:
      "Vapeador desechable sabor mango con 1500 inhalaciones aproximadas",
    precio: 20000,
    categoria: "Vapes Desechables",
    stock: 75,
  },
  {
    id: 4,
    codigo: "AC001",
    nombre: "Líquido Premium Vainilla 30ml",
    descripcion:
      "E-liquid premium sabor vainilla, concentración 3mg",
    precio: 15000,
    categoria: "Líquidos",
    stock: 100,
  },
];

const cotizacionesIniciales: Cotizacion[] = [
  {
    id: 1,
    fechaCotizacion: "2024-01-15T09:00:00",
    fechaVigencia: "2024-01-22T23:59:59",
    cliente: clientesDisponibles[0],
    productos: [
      {
        id: 1,
        codigo: "VD001",
        nombre: "Vape Desechable Cherry 2000 puffs",
        descripcion:
          "Vapeador desechable sabor cereza con 2000 inhalaciones aproximadas",
        precioUnitario: 25000,
        cantidad: 10,
        subtotal: 250000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
      {
        id: 2,
        codigo: "PR001",
        nombre: "Pod System Premium 80W",
        descripcion:
          "Sistema de pod recargable con batería de larga duración",
        precioUnitario: 80000,
        cantidad: 2,
        subtotal: 160000,
        categoria: "Vapes Recargables",
        disponible: true,
      },
    ],
    subtotal: 410000,
    descuento: 20500,
    impuestos: 0,
    total: 389500,
    estado: "aceptada",
    condicionesPago: {
      tipoPago: "credito",
      plazoCredito: 30,
      metodoPago: ["Transferencia bancaria", "Cheque"],
      observaciones:
        "Pago a 30 días con descuento por pronto pago",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 24,
      penalizacion: 10,
      condicionesEspeciales:
        "Cancelación gratuita dentro de las primeras 24 horas",
    },
    observaciones:
      "Cliente preferencial - aplicar descuento del 5%",
    creadoPor: "María González",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2024-01-15T09:00:00",
        estadoAnterior: "",
        estadoNuevo: "pendiente",
        motivo: "Cotización creada",
        usuario: "María González",
      },
      {
        id: 2,
        fechaCambio: "2024-01-15T14:30:00",
        estadoAnterior: "pendiente",
        estadoNuevo: "aceptada",
        motivo: "Cotización aceptada por el cliente",
        usuario: "María González",
      },
    ],
    fechaCreacion: "2024-01-15T09:00:00",
    fechaActualizacion: "2024-01-15T14:30:00",
  },
  {
    id: 2,
    fechaCotizacion: "2024-01-16T10:30:00",
    fechaVigencia: "2024-01-30T23:59:59",
    cliente: clientesDisponibles[1],
    productos: [
      {
        id: 3,
        codigo: "VD002",
        nombre: "Vape Desechable Mango 1500 puffs",
        descripcion:
          "Vapeador desechable sabor mango con 1500 inhalaciones aproximadas",
        precioUnitario: 20000,
        cantidad: 15,
        subtotal: 300000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
    ],
    subtotal: 300000,
    descuento: 15000,
    impuestos: 0,
    total: 285000,
    estado: "aceptada",
    condicionesPago: {
      tipoPago: "contado",
      metodoPago: ["Efectivo", "Transferencia"],
      observaciones: "Descuento del 5% por pago de contado",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 48,
      penalizacion: 5,
      condicionesEspeciales:
        "Cancelación con penalización del 5% después de 48 horas",
    },
    observaciones:
      "Cliente mayorista - precios especiales aplicados",
    creadoPor: "Carlos Ruiz",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2024-01-16T10:30:00",
        estadoAnterior: "",
        estadoNuevo: "aceptada",
        motivo: "Cotización creada y aceptada",
        usuario: "Carlos Ruiz",
      },
    ],
    fechaCreacion: "2024-01-16T10:30:00",
    fechaActualizacion: "2024-01-16T10:30:00",
  },
  {
    id: 3,
    fechaCotizacion: "2024-01-20T16:30:00",
    fechaVigencia: "2024-02-05T23:59:59",
    cliente: clientesDisponibles[2],
    productos: [
      {
        id: 1,
        codigo: "VD001",
        nombre: "Vape Desechable Cherry 2000 puffs",
        descripcion:
          "Vapeador desechable sabor cereza con 2000 inhalaciones aproximadas",
        precioUnitario: 25000,
        cantidad: 8,
        subtotal: 200000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
    ],
    subtotal: 200000,
    descuento: 10000,
    impuestos: 0,
    total: 190000,
    estado: "anulada",
    motivoAnulacion: "Cliente cambió de proveedor",
    condicionesPago: {
      tipoPago: "contado",
      metodoPago: ["Transferencia bancaria"],
      observaciones: "Pago contra entrega",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 24,
      penalizacion: 0,
    },
    observaciones:
      "Cotización anulada por decisión del cliente",
    creadoPor: "Patricia Moreno",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2024-01-20T16:30:00",
        estadoAnterior: "",
        estadoNuevo: "pendiente",
        motivo: "Cotización creada",
        usuario: "Patricia Moreno",
      },
      {
        id: 2,
        fechaCambio: "2024-01-22T10:15:00",
        estadoAnterior: "pendiente",
        estadoNuevo: "anulada",
        motivo: "Cliente cambió de proveedor",
        usuario: "Patricia Moreno",
      },
    ],
    fechaCreacion: "2024-01-20T16:30:00",
    fechaActualizacion: "2024-01-22T10:15:00",
  },
  {
    id: 4,
    fechaCotizacion: "2025-09-21T11:15:00",
    fechaVigencia: "2025-09-28T23:59:59",
    cliente: clientesDisponibles[2],
    productos: [
      {
        id: 4,
        codigo: "AC001",
        nombre: "Líquido Premium Vainilla 30ml",
        descripcion:
          "E-liquid premium sabor vainilla, concentración 3mg",
        precioUnitario: 15000,
        cantidad: 20,
        subtotal: 300000,
        categoria: "Líquidos",
        disponible: true,
      },
      {
        id: 1,
        codigo: "VD001",
        nombre: "Vape Desechable Cherry 2000 puffs",
        descripcion:
          "Vapeador desechable sabor cereza con 2000 inhalaciones aproximadas",
        precioUnitario: 25000,
        cantidad: 5,
        subtotal: 125000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
    ],
    subtotal: 425000,
    descuento: 0,
    impuestos: 0,
    total: 425000,
    estado: "aceptada",
    condicionesPago: {
      tipoPago: "contado",
      metodoPago: ["Transferencia bancaria"],
      observaciones: "Pago inmediato",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 24,
      penalizacion: 0,
    },
    observaciones: "Pedido urgente - entrega rápida",
    creadoPor: "Ana Martínez",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2025-09-21T11:15:00",
        estadoAnterior: "",
        estadoNuevo: "aceptada",
        motivo: "Cotización creada y aceptada automáticamente",
        usuario: "Ana Martínez",
      },
    ],
    fechaCreacion: "2025-09-21T11:15:00",
    fechaActualizacion: "2025-09-21T11:15:00",
  },
  {
    id: 5,
    fechaCotizacion: "2025-09-20T14:45:00",
    fechaVigencia: "2025-10-04T23:59:59",
    cliente: clientesDisponibles[3],
    productos: [
      {
        id: 2,
        codigo: "PR001",
        nombre: "Pod System Premium 80W",
        descripcion:
          "Sistema de pod recargable con batería de larga duración",
        precioUnitario: 80000,
        cantidad: 12,
        subtotal: 960000,
        categoria: "Vapes Recargables",
        disponible: true,
      },
    ],
    subtotal: 960000,
    descuento: 48000,
    impuestos: 0,
    total: 912000,
    estado: "aceptada",
    condicionesPago: {
      tipoPago: "credito",
      plazoCredito: 15,
      metodoPago: ["Transferencia bancaria"],
      observaciones: "Descuento del 5% por volumen",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 48,
      penalizacion: 5,
    },
    observaciones: "Cliente corporativo - volumen alto",
    creadoPor: "Luis Hernández",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2025-09-20T14:45:00",
        estadoAnterior: "",
        estadoNuevo: "aceptada",
        motivo: "Cotización aceptada por cliente corporativo",
        usuario: "Luis Hernández",
      },
    ],
    fechaCreacion: "2025-09-20T14:45:00",
    fechaActualizacion: "2025-09-20T14:45:00",
  },
  {
    id: 6,
    fechaCotizacion: "2025-09-19T09:30:00",
    fechaVigencia: "2025-09-26T23:59:59",
    cliente: clientesDisponibles[4],
    productos: [
      {
        id: 3,
        codigo: "VD002",
        nombre: "Vape Desechable Mango 1500 puffs",
        descripcion:
          "Vapeador desechable sabor mango con 1500 inhalaciones aproximadas",
        precioUnitario: 20000,
        cantidad: 30,
        subtotal: 600000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
    ],
    subtotal: 600000,
    descuento: 30000,
    impuestos: 0,
    total: 570000,
    estado: "aceptada",
    condicionesPago: {
      tipoPago: "contado",
      metodoPago: ["Efectivo"],
      observaciones: "Pago al recibir mercancía",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 24,
      penalizacion: 0,
    },
    observaciones: "Cliente mayorista regular",
    creadoPor: "Carlos Ruiz",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2025-09-19T09:30:00",
        estadoAnterior: "",
        estadoNuevo: "aceptada",
        motivo: "Cotización aceptada",
        usuario: "Carlos Ruiz",
      },
    ],
    fechaCreacion: "2025-09-19T09:30:00",
    fechaActualizacion: "2025-09-19T09:30:00",
  },
  {
    id: 7,
    fechaCotizacion: "2025-09-18T16:20:00",
    fechaVigencia: "2025-10-02T23:59:59",
    cliente: clientesDisponibles[1],
    productos: [
      {
        id: 4,
        codigo: "AC001",
        nombre: "Líquido Premium Vainilla 30ml",
        descripcion:
          "E-liquid premium sabor vainilla, concentración 3mg",
        precioUnitario: 15000,
        cantidad: 10,
        subtotal: 150000,
        categoria: "Líquidos",
        disponible: true,
      },
      {
        id: 3,
        codigo: "VD002",
        nombre: "Vape Desechable Mango 1500 puffs",
        descripcion:
          "Vapeador desechable sabor mango con 1500 inhalaciones aproximadas",
        precioUnitario: 20000,
        cantidad: 6,
        subtotal: 120000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
    ],
    subtotal: 270000,
    descuento: 13500,
    impuestos: 0,
    total: 256500,
    estado: "anulada",
    motivoAnulacion: "Problemas de stock en el inventario",
    condicionesPago: {
      tipoPago: "contado",
      metodoPago: ["Transferencia bancaria"],
      observaciones: "Pago anticipado",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 24,
      penalizacion: 0,
    },
    observaciones: "Cotización anulada por falta de inventario",
    creadoPor: "Patricia Moreno",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2025-09-18T16:20:00",
        estadoAnterior: "",
        estadoNuevo: "aceptada",
        motivo: "Cotización creada y aceptada",
        usuario: "Patricia Moreno",
      },
      {
        id: 2,
        fechaCambio: "2025-09-19T08:45:00",
        estadoAnterior: "aceptada",
        estadoNuevo: "anulada",
        motivo: "Problemas de stock en el inventario",
        usuario: "Patricia Moreno",
      },
    ],
    fechaCreacion: "2025-09-18T16:20:00",
    fechaActualizacion: "2025-09-19T08:45:00",
  },
  {
    id: 8,
    fechaCotizacion: "2025-09-17T13:10:00",
    fechaVigencia: "2025-09-24T23:59:59",
    cliente: clientesDisponibles[0],
    productos: [
      {
        id: 1,
        codigo: "VD001",
        nombre: "Vape Desechable Cherry 2000 puffs",
        descripcion:
          "Vapeador desechable sabor cereza con 2000 inhalaciones aproximadas",
        precioUnitario: 25000,
        cantidad: 25,
        subtotal: 625000,
        categoria: "Vapes Desechables",
        disponible: true,
      },
      {
        id: 2,
        codigo: "PR001",
        nombre: "Pod System Premium 80W",
        descripcion:
          "Sistema de pod recargable con batería de larga duración",
        precioUnitario: 80000,
        cantidad: 3,
        subtotal: 240000,
        categoria: "Vapes Recargables",
        disponible: true,
      },
    ],
    subtotal: 865000,
    descuento: 43250,
    impuestos: 0,
    total: 821750,
    estado: "aceptada",
    condicionesPago: {
      tipoPago: "credito",
      plazoCredito: 45,
      metodoPago: ["Transferencia bancaria", "Cheque"],
      observaciones: "Cliente VIP - condiciones preferenciales",
    },
    politicasCancelacion: {
      permiteCancelacion: true,
      tiempoLimite: 72,
      penalizacion: 3,
    },
    observaciones: "Cliente VIP con historial excelente",
    creadoPor: "María González",
    cambiosEstado: [
      {
        id: 1,
        fechaCambio: "2025-09-17T13:10:00",
        estadoAnterior: "",
        estadoNuevo: "aceptada",
        motivo:
          "Cotización aceptada automáticamente para cliente VIP",
        usuario: "María González",
      },
    ],
    fechaCreacion: "2025-09-17T13:10:00",
    fechaActualizacion: "2025-09-17T13:10:00",
  },
];

// Formulario para nueva cotización
interface FormularioCotizacion {
  clienteId: number | null;
  productos: Array<{
    productoId: number;
    cantidad: number;
  }>;
  fechaVigencia: string;
  condicionesPago: CondicionesPago;
  descuentoPorcentaje: number;
}

export const Cotizaciones: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<
    Cotizacion[]
  >(cotizacionesIniciales);
  const [selectedCotizacion, setSelectedCotizacion] =
    useState<Cotizacion | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] =
    useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] =
    useState<Cotizacion | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] =
    useState<string>("todos");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para el selector de productos temporal
  const [selectedProductId, setSelectedProductId] =
    useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] =
    useState<number>(1);

  // Estado para búsqueda de cliente por documento
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);

  // Formulario de nueva cotización
  const [formData, setFormData] =
    useState<FormularioCotizacion>(() => {
      const fechaVigenciaDefault = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];

      return {
        clienteId: null,
        productos: [],
        fechaVigencia: fechaVigenciaDefault,
        condicionesPago: {
          tipoPago: "contado",
          metodoPago: ["Efectivo"],
          observaciones: "",
        },
        descuentoPorcentaje: 0,
      };
    });



  // Calcular totales
  const calcularTotales = (
    productos: Array<{ productoId: number; cantidad: number }>,
    descuentoPorcentaje: number = 0,
  ) => {
    const subtotal = productos.reduce((sum, item) => {
      const producto = productosDisponibles.find(
        (p) => p.id === item.productoId,
      );
      return (
        sum + (producto ? producto.precio * item.cantidad : 0)
      );
    }, 0);

    const descuento = (subtotal * descuentoPorcentaje) / 100;
    const total = subtotal - descuento;
    const impuestos = 0; // No se maneja IVA

    return { subtotal, descuento, impuestos, total };
  };

  // Filtrar clientes por documento
  const clientesFiltradosPorDocumento = busquedaDocumento
    ? clientesDisponibles.filter((cliente) =>
        cliente.documento.includes(busquedaDocumento)
      )
    : [];

  // Seleccionar cliente desde las sugerencias
  const seleccionarCliente = (cliente: Cliente) => {
    setFormData((prev) => ({
      ...prev,
      clienteId: cliente.id,
    }));
    setBusquedaDocumento(cliente.documento);
    setMostrarSugerenciasCliente(false);
  };

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado]);

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter(
    (cotizacion) => {
      const matchesSearch =
        cotizacion.cliente.nombre
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesEstado =
        filtroEstado === "todos" ||
        cotizacion.estado === filtroEstado;
      return matchesSearch && matchesEstado;
    },
  );

  // Paginación
  const totalPages = Math.ceil(
    cotizacionesFiltradas.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const cotizacionesPaginadas = cotizacionesFiltradas.slice(
    startIndex,
    endIndex,
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Manejar vista de detalles
  const handleViewDetail = (cotizacion: Cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setIsDetailDialogOpen(true);
  };

  // Manejar edición
  const handleEdit = (cotizacion: Cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setFormData({
      clienteId: cotizacion.cliente.id,
      productos: cotizacion.productos.map((p) => ({
        productoId: p.id,
        cantidad: p.cantidad,
      })),
      fechaVigencia: cotizacion.fechaVigencia.split("T")[0],
      condicionesPago: cotizacion.condicionesPago,
      descuentoPorcentaje:
        cotizacion.subtotal > 0
          ? (cotizacion.descuento / cotizacion.subtotal) * 100
          : 0,
    });
    setSelectedProductId(0);
    setSelectedQuantity(1);
    setIsEditDialogOpen(true);
  };

  // Manejar anulación
  const handleAnular = (cotizacion: Cotizacion) => {
    setCotizacionToDelete(cotizacion);
    setIsDeleteDialogOpen(true);
  };

  // Confirmar anulación
  const confirmarAnulacion = () => {
    if (cotizacionToDelete && motivoAnulacion.trim()) {
      const cotizacionActualizada: Cotizacion = {
        ...cotizacionToDelete,
        estado: "anulada",
        motivoAnulacion,
        fechaActualizacion: new Date().toISOString(),
        cambiosEstado: [
          ...cotizacionToDelete.cambiosEstado,
          {
            id: cotizacionToDelete.cambiosEstado.length + 1,
            fechaCambio: new Date().toISOString(),
            estadoAnterior: cotizacionToDelete.estado,
            estadoNuevo: "anulada",
            motivo: motivoAnulacion,
            usuario: "Usuario Actual",
          },
        ],
      };

      setCotizaciones((prev) =>
        prev.map((c) =>
          c.id === cotizacionToDelete.id
            ? cotizacionActualizada
            : c,
        ),
      );

      toast.success("Cotización anulada exitosamente");
      setIsDeleteDialogOpen(false);
      setCotizacionToDelete(null);
      setMotivoAnulacion("");
    }
  };

  // Agregar producto usando el botón +
  const agregarProductoSeleccionado = () => {
    if (selectedProductId > 0 && selectedQuantity > 0) {
      setFormData((prev) => ({
        ...prev,
        productos: [
          ...prev.productos,
          {
            productoId: selectedProductId,
            cantidad: selectedQuantity,
          },
        ],
      }));
      setSelectedProductId(0);
      setSelectedQuantity(1);
    }
  };

  // Remover producto del formulario
  const removerProducto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  // Actualizar producto en el formulario
  const actualizarProducto = (
    index: number,
    campo: "productoId" | "cantidad",
    valor: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.map((p, i) =>
        i === index ? { ...p, [campo]: valor } : p,
      ),
    }));
  };

  // Crear nueva cotización
  const crearCotizacion = () => {
    if (
      !formData.clienteId ||
      formData.productos.length === 0
    ) {
      toast.error(
        "Por favor complete todos los campos requeridos",
      );
      return;
    }

    const cliente = clientesDisponibles.find(
      (c) => c.id === formData.clienteId,
    );
    if (!cliente) return;

    const productosConDetalles = formData.productos.map((p) => {
      const producto = productosDisponibles.find(
        (pd) => pd.id === p.productoId,
      );
      if (!producto) throw new Error("Producto no encontrado");

      return {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precioUnitario: producto.precio,
        cantidad: p.cantidad,
        subtotal: producto.precio * p.cantidad,
        categoria: producto.categoria,
        disponible: true,
      };
    });

    const { subtotal, descuento, impuestos, total } =
      calcularTotales(
        formData.productos,
        formData.descuentoPorcentaje,
      );

    const fechaVigenciaAuto =
      formData.fechaVigencia ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const nuevaCotizacion: Cotizacion = {
      id: Math.max(...cotizaciones.map((c) => c.id)) + 1,
      fechaCotizacion: new Date().toISOString(),
      fechaVigencia: new Date(
        fechaVigenciaAuto + "T23:59:59",
      ).toISOString(),
      cliente,
      productos: productosConDetalles,
      subtotal,
      descuento,
      impuestos,
      total,
      estado: "aceptada",
      condicionesPago: formData.condicionesPago,
      politicasCancelacion: {
        permiteCancelacion: true,
        tiempoLimite: 24,
        penalizacion: 0,
      },
      observaciones: "",
      creadoPor: "Usuario Actual",
      cambiosEstado: [
        {
          id: 1,
          fechaCambio: new Date().toISOString(),
          estadoAnterior: "",
          estadoNuevo: "aceptada",
          motivo: "Cotización creada y aceptada",
          usuario: "Usuario Actual",
        },
      ],
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    setCotizaciones((prev) => [nuevaCotizacion, ...prev]);
    toast.success("Cotización creada exitosamente");
    setIsCreateDialogOpen(false);
    resetFormData();
  };

  // Resetear formulario
  const resetFormData = () => {
    const fechaVigenciaDefault = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0];

    setFormData({
      clienteId: null,
      productos: [],
      fechaVigencia: fechaVigenciaDefault,
      condicionesPago: {
        tipoPago: "contado",
        metodoPago: ["Efectivo"],
        observaciones: "",
      },
      descuentoPorcentaje: 0,
    });
    setSelectedProductId(0);
    setSelectedQuantity(1);
    setBusquedaDocumento("");
    setMostrarSugerenciasCliente(false);
  };

  // Función para obtener el color del badge según el estado
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "aceptada":
        return "bg-green-100 text-green-800";
      case "anulada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función para generar y descargar PDF
  const generarPDF = async (cotizacion: Cotizacion) => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF();

      // Configuración de colores y fuentes
      const primaryColor = [3, 2, 19]; // Color primario del sistema
      const grayColor = [107, 114, 128];
      const darkColor = [31, 41, 55];

      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.text("COTIZACIÓN", 20, 30);

      // Fecha de generación
      doc.setFontSize(12);
      doc.setTextColor(...grayColor);
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`,
        20,
        45,
      );

      // Línea separadora
      doc.setDrawColor(...grayColor);
      doc.line(20, 55, 190, 55);

      // Información del cliente
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("INFORMACIÓN DEL CLIENTE", 20, 70);

      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text(`Cliente: ${cotizacion.cliente.nombre}`, 20, 85);
      if (cotizacion.cliente.empresa) {
        doc.text(
          `Empresa: ${cotizacion.cliente.empresa}`,
          20,
          95,
        );
      }
      doc.text(`Email: ${cotizacion.cliente.email}`, 20, 105);
      doc.text(
        `Teléfono: ${cotizacion.cliente.telefono}`,
        20,
        115,
      );

      // Información de la cotización
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("INFORMACIÓN DE LA COTIZACIÓN", 20, 135);

      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text(
        `Fecha de cotización: ${new Date(cotizacion.fechaCotizacion).toLocaleDateString("es-ES")}`,
        20,
        150,
      );
      doc.text(
        `Fecha de vigencia: ${new Date(cotizacion.fechaVigencia).toLocaleDateString("es-ES")}`,
        20,
        160,
      );
      doc.text(
        `Estado: ${cotizacion.estado.toUpperCase()}`,
        20,
        170,
      );
      doc.text(`Creado por: ${cotizacion.creadoPor}`, 120, 150);

      // Productos
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text("PRODUCTOS", 20, 190);

      // Encabezados de tabla
      doc.setFontSize(9);
      doc.setTextColor(...darkColor);
      let yPos = 205;

      // Línea de encabezado
      doc.setDrawColor(...grayColor);
      doc.line(20, yPos - 5, 190, yPos - 5);

      doc.text("Código", 20, yPos);
      doc.text("Producto", 45, yPos);
      doc.text("Cant.", 120, yPos);
      doc.text("Precio Unit.", 140, yPos);
      doc.text("Subtotal", 170, yPos);

      doc.line(20, yPos + 5, 190, yPos + 5);

      // Productos
      yPos += 15;
      cotizacion.productos.forEach((producto) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }

        doc.text(producto.codigo, 20, yPos);
        // Truncar nombre del producto si es muy largo
        const nombreTruncado =
          producto.nombre.length > 25
            ? producto.nombre.substring(0, 25) + "..."
            : producto.nombre;
        doc.text(nombreTruncado, 45, yPos);
        doc.text(producto.cantidad.toString(), 125, yPos);
        doc.text(
          `$${producto.precioUnitario.toLocaleString()}`,
          140,
          yPos,
        );
        doc.text(
          `$${producto.subtotal.toLocaleString()}`,
          170,
          yPos,
        );
        yPos += 10;
      });

      // Línea separadora antes de totales
      yPos += 10;
      doc.setDrawColor(...grayColor);
      doc.line(120, yPos, 190, yPos);

      // Totales
      yPos += 15;
      doc.setFontSize(10);
      doc.text("Subtotal:", 140, yPos);
      doc.text(
        `$${cotizacion.subtotal.toLocaleString()}`,
        170,
        yPos,
      );

      yPos += 10;
      doc.text("Descuento:", 140, yPos);
      doc.text(
        `-$${cotizacion.descuento.toLocaleString()}`,
        170,
        yPos,
      );

      // Total
      yPos += 10;
      doc.setDrawColor(...primaryColor);
      doc.line(140, yPos - 5, 190, yPos - 5);
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text("TOTAL:", 140, yPos);
      doc.text(
        `$${cotizacion.total.toLocaleString()}`,
        170,
        yPos,
      );

      // Observaciones si existen
      if (
        cotizacion.observaciones &&
        cotizacion.observaciones.trim()
      ) {
        yPos += 20;
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        doc.text("Observaciones:", 20, yPos);
        yPos += 10;
        doc.text(cotizacion.observaciones, 20, yPos);
      }

      // Motivo de anulación si existe
      if (cotizacion.motivoAnulacion) {
        yPos += 20;
        doc.setFontSize(10);
        doc.setTextColor(220, 38, 38); // Color rojo
        doc.text("Motivo de anulación:", 20, yPos);
        yPos += 10;
        doc.text(cotizacion.motivoAnulacion, 20, yPos);
      }

      // Pie de página
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...grayColor);
        doc.text(`Página ${i} de ${totalPages}`, 170, 285);
        doc.text(
          `Generado el ${new Date().toLocaleString("es-ES")}`,
          20,
          285,
        );
      }

      // Guardar el PDF
      const nombreArchivo = `Cotizacion_${cotizacion.cliente.nombre.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date(cotizacion.fechaCotizacion).toLocaleDateString('es-CO').replace(/\//g, "-")}.pdf`;
      doc.save(nombreArchivo);

      toast.success("PDF generado y descargado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con título, filtros y botón - TODO EN UNO */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        {/* Título y botón en la misma línea */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-[13px] text-[14px]">Gestión de Cotizaciones</h1>
            <p className="text-muted-foreground text-sm">
              Administra cotizaciones, seguimiento de estados y aprobaciones
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>

        {/* Filtros de búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 items-end pt-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <Select
              value={filtroEstado}
              onValueChange={setFiltroEstado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  Todos los estados
                </SelectItem>
                <SelectItem value="aceptada">
                  Aceptada
                </SelectItem>
                <SelectItem value="anulada">
                  Anulada
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Separador */}
        <Separator className="my-4" />

        {/* Tabla de cotizaciones */}
        <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizacionesPaginadas.map((cotizacion) => (
                  <TableRow key={cotizacion.id}>
                    <TableCell>{cotizacion.cliente.nombre}</TableCell>
                    <TableCell>
                      {new Date(
                        cotizacion.fechaCotizacion,
                      ).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell>
                      ${cotizacion.total.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          cotizacion.estado === "aceptada"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }
                      >
                        {cotizacion.estado === "aceptada" ? "Aceptada" : "Anulada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewDetail(cotizacion)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generarPDF(cotizacion)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {cotizacion.estado === "aceptada" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAnular(cotizacion)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="text-red-600 hover:text-red-700 hover:bg-red-50" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a{" "}
                {Math.min(
                  endIndex,
                  cotizacionesFiltradas.length,
                )}{" "}
                de {cotizacionesFiltradas.length} cotizaciones
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
      </div>

      {/* Dialog de detalles */}
      <Dialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      >
        <DialogContent className="max-w-[98vw] sm:max-w-[95vw] md:max-w-[600px] lg:max-w-[700px] h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
            <DialogTitle className="text-lg sm:text-xl">Detalles de Cotización</DialogTitle>
            <DialogDescription className="text-sm">
              Información completa de la cotización seleccionada
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {selectedCotizacion && (
              <div className="space-y-4 sm:space-y-5">
                {/* Grid principal - responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Primera fila */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Cliente
                    </Label>
                    <p className="mt-1 text-sm sm:text-base break-words">
                      {selectedCotizacion.cliente.nombre}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Fecha
                    </Label>
                    <p className="mt-1 text-sm sm:text-base">
                      {new Date(
                        selectedCotizacion.fechaCotizacion,
                      ).toLocaleDateString('es-CO')}
                    </p>
                  </div>

                  {/* Segunda fila */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Estado
                    </Label>
                    <div className="mt-1">
                      <Badge 
                        className={
                          selectedCotizacion.estado === "aceptada"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }
                      >
                        {selectedCotizacion.estado === "aceptada" ? "Aceptada" : "Anulada"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Fecha de Vigencia
                    </Label>
                    <p className="mt-1 text-sm sm:text-base">
                      {new Date(
                        selectedCotizacion.fechaVigencia,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Tercera fila - Estado ocupa ambas columnas */}
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Estado
                    </Label>
                    <div className="mt-1">
                      <Badge
                        className={getEstadoBadgeColor(
                          selectedCotizacion.estado,
                        )}
                      >
                        {selectedCotizacion.estado}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sección Productos con scroll independiente */}
                <div>
                  <Label className="text-sm sm:text-base">Productos</Label>
                  <div className="mt-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 space-y-2">
                    {selectedCotizacion.productos.map(
                      (producto, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:grid sm:grid-cols-4 gap-2 text-sm p-2.5 sm:p-3 bg-muted/20 rounded-lg border"
                        >
                          <div className="sm:col-span-2">
                            <p className="font-medium break-words">
                              {producto.nombre}
                            </p>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-muted-foreground sm:hidden">Cantidad:</span>
                            <p className="sm:text-center">{producto.cantidad}</p>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-muted-foreground sm:hidden">Subtotal:</span>
                            <p className="font-medium sm:text-right">
                              ${producto.subtotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <Separator />

                {/* Resumen de Pago */}
                <div>
                  <Label className="text-sm sm:text-base">Resumen de Pago</Label>
                  <div className="mt-3 space-y-2.5 bg-muted/20 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">
                        ${selectedCotizacion.subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base text-red-600">
                      <span>Descuento:</span>
                      <span className="font-medium">
                        -${selectedCotizacion.descuento.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base sm:text-lg pt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">
                        ${selectedCotizacion.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCotizacion.motivoAnulacion && (
                  <>
                    <Separator />
                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
                      <Label className="text-xs text-muted-foreground">
                        Motivo de Anulación
                      </Label>
                      <p className="mt-1 text-sm sm:text-base text-red-600 break-words">
                        {selectedCotizacion.motivoAnulacion}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0 bg-background">
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar cotización */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedCotizacion(null);
            resetFormData();
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen
                ? "Nueva Cotización"
                : "Editar Cotización"}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen
                ? "Crea una nueva cotización en el sistema"
                : "Modifica la información de la cotización"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-4 sm:space-y-6 py-2 px-1">
              {/* Grid de campos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Fecha de Vigencia */}
                <div>
                  <Label htmlFor="fechaVigencia">Fecha</Label>
                  <Input
                    id="fechaVigencia"
                    type="date"
                    value={formData.fechaVigencia}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechaVigencia: e.target.value,
                      }))
                    }
                    className="bg-input-background"
                  />
                </div>

                {/* Cliente - Búsqueda por documento */}
                <div className="relative">
                  <Label htmlFor="cliente">Cliente (Buscar por documento)</Label>
                  <div className="relative">
                    <Input
                      id="cliente"
                      type="text"
                      placeholder="Ingrese número de documento"
                      value={busquedaDocumento}
                      onChange={(e) => {
                        setBusquedaDocumento(e.target.value);
                        setMostrarSugerenciasCliente(true);
                        if (e.target.value === "") {
                          setFormData((prev) => ({
                            ...prev,
                            clienteId: null,
                          }));
                        }
                      }}
                      onFocus={() => setMostrarSugerenciasCliente(true)}
                      className="bg-input-background"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  
                  {/* Sugerencias de clientes */}
                  {mostrarSugerenciasCliente && busquedaDocumento && clientesFiltradosPorDocumento.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {clientesFiltradosPorDocumento.map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                          onClick={() => seleccionarCliente(cliente)}
                        >
                          <div className="font-medium">{cliente.nombre}</div>
                          <div className="text-sm text-gray-600">
                            Doc: {cliente.documento}
                            {cliente.empresa && ` - ${cliente.empresa}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cliente seleccionado */}
                  {formData.clienteId && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <span className="text-green-800 font-medium">
                        Cliente seleccionado: {clientesDisponibles.find(c => c.id === formData.clienteId)?.nombre}
                      </span>
                    </div>
                  )}
                </div>

                {/* Descuento */}
                <div>
                  <Label htmlFor="descuento">Descuento</Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.descuentoPorcentaje}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descuentoPorcentaje:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                    className="bg-input-background"
                  />
                </div>

              </div>

              {/* Sección de agregar productos - ocupa todo el ancho */}
              <div className="space-y-3 pt-2 border-t">
                <Label>Agregar Productos</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Producto */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Producto</Label>
                    <Select
                      value={selectedProductId.toString()}
                      onValueChange={(value) =>
                        setSelectedProductId(parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" disabled>
                          Seleccionar producto
                        </SelectItem>
                        {productosDisponibles.map((prod) => (
                          <SelectItem
                            key={prod.id}
                            value={prod.id.toString()}
                          >
                            {prod.codigo} - {prod.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cantidad */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Cantidad</Label>
                    <div className="flex space-x-2">
                      <div className="flex items-center border rounded-md flex-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-r-none border-r"
                          onClick={() => {
                            setSelectedQuantity(Math.max(1, selectedQuantity - 1));
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={selectedQuantity}
                          onChange={(e) =>
                            setSelectedQuantity(
                              parseInt(e.target.value) || 1,
                            )
                          }
                          placeholder="1"
                          className="border-0 text-center h-9 focus-visible:ring-0 focus-visible:ring-offset-0 bg-input-background"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-l-none border-l"
                          onClick={() => {
                            setSelectedQuantity(selectedQuantity + 1);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        onClick={agregarProductoSeleccionado}
                        disabled={selectedProductId === 0}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos Seleccionados */}
              {formData.productos.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Label>Productos Seleccionados</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {formData.productos.map(
                      (producto, index) => {
                        const productoInfo =
                          productosDisponibles.find(
                            (p) => p.id === producto.productoId,
                          );
                        if (!productoInfo) return null;

                        return (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {productoInfo.nombre}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {producto.cantidad} x ${productoInfo.precio.toLocaleString()}
                                <span className="ml-2 font-medium text-foreground">
                                  = ${(producto.cantidad * productoInfo.precio).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removerProducto(index)
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end sm:self-auto shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* Resumen de totales */}
              {formData.productos.length > 0 && (
                <div className="space-y-3 pt-4 border-t bg-muted/20 p-4 rounded-lg">
                  {(() => {
                    const {
                      subtotal,
                      descuento,
                      impuestos,
                      total,
                    } = calcularTotales(
                      formData.productos,
                      formData.descuentoPorcentaje,
                    );
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span className="font-medium">
                            ${subtotal.toLocaleString()}
                          </span>
                        </div>
                        {descuento > 0 && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span>Descuento:</span>
                            <span className="font-medium">
                              -${descuento.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium text-base sm:text-lg border-t pt-2">
                          <span>Total:</span>
                          <span className="text-primary">${total.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedCotizacion(null);
                resetFormData();
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={crearCotizacion}
              disabled={
                !formData.clienteId ||
                formData.productos.length === 0
              }
              className="w-full sm:w-auto"
            >
              {isCreateDialogOpen
                ? "Crear Cotización"
                : "Actualizar Cotización"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para anulación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro de anular esta cotización?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cotización
              será marcada como anulada.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="motivoAnulacion">
                Motivo de anulación *
              </Label>
              <Textarea
                id="motivoAnulacion"
                value={motivoAnulacion}
                onChange={(e) =>
                  setMotivoAnulacion(e.target.value)
                }
                placeholder="Ingrese el motivo de la anulación..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setMotivoAnulacion("");
                setCotizacionToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarAnulacion}
              disabled={!motivoAnulacion.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Anular Cotización
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
