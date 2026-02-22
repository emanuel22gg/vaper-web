import React, { useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { TablePagination } from './ui/TablePagination';
import { Devolucion } from "../types";
import { DetalleDevolucion } from "./DetalleDevolucion";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Edit3,
  X,
  Calendar,
  DollarSign,
  Package,
  ShoppingBag,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Plus,
  Phone,
  Mail,
  Trash2,
  Download,
} from "lucide-react";

const mockDevoluciones: Devolucion[] = [
  {
    id: "1",
    numeroDevolucion: "DEV-2024-001",
    cliente: {
      id: "c1",
      nombre: "María",
      apellido: "González",
      email: "maria.gonzalez@email.com",
      telefono: "+57 300 123 4567",
      fechaRegistro: new Date("2024-01-15"),
      totalCompras: 5,
      activo: true,
    },
    pedido: {
      id: "1",
      numeroPedido: "VEN-2024-001",
    },
    fechaDevolucion: new Date("2024-03-20T10:30:00"),
    fechaSolicitud: new Date("2024-03-19T14:00:00"),
    estado: "Aceptada",
    motivo: "Producto defectuoso",
    descripcion:
      "El vape no funciona correctamente, no produce vapor",
    productos: [
      {
        id: "p1",
        nombre: "Vape Desechable Snoopy Smoke 15000 puffs",
        categoria: "Desechables",
        precio: 45000,
        cantidad: 1,
        cantidadDevolver: 1,
        motivoDevolucion: "Producto defectuoso",
        estadoProducto: "Defectuoso",
      },
    ],
    montoTotal: 45000,
    notaCredito: {
      id: "nc1",
      numeroNota: "NC-2024-001",
      estado: "Pendiente",
      monto: 0,
      fechaCreacion: new Date("2024-03-20"),
    },
    observacionesInternas:
      "Cliente reporta que el producto llegó defectuoso",
  },
  {
    id: "2",
    numeroDevolucion: "DEV-2024-002",
    cliente: {
      id: "c2",
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan.perez@email.com",
      telefono: "+57 310 987 6543",
      fechaRegistro: new Date("2024-02-10"),
      totalCompras: 3,
      activo: true,
    },
    pedido: {
      id: "2",
      numeroPedido: "VEN-2024-002",
    },
    fechaDevolucion: new Date("2024-03-18T16:45:00"),
    fechaSolicitud: new Date("2024-03-17T09:30:00"),
    estado: "Aceptada",
    motivo: "Sabor incorrecto",
    descripcion: "Pedí sabor menta pero recibí sabor frutal",
    productos: [
      {
        id: "p2",
        nombre: "Líquido Premium Frutal 60ml",
        categoria: "Líquidos",
        precio: 55000,
        cantidad: 1,
        cantidadDevolver: 1,
        motivoDevolucion: "Producto incorrecto",
        estadoProducto: "Nuevo",
      },
    ],
    montoTotal: 55000,
    montoAprobado: 55000,
    notaCredito: {
      id: "nc2",
      numeroNota: "NC-2024-002",
      estado: "Pagada",
      monto: 55000,
      fechaCreacion: new Date("2024-03-18"),
      fechaPago: new Date("2024-03-19"),
    },
    procesadoPor: "Admin",
    fechaProceso: new Date("2024-03-18T17:00:00"),
  },
  {
    id: "3",
    numeroDevolucion: "DEV-2024-003",
    cliente: {
      id: "c3",
      nombre: "Ana",
      apellido: "López",
      email: "ana.lopez@email.com",
      telefono: "+57 320 456 7890",
      fechaRegistro: new Date("2024-01-20"),
      totalCompras: 8,
      activo: true,
    },
    pedido: {
      id: "3",
      numeroPedido: "VEN-2024-003",
    },
    fechaDevolucion: new Date("2024-03-15T11:20:00"),
    fechaSolicitud: new Date("2024-03-14T13:15:00"),
    estado: "Anulada",
    motivo: "No me gustó el sabor",
    descripcion:
      "El sabor no es de mi agrado, quiero cambiarlo",
    productos: [
      {
        id: "p3",
        nombre: "Pod System Premium Kit",
        categoria: "Pods",
        precio: 120000,
        cantidad: 1,
        cantidadDevolver: 1,
        motivoDevolucion: "Preferencia personal",
        estadoProducto: "Usado",
      },
    ],
    montoTotal: 120000,
    montoAprobado: 0,
    notaCredito: {
      id: "nc3",
      numeroNota: "NC-2024-003",
      estado: "No Aplica",
      monto: 0,
      fechaCreacion: new Date("2024-03-15"),
    },
    procesadoPor: "Admin",
    fechaProceso: new Date("2024-03-15T12:00:00"),
    observacionesInternas:
      "Política de devoluciones no permite cambios por preferencia personal en productos usados",
  },
];

