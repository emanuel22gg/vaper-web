import React, { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
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
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { TablePagination } from "@/shared/ui/TablePagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  ShoppingCart,
  Info
} from "lucide-react";
import logoImage from "@/assets/da58514cc4a62145203981edd12b890ba8690130.png";
import { cn } from "@/shared/ui/utils";
import { getUsuarios, getProductos, getCotizaciones, createCotizacion, updateCotizacion, deleteCotizacion, getDetallesByCotizacion, createDetalleCotizacion } from "@/shared/services/api";
import { CotizacionDto, DetalleCotizacionDto } from "@/shared/types";

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
  clienteId: number | string | null;
  productos: Array<{
    productoId: number;
    cantidad: number;
  }>;
  fechaVigencia: string;
  condicionesPago: CondicionesPago;
  descuentoPorcentaje: number;
  nombreCliente?: string;
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


export const Cotizaciones: React.FC = () => {
  // Estados para API
  const [clientesDisponibles, setClientesDisponibles] = useState<Usuario[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDisponible[]>([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);

  // Estados para cotizaciones de la API
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);

  // Efecto eliminado: ya no guardamos en localStorage

  // Cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingClientes(true);
      setIsLoadingProductos(true);
      setIsInitialLoading(true);
      try {
        const [usuariosData, productosData, cotizacionesData] = await Promise.all([
          getUsuarios(),
          getProductos(),
          getCotizaciones()
        ]);
        
        setClientesDisponibles(usuariosData);
        
        // Mapear productos
        const mappedProductos = productosData.map(p => ({
          id: p.id,
          codigo: p.nombreProducto.substring(0, 5).toUpperCase(),
          nombre: p.nombreProducto,
          descripcion: p.descripcion || p.nombreProducto,
          precio: p.precio,
          categoria: p.categoria?.nombreCategoria || "General",
          stock: p.stock
        }));
        setProductosDisponibles(mappedProductos);

        // Mapear cotizaciones desde la API al formato local y ordenar por ID descendente
        const mappedCotizaciones: Cotizacion[] = (cotizacionesData as CotizacionDto[]).map((c: CotizacionDto) => {
          // Intentar encontrar el usuario para tener datos completos si es posible
          const usuario = usuariosData.find(u => `${u.nombres} ${u.apellidos}` === c.nombreUsuario);
          
          return {
            id: c.id!,
            fechaCotizacion: c.fecha || new Date().toISOString(),
            fechaVigencia: c.vigencia 
              ? new Date(new Date(c.fecha || Date.now()).getTime() + c.vigencia * 24 * 60 * 60 * 1000).toISOString()
              : new Date().toISOString(),
            cliente: {
              id: usuario?.id || 0,
              nombre: c.nombreUsuario || "Cliente Desconocido",
              documento: usuario?.numeroDocumento || "N/A",
              email: usuario?.correo || "N/A",
              telefono: usuario?.telefono || "N/A"
            },
            productos: [], // Se cargarán bajo demanda o se pueden cargar aquí
            subtotal: Number(c.subtotal || 0),
            descuento: Number(c.descuento || 0),
            impuestos: 0,
            total: Number(c.total || 0),
            estado: (c.estadoId === 3 ? "anulada" : "aceptada") as "anulada" | "aceptada",
            condicionesPago: {
              tipoPago: "contado" as "contado" | "credito",
              metodoPago: ["Efectivo"],
              observaciones: ""
            },
            politicasCancelacion: {
              permiteCancelacion: true
            },
            creadoPor: "Sistema",
            cambiosEstado: [],
            fechaCreacion: c.fecha || new Date().toISOString(),
            fechaActualizacion: c.fecha || new Date().toISOString()
          };
        }).sort((a, b) => b.id - a.id);
        
        setCotizaciones(mappedCotizaciones);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("Error al cargar datos de la API");
      } finally {
        setIsLoadingClientes(false);
        setIsLoadingProductos(false);
        setIsInitialLoading(false);
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

    // Asegurar orden descendente por ID (las nuevas primero, antiguas abajo)
    return result.sort((a, b) => b.id - a.id);
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
  const handleViewDetail = async (cotizacion: Cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setIsDetailDialogOpen(true);
    
    // Si no tiene productos cargados, los buscamos en la API
    if (cotizacion.productos.length === 0) {
      try {
        const detalles = await getDetallesByCotizacion(cotizacion.id);
        const productosMapeados: ProductoCotizacion[] = detalles.map(d => {
          const prodInfo = productosDisponibles.find(p => p.id === d.productoId);
          return {
            id: d.productoId,
            codigo: prodInfo?.codigo || "N/A",
            nombre: d.nombreProducto || prodInfo?.nombre || "Producto",
            descripcion: prodInfo?.descripcion || "",
            precioUnitario: Number(d.precioUnitario),
            cantidad: d.cantidad,
            subtotal: Number(d.subtotal || 0),
            categoria: prodInfo?.categoria || "General",
            disponible: true
          };
        });
        
        const cotizacionConProductos = { ...cotizacion, productos: productosMapeados };
        setSelectedCotizacion(cotizacionConProductos);
        
        // Actualizar también en la lista principal para no volver a cargar
        setCotizaciones(prev => prev.map(c => c.id === cotizacion.id ? cotizacionConProductos : c));
      } catch (error) {
        console.error("Error al cargar detalles:", error);
        toast.error("No se pudieron cargar los detalles de la cotización");
      }
    }
  };

  // Manejar edición
  const handleEdit = async (cotizacion: Cotizacion) => {
    setSelectedCotizacion(cotizacion);
    
    let productosParaEditar = cotizacion.productos;
    
    // Si no tiene productos, cargarlos primero
    if (productosParaEditar.length === 0) {
      try {
        const detalles = await getDetallesByCotizacion(cotizacion.id);
        productosParaEditar = detalles.map(d => {
          const prodInfo = productosDisponibles.find(p => p.id === d.productoId);
          return {
            id: d.productoId,
            codigo: prodInfo?.codigo || "N/A",
            nombre: d.nombreProducto || prodInfo?.nombre || "Producto",
            descripcion: prodInfo?.descripcion || "",
            precioUnitario: Number(d.precioUnitario),
            cantidad: d.cantidad,
            subtotal: Number(d.subtotal || 0),
            categoria: prodInfo?.categoria || "General",
            disponible: true
          };
        });
        
        // Sincronizar localmente
        setCotizaciones(prev => prev.map(c => c.id === cotizacion.id ? { ...c, productos: productosParaEditar } : c));
      } catch (error) {
        console.error("Error al cargar detalles para editar:", error);
        toast.error("No se pudieron cargar los detalles para editar");
        return;
      }
    }

    setFormData({
      clienteId: cotizacion.cliente.id,
      productos: productosParaEditar.map((p) => ({
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
  const confirmarAnulacion = async () => {
    if (cotizacionToDelete) {
      try {
        const cotizacionActualizada: CotizacionDto = {
          nombreUsuario: cotizacionToDelete.cliente.nombre,
          total: cotizacionToDelete.total,
          subtotal: cotizacionToDelete.subtotal,
          descuento: cotizacionToDelete.descuento,
          estadoId: 3 // 3 = Anulada
        };

        await updateCotizacion(cotizacionToDelete.id, cotizacionActualizada);

        const localUpdated: Cotizacion = {
          ...cotizacionToDelete,
          estado: "anulada",
          motivoAnulacion: motivoAnulacion || "Sin motivo especificado",
          fechaActualizacion: new Date().toISOString(),
        };

        setCotizaciones((prev) =>
          prev.map((c) =>
            c.id === cotizacionToDelete.id
              ? localUpdated
              : c,
          ),
        );

        toast.success("Cotización anulada exitosamente");
        setIsDeleteDialogOpen(false);
        setCotizacionToDelete(null);
        setMotivoAnulacion("");
      } catch (error) {
        console.error("Error al anular:", error);
        toast.error("Ocurrió un error al anular la cotización en el servidor");
      }
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
  const crearCotizacion = async () => {
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
      (c) => c.id.toString() === formData.clienteId?.toString(),
    );
    if (!clienteSeleccionado) {
      toast.error("No se encontró el cliente seleccionado.");
      return;
    }

    const { subtotal, descuento, total } =
      calcularTotales(
        formData.productos,
        formData.descuentoPorcentaje,
      );

    // Calcular vigencia en días
    const hoy = new Date();
    const fechaVigenciaDate = new Date(formData.fechaVigencia + "T23:59:59");
    const vigenciaDias = Math.max(0, Math.ceil((fechaVigenciaDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));

    setIsInitialLoading(true);
    try {
      // 1. Crear cabecera de cotización
      const cotizacionData: CotizacionDto = {
        nombreUsuario: `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}`,
        total,
        subtotal,
        descuento,
        vigencia: vigenciaDias,
        estadoId: 1 // 1 = Aceptada
      };

      const createdCotizacion = await createCotizacion(cotizacionData);
      const cotId = createdCotizacion.id!;

      // 2. Crear detalles
      const detallesPromesas = formData.productos.map(p => {
        const prodInfo = productosDisponibles.find(pd => pd.id === p.productoId);
        const detalle: DetalleCotizacionDto = {
          cotizacionId: cotId,
          productoId: p.productoId,
          cantidad: p.cantidad,
          precioUnitario: prodInfo?.precio || 0,
          subtotal: (prodInfo?.precio || 0) * p.cantidad
        };
        return createDetalleCotizacion(detalle);
      });

      const detallesCreados = await Promise.all(detallesPromesas);

      // 3. Mapear al formato local y actualizar estado
      const productosConDetalles: ProductoCotizacion[] = detallesCreados.map(d => {
        const productInfo = productosDisponibles.find(pd => pd.id === d.productoId);
        return {
          id: d.productoId,
          codigo: productInfo?.codigo || "N/A",
          nombre: productInfo?.nombre || "Producto",
          descripcion: productInfo?.descripcion || "",
          precioUnitario: Number(d.precioUnitario),
          cantidad: d.cantidad,
          subtotal: Number(d.subtotal || 0),
          categoria: productInfo?.categoria || "General",
          disponible: true
        };
      });

      const nuevaCotizacion: Cotizacion = {
        id: cotId,
        fechaCotizacion: createdCotizacion.fecha || new Date().toISOString(),
        fechaVigencia: fechaVigenciaDate.toISOString(),
        cliente: {
          id: clienteSeleccionado.id,
          nombre: `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}`,
          documento: clienteSeleccionado.numeroDocumento,
          email: clienteSeleccionado.correo,
          telefono: clienteSeleccionado.telefono
        },
        productos: productosConDetalles,
        subtotal,
        descuento,
        impuestos: 0,
        total,
        estado: "aceptada",
        condicionesPago: formData.condicionesPago,
        politicasCancelacion: { permiteCancelacion: true },
        creadoPor: "Usuario Actual",
        cambiosEstado: [],
        fechaCreacion: createdCotizacion.fecha || new Date().toISOString(),
        fechaActualizacion: createdCotizacion.fecha || new Date().toISOString()
      };

      setCotizaciones((prev) => [nuevaCotizacion, ...prev]);
      toast.success("Cotización creada exitosamente");
      setIsCreateDialogOpen(false);
      resetFormData();
    } catch (error) {
      console.error("Error al crear cotización:", error);
      toast.error("Ocurrió un error al guardar la cotización en el servidor");
    } finally {
      setIsInitialLoading(false);
    }
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

  // Función para obtener el badge del estado
  const getEstadoBadge = (estado: string) => {
    const variants = {
      'aceptada': { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'bg-black hover:bg-black/90 text-white', label: 'Aceptada' },
      'anulada': { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" />, color: 'bg-red-600 hover:bg-red-700 text-white', label: 'Anulada' },
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
      let cotizacionParaPDF = { ...cotizacion };

      // Si no tiene productos cargados, los buscamos en la API
      if (cotizacion.productos.length === 0) {
        try {
          const detalles = await getDetallesByCotizacion(cotizacion.id);
          const productosMapeados: ProductoCotizacion[] = detalles.map(d => {
            const prodInfo = productosDisponibles.find(p => p.id === d.productoId);
            return {
              id: d.productoId,
              codigo: prodInfo?.codigo || "N/A",
              nombre: d.nombreProducto || prodInfo?.nombre || "Producto",
              descripcion: prodInfo?.descripcion || "",
              precioUnitario: Number(d.precioUnitario),
              cantidad: d.cantidad,
              subtotal: Number(d.subtotal || 0),
              categoria: prodInfo?.categoria || "General",
              disponible: true
            };
          });
          
          cotizacionParaPDF = { ...cotizacion, productos: productosMapeados };
          
          // Actualizar también en la lista principal para no volver a cargar
          setCotizaciones(prev => prev.map(c => c.id === cotizacion.id ? cotizacionParaPDF : c));
        } catch (error) {
          console.error("Error al cargar detalles para PDF:", error);
          toast.error("No se pudieron cargar los detalles para el PDF");
        }
      }

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-CO');
      };

      // Header - Logo y Título
      try {
        if (logoImage) {
          doc.addImage(logoImage, 'PNG', pageWidth / 2 - 25, y, 50, 20);
          y += 25;
        }
      } catch (e) {
        console.warn("Could not load logo image for PDF", e);
        y += 10;
      }

      doc.setFontSize(22);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "bold");
      doc.text("Vaper One", pageWidth / 2, y, { align: "center" });
      y += 10;
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("COTIZACIÓN", pageWidth / 2, y, { align: "center" });
      y += 8;

      doc.setFontSize(10);
      doc.text("NIT: 830.517.246-3", pageWidth / 2, y, { align: "center" });
      y += 5;
      doc.text("Teléfono: +57 (4) 123-4567", pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setDrawColor(33, 33, 33);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Info Section
      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);

      // Columna Izquierda: Datos del Cliente
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL CLIENTE", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${cotizacionParaPDF.cliente.nombre}`, margin, y);
      y += 6;
      doc.text(`C.C./NIT: ${cotizacionParaPDF.cliente.documento}`, margin, y);
      y += 6;
      doc.text(`Teléfono: ${cotizacionParaPDF.cliente.telefono}`, margin, y);
      y += 6;
      doc.text(`Email: ${cotizacionParaPDF.cliente.email}`, margin, y);

      // Columna Derecha: Datos de la Cotización
      let yDerecha = y - 25;
      doc.setFont("helvetica", "bold");
      doc.text("INFO COTIZACIÓN", pageWidth - margin - 50, yDerecha);
      yDerecha += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Número: COT-${String(cotizacionParaPDF.id).padStart(3, '0')}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Fecha: ${formatDate(cotizacionParaPDF.fechaCotizacion)}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Vencimiento: ${formatDate(cotizacionParaPDF.fechaVigencia)}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Estado: ${cotizacionParaPDF.estado.toUpperCase()}`, pageWidth - margin - 50, yDerecha);

      y = Math.max(y, yDerecha) + 15;

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Producto", margin + 5, y + 7);
      doc.text("Cant", margin + 100, y + 7);
      doc.text("Precio", margin + 120, y + 7);
      doc.text("Subtotal", margin + 150, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      // Table Content
      cotizacionParaPDF.productos.forEach((item) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.text(item.nombre.substring(0, 45), margin + 5, y + 7);
        doc.text(String(item.cantidad), margin + 100, y + 7);
        doc.text(`$${item.precioUnitario.toLocaleString()}`, margin + 120, y + 7);
        doc.text(`$${item.subtotal.toLocaleString()}`, margin + 150, y + 7);
        y += 8;
      });

      y += 5;
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Totals
      doc.setFont("helvetica", "bold");
      if (cotizacionParaPDF.descuento > 0) {
        doc.text("Subtotal:", margin + 120, y);
        doc.text(`$${cotizacionParaPDF.subtotal.toLocaleString()}`, margin + 150, y);
        y += 7;
        doc.text("Descuento:", margin + 120, y);
        doc.text(`-$${cotizacionParaPDF.descuento.toLocaleString()}`, margin + 150, y);
        y += 7;
      }
      doc.setFontSize(14);
      doc.text("TOTAL:", margin + 120, y);
      doc.text(`$${cotizacionParaPDF.total.toLocaleString()}`, margin + 150, y);

      y += 30;
      // Signatures
      if (y > 250) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(10);
      doc.line(margin, y, margin + 60, y);
      doc.text("Firma del Cliente", margin, y + 5);

      doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
      doc.text("Firma del Vendedor", pageWidth - margin - 60, y + 5);

      y += 30;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado el ${formatDate(new Date())} por ${cotizacionParaPDF.creadoPor}`, pageWidth / 2, y, { align: "center" });
      doc.text("Vaper One - Sistema de Gestión de Ventas", pageWidth / 2, y + 4, { align: "center" });

      const nombreArchivo = `Cotizacion_${String(cotizacionParaPDF.id).padStart(3, '0')}_${cotizacionParaPDF.cliente.nombre.replace(/\s+/g, '_')}.pdf`;
      doc.save(nombreArchivo);
      toast.success("PDF generado exitosamente");
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                <TableHead>Vigencia</TableHead>
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
                    {new Date(
                      cotizacion.fechaVigencia,
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

      {/* Dialog de detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
          <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles de Cotización</DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Propuesta comercial enviada al cliente {`COT-${String(selectedCotizacion?.id).padStart(3, '0')}`}
                </DialogDescription>
              </div>
              {selectedCotizacion && getEstadoBadge(selectedCotizacion.estado)}
            </div>
          </DialogHeader>

          {selectedCotizacion && (
            <div className="p-8 space-y-10">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
                  <TabsTrigger 
                    value="info" 
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                  >
                    <Info className="h-4 w-4" /> Información General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="productos" 
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" /> Artículos Cotizados
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
                  {/* Información General y Cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Información del Cliente</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900 leading-tight">{selectedCotizacion.cliente.nombre}</p>
                          <p className="text-sm text-gray-500 mt-1 font-mono">Doc: {selectedCotizacion.cliente.documento}</p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                              <Mail className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 truncate">{selectedCotizacion.cliente.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                              <Phone className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">{selectedCotizacion.cliente.telefono}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vigencia y Control</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <div>
                            <Label className="text-[10px] font-bold text-gray-400 uppercase leading-none block mb-1">Fecha Emisión</Label>
                            <p className="text-xs font-bold text-gray-900">{new Date(selectedCotizacion.fechaCotizacion).toLocaleDateString('es-CO')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                          <Receipt className="h-4 w-4 text-orange-500" />
                          <div>
                            <Label className="text-[10px] font-bold text-gray-400 uppercase leading-none block mb-1">Válida Hasta</Label>
                            <p className="text-xs font-bold text-gray-900">{new Date(selectedCotizacion.fechaVigencia).toLocaleDateString('es-CO')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCotizacion.observaciones && (
                    <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/30 mt-6">
                      <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Comentarios Adicionales</h4>
                      <p className="text-sm text-gray-600 leading-relaxed italic">"{selectedCotizacion.observaciones}"</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="productos" className="space-y-8 animate-in fade-in-50 duration-500">
                  {/* Productos */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Artículos Cotizados</h4>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-0.5 rounded border border-gray-100">
                        {selectedCotizacion.productos.length} Items
                      </Badge>
                    </div>
                    
                    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 sticky top-0">
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Cant</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Unitario</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selectedCotizacion.productos.map((producto, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-5">
                                <p className="text-sm font-semibold text-gray-900">{producto.nombre}</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-mono uppercase">{producto.codigo}</p>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="inline-flex h-7 px-2 items-center justify-center bg-gray-100 text-gray-700 font-bold rounded-lg text-xs min-w-[32px]">
                                  {producto.cantidad}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right text-sm text-gray-500 font-medium font-mono">
                                ${producto.precioUnitario.toLocaleString()}
                              </td>
                              <td className="px-6 py-5 text-right text-sm font-bold text-gray-900 font-mono">
                                ${producto.subtotal.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Resumen Financiero */}
                  <div className="flex justify-end pt-4">
                    <div className="w-full md:w-72 space-y-4 pr-6">
                      <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                        <span>Subtotal Bruto</span>
                        <span className="font-mono">${selectedCotizacion.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedCotizacion.descuento > 0 && (
                        <div className="flex justify-between items-center text-sm font-medium text-red-500">
                          <span>Descuento Aplicado</span>
                          <span className="font-mono">-${selectedCotizacion.descuento.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="h-px bg-gray-100 w-full" />
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Importe Neto</span>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">${selectedCotizacion.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="p-8 border-t border-gray-100 bg-white">
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
              className="h-11 px-8 font-medium text-gray-600 hover:bg-gray-50 border-gray-200 rounded-xl"
            >
              Cerrar Detalle
            </Button>
            {selectedCotizacion && (
              <Button 
                onClick={() => generarPDF(selectedCotizacion)}
                className="h-11 px-8 bg-gray-900 text-white font-medium hover:bg-black transition-all rounded-xl shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Documento
              </Button>
            )}
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
          <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isCreateDialogOpen ? "Nueva Cotización" : "Editar Cotización"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              {isCreateDialogOpen ? "Crea una nueva cotización en el sistema" : "Modifica la información de la cotización"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <div className="px-8 border-b">
              <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0">
                <TabsTrigger 
                  value="info" 
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-[rgb(21,93,252)] data-[state=active]:bg-transparent data-[state=active]:text-[rgb(21,93,252)] rounded-none transition-all"
                >
                  Información General
                </TabsTrigger>
                <TabsTrigger 
                  value="productos" 
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-[rgb(21,93,252)] data-[state=active]:bg-transparent data-[state=active]:text-[rgb(21,93,252)] rounded-none transition-all"
                >
                  Productos ({formData.productos.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="info" className="m-0 space-y-6">
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
                    className="bg-gray-200 border-transparent text-gray-500 cursor-not-allowed w-full"
                  />
                </div>

                {/* Cliente - Buscador Directo */}
                <div className="relative">
                  <Label htmlFor="cliente">Cliente (Buscar por nombre o documento)*</Label>
                    <Popover open={openSelectorCliente && clientSearchTerm.trim() !== ""} onOpenChange={setOpenSelectorCliente}>
                      <PopoverTrigger asChild>
                        <div className="relative mt-1">
                          <Input
                            placeholder="Escribe el nombre o documento..."
                            value={clientSearchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setClientSearchTerm(e.target.value);
                              if (!openSelectorCliente) setOpenSelectorCliente(true);
                              if (e.target.value === "") setFormData(prev => ({ ...prev, clienteId: "" }));
                            }}
                            className="bg-white border-2 border-gray-300 pr-10"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                        </div>
                      </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] p-0"
                      align="start"
                      onOpenAutoFocus={(e: Event) => e.preventDefault()}
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

                {/* Fecha de Vigencia */}
                <div className="space-y-2">
                  <Label htmlFor="fechaVigencia">Vigencia (Fecha de vencimiento)*</Label>
                  <Input
                    id="fechaVigencia"
                    type="date"
                    value={formData.fechaVigencia}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, fechaVigencia: e.target.value }));
                    }}
                    className="bg-white border-2 border-gray-300"
                  />
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = e.target.value.replace(',', '.');
                          if (val === '' || (/^\d*\.?\d*$/.test(val) && parseFloat(val) <= 100)) {
                          setFormData(prev => ({ ...prev, descuentoPorcentaje: val === '' ? 0 : parseFloat(val) }));
                        }
                      }}
                      placeholder="0"
                      className="w-full pr-8 bg-white border-2 border-gray-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>

                </div>
              </TabsContent>

              <TabsContent value="productos" className="m-0 space-y-6">
                <div className="space-y-3 pt-2">
                <Label>Agregar Productos</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Producto - Buscador Directo */}
                  <div className="relative">
                    <Label className="text-xs text-muted-foreground">Producto (Nombre o Código)*</Label>
                    <Popover open={openSelectorProducto && productSearchTerm.trim() !== ""} onOpenChange={setOpenSelectorProducto}>
                      <PopoverTrigger asChild>
                        <div className="relative mt-1">
                          <Input
                            placeholder="Escribe el nombre o código..."
                            value={productSearchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setProductSearchTerm(e.target.value);
                              if (!openSelectorProducto) setOpenSelectorProducto(true);
                              // No reseteamos el ID aquí para permitir escribir y luego seleccionar
                            }}
                            className="bg-white border-2 border-gray-300 pr-10 h-10"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] p-0"
                        align="start"
                        onOpenAutoFocus={(e: Event) => e.preventDefault()}
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
                      <Label className="text-sm">Cantidad*</Label>
                      <Input
                        type="number"
                        min="1"
                        value={selectedQuantity}
                        onChange={(e) =>
                          setSelectedQuantity(
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full bg-white border-2 border-gray-300"
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
              </TabsContent>
            </div>
          </Tabs>

          <div className="px-8 py-6 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedCotizacion(null);
                resetFormData();
              }}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={crearCotizacion}
              disabled={
                !formData.clienteId ||
                formData.productos.length === 0
              }
              className="min-w-[150px] bg-black hover:bg-gray-800 text-white"
            >
              {isCreateDialogOpen
                ? "Crear Cotización"
                : "Actualizar Cotización"}
            </Button>
          </div>
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
  </div>
);
};
