import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Separator } from "./ui/separator";
import { AbonosIndividuales } from "./AbonosIndividuales";
import { DetallePedido } from "./DetallePedido";
import { Pedido } from "../types";
import { toast } from "sonner";
import {
  productosInventario,
  ProductoInventario,
} from "../data/productos";
import {
  Search,
  Eye,
  Edit,
  Edit3,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Minus,
  Receipt,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  CreditCard,
  Star,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

// Mock de clientes disponibles
const mockClientes = [
  {
    id: "c1",
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@email.com",
    telefono: "+57 300 123 4567",
    direccion: "Carrera 70 #45-32, Apto 501",
    ciudad: "Medellín",
    pais: "Colombia",
  },
  {
    id: "c2",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    telefono: "+57 310 987 6543",
    direccion: "Calle 10 #20-15",
    ciudad: "Medellín",
    pais: "Colombia",
  },
  {
    id: "c3",
    nombre: "Ana",
    apellido: "López",
    email: "ana.lopez@email.com",
    telefono: "+57 320 456 7890",
    direccion: "Avenida Oriental #25-40",
    ciudad: "Medellín",
    pais: "Colombia",
  },
  {
    id: "c4",
    nombre: "Carmen",
    apellido: "Ruiz",
    email: "carmen.ruiz@email.com",
    telefono: "+57 320 555 0123",
    direccion: "Calle 50 #30-20",
    ciudad: "Medellín",
    pais: "Colombia",
  },
  {
    id: "c5",
    nombre: "Diego",
    apellido: "Vargas",
    email: "diego.vargas@email.com",
    telefono: "+57 311 444 5678",
    direccion: "Carrera 65 #48-15",
    ciudad: "Medellín",
    pais: "Colombia",
  },
];

const mockPedidos: Pedido[] = [
  {
    id: "1",
    numeroPedido: "PED-2024-001",
    cliente: {
      id: "c1",
      nombre: "María",
      apellido: "González",
      email: "maria.gonzalez@email.com",
      telefono: "+57 300 123 4567",
    },
    fechaPedido: new Date("2024-03-15T10:30:00"),
    fechaEntregaEstimada: new Date("2024-03-16T15:00:00"),
    fechaEntrega: new Date("2024-03-16T14:45:00"),
    estado: "entregado",
    metodoPago: "Tarjeta Crédito",
    productos: [
      {
        id: "p1",
        nombre: "Vape Desechable Snoopy Smoke 15000 puffs",
        categoria: "Desechables",
        precio: 45000,
        cantidad: 2,
        subtotal: 90000,
        imagen: "/images/snoopy-smoke.jpg",
        especificaciones: {
          sabor: "Frozen Strawberry Cream",
          nicotina: "5%",
          tamaño: "15000 puffs",
        },
      },
      {
        id: "p2",
        nombre: "Líquido Premium Frutal 60ml",
        categoria: "Líquidos",
        precio: 55000,
        cantidad: 1,
        subtotal: 55000,
        especificaciones: {
          sabor: "Mango Tropical",
          nicotina: "3mg",
          tamaño: "60ml",
        },
      },
    ],
    subtotal: 145000,
    descuento: 5000,
    impuestos: 22400,
    costoEnvio: 8000,
    total: 170400,
    direccionEntrega: {
      direccion: "Carrera 70 #45-32, Apto 501",
      ciudad: "Medellín",
      departamento: "Antioquia",
      codigoPostal: "050010",
      instrucciones:
        "Portería, preguntar por María en el apartamento 501",
    },
    observaciones:
      "Cliente prefiere entrega después de las 2:00 PM",
    repartidor: "Carlos Rodríguez",
    tiempoEstimadoEntrega: 45,
    calificacion: 5,
    comentarioCliente:
      "Excelente servicio, muy rápida la entrega",
  },
  {
    id: "2",
    numeroPedido: "PED-2024-002",
    cliente: {
      id: "c2",
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan.perez@email.com",
      telefono: "+57 310 987 6543",
    },
    fechaPedido: new Date("2024-03-16T09:15:00"),
    fechaEntregaEstimada: new Date("2024-03-16T16:30:00"),
    estado: "pendiente",
    metodoPago: "Efectivo",
    productos: [
      {
        id: "p3",
        nombre: "Pod System Premium Kit",
        categoria: "Pods",
        precio: 120000,
        cantidad: 1,
        subtotal: 120000,
        especificaciones: {
          tamaño: "Kit Completo",
        },
      },
      {
        id: "p4",
        nombre: "Resistencias Pod (Pack x5)",
        categoria: "Accesorios",
        precio: 35000,
        cantidad: 1,
        subtotal: 35000,
      },
    ],
    subtotal: 155000,
    impuestos: 24800,
    costoEnvio: 12000,
    total: 191800,
    direccionEntrega: {
      direccion: "Calle 10 #20-15",
      ciudad: "Medellín",
      departamento: "Antioquia",
      instrucciones: "Casa blanca con portón Negro",
    },
    repartidor: "Luis Martínez",
    tiempoEstimadoEntrega: 30,
  },
  {
    id: "3",
    numeroPedido: "PED-2024-003",
    cliente: {
      id: "c3",
      nombre: "Ana",
      apellido: "López",
      email: "ana.lopez@email.com",
      telefono: "+57 320 456 7890",
    },
    fechaPedido: new Date("2024-03-16T11:45:00"),
    fechaEntregaEstimada: new Date("2024-03-17T10:00:00"),
    estado: "cancelado",
    metodoPago: "Nequi",
    productos: [
      {
        id: "p5",
        nombre: "Mod Avanzado 100W",
        categoria: "Mods",
        precio: 250000,
        cantidad: 1,
        subtotal: 250000,
      },
      {
        id: "p6",
        nombre: "Tanque Sub-Ohm",
        categoria: "Accesorios",
        precio: 80000,
        cantidad: 1,
        subtotal: 80000,
      },
    ],
    subtotal: 330000,
    descuento: 20000,
    impuestos: 49600,
    costoEnvio: 15000,
    total: 374600,
    direccionEntrega: {
      direccion: "Avenida Oriental #25-40, Local 3",
      ciudad: "Medellín",
      departamento: "Antioquia",
      instrucciones: "Entregar en el local de tatuajes",
    },
    observaciones: "Cliente canceló por cambio de planes",
  },
  {
    id: "4",
    numeroPedido: "PED-2024-004",
    cliente: {
      id: "c4",
      nombre: "Carmen",
      apellido: "Ruiz",
      email: "carmen.ruiz@email.com",
      telefono: "+57 320 555 0123",
    },
    fechaPedido: new Date("2024-03-17T14:30:00"),
    estado: "pendiente",
    metodoPago: "Efectivo",
    productos: [],
    subtotal: 75000,
    impuestos: 12000,
    costoEnvio: 8000,
    total: 95000,
    direccionEntrega: {
      direccion: "Calle 50 #30-20",
      ciudad: "Medellín",
      departamento: "Antioquia",
    },
  },
  {
    id: "5",
    numeroPedido: "PED-2024-005",
    cliente: {
      id: "c5",
      nombre: "Diego",
      apellido: "Vargas",
      email: "diego.vargas@email.com",
      telefono: "+57 311 444 5678",
    },
    fechaPedido: new Date("2024-03-17T16:00:00"),
    estado: "entregado",
    metodoPago: "Nequi",
    productos: [],
    subtotal: 180000,
    impuestos: 28800,
    costoEnvio: 12000,
    total: 220800,
    direccionEntrega: {
      direccion: "Carrera 65 #48-15",
      ciudad: "Medellín",
      departamento: "Antioquia",
    },
  },
  {
    id: "6",
    numeroPedido: "PED-2024-006",
    cliente: {
      id: "c1",
      nombre: "María",
      apellido: "González",
      email: "maria.gonzalez@email.com",
      telefono: "+57 300 123 4567",
    },
    fechaPedido: new Date("2024-03-18T10:00:00"),
    estado: "pendiente",
    metodoPago: "PSE",
    productos: [],
    subtotal: 95000,
    impuestos: 15200,
    costoEnvio: 8000,
    total: 118200,
    direccionEntrega: {
      direccion: "Carrera 70 #45-32, Apto 501",
      ciudad: "Medellín",
      departamento: "Antioquia",
    },
  },
];

interface PedidosProps {
  onNavigateToDetail?: (id: string) => void;
}

export const Pedidos: React.FC<PedidosProps> = ({
  onNavigateToDetail,
}) => {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPedido, setSelectedPedido] =
    useState<Pedido | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] =
    useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] =
    useState(false);
  const [pedidoToUpdate, setPedidoToUpdate] =
    useState<Pedido | null>(null);
  const [newStatus, setNewStatus] = useState("");

  // Estados para navegación a abonos individuales
  const [showAbonosIndividuales, setShowAbonosIndividuales] =
    useState(false);
  const [selectedPedidoForAbonos, setSelectedPedidoForAbonos] =
    useState<Pedido | null>(null);

  // Estados para mostrar detalle completo del pedido
  const [showDetallePedido, setShowDetallePedido] =
    useState(false);

  // Estados para crear pedido
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(false);
  const [newPedido, setNewPedido] = useState({
    cliente: "",
    metodoPago: "",
    productos: [] as Array<{
      id: string;
      nombre: string;
      precio: number;
      cantidad: number;
      subtotal: number;
    }>,
    direccionEntrega: {
      direccion: "",
      ciudad: "Medellín",
      departamento: "Antioquia",
      codigoPostal: "",
      instrucciones: "",
    },
    observaciones: "",
    repartidor: "",
    tiempoEstimadoEntrega: 30,
  });
  const [selectedProductos, setSelectedProductos] = useState<
    Array<{
      producto: ProductoInventario;
      cantidad: number;
    }>
  >([]);

  // Estados para editar pedido
  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);
  const [editingPedido, setEditingPedido] =
    useState<Pedido | null>(null);
  const [editingData, setEditingData] = useState({
    estado: "",
    metodoPago: "",
    direccionEntrega: {
      direccion: "",
      ciudad: "",
      departamento: "",
      codigoPostal: "",
      instrucciones: "",
    },
    observaciones: "",
    repartidor: "",
    tiempoEstimadoEntrega: 30,
  });
  const [
    editingSelectedProductos,
    setEditingSelectedProductos,
  ] = useState<
    Array<{
      producto: ProductoInventario;
      cantidad: number;
    }>
  >([]);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch =
      `${pedido.cliente.nombre} ${pedido.cliente.apellido}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pedido.cliente.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || pedido.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Cálculos de paginación
  const totalPages = Math.max(
    Math.ceil(filteredPedidos.length / itemsPerPage),
    1,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPedidos = filteredPedidos.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Actualizar página actual cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "entregado":
        return "bg-blue-600";
      case "pendiente":
        return "bg-gray-700";
      case "cancelado":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "entregado":
        return <CheckCircle className="h-4 w-4" />;
      case "pendiente":
        return <Clock className="h-4 w-4" />;
      case "cancelado":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (metodo: string) => {
    switch (metodo) {
      case "Efectivo":
        return "💵";
      case "Tarjeta Crédito":
        return "💳";
      case "Tarjeta Débito":
        return "💳";
      case "Transferencia":
        return "🏦";
      case "PSE":
        return "🏛️";
      case "Nequi":
        return "📱";
      case "Daviplata":
        return "📱";
      default:
        return "💰";
    }
  };

  // Función para exportar PDF
  const handleExportToPDF = (pedido: Pedido) => {
    const doc = new jsPDF();

    // Configuración inicial
    doc.setFont("helvetica");
    let yPosition = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.width;
    const leftMargin = 20;
    const rightMargin = 20;
    const maxWidth = pageWidth - leftMargin - rightMargin;

    // Función para agregar texto con salto de línea automático
    const addWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      fontSize = 10,
    ) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * lineHeight;
    };

    // Función para agregar título
    const addTitle = (title: string, y: number) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, leftMargin, y);
      doc.setFont("helvetica", "normal");
      return y + lineHeight + 2;
    };

    // Función para agregar línea separadora
    const addSeparator = (y: number) => {
      doc.line(leftMargin, y, pageWidth - rightMargin, y);
      return y + 5;
    };

    // Título principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PEDIDO", leftMargin, yPosition);
    yPosition += 15;

    yPosition = addSeparator(yPosition);

    // Información del cliente
    yPosition = addTitle("INFORMACIÓN DEL CLIENTE", yPosition);
    yPosition = addWrappedText(
      `Nombre: ${pedido.cliente.nombre} ${pedido.cliente.apellido}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Email: ${pedido.cliente.email}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Teléfono: ${pedido.cliente.telefono || "No especificado"}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition += 5;

    // Información del pedido
    yPosition = addTitle("INFORMACIÓN DEL PEDIDO", yPosition);
    yPosition = addWrappedText(
      `Fecha: ${pedido.fechaPedido.toLocaleDateString()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Estado: ${pedido.estado.toUpperCase()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Método de Pago: ${pedido.metodoPago}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    if (pedido.fechaEntregaEstimada) {
      yPosition = addWrappedText(
        `Fecha Entrega Estimada: ${pedido.fechaEntregaEstimada.toLocaleDateString()}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
    }
    yPosition += 5;

    // Productos
    if (pedido.productos && pedido.productos.length > 0) {
      yPosition = addTitle("PRODUCTOS", yPosition);
      pedido.productos.forEach((producto) => {
        if (yPosition > 250) {
          // Nueva página si es necesario
          doc.addPage();
          yPosition = 20;
        }
        yPosition = addWrappedText(
          `• ${producto.nombre}`,
          leftMargin,
          yPosition,
          maxWidth,
        );
        yPosition = addWrappedText(
          `  Cantidad: ${producto.cantidad}`,
          leftMargin + 5,
          yPosition,
          maxWidth - 5,
        );
        yPosition = addWrappedText(
          `  Precio: ${producto.precio.toLocaleString()}`,
          leftMargin + 5,
          yPosition,
          maxWidth - 5,
        );
        yPosition = addWrappedText(
          `  Subtotal: ${producto.subtotal.toLocaleString()}`,
          leftMargin + 5,
          yPosition,
          maxWidth - 5,
        );
        yPosition += 3;
      });
      yPosition += 5;
    }

    // Totales
    yPosition = addTitle("TOTALES", yPosition);
    yPosition = addWrappedText(
      `Subtotal: ${pedido.subtotal.toLocaleString()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    if (pedido.descuento) {
      yPosition = addWrappedText(
        `Descuento: -${pedido.descuento.toLocaleString()}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
    }
    if (pedido.costoEnvio) {
      yPosition = addWrappedText(
        `Costo de Envío: ${pedido.costoEnvio.toLocaleString()}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
    }
    yPosition = addWrappedText(
      `TOTAL: ${pedido.total.toLocaleString()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition += 5;

    // Dirección de entrega
    if (pedido.direccionEntrega) {
      if (yPosition > 230) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addTitle("DIRECCIÓN DE ENTREGA", yPosition);
      yPosition = addWrappedText(
        `${pedido.direccionEntrega.direccion}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
      yPosition = addWrappedText(
        `${pedido.direccionEntrega.ciudad}, ${pedido.direccionEntrega.departamento}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
      if (pedido.direccionEntrega.codigoPostal) {
        yPosition = addWrappedText(
          `Código Postal: ${pedido.direccionEntrega.codigoPostal}`,
          leftMargin,
          yPosition,
          maxWidth,
        );
      }
      if (pedido.direccionEntrega.instrucciones) {
        yPosition = addWrappedText(
          `Instrucciones: ${pedido.direccionEntrega.instrucciones}`,
          leftMargin,
          yPosition,
          maxWidth,
        );
      }
      yPosition += 5;
    }

    // Observaciones
    if (pedido.observaciones) {
      if (yPosition > 230) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addTitle("OBSERVACIONES", yPosition);
      yPosition = addWrappedText(
        pedido.observaciones,
        leftMargin,
        yPosition,
        maxWidth,
      );
      yPosition += 5;
    }

    // Información adicional
    if (pedido.repartidor || pedido.tiempoEstimadoEntrega) {
      if (yPosition > 240) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addTitle("INFORMACIÓN DE ENTREGA", yPosition);
      if (pedido.repartidor) {
        yPosition = addWrappedText(
          `Repartidor: ${pedido.repartidor}`,
          leftMargin,
          yPosition,
          maxWidth,
        );
      }
      if (pedido.tiempoEstimadoEntrega) {
        yPosition = addWrappedText(
          `Tiempo Estimado: ${pedido.tiempoEstimadoEntrega} minutos`,
          leftMargin,
          yPosition,
          maxWidth,
        );
      }
      yPosition += 5;
    }

    // Pie de página
    if (yPosition > 250) {
      // Nueva página si es necesario
      doc.addPage();
      yPosition = 20;
    }
    yPosition = addSeparator(yPosition);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
      leftMargin,
      yPosition,
    );

    // Descargar el PDF
    doc.save(`Pedido_${pedido.id}.pdf`);

    toast.success("PDF exportado", {
      description: `El pedido se ha descargado exitosamente.`,
    });
  };

  const handleDetallePedido = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setShowDetallePedido(true);
  };

  const handleCambiarEstado = (pedido: Pedido) => {
    setPedidoToUpdate(pedido);
    setNewStatus(pedido.estado);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (pedidoToUpdate && newStatus) {
      const updatedPedidos = pedidos.map((p) =>
        p.id === pedidoToUpdate.id
          ? { ...p, estado: newStatus }
          : p,
      );
      setPedidos(updatedPedidos);
      setIsStatusDialogOpen(false);
      setPedidoToUpdate(null);
      setNewStatus("");

      toast.success("Estado actualizado", {
        description: `El pedido ahora está ${newStatus}.`,
      });
    }
  };

  // Funciones para editar pedido
  const handleEditPedido = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setEditingData({
      estado: pedido.estado,
      metodoPago: pedido.metodoPago,
      direccionEntrega: {
        direccion: pedido.direccionEntrega?.direccion || "",
        ciudad: pedido.direccionEntrega?.ciudad || "",
        departamento:
          pedido.direccionEntrega?.departamento || "",
        codigoPostal:
          pedido.direccionEntrega?.codigoPostal || "",
        instrucciones:
          pedido.direccionEntrega?.instrucciones || "",
      },
      observaciones: pedido.observaciones || "",
      repartidor: pedido.repartidor || "",
      tiempoEstimadoEntrega: pedido.tiempoEstimadoEntrega || 30,
    });

    // Convertir productos del pedido a formato editable
    const productosEditables = pedido.productos.map((prod) => {
      const productoInventario = productosInventario.find(
        (p) => p.id === prod.id,
      );
      if (productoInventario) {
        return {
          producto: productoInventario,
          cantidad: prod.cantidad,
        };
      }
      // Si no se encuentra en inventario, crear un objeto temporal
      return {
        producto: {
          id: prod.id,
          nombre: prod.nombre,
          categoria: prod.categoria,
          precio: prod.precio,
          stock: 100, // Valor por defecto
          imagen: prod.imagen || "",
        } as ProductoInventario,
        cantidad: prod.cantidad,
      };
    });

    setEditingSelectedProductos(productosEditables);
    setIsEditDialogOpen(true);
  };

  const handleAddProductoToEdit = (
    producto: ProductoInventario,
  ) => {
    const exists = editingSelectedProductos.find(
      (p) => p.producto.id === producto.id,
    );
    if (exists) {
      setEditingSelectedProductos((prev) =>
        prev.map((p) =>
          p.producto.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p,
        ),
      );
    } else {
      setEditingSelectedProductos((prev) => [
        ...prev,
        { producto, cantidad: 1 },
      ]);
    }
  };

  const handleRemoveProductoFromEdit = (productoId: string) => {
    setEditingSelectedProductos((prev) =>
      prev.filter((p) => p.producto.id !== productoId),
    );
  };

  const handleUpdateCantidadEdit = (
    productoId: string,
    cantidad: number,
  ) => {
    if (cantidad <= 0) {
      handleRemoveProductoFromEdit(productoId);
      return;
    }
    setEditingSelectedProductos((prev) =>
      prev.map((p) =>
        p.producto.id === productoId ? { ...p, cantidad } : p,
      ),
    );
  };

  const calculateEditSubtotal = () => {
    return editingSelectedProductos.reduce(
      (sum, item) => sum + item.producto.precio * item.cantidad,
      0,
    );
  };

  const calculateEditTotal = () => {
    const subtotal = calculateEditSubtotal();
    const costoEnvio = 8000; // Costo fijo de envío
    return subtotal + costoEnvio;
  };

  const handleSaveEditPedido = () => {
    if (
      !editingPedido ||
      editingSelectedProductos.length === 0
    ) {
      toast.error("Error", {
        description:
          "Debe tener al menos un producto en el pedido.",
      });
      return;
    }

    const subtotal = calculateEditSubtotal();
    const costoEnvio = 8000;
    const total = calculateEditTotal();

    const pedidoActualizado: Pedido = {
      ...editingPedido,
      estado: editingData.estado,
      metodoPago: editingData.metodoPago,
      productos: editingSelectedProductos.map((item) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        categoria: item.producto.categoria,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        subtotal: item.producto.precio * item.cantidad,
        imagen: item.producto.imagen,
        especificaciones: item.producto.especificaciones || {},
      })),
      subtotal,
      costoEnvio,
      total,
      direccionEntrega: editingData.direccionEntrega,
      observaciones: editingData.observaciones,
      repartidor: editingData.repartidor,
      tiempoEstimadoEntrega: editingData.tiempoEstimadoEntrega,
    };

    setPedidos((prev) =>
      prev.map((p) =>
        p.id === editingPedido.id ? pedidoActualizado : p,
      ),
    );
    setIsEditDialogOpen(false);
    setEditingPedido(null);
    setEditingSelectedProductos([]);

    toast.success("Pedido actualizado", {
      description: `El pedido ha sido actualizado exitosamente.`,
    });
  };

  const handleVerAbonos = (pedido: Pedido) => {
    setSelectedPedidoForAbonos(pedido);
    setShowAbonosIndividuales(true);
  };

  // Función auxiliar para obtener el número de pedido display
  const getPedidoNumeroDisplay = (pedido: Pedido) => {
    return pedido.numeroPedido || `Pedido #${pedido.id}`;
  };

  // Funciones para crear pedido
  const handleCreatePedido = () => {
    setIsCreateDialogOpen(true);
  };

  const handleAddProducto = (producto: ProductoInventario) => {
    const exists = selectedProductos.find(
      (p) => p.producto.id === producto.id,
    );
    if (exists) {
      setSelectedProductos((prev) =>
        prev.map((p) =>
          p.producto.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p,
        ),
      );
    } else {
      setSelectedProductos((prev) => [
        ...prev,
        { producto, cantidad: 1 },
      ]);
    }
  };

  const handleRemoveProducto = (productoId: string) => {
    setSelectedProductos((prev) =>
      prev.filter((p) => p.producto.id !== productoId),
    );
  };

  const handleUpdateCantidad = (
    productoId: string,
    cantidad: number,
  ) => {
    if (cantidad <= 0) {
      handleRemoveProducto(productoId);
      return;
    }
    setSelectedProductos((prev) =>
      prev.map((p) =>
        p.producto.id === productoId ? { ...p, cantidad } : p,
      ),
    );
  };

  const calculateSubtotal = () => {
    return selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio * item.cantidad,
      0,
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const costoEnvio = 8000; // Costo fijo de envío
    return subtotal + costoEnvio;
  };

  const handleSavePedido = () => {
    if (!newPedido.cliente || selectedProductos.length === 0) {
      toast.error("Error", {
        description:
          "Debe seleccionar un cliente y al menos un producto.",
      });
      return;
    }

    const clienteSeleccionado = mockClientes.find(
      (c) => c.id === newPedido.cliente,
    );
    if (!clienteSeleccionado) {
      toast.error("Error", {
        description: "Cliente no encontrado.",
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const costoEnvio = 8000;
    const total = calculateTotal();

    const nuevoPedido: Pedido = {
      id: (pedidos.length + 1).toString(),
      cliente: clienteSeleccionado,
      fechaPedido: new Date(),
      fechaEntregaEstimada: new Date(
        Date.now() +
          newPedido.tiempoEstimadoEntrega * 60 * 1000,
      ),
      estado: "pendiente",
      metodoPago: newPedido.metodoPago,
      productos: selectedProductos.map((item) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        categoria: item.producto.categoria,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        subtotal: item.producto.precio * item.cantidad,
        imagen: item.producto.imagen,
        especificaciones: item.producto.especificaciones || {},
      })),
      subtotal,
      costoEnvio,
      total,
      direccionEntrega: newPedido.direccionEntrega,
      observaciones: newPedido.observaciones,
      repartidor: newPedido.repartidor,
      tiempoEstimadoEntrega: newPedido.tiempoEstimadoEntrega,
    };

    setPedidos((prev) => [...prev, nuevoPedido]);
    setIsCreateDialogOpen(false);

    // Resetear formulario
    setNewPedido({
      cliente: "",
      metodoPago: "",
      productos: [],
      direccionEntrega: {
        direccion: "",
        ciudad: "Medellín",
        departamento: "Antioquia",
        codigoPostal: "",
        instrucciones: "",
      },
      observaciones: "",
      repartidor: "",
      tiempoEstimadoEntrega: 30,
    });
    setSelectedProductos([]);

    toast.success("Pedido creado", {
      description: `El pedido ha sido creado exitosamente.`,
    });
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({rating}/5)
        </span>
      </div>
    );
  };

  if (showAbonosIndividuales && selectedPedidoForAbonos) {
    return (
      <AbonosIndividuales
        pedidoId={getPedidoNumeroDisplay(selectedPedidoForAbonos)}
        onBack={() => {
          setShowAbonosIndividuales(false);
          setSelectedPedidoForAbonos(null);
        }}
      />
    );
  }

  if (showDetallePedido && selectedPedido) {
    return (
      <DetallePedido
        pedido={selectedPedido}
        onVolver={() => {
          setShowDetallePedido(false);
          setSelectedPedido(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Card principal con todo integrado */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Gestión de Pedidos</CardTitle>
              <CardDescription>
                Administra todos los pedidos de tus clientes
              </CardDescription>
            </div>
            <Button
              onClick={handleCreatePedido}
              className="text-[12px] text-[rgb(255,255,255)] bg-[rgb(21,93,252)] hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o email..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="pendiente">
                    Pendiente
                  </SelectItem>
                  <SelectItem value="entregado">
                    Entregado
                  </SelectItem>
                  <SelectItem value="cancelado">
                    Cancelado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="border rounded-lg overflow-x-auto">
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
                {paginatedPedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <div className="font-medium">
                        {pedido.cliente.nombre}{" "}
                        {pedido.cliente.apellido}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pedido.fechaPedido.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${pedido.total.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(pedido.estado)} text-white flex items-center space-x-1 w-fit`}
                      >
                        {getStatusIcon(pedido.estado)}
                        <span className="capitalize">
                          {pedido.estado}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDetallePedido(pedido)
                          }
                          title="Ver detalles del pedido"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEditPedido(pedido)
                          }
                          title="Editar pedido"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportToPDF(pedido)
                          }
                          title="Exportar a PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleVerAbonos(pedido)
                          }
                          title="Ver abonos"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando{" "}
              {Math.min(startIndex + 1, filteredPedidos.length)}{" "}
              a{" "}
              {Math.min(
                startIndex + itemsPerPage,
                filteredPedidos.length,
              )}{" "}
              de {filteredPedidos.length} pedidos
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1),
                  )
                }
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages),
                  )
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear pedido */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] modal-scroll overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-6 w-6" />
              <span>Crear Nuevo Pedido</span>
            </DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo pedido
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="cliente" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cliente">Cliente</TabsTrigger>
              <TabsTrigger value="productos">Productos</TabsTrigger>
              <TabsTrigger value="entrega">Entrega</TabsTrigger>
            </TabsList>

            {/* PESTAÑA 1: CLIENTE */}
            <TabsContent value="cliente" className="space-y-6">
              {/* Información básica del pedido */}
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Fecha del Pedido</Label>
                  <Input
                    value={new Date().toLocaleDateString("es-ES")}
                    disabled
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Información del cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Información del Cliente
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Select
                      value={newPedido.cliente}
                      onValueChange={(value) => {
                        const cliente = mockClientes.find(
                          (c) => c.id === value,
                        );
                        if (cliente) {
                          setNewPedido((prev) => ({
                            ...prev,
                            cliente: value,
                            direccionEntrega: {
                              direccion: cliente.direccion,
                              ciudad: cliente.ciudad,
                              departamento:
                                prev.direccionEntrega
                                  .departamento,
                              codigoPostal:
                                prev.direccionEntrega
                                  .codigoPostal,
                              instrucciones:
                                prev.direccionEntrega
                                  .instrucciones,
                            },
                          }));
                        } else {
                          setNewPedido((prev) => ({
                            ...prev,
                            cliente: value,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClientes.map((cliente) => (
                          <SelectItem
                            key={cliente.id}
                            value={cliente.id}
                          >
                            {cliente.nombre} {cliente.apellido} -{" "}
                            {cliente.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newPedido.cliente &&
                    (() => {
                      const cliente = mockClientes.find(
                        (c) => c.id === newPedido.cliente,
                      );
                      return cliente ? (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500">
                                Nombre Completo
                              </Label>
                              <p className="font-medium">
                                {cliente.nombre}{" "}
                                {cliente.apellido}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Email
                              </Label>
                              <p className="text-sm text-gray-700">
                                {cliente.email}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Teléfono
                              </Label>
                              <p className="text-sm text-gray-700">
                                {cliente.telefono}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Dirección
                              </Label>
                              <p className="text-sm text-gray-700">
                                {cliente.direccion}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                Ciudad
                              </Label>
                              <p className="text-sm text-gray-700">
                                {cliente.ciudad}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                País
                              </Label>
                              <p className="text-sm text-gray-700">
                                {cliente.pais}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                </div>
              </div>
            </TabsContent>

            {/* PESTAÑA 2: PRODUCTOS */}
            <TabsContent value="productos" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Productos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seleccionar Producto *</Label>
                    <Select
                      onValueChange={(value) => {
                        const producto = productosInventario.find(
                          (p) => p.id === value,
                        );
                        if (producto) handleAddProducto(producto);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productosInventario.map((producto) => (
                          <SelectItem
                            key={producto.id}
                            value={producto.id}
                          >
                            {producto.nombre} - $
                            {producto.precio.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Pago *</Label>
                    <Select
                      value={newPedido.metodoPago}
                      onValueChange={(value) =>
                        setNewPedido((prev) => ({
                          ...prev,
                          metodoPago: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">
                          💵 Efectivo
                        </SelectItem>
                        <SelectItem value="Transferencia">
                          🏦 Transferencia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lista de productos seleccionados */}
                {selectedProductos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Productos Seleccionados
                    </h4>
                    <div className="space-y-2">
                      {selectedProductos.map((item) => (
                        <div
                          key={item.producto.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.producto.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              $
                              {item.producto.precio.toLocaleString()}{" "}
                              c/u
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateCantidad(
                                  item.producto.id,
                                  item.cantidad - 1,
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.cantidad}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateCantidad(
                                  item.producto.id,
                                  item.cantidad + 1,
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveProducto(
                                  item.producto.id,
                                )
                              }
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <span className="min-w-20 text-right font-semibold">
                              $
                              {(
                                item.producto.precio *
                                item.cantidad
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen de totales */}
                {selectedProductos.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          ${calculateSubtotal().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío:</span>
                        <span>$8,000</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>
                          ${calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* PESTAÑA 3: ENTREGA */}
            <TabsContent value="entrega" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Información de Entrega (Opcional)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Los datos del cliente se autocompletarán.
                    Puede modificarlos si es necesario.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input
                      placeholder="Dirección completa"
                      value={newPedido.direccionEntrega.direccion}
                      onChange={(e) =>
                        setNewPedido((prev) => ({
                          ...prev,
                          direccionEntrega: {
                            ...prev.direccionEntrega,
                            direccion: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      placeholder="Ciudad"
                      value={newPedido.direccionEntrega.ciudad}
                      onChange={(e) =>
                        setNewPedido((prev) => ({
                          ...prev,
                          direccionEntrega: {
                            ...prev.direccionEntrega,
                            ciudad: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input
                      placeholder="Departamento"
                      value={
                        newPedido.direccionEntrega.departamento
                      }
                      onChange={(e) =>
                        setNewPedido((prev) => ({
                          ...prev,
                          direccionEntrega: {
                            ...prev.direccionEntrega,
                            departamento: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instrucciones de Entrega</Label>
                    <Input
                      placeholder="Instrucciones especiales"
                      value={
                        newPedido.direccionEntrega.instrucciones
                      }
                      onChange={(e) =>
                        setNewPedido((prev) => ({
                          ...prev,
                          direccionEntrega: {
                            ...prev.direccionEntrega,
                            instrucciones: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Input
                  placeholder="Observaciones adicionales del pedido"
                  value={newPedido.observaciones}
                  onChange={(e) =>
                    setNewPedido((prev) => ({
                      ...prev,
                      observaciones: e.target.value,
                    }))
                  }
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSavePedido}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar estado */}
      <Dialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Pedido</DialogTitle>
            <DialogDescription>
              Seleccione el nuevo estado para este pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">
                    Pendiente
                  </SelectItem>
                  <SelectItem value="entregado">
                    Entregado
                  </SelectItem>
                  <SelectItem value="cancelado">
                    Cancelado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus}>
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar pedido */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] modal-scroll overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit3 className="h-6 w-6" />
              <span>Editar Pedido</span>
            </DialogTitle>
            <DialogDescription>
              {editingData.estado === "pendiente"
                ? "Puede editar todos los campos del pedido mientras está en estado pendiente"
                : "El pedido está finalizado. Solo puede cambiar el estado."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Estado del pedido - Siempre activo */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <Label>Estado del Pedido *</Label>
                <Select
                  value={editingData.estado}
                  onValueChange={(value) =>
                    setEditingData((prev) => ({
                      ...prev,
                      estado: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">
                      Pendiente
                    </SelectItem>
                    <SelectItem value="entregado">
                      Entregado
                    </SelectItem>
                    <SelectItem value="cancelado">
                      Cancelado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información básica del pedido */}
            <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>Fecha del Pedido</Label>
                <Input
                  value={
                    editingPedido?.fechaPedido.toLocaleDateString(
                      "es-ES",
                    ) || ""
                  }
                  disabled
                  className="bg-white"
                />
              </div>
            </div>

            <Separator />

            {/* Información del cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Información del Cliente
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">
                      Nombre Completo
                    </Label>
                    <p className="font-medium">
                      {editingPedido?.cliente.nombre}{" "}
                      {editingPedido?.cliente.apellido}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Email
                    </Label>
                    <p className="text-sm text-gray-700">
                      {editingPedido?.cliente.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Teléfono
                    </Label>
                    <p className="text-sm text-gray-700">
                      {editingPedido?.cliente.telefono ||
                        "No especificado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de Pago *</Label>
              <Select
                value={editingData.metodoPago}
                onValueChange={(value) =>
                  setEditingData((prev) => ({
                    ...prev,
                    metodoPago: value,
                  }))
                }
                disabled={editingData.estado !== "pendiente"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">
                    💵 Efectivo
                  </SelectItem>
                  <SelectItem value="Transferencia">
                    🏦 Transferencia
                  </SelectItem>
                  <SelectItem value="Tarjeta Crédito">
                    💳 Tarjeta Crédito
                  </SelectItem>
                  <SelectItem value="PSE">🏛️ PSE</SelectItem>
                  <SelectItem value="Nequi">
                    📱 Nequi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Productos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Productos
              </h3>

              {editingData.estado === "pendiente" && (
                <div className="space-y-2">
                  <Label>Agregar Producto</Label>
                  <Select
                    onValueChange={(value) => {
                      const producto = productosInventario.find(
                        (p) => p.id === value,
                      );
                      if (producto)
                        handleAddProductoToEdit(producto);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productosInventario.map((producto) => (
                        <SelectItem
                          key={producto.id}
                          value={producto.id}
                        >
                          {producto.nombre} - $
                          {producto.precio.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lista de productos seleccionados */}
              {editingSelectedProductos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">
                    Productos en el Pedido
                  </h4>
                  <div className="space-y-2">
                    {editingSelectedProductos.map((item) => (
                      <div
                        key={item.producto.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.producto.nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            $
                            {item.producto.precio.toLocaleString()}{" "}
                            c/u
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateCantidadEdit(
                                item.producto.id,
                                item.cantidad - 1,
                              )
                            }
                            disabled={
                              editingData.estado !== "pendiente"
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.cantidad}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateCantidadEdit(
                                item.producto.id,
                                item.cantidad + 1,
                              )
                            }
                            disabled={
                              editingData.estado !== "pendiente"
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          {editingData.estado ===
                            "pendiente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRemoveProductoFromEdit(
                                  item.producto.id,
                                )
                              }
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          <span className="min-w-20 text-right font-semibold">
                            $
                            {(
                              item.producto.precio *
                              item.cantidad
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de totales */}
              {editingSelectedProductos.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        $
                        {calculateEditSubtotal().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío:</span>
                      <span>$8,000</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>
                        ${calculateEditTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Información de entrega */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Información de Entrega
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    placeholder="Dirección completa"
                    value={
                      editingData.direccionEntrega.direccion
                    }
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        direccionEntrega: {
                          ...prev.direccionEntrega,
                          direccion: e.target.value,
                        },
                      }))
                    }
                    disabled={
                      editingData.estado !== "pendiente"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    placeholder="Ciudad"
                    value={editingData.direccionEntrega.ciudad}
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        direccionEntrega: {
                          ...prev.direccionEntrega,
                          ciudad: e.target.value,
                        },
                      }))
                    }
                    disabled={
                      editingData.estado !== "pendiente"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Input
                    placeholder="Departamento"
                    value={
                      editingData.direccionEntrega.departamento
                    }
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        direccionEntrega: {
                          ...prev.direccionEntrega,
                          departamento: e.target.value,
                        },
                      }))
                    }
                    disabled={
                      editingData.estado !== "pendiente"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instrucciones de Entrega</Label>
                  <Input
                    placeholder="Instrucciones especiales"
                    value={
                      editingData.direccionEntrega.instrucciones
                    }
                    onChange={(e) =>
                      setEditingData((prev) => ({
                        ...prev,
                        direccionEntrega: {
                          ...prev.direccionEntrega,
                          instrucciones: e.target.value,
                        },
                      }))
                    }
                    disabled={
                      editingData.estado !== "pendiente"
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Observaciones */}
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Input
                placeholder="Observaciones adicionales del pedido"
                value={editingData.observaciones}
                onChange={(e) =>
                  setEditingData((prev) => ({
                    ...prev,
                    observaciones: e.target.value,
                  }))
                }
                disabled={editingData.estado !== "pendiente"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEditPedido}>
              <Edit3 className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