// Datos mock para el modal
const mockClientes = [
  {
    id: "c1",
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@email.com",
    telefono: "+57 300 123 4567",
  },
  {
    id: "c2",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    telefono: "+57 310 987 6543",
  },
  {
    id: "c3",
    nombre: "Ana",
    apellido: "López",
    email: "ana.lopez@email.com",
    telefono: "+57 320 456 7890",
  },
  {
    id: "c4",
    nombre: "Roberto",
    apellido: "Silva",
    email: "roberto.silva@email.com",
    telefono: "+57 315 789 0123",
  },
  {
    id: "c5",
    nombre: "Carmen",
    apellido: "Ruiz",
    email: "carmen.ruiz@email.com",
    telefono: "+57 320 555 0123",
  },
  {
    id: "c6",
    nombre: "Diego",
    apellido: "Vargas",
    email: "diego.vargas@email.com",
    telefono: "+57 300 111 2233",
  },
  {
    id: "c7",
    nombre: "Lucia",
    apellido: "Morales",
    email: "lucia.morales@email.com",
    telefono: "+57 310 222 3344",
  },
  {
    id: "c8",
    nombre: "Fernando",
    apellido: "Castro",
    email: "fernando.castro@email.com",
    telefono: "+57 320 333 4455",
  },
  {
    id: "c9",
    nombre: "Patricia",
    apellido: "Jiménez",
    email: "patricia.jimenez@email.com",
    telefono: "+57 315 444 5566",
  },
  {
    id: "c10",
    nombre: "Ricardo",
    apellido: "Mendez",
    email: "ricardo.mendez@email.com",
    telefono: "+57 300 555 6677",
  },
];

const mockVentas = [
  {
    id: "1",
    numeroVenta: "VEN-2024-001",
    cliente: "Diego Vargas",
    fecha: "2024-03-10",
    total: 75000,
    productos: [
      {
        id: "p1",
        nombre: "Vape Desechable Snoopy Smoke 15000 puffs",
        precio: 45000,
        cantidad: 1,
      },
      {
        id: "p6",
        nombre: "Batería 18650 3000mAh",
        precio: 30000,
        cantidad: 1,
      },
    ],
  },
  {
    id: "2",
    numeroVenta: "VEN-2024-002",
    cliente: "Lucia Morales",
    fecha: "2024-03-11",
    total: 120000,
    productos: [
      {
        id: "p3",
        nombre: "Pod System Premium Kit",
        precio: 120000,
        cantidad: 1,
      },
    ],
  },
  {
    id: "3",
    numeroVenta: "VEN-2024-003",
    cliente: "Fernando Castro",
    fecha: "2024-03-12",
    total: 95000,
    productos: [
      {
        id: "p2",
        nombre: "Líquido Premium Frutal 60ml",
        precio: 55000,
        cantidad: 1,
      },
      {
        id: "p5",
        nombre: "Coils Reemplazo Pack x5",
        precio: 40000,
        cantidad: 1,
      },
    ],
  },
  {
    id: "4",
    numeroVenta: "VEN-2024-004",
    cliente: "Patricia Jiménez",
    fecha: "2024-03-13",
    total: 160000,
    productos: [
      {
        id: "p4",
        nombre: "Mod Avanzado 100W",
        precio: 135000,
        cantidad: 1,
      },
      {
        id: "p7",
        nombre: "Cargador Universal USB-C",
        precio: 25000,
        cantidad: 1,
      },
    ],
  },
  {
    id: "5",
    numeroVenta: "VEN-2024-005",
    cliente: "Ricardo Mendez",
    fecha: "2024-03-14",
    total: 45000,
    productos: [
      {
        id: "p1",
        nombre: "Vape Desechable Snoopy Smoke 15000 puffs",
        precio: 45000,
        cantidad: 1,
      },
    ],
  },
];

