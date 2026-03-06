import React, { useState, useEffect, useMemo } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
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
import { TablePagination } from "./ui/TablePagination";
import { toast } from "sonner";
import {
  Plus,
  Minus,
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
  CheckCircle,
  Receipt,
  Check,
  ChevronsUpDown,
  User,
  FileText,
} from "lucide-react";
import { cn } from "./ui/utils";

// Interfaces para tipado
interface Cliente {
  id: number;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  empresa?: string;
}

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  numeroDocumento: string;
}

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


import { getUsuarios, getProductos } from "../services/api";

// ... (interfaces se mantienen igual)

export const Cotizaciones: React.FC = () => {
  // Estados para API
  const [clientesDisponibles, setClientesDisponibles] = useState<Usuario[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);

  // Inicializar cotizaciones desde localStorage o con array vacío
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(() => {
    try {
      const saved = localStorage.getItem('vaper_cotizaciones');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error al cargar cotizaciones del localStorage:", e);
    }
    return [];
  });

  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);

  // Guardar cotizaciones en localStorage cada vez que cambien
  useEffect(() => {
    try {
      localStorage.setItem('vaper_cotizaciones', JSON.stringify(cotizaciones));
    } catch (e) {
      console.error("Error al guardar cotizaciones en localStorage:", e);
    }
  }, [cotizaciones]);

  // Cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingClientes(true);
      setIsLoadingProductos(true);
      try {
        const [usuariosData, productosData] = await Promise.all([
          getUsuarios(),
          getProductos()
        ]);
        setClientesDisponibles(usuariosData);
        // Mapear productos al formato esperado por el componente si es necesario
        setProductosDisponibles(productosData.map(p => ({
          id: p.id,
          codigo: p.nombreProducto.substring(0, 5).toUpperCase(),
          nombre: p.nombreProducto,
          descripcion: p.descripcion || p.nombreProducto,
          precio: p.precio,
          categoria: p.categoria?.nombreCategoria || "General",
          stock: p.stock
        })));
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("Error al cargar datos de la API");
      } finally {
        setIsLoadingClientes(false);
        setIsLoadingProductos(false);
      }
    };

    fetchData();
  }, []);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] = useState<Cotizacion | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estados para el selector de productos temporal
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Estado para búsqueda de cliente por documento
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [openSelectorCliente, setOpenSelectorCliente] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [openSelectorProducto, setOpenSelectorProducto] = useState(false);

  // Formulario de nueva cotización
  const [formData, setFormData] = useState<FormularioCotizacion>(() => {
    const today = new Date().toISOString().split('T')[0];
    const fechaVigenciaDefault = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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

  // Filtrar clientes por documento o nombre (para el buscador avanzado)
  const clientesFiltradosParaBusqueda = useMemo(() => {
    if (!clientSearchTerm || clientSearchTerm.trim() === "") return [];
    const term = clientSearchTerm.toLowerCase();
    return clientesDisponibles.filter(
      (c) =>
        (c.nombres?.toLowerCase() || "").includes(term) ||
        (c.apellidos?.toLowerCase() || "").includes(term) ||
        (c.numeroDocumento || "").includes(term)
    );
  }, [clientesDisponibles, clientSearchTerm]);

  // Filtrar productos para búsqueda (por nombre o código)
  const productosFiltrados = useMemo(() => {
    if (!productSearchTerm || productSearchTerm.trim() === "") return [];
    const term = productSearchTerm.toLowerCase();
    return productosDisponibles.filter(
      (pd) =>
        (pd.nombre?.toLowerCase() || "").includes(term) ||
        (pd.codigo?.toLowerCase() || "").includes(term)
    );
  }, [productosDisponibles, productSearchTerm]);

  // Seleccionar cliente desde las sugerencias
  const seleccionarCliente = (cliente: Usuario) => {
    setFormData((prev) => ({
      ...prev,
      clienteId: cliente.id,
    }));
    setBusquedaDocumento(cliente.numeroDocumento);
    setMostrarSugerenciasCliente(false);
    setClientSearchTerm(`${cliente.nombres} ${cliente.apellidos}`);
    setOpenSelectorCliente(false);
  };

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado]);

  // Filtrar cotizaciones
  const cotizacionesFiltradas = useMemo(() => {
    let result = [...cotizaciones];

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const isNumeric = /^\d+$/.test(term);
      const isCotId = term.startsWith('cot-');
      const cotNum = isCotId ? term.replace('cot-', '') : '';
      const isCotNumNumeric = cotNum && /^\d+$/.test(cotNum);

      result = result.filter(cotizacion => {
        // 1. Si es numérico buscar por ID exacto O padded ID
        if (isNumeric) {
          return cotizacion.id.toString() === term ||
            String(cotizacion.id).padStart(3, '0') === term;
        }

        // 2. Si empieza por COT- buscar por ID exacto O padded ID (con el COT- removido)
        if (isCotId && isCotNumNumeric) {
          const idNumStr = parseInt(cotNum).toString();
          return cotizacion.id.toString() === idNumStr ||
            String(cotizacion.id).padStart(3, '0') === cotNum;
        }

        // 3. Fallback: buscar por nombre de cliente
        return cotizacion.cliente.nombre
          .toLowerCase()
          .includes(term);
      });
    }

    // Filtro por estado
    if (filtroEstado !== "todos") {
      result = result.filter(cotizacion => cotizacion.estado === filtroEstado);
    }

    return result;
  }, [cotizaciones, searchTerm, filtroEstado]);

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
    if (cotizacionToDelete) {
      const cotizacionActualizada: Cotizacion = {
        ...cotizacionToDelete,
        estado: "anulada",
        motivoAnulacion: motivoAnulacion || "Sin motivo especificado",
        fechaActualizacion: new Date().toISOString(),
        cambiosEstado: [
          ...cotizacionToDelete.cambiosEstado,
          {
            id: cotizacionToDelete.cambiosEstado.length + 1,
            fechaCambio: new Date().toISOString(),
            estadoAnterior: cotizacionToDelete.estado,
            estadoNuevo: "anulada",
            motivo: motivoAnulacion || "Anulación manual",
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
      const productoInfo = productosDisponibles.find(p => p.id === selectedProductId);
      if (!productoInfo) return;

      if (selectedQuantity > productoInfo.stock) {
        toast.error(`Stock insuficiente. Solo hay ${productoInfo.stock} disponibles.`);
        return;
      }

      setFormData((prev) => {
        const indexExistente = prev.productos.findIndex(p => p.productoId === selectedProductId);

        if (indexExistente >= 0) {
          // El producto ya existe, mostrar alerta
          toast.error("Este producto ya fue agregado");
          return prev;
        } else {
          // Es un producto nuevo
          return {
            ...prev,
            productos: [
              ...prev.productos,
              {
                productoId: selectedProductId,
                cantidad: selectedQuantity,
              },
            ],
          };
        }
      });
      setSelectedProductId(0);
      setSelectedQuantity(1);
      setProductSearchTerm(''); // Limpiar buscador al agregar
    }
  };

  // Función para cambiar cantidad desde la lista de seleccionados
  const cambiarCantidad = (index: number, delta: number) => {
    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];
      const nuevaCantidad = nuevosProductos[index].cantidad + delta;
      const productoInfo = productosDisponibles.find(p => p.id === nuevosProductos[index].productoId);

      if (productoInfo && nuevaCantidad > productoInfo.stock) {
        toast.error(`Stock insuficiente. Solo hay ${productoInfo.stock} disponibles.`);
        return prev;
      }

      if (nuevaCantidad > 0) {
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          cantidad: nuevaCantidad
        };
      }

      return { ...prev, productos: nuevosProductos };
    });
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

    const clienteSeleccionado = clientesDisponibles.find(
      (c) => c.id.toString() === formData.clienteId.toString(),
    );
    if (!clienteSeleccionado) {
      toast.error("No se encontró el cliente seleccionado.");
      return;
    }

    const clienteParaCotizacion: Cliente = {
      id: clienteSeleccionado.id,
      nombre: `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}`,
      documento: clienteSeleccionado.numeroDocumento,
      email: clienteSeleccionado.correo,
      telefono: clienteSeleccionado.telefono
    };

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
      id: cotizaciones.length > 0 ? Math.max(...cotizaciones.map((c) => c.id)) + 1 : 1,
      fechaCotizacion: new Date().toISOString(),
      fechaVigencia: new Date(
        fechaVigenciaAuto + "T23:59:59",
      ).toISOString(),
      cliente: clienteParaCotizacion,
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
    setCotizaciones((prev) => [...prev, nuevaCotizacion]);
    toast.success("Cotización creada exitosamente");
    setIsCreateDialogOpen(false);
    resetFormData();
  };

  // Resetear formulario
  const resetFormData = () => {
    const hoy = new Date().toISOString().split("T")[0];

    const fechaVigenciaDefault = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0];

    setFormData({
      clienteId: null,
      productos: [],
      fechaVigencia: hoy,
      condicionesPago: {
        tipoPago: "contado",
        metodoPago: ["Efectivo"],
        observaciones: "",
      },
      descuentoPorcentaje: 0,
    });
    setSelectedProductId(0);
    setSelectedQuantity(1);
    setClientSearchTerm("");
    setOpenSelectorCliente(false);
  };

  // Función para obtener el badge del estado con el mismo estilo que Ventas
  const getEstadoBadge = (estado: string) => {
    const variants = {
      'aceptada': { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'bg-black hover:bg-black/90', label: 'Aceptada' },
      'anulada': { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" />, color: 'bg-red-600 hover:bg-red-700', label: 'Anulada' },
    };

    const config = variants[estado.toLowerCase() as keyof typeof variants] || variants.aceptada;

    return (
      <Badge
        variant={config.variant}
        className={cn("flex items-center gap-1 w-fit capitalize", config.color)}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
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
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("COTIZACIÓN", 20, 30);

      // Fecha de generación
      doc.setFontSize(12);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`,
        20,
        45,
      );

      // Línea separadora
      doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.line(20, 55, 190, 55);

      // Información del cliente
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("INFORMACIÓN DEL CLIENTE", 20, 70);

      doc.setFontSize(10);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
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
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("INFORMACIÓN DE LA COTIZACIÓN", 20, 135);

      doc.setFontSize(10);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(
        `Fecha de cotización: ${new Date(cotizacion.fechaCotizacion).toLocaleDateString("es-ES")}`,
        20,
        150,
      );
      doc.text(
        `Estado: ${cotizacion.estado.toUpperCase()}`,
        20,
        160,
      );


      // Productos
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("PRODUCTOS", 20, 190);

      // Encabezados de tabla
      doc.setFontSize(9);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      let yPos = 205;

      // Línea de encabezado
      doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
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

      // Totales
      yPos += 10;
      doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.line(120, yPos, 190, yPos);

      // Totales
      yPos += 15;
      doc.setFontSize(10);
      yPos += 5;

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
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-[13px] text-[14px]">Gestión de Cotizaciones</h1>
            <p className="text-muted-foreground text-sm">
              Administra cotizaciones, seguimiento de estados y aprobaciones
            </p>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cotización
            </Button>
          </div>
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
                <TableHead>ID</TableHead>
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
                  <TableCell className="font-medium text-black">
                    {`COT-${String(cotizacion.id).padStart(3, '0')}`}
                  </TableCell>
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
                    {getEstadoBadge(cotizacion.estado)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewDetail(cotizacion)
                        }
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generarPDF(cotizacion)}
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAnular(cotizacion)
                        }
                        disabled={cotizacion.estado === "anulada"}
                        title="Anular cotización"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={cotizacionesFiltradas.length}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            itemName="cotizaciones"
          />
        )}
      </div>

      {/* Dialog de detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] modal-scroll">
          <DialogHeader>
            <DialogTitle>Detalles de Cotización</DialogTitle>
            <DialogDescription>
              Información completa de la cotización {`COT-${String(selectedCotizacion?.id).padStart(3, '0')}`}
            </DialogDescription>
          </DialogHeader>

          {selectedCotizacion && (
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div><strong>Número:</strong> {`COT-${String(selectedCotizacion.id).padStart(3, '0')}`}</div>
                    <div><strong>Fecha:</strong> {new Date(selectedCotizacion.fechaCotizacion).toLocaleDateString('es-CO')}</div>
                    <div><strong>Cliente:</strong> {selectedCotizacion.cliente.nombre}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Estado:</strong> {getEstadoBadge(selectedCotizacion.estado)}</div>
                    {selectedCotizacion.motivoAnulacion && (
                      <div><strong>Motivo Anulación:</strong> {selectedCotizacion.motivoAnulacion}</div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Productos */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Productos</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unitario</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCotizacion.productos.map((producto, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{producto.nombre}</TableCell>
                            <TableCell>{producto.cantidad}</TableCell>
                            <TableCell>${producto.precioUnitario.toLocaleString()}</TableCell>
                            <TableCell>${producto.subtotal.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                {/* Resumen financiero */}
                <div className="space-y-4">
                  <div className="max-w-md ml-auto">
                    <h4 className="border-b pb-2 mb-3 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Resumen de Pago</h4>
                    <div className="space-y-2">
                      {/* La línea de subtotal fue removida por diseño de Ventas */}
                      {selectedCotizacion.descuento > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Descuento:</span>
                          <span>-${selectedCotizacion.descuento.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t text-black">
                        <span>Total:</span>
                        <span>${selectedCotizacion.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar cotización */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open: boolean) => {
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
                {/* Fecha (No editable) */}
                <div className="space-y-2">
                  <Label htmlFor="fechaCotizacion">Fecha de Cotización</Label>
                  <Input
                    id="fechaCotizacion"
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    readOnly
                    className="bg-muted cursor-not-allowed opacity-70"
                  />
                </div>

                {/* Cliente - Buscador Directo */}
                <div className="relative">
                  <Label htmlFor="cliente">Cliente (Buscar por nombre o documento)</Label>
                  <Popover open={openSelectorCliente && clientSearchTerm.trim() !== ""} onOpenChange={setOpenSelectorCliente}>
                    <PopoverTrigger asChild>
                      <div className="relative mt-1">
                        <Input
                          placeholder="Escribe el nombre o documento..."
                          value={clientSearchTerm}
                          onChange={(e) => {
                            setClientSearchTerm(e.target.value);
                            if (!openSelectorCliente) setOpenSelectorCliente(true);
                            if (e.target.value === "") setFormData(prev => ({ ...prev, clienteId: "" }));
                          }}
                          className="bg-input-background pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] p-0"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col h-full overflow-hidden border rounded-lg shadow-2xl">
                        <div className="p-2 border-b bg-muted/30">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                            Resultados de búsqueda
                          </span>
                        </div>
                        <Command className="border-none">
                          <div className="hidden">
                            <CommandInput value={clientSearchTerm} onValueChange={setClientSearchTerm} />
                          </div>
                          <CommandList className="max-h-60 custom-scrollbar">
                            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                            <CommandGroup className="p-1">
                              {clientesFiltradosParaBusqueda.map((cliente) => (
                                <CommandItem
                                  key={cliente.id}
                                  value={`${cliente.nombres} ${cliente.apellidos} ${cliente.numeroDocumento}`}
                                  onSelect={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      clienteId: cliente.id.toString(),
                                      nombreCliente: `${cliente.nombres} ${cliente.apellidos}`
                                    }));
                                    setClientSearchTerm(`${cliente.nombres} ${cliente.apellidos}`);
                                    setOpenSelectorCliente(false);
                                  }}
                                  className="flex items-center gap-3 py-2.5 px-3 hover:bg-primary/5 rounded-md cursor-pointer transition-all group"
                                >
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors italic">
                                        {cliente.nombres} {cliente.apellidos}
                                      </span>
                                      {formData.clienteId === cliente.id.toString() && (
                                        <Check className="h-3 w-3 text-primary shrink-0" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                      <span className="text-[11px] font-medium bg-muted px-1.5 rounded leading-tight border border-border/50">
                                        Doc: {cliente.numeroDocumento}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Descuento */}
                <div className="space-y-2">
                  <Label htmlFor="descuento" className="text-sm">Descuento (%)</Label>
                  <div className="relative">
                    <Input
                      id="descuento"
                      type="text"
                      inputMode="decimal"
                      value={formData.descuentoPorcentaje === 0 ? '' : formData.descuentoPorcentaje.toString()}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || (/^\d*\.?\d*$/.test(val) && parseFloat(val) <= 100)) {
                          setFormData(prev => ({ ...prev, descuentoPorcentaje: val === '' ? 0 : parseFloat(val) }));
                        }
                      }}
                      placeholder="0"
                      className="w-full pr-8 bg-input-background"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>

              </div>

              {/* Sección de agregar productos - ocupa todo el ancho */}
              <div className="space-y-3 pt-2 border-t">
                <Label>Agregar Productos</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Producto - Buscador Directo */}
                  <div className="relative">
                    <Label className="text-xs text-muted-foreground">Producto (Nombre o Código)</Label>
                    <Popover open={openSelectorProducto && productSearchTerm.trim() !== ""} onOpenChange={setOpenSelectorProducto}>
                      <PopoverTrigger asChild>
                        <div className="relative mt-1">
                          <Input
                            placeholder="Escribe el nombre o código..."
                            value={productSearchTerm}
                            onChange={(e) => {
                              setProductSearchTerm(e.target.value);
                              if (!openSelectorProducto) setOpenSelectorProducto(true);
                              // No reseteamos el ID aquí para permitir escribir y luego seleccionar
                            }}
                            className="bg-input-background pr-10 h-10"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] p-0"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <div className="flex flex-col h-full overflow-hidden border rounded-lg shadow-2xl">
                          <div className="p-2 border-b bg-muted/30 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                              Productos Disponibles
                            </span>
                          </div>
                          <Command className="border-none">
                            <div className="hidden">
                              <CommandInput value={productSearchTerm} onValueChange={setProductSearchTerm} />
                            </div>
                            <CommandList className="max-h-60 custom-scrollbar">
                              <CommandEmpty>No se encontraron productos.</CommandEmpty>
                              <CommandGroup className="p-1">
                                {productosFiltrados.map((prod) => (
                                  <CommandItem
                                    key={prod.id}
                                    value={`${prod.codigo} ${prod.nombre}`}
                                    onSelect={() => {
                                      setSelectedProductId(prod.id);
                                      setProductSearchTerm(`${prod.codigo} - ${prod.nombre}`);
                                      setOpenSelectorProducto(false);
                                    }}
                                    disabled={prod.stock <= 0}
                                    className={cn(
                                      "flex items-center gap-3 py-2.5 px-3 rounded-md cursor-pointer transition-all group",
                                      prod.stock <= 0 ? "opacity-50 cursor-not-allowed bg-muted/20" : "hover:bg-primary/5"
                                    )}
                                  >
                                    <div className={cn(
                                      "h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                                      prod.stock <= 0 ? "bg-muted" : "bg-primary/10 group-hover:bg-primary/20"
                                    )}>
                                      <FileText className={cn("h-4 w-4", prod.stock <= 0 ? "text-muted-foreground" : "text-primary")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className={cn(
                                          "font-semibold text-sm truncate transition-colors italic",
                                          prod.stock > 0 && "group-hover:text-primary"
                                        )}>
                                          {prod.nombre}
                                        </span>
                                        <span className="font-bold text-xs text-primary shrink-0">
                                          ${prod.precio.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge
                                          variant={prod.stock > 5 ? "secondary" : "destructive"}
                                          className="text-[8px] px-1 py-0 h-4 min-h-0 flex items-center"
                                        >
                                          {prod.stock} disp.
                                        </Badge>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={selectedQuantity}
                        onChange={(e) =>
                          setSelectedQuantity(
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={agregarProductoSeleccionado}
                      disabled={selectedProductId === 0}
                      className="bg-gray-600 hover:bg-gray-700 w-full sm:w-auto px-6 h-10"
                    >
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Productos Seleccionados */}
              {formData.productos.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Label>Productos Seleccionados</Label>
                  <div className="space-y-2 pr-2">
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
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1.5">
                                <div className="flex items-center border rounded-md bg-background h-7">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => cambiarCantidad(index, -1)}
                                    className="h-6 w-6 rounded-r-none border-r hover:bg-muted"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-2.5 text-xs font-semibold min-w-[2rem] text-center">
                                    {producto.cantidad}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => cambiarCantidad(index, 1)}
                                    className="h-6 w-6 rounded-l-none border-l hover:bg-muted"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <span>Precio: ${productoInfo.precio.toLocaleString()}</span>
                                  <span className="mx-2 font-bold opacity-30">•</span>
                                  <span className="font-semibold text-foreground">
                                    Subtotal: ${(producto.cantidad * productoInfo.precio).toLocaleString()}
                                  </span>
                                </div>
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
                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2 bg-muted/20 p-3 sm:p-4 rounded-lg">
                    {(() => {
                      const {
                        subtotal,
                        descuento,
                        total,
                      } = calcularTotales(
                        formData.productos,
                        formData.descuentoPorcentaje,
                      );
                      return (
                        <>
                          {descuento > 0 && (
                            <div className="flex justify-between text-sm sm:text-base text-red-600">
                              <span>Descuento ({formData.descuentoPorcentaje}%):</span>
                              <span className="font-medium">
                                -${descuento.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-base sm:text-lg pt-1">
                            <span className="font-semibold">Total:</span>
                            <span className="font-bold text-primary">${total.toLocaleString()}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
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

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="motivoAnulacion" className="mb-2 block font-medium">
                Motivo de anulación
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