const motivosDevolucion = [
  "Producto defectuoso",
  "Producto incorrecto",
  "No me gustó el sabor",
  "Problemas de calidad",
  "Llegó dañado",
  "No es lo que esperaba",
  "Preferencia personal",
  "Problema con la batería",
  "Sabor incorrecto",
  "Otro motivo",
];

const mockProductosDisponibles = [
  {
    id: "p1",
    nombre: "Vape Desechable Snoopy Smoke 15000 puffs",
    precio: 45000,
    disponible: true,
  },
  {
    id: "p2",
    nombre: "Líquido Premium Frutal 60ml",
    precio: 55000,
    disponible: true,
  },
  {
    id: "p3",
    nombre: "Pod System Premium Kit",
    precio: 120000,
    disponible: false,
  },
  {
    id: "p4",
    nombre: "Mod Avanzado 100W",
    precio: 250000,
    disponible: true,
  },
  {
    id: "p5",
    nombre: "Coils Reemplazo Pack x5",
    precio: 35000,
    disponible: false,
  },
  {
    id: "p6",
    nombre: "Batería 18650 3000mAh",
    precio: 45000,
    disponible: true,
  },
  {
    id: "p7",
    nombre: "Cargador Universal USB-C",
    precio: 25000,
    disponible: true,
  },
];

export const Devoluciones: React.FC = () => {
  const [devoluciones, setDevoluciones] =
    useState<Devolucion[]>(mockDevoluciones);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDevolucion, setSelectedDevolucion] =
    useState<Devolucion | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [currentView, setCurrentView] = useState<
    "list" | "detail"
  >("list");

  // Estados para el modal de nueva devolución
  const [
    isNewDevolucionDialogOpen,
    setIsNewDevolucionDialogOpen,
  ] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: "",
    nombreCliente: "",
    telefonoCliente: "",
    emailCliente: "",
    medioContacto: "Local" as "Local" | "WhatsApp",
    numeroVenta: "",
    descripcionMotivo: "",
    productosSeleccionados: [] as Array<{
      id: string;
      nombre: string;
      precio: number;
      cantidad: number;
      disponible: boolean;
    }>,
    productosVenta: [] as Array<{
      id: string;
      nombre: string;
      precio: number;
      cantidad: number;
    }>,
  });

  const [productoTemporal, setProductoTemporal] = useState({
    productoId: "",
    cantidad: 1,
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Función para generar ID autoincrementable
  const generateNextId = () => {
    const maxId =
      Math.max(...devoluciones.map((d) => parseInt(d.id))) + 1;
    return maxId.toString();
  };

  // Función para generar número de devolución
  const generateDevolucionNumber = () => {
    const maxNumber =
      Math.max(
        ...devoluciones.map((d) => {
          const match =
            d.numeroDevolucion.match(/DEV-2024-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }),
      ) + 1;
    return `DEV-2024-${maxNumber.toString().padStart(3, "0")}`;
  };

  const filteredDevoluciones = devoluciones.filter(
    (devolucion) => {
      const matchesSearch =
        `${devolucion.cliente.nombre} ${devolucion.cliente.apellido}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        devolucion.pedido.id
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        devolucion.cliente.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        devolucion.estado === filterStatus;
      return matchesSearch && matchesStatus;
    },
  );

  // Cálculos de paginación
  const totalPages = Math.ceil(
    filteredDevoluciones.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDevoluciones = filteredDevoluciones.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Actualizar página actual cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Aceptada":
        return "bg-green-500";
      case "Anulada":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Aceptada":
        return <CheckCircle className="h-4 w-4" />;
      case "Anulada":
        return <XCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const handleVerDetalle = (devolucion: Devolucion) => {
    setSelectedDevolucion(devolucion);
    setCurrentView("detail");
  };

  const handleVolverALista = () => {
    setSelectedDevolucion(null);
    setCurrentView("list");
  };

  const handleAnularDevolucion = (devolucion: Devolucion) => {
    const updatedDevoluciones = devoluciones.map((d) =>
      d.id === devolucion.id
        ? {
          ...d,
          estado: "Anulada" as "Aceptada" | "Anulada",
          fechaProceso: new Date(),
          procesadoPor: "Admin",
        }
        : d,
    );
    setDevoluciones(updatedDevoluciones);

    toast.success("Devolución anulada", {
      description: `${devolucion.numeroDevolucion} ha sido anulada exitosamente.`,
    });
  };

  const handleExportarPDF = (devolucion: Devolucion) => {
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
    doc.text("REPORTE DE DEVOLUCIÓN", leftMargin, yPosition);
    yPosition += 15;

    yPosition = addSeparator(yPosition);

    // Información básica
    yPosition = addTitle("INFORMACIÓN BÁSICA", yPosition);
    yPosition = addWrappedText(
      `Número de Devolución: ${devolucion.numeroDevolucion}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Estado: ${devolucion.estado}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Fecha de Devolución: ${devolucion.fechaDevolucion.toLocaleDateString()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Fecha de Solicitud: ${devolucion.fechaSolicitud.toLocaleDateString()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition += 5;

    // Información del cliente
    yPosition = addTitle("INFORMACIÓN DEL CLIENTE", yPosition);
    yPosition = addWrappedText(
      `Nombre: ${devolucion.cliente.nombre} ${devolucion.cliente.apellido}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Email: ${devolucion.cliente.email}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Teléfono: ${devolucion.cliente.telefono}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition += 5;

    // Transacción relacionada
    yPosition = addTitle("TRANSACCIÓN RELACIONADA", yPosition);
    yPosition = addWrappedText(
      `Número: ${devolucion.pedido.numeroPedido}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition = addWrappedText(
      `Tipo: ${devolucion.pedido.numeroPedido.startsWith("PED") ? "Pedido" : "Venta"}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    yPosition += 5;

    // Motivo de devolución
    yPosition = addTitle("MOTIVO DE DEVOLUCIÓN", yPosition);
    if (devolucion.descripcion) {
      yPosition = addWrappedText(
        `Descripción: ${devolucion.descripcion}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
    }
    yPosition += 5;

    // Productos a devolver
    if (
      devolucion.productos &&
      devolucion.productos.length > 0
    ) {
      yPosition = addTitle("PRODUCTOS A DEVOLVER", yPosition);
      devolucion.productos.forEach((producto) => {
        if (yPosition > 250) {
          // Nueva página si es necesario
          doc.addPage();
          yPosition = 20;
        }
        yPosition = addWrappedText(
          `• ${producto.nombre} (${producto.categoria})`,
          leftMargin,
          yPosition,
          maxWidth,
        );
        yPosition = addWrappedText(
          `  Cantidad: ${producto.cantidadDevolver}`,
          leftMargin + 5,
          yPosition,
          maxWidth - 5,
        );
        yPosition = addWrappedText(
          `  Estado: ${producto.estadoProducto}`,
          leftMargin + 5,
          yPosition,
          maxWidth - 5,
        );
        yPosition = addWrappedText(
          `  Precio: $${producto.precio.toLocaleString()}`,
          leftMargin + 5,
          yPosition,
          maxWidth - 5,
        );
        yPosition += 3;
      });
      yPosition += 5;
    }

    // Montos
    yPosition = addTitle("MONTOS", yPosition);
    yPosition = addWrappedText(
      `Monto Total: $${devolucion.montoTotal.toLocaleString()}`,
      leftMargin,
      yPosition,
      maxWidth,
    );
    if (devolucion.montoAprobado !== undefined) {
      yPosition = addWrappedText(
        `Monto Aprobado: $${devolucion.montoAprobado.toLocaleString()}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
    }
    yPosition += 5;

    // Información de procesamiento
    if (devolucion.procesadoPor) {
      if (yPosition > 240) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addTitle(
        "INFORMACIÓN DE PROCESAMIENTO",
        yPosition,
      );
      yPosition = addWrappedText(
        `Procesado por: ${devolucion.procesadoPor}`,
        leftMargin,
        yPosition,
        maxWidth,
      );
      if (devolucion.fechaProceso) {
        yPosition = addWrappedText(
          `Fecha de Proceso: ${devolucion.fechaProceso.toLocaleDateString()}`,
          leftMargin,
          yPosition,
          maxWidth,
        );
      }
      yPosition += 5;
    }

    // Observaciones internas
    if (devolucion.observacionesInternas) {
      if (yPosition > 230) {
        // Nueva página si es necesario
        doc.addPage();
        yPosition = 20;
      }
      yPosition = addTitle("OBSERVACIONES INTERNAS", yPosition);
      yPosition = addWrappedText(
        devolucion.observacionesInternas,
        leftMargin,
        yPosition,
        maxWidth,
      );
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
    doc.save(`Devolucion_${devolucion.numeroDevolucion}.pdf`);

    toast.success("PDF exportado", {
      description: `El reporte de ${devolucion.numeroDevolucion} se ha descargado exitosamente.`,
    });
  };

  // Funciones para el modal de nueva devolución
  const resetForm = () => {
    setFormData({
      clienteId: "",
      nombreCliente: "",
      telefonoCliente: "",
      emailCliente: "",
      medioContacto: "Local",
      numeroVenta: "",
      descripcionMotivo: "",
      productosSeleccionados: [],
      productosVenta: [],
    });
    setProductoTemporal({
      productoId: "",
      cantidad: 1,
    });
  };

  // Función para manejar cambio de venta
  const handleVentaChange = (numeroVenta: string) => {
    const venta = mockVentas.find(
      (v) => v.numeroVenta === numeroVenta,
    );

    if (venta) {
      const clienteEncontrado = mockClientes.find(
        (c) => `${c.nombre} ${c.apellido}` === venta.cliente,
      );

      setFormData({
        ...formData,
        numeroVenta,
        clienteId: clienteEncontrado?.id || "",
        nombreCliente: venta.cliente,
        telefonoCliente: clienteEncontrado?.telefono || "",
        emailCliente: clienteEncontrado?.email || "",
        productosVenta: venta.productos || [],
      });
    } else {
      setFormData({
        ...formData,
        numeroVenta,
        productosVenta: [],
      });
    }
  };

  // Función para agregar producto de la venta
  const handleAgregarProductoVenta = () => {
    if (!productoTemporal.productoId) return;

    const producto = formData.productosVenta.find(
      (p) => p.id === productoTemporal.productoId,
    );
    if (!producto) return;

    // Verificar si ya está seleccionado
    const yaSeleccionado = formData.productosSeleccionados.find(
      (p) => p.id === productoTemporal.productoId,
    );

    if (yaSeleccionado) {
      if (
        yaSeleccionado.cantidad + productoTemporal.cantidad <=
        producto.cantidad
      ) {
        setFormData({
          ...formData,
          productosSeleccionados:
            formData.productosSeleccionados.map((p) =>
              p.id === producto.id
                ? {
                  ...p,
                  cantidad:
                    p.cantidad + productoTemporal.cantidad,
                }
                : p,
            ),
        });
      } else {
        toast.error("Cantidad excedida", {
          description:
            "La cantidad seleccionada excede la disponible en la venta.",
        });
        return;
      }
    } else {
      setFormData({
        ...formData,
        productosSeleccionados: [
          ...formData.productosSeleccionados,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: productoTemporal.cantidad,
            disponible: true,
          },
        ],
      });
    }

    // Resetear temporal
    setProductoTemporal({
      productoId: "",
      cantidad: 1,
    });
  };

  // Función para eliminar producto seleccionado
  const handleEliminarProductoSeleccionado = (
    productId: string,
  ) => {
    setFormData({
      ...formData,
      productosSeleccionados:
        formData.productosSeleccionados.filter(
          (p) => p.id !== productId,
        ),
    });
  };

  // Función para crear nueva devolución
  const handleCrearDevolucion = () => {
    if (
      !formData.clienteId ||
      !formData.numeroVenta ||
      formData.productosSeleccionados.length === 0
    ) {
      toast.error("Error", {
        description:
          "Por favor complete todos los campos obligatorios y seleccione al menos un producto.",
      });
      return;
    }

    const cliente = mockClientes.find(
      (c) => c.id === formData.clienteId,
    );
    if (!cliente) return;

    const montoTotal = formData.productosSeleccionados.reduce(
      (total, producto) =>
        total + producto.precio * producto.cantidad,
      0,
    );

    const nuevaDevolucion: Devolucion = {
      id: generateNextId(),
      numeroDevolucion: generateDevolucionNumber(),
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        fechaRegistro: new Date(),
        totalCompras: 0,
        activo: true,
      },
      pedido: {
        id: "0",
        numeroPedido: formData.numeroVenta,
      },
      fechaDevolucion: new Date(),
      fechaSolicitud: new Date(),
      estado: "Aceptada",
      motivo: "Otro motivo",
      descripcion: formData.descripcionMotivo,
      productos: formData.productosSeleccionados.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        categoria: "General",
        precio: p.precio,
        cantidad: p.cantidad,
        cantidadDevolver: p.cantidad,
        motivoDevolucion: "Otro motivo",
        estadoProducto: "Usado",
      })),
      montoTotal: montoTotal,
      notaCredito: {
        id: `nc${generateNextId()}`,
        numeroNota: `NC-2024-${generateNextId().padStart(3, "0")}`,
        estado: "Pendiente",
        monto: 0,
        fechaCreacion: new Date(),
      },
    };

    setDevoluciones([...devoluciones, nuevaDevolucion]);
    setIsNewDevolucionDialogOpen(false);
    resetForm();

    toast.success("Devolución creada", {
      description: `La devolución ${nuevaDevolucion.numeroDevolucion} ha sido creada exitosamente.`,
    });
  };

  const listContent = (
    <div className="space-y-6 p-6">
      {/* Contenedor unificado: Header, Filtros y Tabla */}
      <div className="bg-white rounded-lg border">
        {/* Header con título, subtítulo y botón */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h1 className="text-xl font-semibold mb-1">Gestión de Devoluciones</h1>
            <p className="text-muted-foreground text-sm">
              Administra las devoluciones de productos y maneja las solicitudes de reembolso
            </p>
          </div>
          <Dialog
            open={isNewDevolucionDialogOpen}
            onOpenChange={setIsNewDevolucionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsNewDevolucionDialogOpen(true)}
                className="bg-[rgb(21,93,252)] hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Devolución
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modal-scroll">
              <DialogHeader>
                <DialogTitle>Crear Nueva Devolución</DialogTitle>
                <DialogDescription>
                  Complete la información para registrar una nueva
                  devolución
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4">
                {/* Información de la Venta */}
                <div className="space-y-4">
                  <h3>Información de la Venta</h3>
                  <div className="space-y-2">
                    <Label htmlFor="numeroVenta">
                      Número de Venta *
                    </Label>
                    <Select
                      value={formData.numeroVenta}
                      onValueChange={handleVentaChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar venta" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockVentas.map((venta) => (
                          <SelectItem
                            key={venta.id}
                            value={venta.numeroVenta}
                          >
                            {venta.numeroVenta} - {venta.cliente}{" "}
                            - ${venta.total.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Información del Cliente - Auto-completada desde la venta */}
                {formData.numeroVenta && (
                  <div className="space-y-4">
                    <h3>Información del Cliente</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombreCliente">
                          Nombre del Cliente
                        </Label>
                        <Input
                          id="nombreCliente"
                          value={formData.nombreCliente}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={formData.telefonoCliente}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={formData.emailCliente}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Productos de la Venta */}
                {formData.productosVenta.length > 0 && (
                  <div className="space-y-4">
                    <h3>Productos de la Venta</h3>
                    <div className="border rounded-lg p-4 space-y-4">
                      {formData.productosVenta.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p>{producto.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              Cantidad: {producto.cantidad} -
                              Precio: $
                              {producto.precio.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Producto a devolver</Label>
                          <Select
                            value={productoTemporal.productoId}
                            onValueChange={(value) =>
                              setProductoTemporal({
                                ...productoTemporal,
                                productoId: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.productosVenta.map(
                                (producto) => (
                                  <SelectItem
                                    key={producto.id}
                                    value={producto.id}
                                  >
                                    {producto.nombre}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20">
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={productoTemporal.cantidad}
                            onChange={(e) =>
                              setProductoTemporal({
                                ...productoTemporal,
                                cantidad:
                                  parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>
                        <Button
                          onClick={handleAgregarProductoVenta}
                          disabled={!productoTemporal.productoId}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Productos Seleccionados para Devolución */}
                {formData.productosSeleccionados.length > 0 && (
                  <div className="space-y-4">
                    <h3>Productos a Devolver</h3>
                    <div className="border rounded-lg p-4 space-y-2">
                      {formData.productosSeleccionados.map(
                        (producto) => (
                          <div
                            key={producto.id}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div>
                              <p>{producto.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                Cantidad: {producto.cantidad} -
                                Precio: $
                                {producto.precio.toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleEliminarProductoSeleccionado(
                                  producto.id,
                                )
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                      <div className="pt-2 border-t">
                        <p>
                          <span className="text-sm text-muted-foreground">
                            Total a devolver:{" "}
                          </span>
                          <span>
                            $
                            {formData.productosSeleccionados
                              .reduce(
                                (total, p) =>
                                  total + p.precio * p.cantidad,
                                0,
                              )
                              .toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivo de la Devolución */}
                <div className="space-y-4">
                  <h3>Motivo de la Devolución</h3>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">
                      Descripción detallada
                    </Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describe detalladamente el motivo de la devolución..."
                      value={formData.descripcionMotivo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcionMotivo: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewDevolucionDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCrearDevolucion}>
                  Crear Devolución
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros: Barra de búsqueda y filtro de estado */}
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar devoluciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Todos los estados
                </SelectItem>
                <SelectItem value="Aceptada">
                  Aceptada
                </SelectItem>
                <SelectItem value="Anulada">
                  Anulada
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla de Devoluciones */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDevoluciones.map((devolucion) => (
                  <TableRow key={devolucion.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p>
                            {devolucion.cliente.nombre}{" "}
                            {devolucion.cliente.apellido}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {devolucion.pedido.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {devolucion.fechaDevolucion.toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(devolucion.estado)} text-white`}
                      >
                        {devolucion.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleVerDetalle(devolucion)
                          }
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleExportarPDF(devolucion)
                          }
                          title="Exportar a PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {devolucion.estado === "Aceptada" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Anular devolución"
                              >
                                <Trash2 className="text-red-600 hover:text-red-700 hover:bg-red-50" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Anular devolución?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción cambiará el estado
                                  de la devolución{" "}
                                  {devolucion.numeroDevolucion}{" "}
                                  a "Anulada". Esta acción no se
                                  puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleAnularDevolucion(
                                      devolucion,
                                    )
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Anular Devolución
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            title="Devolución anulada"
                          >
                            <Trash2 className="h-4 w-4" />
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
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDevoluciones.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="devoluciones"
          />
        </div>
      </div>
    </div>
  );

  // Renderizar vista condicional
  if (currentView === "detail" && selectedDevolucion) {
    return (
      <DetalleDevolucion
        devolucion={selectedDevolucion}
        onBack={handleVolverALista}
      />
    );
  }

  return listContent;
};
