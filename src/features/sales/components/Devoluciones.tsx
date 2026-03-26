import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { TablePagination } from '@/shared/ui/TablePagination';
import { DetalleDevolucion } from "./DetalleDevolucion";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Trash2,
  X,
  Calendar,
  Package,
  RefreshCw,
  Plus,
  User,
  AlertCircle,
  Download,
  FileText,
  Ban,
  XCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Minus,
  ArrowRightCircle,
  ShieldCheck,
  History,
  Receipt,
  CheckCircle,
  Check,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { cn } from "@/shared/ui/utils";
import { Separator } from "@/shared/ui/separator";
import {
  getDevoluciones,
  getDetalleDevoluciones,
  createDevolucion,
  updateDevolucion,
  createDetalleDevolucion,
  getUsuarios,
  getProductos,
  getVentaPedidos,
  getVentaPedidoById,
  updateProducto,
  getDetalleVentaPedidos,
  updateVentaPedido,
  updateDetalleVentaPedido,
  deleteDetalleVentaPedido,
  createDetalleVentaPedido,
  getUsuarioById,
  getProductoById
} from "@/shared/services/api";
import {
  DevolucionDto,
  DetalleDevolucionDto,
  VentaPedidoDto,
  ProductoDto,
  UsuarioDto
} from "@/shared/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";

export const Devoluciones: React.FC = () => {
  // --- STATE ---
  const [devoluciones, setDevoluciones] = useState<DevolucionDto[]>([]);
  const [detallesDevolucion, setDetallesDevolucion] = useState<DetalleDevolucionDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [productos, setProductos] = useState<ProductoDto[]>([]);
  const [ventas, setVentas] = useState<VentaPedidoDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedDevolucion, setSelectedDevolucion] = useState<DevolucionDto | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [buscandoVenta, setBuscandoVenta] = useState(false);
  const [ventaEncontrada, setVentaEncontrada] = useState<VentaPedidoDto | null>(null);

  const [formData, setFormData] = useState({
    ventaPedidoId: 0,
    motivo: "",
    fechaDevolucion: new Date().toISOString().split('T')[0], // Fecha default hoy
    productosSeleccionados: [] as { productoId: number; cantidad: number; motivo: string }[],
    productosReposicion: [] as { productoId: number; cantidad: number; precioUnitario: number }[],
  });

  const [busquedaReposicion, setBusquedaReposicion] = useState("");
  const [loadingProductosReposicion, setLoadingProductosReposicion] = useState(false);

  const [saleValidity, setSaleValidity] = useState<{ isValid: boolean; message: string; daysLeft?: number } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [devolucionToAnular, setDevolucionToAnular] = useState<DevolucionDto | null>(null);
  const [activeTab, setActiveTab] = useState("venta");

  // Totales de unidades
  const totalDevueltoCant = formData.productosSeleccionados.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  const totalReposicionCant = formData.productosReposicion.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  // --- DATA LOADING ---
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [devs, dets, usr, prods, vts] = await Promise.all([
        getDevoluciones(),
        getDetalleDevoluciones(),
        getUsuarios(),
        getProductos(),
        getVentaPedidos()
      ]);

      // Mapear nombres de clientes para facilitar filtrado
      const devsWithClient = (devs || []).map(d => {
        const venta = vts.find(v => Number(v.id) === Number(d.ventaPedidoId ?? (d as any).VentaPedidoId));
        const cliente = venta ? usr.find(u => Number(u.id) === Number(venta.usuarioId)) : null;
        return {
          ...d,
          clienteNombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : "Desconocido"
        };
      });

      setDevoluciones(devsWithClient);
      setDetallesDevolucion(dets || []);
      setUsuarios(usr || []);
      setProductos(prods || []);
      setVentas(vts || []);
    } catch (error) {
      console.error("Error sincronizando devoluciones:", error);
      toast.error("Error al cargar datos de devoluciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // --- HELPERS ---
  const resetForm = () => {
    setFormData({
      ventaPedidoId: 0,
      motivo: "",
      fechaDevolucion: new Date().toISOString().split('T')[0],
      productosSeleccionados: [],
      productosReposicion: [],
    });
    setVentaEncontrada(null);
    setSaleValidity(null);
  };

  const handleBuscarVenta = async (query: string) => {
    if (!query) return;
    setBuscandoVenta(true);

    try {
        const venda = await getVentaPedidoById(parseInt(query));

      if (venda) {
        const ventaId = Number((venda as any).id ?? (venda as any).Id ?? 0);
        if (!ventaId) {
          toast.error("La venta no tiene un ID válido");
          setVentaEncontrada(null);
          setSaleValidity(null);
          return;
        }

        // Traer detalles: la API a veces envía ventaPedidoId como string o PascalCase; a veces solo vienen en el objeto venta
        const todosLosDetalles = await getDetalleVentaPedidos();
        const detalleFk = (d: any) => Number(d.ventaPedidoId ?? d.VentaPedidoId ?? 0);
        let detallesVenta = todosLosDetalles.filter((d: any) => detalleFk(d) === ventaId);

        if (detallesVenta.length === 0) {
          const embebidos =
            (venda as any).detalleVenta_Pedido ||
            (venda as any).detalleVentaPedidos ||
            (venda as any).DetalleVentaPedidos ||
            [];
          detallesVenta = Array.isArray(embebidos) ? [...embebidos] : [];
        }

        detallesVenta = detallesVenta.map((d: any) => ({
          ...d,
          id: d.id ?? d.Id,
          ventaPedidoId: ventaId,
          productoId: Number(d.productoId ?? d.ProductoId ?? 0),
          cantidad: Number(d.cantidad ?? d.Cantidad ?? 0),
          precioUnitario: Number(
            d.precioUnitario ?? d.PrecioUnitario ?? d.precio ?? 0
          ),
          subtotal: Number(d.subtotal ?? d.Subtotal ?? 0),
        }));

        // Población dinámica de productos si faltan en caché
        for (let det of detallesVenta) {
            const prodId = Number(det.productoId ?? det.ProductoId ?? 0);
            let prod = productos.find(p => Number(p.id) === prodId);
            if (!prod) {
                try {
                    const data = await getProductoById(prodId);
                    // Fetch directly from API
                    prod = data;
                } catch (e) {
                    console.error("Producto de la venta no encontrado:", e);
                }
            }
            if (prod) det.producto = prod;
        }

        let usu = usuarios.find(u => Number(u.id) === Number(venda.usuarioId));
        if (!usu) {
            try {
                // If the user isn't in our loaded array, fetch directly from the DB
                usu = await getUsuarioById(venda.usuarioId);
            } catch (e) {
                console.error("Usuario de la venta no encontrado:", e);
            }
        }

        const vendaConDetalles = {
          ...venda,
          detalleVenta_Pedido: detallesVenta,
          usuario: usu
        };

        setVentaEncontrada(vendaConDetalles);
        setFormData(prev => ({ ...prev, ventaPedidoId: ventaId }));

        // Calcular vigencia real (ahora usando el nuevo campo)
        if (venda.fechaCreacion) {
          const fechaVenta = new Date(venda.fechaCreacion);
          const hoy = new Date();
          // Usar vigenciaDevolucion del backend o por defecto 1 mes
          const mesesVigencia = venda.vigenciaDevolucion || 1;

          const fechaLimite = new Date(fechaVenta);
          fechaLimite.setMonth(fechaLimite.getMonth() + mesesVigencia);

          const diffTime = fechaLimite.getTime() - hoy.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffTime > 0) {
            setSaleValidity({
              isValid: true,
              message: `¡Garantía Vigente! (${diffDays} días restantes)`,
              daysLeft: diffDays
            });
            toast.success("Venta dentro de periodo de garantía");
          } else {
            setSaleValidity({
              isValid: false,
              message: `Garantía Expirada (${fechaLimite.toLocaleDateString()})`,
              daysLeft: 0
            });
            toast.error("Periodo de garantía finalizado");
          }
        }
      }
    } catch (error) {
      console.error("Error al buscar venta:", error);
      toast.error("Referencia de venta no encontrada");
      setVentaEncontrada(null);
      setSaleValidity(null);
    } finally {
      setBuscandoVenta(false);
    }
  };

  const handleAgregarProducto = (productoId: number, cantidad: number, motivo: string) => {
    setFormData(prev => {
      const yaSeleccionado = prev.productosSeleccionados.find(p => p.productoId === productoId);
      if (yaSeleccionado) {
        return {
          ...prev,
          productosSeleccionados: prev.productosSeleccionados.map(p =>
            p.productoId === productoId ? { ...p, cantidad: p.cantidad + cantidad } : p
          )
        };
      }
      return {
        ...prev,
        productosSeleccionados: [...prev.productosSeleccionados, { productoId, cantidad, motivo }]
      };
    });
  };

  const handleGuardarDevolucion = async () => {
    if (!ventaEncontrada) return;
    try {
      const totalDevuelto = formData.productosSeleccionados.reduce((acc, p) => {
        const prod = productos.find(pr => pr.id === p.productoId);
        return acc + (prod?.precio || 0) * p.cantidad;
      }, 0);

      const totalReposicion = formData.productosReposicion.reduce((acc, p) => {
        return acc + p.cantidad * p.precioUnitario;
      }, 0);

      const resumenReposicion = formData.productosReposicion.map(p => {
        const prod = productos.find(pr => pr.id === p.productoId);
        return `${p.cantidad}x ${prod?.nombreProducto || `Item #${p.productoId}`}`;
      }).join(", ");

      const descripcionConsolidada = `MOTIVO: ${formData.motivo || "Garantía General"}${resumenReposicion ? ` ||| REPOSICION: ${resumenReposicion}` : ""}`;

      const diferenciaNetos = totalReposicion - totalDevuelto;

      const nuevaDev: DevolucionDto = {
        ventaPedidoId: ventaEncontrada.id!,
        fechaDevolucion: new Date(formData.fechaDevolucion).toISOString(),
        motivo: formData.motivo,
        descripcion: descripcionConsolidada,
        estadoId: 5, // Status Aceptada
        montoTotal: totalDevuelto
      };

      const respDev = await createDevolucion(nuevaDev);
      const devId = respDev.id || respDev.Id;

      if (!devId) throw new Error("No se pudo obtener el ID de la devolución");

      let detallesOriginales = [...(ventaEncontrada.detalleVenta_Pedido || [])];
      const mapaConsolidado = new Map<number, any>();

      detallesOriginales.forEach(det => {
        mapaConsolidado.set(det.productoId, {
          productoId: det.productoId,
          originalQty: det.cantidad,
          finalQty: det.cantidad,
          precioUnitario: det.precioUnitario,
          originalDetail: det,
          action: 'update'
        });
      });

      for (const p of formData.productosSeleccionados) {
        const entry = mapaConsolidado.get(p.productoId);
        if (entry) {
          entry.finalQty -= p.cantidad;
          await createDetalleDevolucion({
            devolucionId: devId,
            detalleVentaPedidoId: entry.originalDetail?.id || 0,
            cantidad: p.cantidad,
            motivo: p.motivo
          });
        }
      }

      for (const p of formData.productosReposicion) {
        let entry = mapaConsolidado.get(p.productoId);
        const prodOriginal = productos.find(pr => pr.id === p.productoId);
        if (prodOriginal) {
          await updateProducto(p.productoId, {
            ...prodOriginal,
            stock: Math.max(0, prodOriginal.stock - p.cantidad)
          });
        }

        if (entry) {
          entry.finalQty += p.cantidad;
          entry.precioUnitario = p.precioUnitario;
        } else {
          mapaConsolidado.set(p.productoId, {
            productoId: p.productoId,
            finalQty: p.cantidad,
            precioUnitario: p.precioUnitario,
            action: 'create'
          });
        }
      }

      for (const [prodId, data] of mapaConsolidado.entries()) {
        if (data.action === 'update') {
          if (data.finalQty <= 0) {
            await deleteDetalleVentaPedido(data.originalDetail.id);
          } else if (data.finalQty !== data.originalQty || data.precioUnitario !== data.originalDetail.precioUnitario) {
            await updateDetalleVentaPedido(data.originalDetail.id, {
              ...data.originalDetail,
              cantidad: data.finalQty,
              precioUnitario: data.precioUnitario,
              subtotal: data.finalQty * data.precioUnitario
            });
          }
        } else if (data.action === 'create' && data.finalQty > 0) {
          await createDetalleVentaPedido({
            ventaPedidoId: ventaEncontrada.id!,
            productoId: prodId,
            cantidad: data.finalQty,
            precioUnitario: data.precioUnitario,
            subtotal: data.finalQty * data.precioUnitario
          });
        }
      }

      const nuevoTotal = (ventaEncontrada.total || 0) + diferenciaNetos;
      const nuevoSubtotal = (ventaEncontrada.subtotal || 0) + diferenciaNetos;
      
      await updateVentaPedido(ventaEncontrada.id!, {
        ...ventaEncontrada,
        total: nuevoTotal,
        subtotal: nuevoSubtotal
      });

      toast.success("Cambio Procesado", {
        description: "Se ha registrado la devolución y sincronizado el pedido y el inventario correctamente."
      });
      setIsNewDialogOpen(false);
      setShowConfirmDialog(false);
      resetForm();
      loadInitialData();
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la devolución");
    }
  };

  const handleExportPDF = (devolucion: DevolucionDto) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(21, 93, 252);
    doc.text("VAPER - COMPROBANTE DE DEVOLUCIÓN", 20, 25);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`REFERENCIA: DEV-${devolucion.id}`, 20, 45);
    doc.text(`FECHA PROCESO: ${new Date(devolucion.fechaDevolucion).toLocaleDateString()}`, 20, 52);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text("Resumen Económico", 20, 70);
    doc.setFontSize(12);
    doc.text(`Monto Total Devuelto: $${devolucion.montoTotal.toLocaleString()}`, 20, 80);
    const desc = devolucion.descripcion || "";
    let concepto = desc;
    if (desc.includes(" ||| REPOSICION: ")) {
      concepto = desc.split(" ||| REPOSICION: ")[0].replace("MOTIVO: ", "");
    } else if (desc.includes(" | [REPOSICIÓN]: ")) {
      concepto = desc.split(" | [REPOSICIÓN]: ")[0].replace("[MOTIVO]: ", "");
    } else if (desc.startsWith("MOTIVO: ")) {
      concepto = desc.replace("MOTIVO: ", "");
    } else if (desc.startsWith("[MOTIVO]: ")) {
      concepto = desc.replace("[MOTIVO]: ", "");
    }
    
    if (!concepto || concepto === "") concepto = "Garantía General";

    doc.text(`Concepto: ${concepto}`, 20, 87);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento generado automáticamente por el sistema VAPER Admin.", 20, 130);
    doc.save(`Devolucion_PRV_${devolucion.id}.pdf`);
    toast.success("Descarga iniciada");
  };

  const handleAnularDevolucion = async () => {
    const dev = devolucionToAnular;
    if (!dev || !dev.id) return;

    try {
      setLoading(true);
      await updateDevolucion(dev.id, {
        ...dev,
        estadoId: 3 // Anulado
      });
      const detallesTicket = detallesDevolucion.filter(det => det.devolucionId === dev.id);
      const ventaOriginal = ventas.find(v => Number(v.id) === Number(dev.ventaPedidoId));
      for (const det of detallesTicket) {
        const detalleVenta = ventaOriginal?.detalleVenta_Pedido?.find(d => d.id === det.detalleVentaPedidoId);
        const productoIdReal = detalleVenta?.productoId;
        if (productoIdReal) {
          const prod = productos.find(p => p.id === productoIdReal);
          if (prod) {
            await updateProducto(productoIdReal, {
              ...prod,
              stock: Math.max(0, prod.stock - det.cantidad)
            });
          }
        }
      }
      toast.success("Devolución Anulada", {
        description: `Ticket #DEV-${dev.id} invalidado y stock revertido.`
      });
      setIsAnularDialogOpen(false);
      setDevolucionToAnular(null);
      loadInitialData();
    } catch (error) {
      console.error("Error anular devolucion:", error);
      toast.error("No se pudo anular la devolución");
    }
  };

  const getStatusColor = (estadoId: number) => {
    switch (estadoId) {
      case 5: return "bg-green-500 hover:bg-green-600";
      case 3:
      case 4: return "bg-red-500 hover:bg-red-600";
      default: return "bg-amber-500 hover:bg-amber-600";
    }
  };

  const getStatusText = (estadoId: number) => {
    switch (estadoId) {
      case 5: return "Aceptada";
      case 3: return "Anulada";
      case 4: return "Cancelada";
      default: return "Pendiente";
    }
  };

  const getClienteInfo = (usuarioId: number) => {
    const u = usuarios.find(usr => Number(usr.id) === Number(usuarioId)) || ((ventaEncontrada as any)?.usuario);
    return u ? `${u.nombres} ${u.apellidos}` : `Usuario #${usuarioId}`;
  };

  const getProductoNombre = (p: any) => {
    if (p.producto && p.producto.nombreProducto) return p.producto.nombreProducto;
    const pid = Number(p.productoId ?? p.ProductoId ?? 0);
    const prd = productos.find(prod => Number(prod.id) === pid);
    if (prd) return prd.nombreProducto;
    return pid ? `Item #${pid}` : "Producto";
  };

  const handleVerDetalle = (dev: DevolucionDto) => {
    setSelectedDevolucion(dev);
    setCurrentView("detail");
  };

  const filteredDevoluciones = devoluciones.filter(d => {
    const userVenta = ventas.find(v => Number(v.id) === Number(d.ventaPedidoId));
    const clienteNombre = userVenta ? getClienteInfo(userVenta.usuarioId) : "";
    const matchesSearch = clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === "all" || getStatusText(d.estadoId) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);
  const paginatedDevoluciones = filteredDevoluciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const defectiveDetails = detallesDevolucion.filter(det => true);

  if (currentView === "detail" && selectedDevolucion) {
    return <DetalleDevolucion devolucion={selectedDevolucion} onBack={() => setCurrentView("list")} />;
  }

  return (
    <div className="space-y-6">
      {/* Header con título, filtros y botón - TODO EN UNO */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Gestión de Devoluciones</h1>
            <p className="text-muted-foreground text-sm">
              Administre retornos, garantías y devoluciones de productos
            </p>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              onClick={() => setIsNewDialogOpen(true)}
              className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Devolución
            </Button>
          </div>
        </div>

        {/* Filtros de búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 items-end pt-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Aceptada">Aceptada</SelectItem>
                <SelectItem value="Anulada">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Separador */}
        <Separator className="my-4" />

        {/* Tabla de devoluciones */}
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : paginatedDevoluciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron devoluciones
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDevoluciones.map((dev) => {
                  const userVenta = ventas.find(v => Number(v.id) === Number(dev.ventaPedidoId));
                  const usuario = userVenta ? usuarios.find(u => u.id === userVenta.usuarioId) : null;

                  return (
                    <TableRow key={dev.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-black">
                        {`DEV-${String(dev.id).padStart(3, '0')}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {usuario ? `${usuario.nombres} ${usuario.apellidos}` : "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {usuario?.correo || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          {`VEN-${String(dev.ventaPedidoId).padStart(3, '0')}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(dev.fechaDevolucion).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "flex items-center gap-1 w-fit capitalize text-white border-none",
                          dev.estadoId === 5 ? "bg-black hover:bg-black/90" :
                            (dev.estadoId === 3 || dev.estadoId === 4) ? "bg-red-600 hover:bg-red-700" : "bg-amber-500"
                        )}>
                          {dev.estadoId === 5 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {getStatusText(dev.estadoId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerDetalle(dev)}
                            title="Ver Detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportPDF(dev)}
                            disabled={dev.estadoId !== 5}
                            title="Descargar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDevolucionToAnular(dev);
                              setIsAnularDialogOpen(true);
                            }}
                            disabled={dev.estadoId === 3 || dev.estadoId === 4}
                            title="Anular Devolución"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDevoluciones.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="devoluciones"
          />
        )}
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={(open: boolean) => {
        if (!open) {
          resetForm();
          setActiveTab("venta");
        }
        setIsNewDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Devolución</DialogTitle>
            <DialogDescription>
              Siga los pasos para localizar la venta y detallar los productos a devolver.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="venta">Localizar venta</TabsTrigger>
              <TabsTrigger value="devolucion">Devolución</TabsTrigger>
              <TabsTrigger value="reposicion">Reposición</TabsTrigger>
            </TabsList>

              <TabsContent value="venta" className="space-y-4">
                {/* Buscador */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="venta-search-input">Referencia de venta / pedido</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          id="venta-search-input"
                          placeholder="Ingrese el ID (ej: 145)..."
                          className="pl-9"
                          onKeyPress={(e) => e.key === 'Enter' && handleBuscarVenta((e.target as HTMLInputElement).value)}
                        />
                      </div>
                      <Button
                        className="bg-[rgb(21,93,252)] hover:bg-blue-700 shrink-0"
                        onClick={() => {
                          const el = document.getElementById('venta-search-input') as HTMLInputElement;
                          handleBuscarVenta(el.value);
                        }}
                        disabled={buscandoVenta}
                      >
                        {buscandoVenta ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                        Localizar
                      </Button>
                    </div>
                  </div>

                {ventaEncontrada && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/80">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-medium text-gray-900">{getClienteInfo(ventaEncontrada.usuarioId)}</h3>
                          <Badge variant="outline" className="shrink-0 text-xs font-normal">
                            #{ventaEncontrada.id}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Información del cliente</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {(() => {
                        const u = usuarios.find(usr => Number(usr.id) === Number(ventaEncontrada.usuarioId)) || (ventaEncontrada as any).usuario;
                        const stats = [
                          { label: "Documento", val: `${u?.tipoDocumento || ''} ${u?.numeroDocumento || ''}`, icon: Receipt },
                          { label: "Fecha", val: new Date(ventaEncontrada.fechaCreacion!).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }), icon: Calendar },
                          { label: "Tipo", val: ventaEncontrada.tipoVenta || 'Venta', icon: FileText },
                          { label: "Total", val: `$${ventaEncontrada.total?.toLocaleString()}`, icon: CheckCircle, highlight: true }
                        ];

                        return stats.map((stat, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <stat.icon className="h-3.5 w-3.5 shrink-0" />
                              <span>{stat.label}</span>
                            </div>
                            <p className="text-sm text-gray-900">{stat.val}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

              <TabsContent value="devolucion" className="space-y-4">
                {ventaEncontrada && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={cn(
                        "p-3 rounded-lg border flex items-center gap-3",
                        saleValidity?.isValid ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                      )}>
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                          saleValidity?.isValid ? "bg-emerald-100" : "bg-red-100"
                        )}>
                          {saleValidity?.isValid ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900">Garantía</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{saleValidity?.message}</p>
                        </div>
                      </div>

                      <div className="space-y-2 p-3 border rounded-lg">
                        <Label htmlFor="fecha-devolucion">Fecha de registro</Label>
                        <Input
                          id="fecha-devolucion"
                          type="date"
                          value={formData.fechaDevolucion}
                          onChange={(e) => setFormData(p => ({ ...p, fechaDevolucion: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Productos a retornar</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]" />
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-center">Original</TableHead>
                              <TableHead className="text-center w-[100px]">Retorno</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(ventaEncontrada.detalleVenta_Pedido || []).map((p) => {
                              const selectedItem = formData.productosSeleccionados.find(ps => ps.productoId === p.productoId);
                              const isSelected = !!selectedItem;

                              return (
                                <TableRow key={p.productoId} className={cn(isSelected ? "bg-blue-50/50" : "")}>
                                  <TableCell className="text-center py-2">
                                    <div
                                      className={cn(
                                        "h-4 w-4 mx-auto rounded border flex items-center justify-center cursor-pointer",
                                        isSelected ? "bg-[rgb(21,93,252)] border-[rgb(21,93,252)] text-white" : "bg-background border-input"
                                      )}
                                      onClick={() => {
                                        if (isSelected) {
                                          setFormData(prev => ({
                                            ...prev,
                                            productosSeleccionados: prev.productosSeleccionados.filter(ps => ps.productoId !== p.productoId)
                                          }));
                                        } else {
                                          handleAgregarProducto(p.productoId, p.cantidad, "Garantía");
                                        }
                                      }}
                                    >
                                      {isSelected && <Check className="h-2.5 w-2.5" />}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <p className="text-sm font-medium truncate max-w-[180px]">{getProductoNombre(p)}</p>
                                    <p className="text-xs text-muted-foreground">${p.precioUnitario.toLocaleString()}</p>
                                  </TableCell>
                                  <TableCell className="text-center text-sm py-2">{p.cantidad}</TableCell>
                                  <TableCell className="text-center py-2">
                                    {isSelected ? (
                                      <div className="flex items-center justify-center rounded-md border border-input p-0.5 h-8 max-w-[110px] mx-auto">
                                        <button
                                          type="button"
                                          className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-muted text-muted-foreground"
                                          onClick={() => {
                                            const newVal = Math.max(1, (selectedItem?.cantidad || 1) - 1);
                                            setFormData(prev => ({
                                              ...prev,
                                              productosSeleccionados: prev.productosSeleccionados.map(ps =>
                                                ps.productoId === p.productoId ? { ...ps, cantidad: newVal } : ps
                                              )
                                            }));
                                          }}
                                        >
                                          <Minus className="h-2.5 w-2.5" />
                                        </button>
                                        <Input
                                          className="w-8 h-6 text-center text-sm border-0 shadow-none p-0 focus-visible:ring-0"
                                          type="number"
                                          min="1"
                                          max={p.cantidad}
                                          value={selectedItem?.cantidad || ''}
                                          onChange={(e) => {
                                              const raw = e.target.value;
                                              if (raw === '') {
                                                   setFormData(prev => ({ ...prev, productosSeleccionados: prev.productosSeleccionados.map(ps => ps.productoId === p.productoId ? { ...ps, cantidad: '' as any } : ps) }));
                                                   return;
                                              }
                                              const val = parseInt(raw, 10);
                                              if (isNaN(val)) return;
                                              const finalVal = val > p.cantidad ? p.cantidad : val;
                                              setFormData(prev => ({ ...prev, productosSeleccionados: prev.productosSeleccionados.map(ps => ps.productoId === p.productoId ? { ...ps, cantidad: finalVal } : ps) }));
                                          }}
                                        />
                                        <button
                                          type="button"
                                          className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-muted text-muted-foreground"
                                          onClick={() => {
                                            const newVal = Math.min(p.cantidad, (selectedItem?.cantidad || 1) + 1);
                                            setFormData(prev => ({
                                              ...prev,
                                              productosSeleccionados: prev.productosSeleccionados.map(ps =>
                                                ps.productoId === p.productoId ? { ...ps, cantidad: newVal } : ps
                                              )
                                            }));
                                          }}
                                        >
                                          <Plus className="h-2.5 w-2.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">Seleccione</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivo">Observaciones / motivo</Label>
                      <Textarea
                        id="motivo"
                        placeholder="Describa el estado del producto..."
                        value={formData.motivo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        className="min-h-[80px]"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="reposicion" className="space-y-4">
                {ventaEncontrada && (
                  <>
                    <div className="p-3 border rounded-lg space-y-2 bg-muted/30">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Plus className="h-4 w-4" />
                          Catálogo de reposición
                        </Label>
                        <Badge variant="outline" className={cn(
                          "text-xs font-normal",
                          totalReposicionCant === totalDevueltoCant ? "border-amber-200 bg-amber-50 text-amber-800" : ""
                        )}>
                          Reposición: {totalReposicionCant} / {totalDevueltoCant} uds.
                        </Badge>
                      </div>
                      <div className="relative z-10">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Buscar por nombre..."
                          className="pl-9"
                          value={busquedaReposicion}
                          onChange={async (e) => {
                              setBusquedaReposicion(e.target.value);
                              if (e.target.value.length > 2 && !loadingProductosReposicion) {
                                  setLoadingProductosReposicion(true);
                                  try {
                                      const freshProds = await getProductos();
                                      setProductos(freshProds);
                                  } catch (error) {
                                      console.error("Error fetching fresh catalog", error);
                                  } finally {
                                      setLoadingProductosReposicion(false);
                                  }
                              }
                          }}
                        />
                        {busquedaReposicion && (
                        <div className="bg-popover border rounded-md shadow-md max-h-[140px] overflow-y-auto absolute top-full left-0 right-0 z-50 mt-1">
                          {productos
                            .filter(p => p.nombreProducto.toLowerCase().includes(busquedaReposicion.toLowerCase()) && p.estado && p.stock > 0)
                            .map(p => (
                              <div
                                key={p.id}
                                className="p-2 hover:bg-muted/80 cursor-pointer flex justify-between items-center border-b last:border-0"
                                onClick={() => {
                                  if (totalReposicionCant >= totalDevueltoCant) {
                                    toast.error("Límite alcanzado", { description: `Máximo ${totalDevueltoCant} unidades.` });
                                    return;
                                  }
                                  setFormData(prev => {
                                    const existing = prev.productosReposicion.find(pr => pr.productoId === p.id);
                                    if (existing) {
                                      return {
                                        ...prev,
                                        productosReposicion: prev.productosReposicion.map(pr =>
                                          pr.productoId === p.id ? { ...pr, cantidad: pr.cantidad + 1 } : pr
                                        )
                                      };
                                    }
                                    return {
                                      ...prev,
                                      productosReposicion: [...prev.productosReposicion, { productoId: p.id!, cantidad: 1, precioUnitario: p.precio }]
                                    };
                                  });
                                  setBusquedaReposicion("");
                                }}
                              >
                                <div>
                                  <p className="text-sm font-medium">{p.nombreProducto}</p>
                                  <p className="text-xs text-muted-foreground">${p.precio.toLocaleString()} · Stock: {p.stock}</p>
                                </div>
                                <Plus className="h-4 w-4 text-[rgb(21,93,252)] shrink-0" />
                              </div>
                            ))}
                        </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Resumen de cambio</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[150px] overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted/50">
                              <TableRow>
                                <TableHead className="px-4">Producto</TableHead>
                                <TableHead className="text-center w-[100px]">Cantidad</TableHead>
                                <TableHead className="text-right px-4">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.productosReposicion.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm italic">
                                    Agregue productos desde el buscador.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                formData.productosReposicion.map((p) => (
                                  <TableRow key={p.productoId}>
                                    <TableCell className="px-4 py-2">
                                      <p className="text-sm font-medium truncate max-w-[200px]">{getProductoNombre(p)}</p>
                                      <p className="text-xs text-muted-foreground">${p.precioUnitario.toLocaleString()}</p>
                                    </TableCell>
                                      <TableCell className="text-center py-2">
                                        <div className="flex items-center justify-center rounded-md border border-input h-8 w-[96px] mx-auto overflow-hidden">
                                          <button 
                                              type="button"
                                              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0" 
                                              onClick={() => {
                                                setFormData(prev => ({
                                                  ...prev,
                                                  productosReposicion: prev.productosReposicion
                                                    .map(pr => pr.productoId === p.productoId ? { ...pr, cantidad: Math.max(0, pr.cantidad - 1) } : pr)
                                                    .filter(pr => pr.cantidad > 0)
                                                }));
                                              }}
                                          >
                                              <Minus className="h-3 w-3" />
                                          </button>
                                          
                                          <Input
                                            className="w-10 h-6 text-center text-sm border-0 shadow-none p-0 focus-visible:ring-0 [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                                            type="number"
                                            min="1"
                                            value={p.cantidad || ''}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                const stockMax = productos.find(pr => pr.id === p.productoId)?.stock || 0;
                                                
                                                if (raw === '') {
                                                     setFormData(prev => ({
                                                          ...prev,
                                                          productosReposicion: prev.productosReposicion.map(pr =>
                                                            pr.productoId === p.productoId ? { ...pr, cantidad: '' as any } : pr
                                                          )
                                                     }));
                                                     return;
                                                }
                                                const val = parseInt(raw, 10);
                                                if (isNaN(val)) return;
                                                
                                                const finalValPre = val > stockMax ? stockMax : val;
                                                // Restricción extra: no superar el total devuelto
                                                const cupoRestante = totalDevueltoCant - (totalReposicionCant - (p.cantidad || 0));
                                                const finalVal = Math.min(finalValPre, cupoRestante);

                                                if (val > stockMax) toast.error(`Stock insuficiente. Máximo: ${stockMax}`);
                                                else if (val > cupoRestante) toast.error(`Máximo permitido por devolución: ${cupoRestante} uds.`);
                                                
                                                setFormData(prev => ({
                                                    ...prev,
                                                    productosReposicion: prev.productosReposicion.map(pr =>
                                                      pr.productoId === p.productoId ? { ...pr, cantidad: finalVal } : pr
                                                    )
                                                }));
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                                                     setFormData(prev => ({
                                                          ...prev,
                                                          productosReposicion: prev.productosReposicion.map(pr =>
                                                            pr.productoId === p.productoId ? { ...pr, cantidad: 1 } : pr
                                                          )
                                                     }));
                                                }
                                            }}
                                          />

                                          <button 
                                              type="button"
                                              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0" 
                                              onClick={() => {
                                                const stock = productos.find(pr => pr.id === p.productoId)?.stock || 0;
                                                if (p.cantidad < stock) {
                                                  if (totalReposicionCant < totalDevueltoCant) {
                                                    setFormData(prev => ({
                                                      ...prev,
                                                      productosReposicion: prev.productosReposicion.map(pr =>
                                                        pr.productoId === p.productoId ? { ...pr, cantidad: pr.cantidad + 1 } : pr
                                                      )
                                                    }));
                                                  } else {
                                                    toast.error("Límite de devolución alcanzado");
                                                  }
                                                } else {
                                                  toast.error("Stock insuficiente");
                                                }
                                              }}
                                          >
                                              <Plus className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right px-4 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                          <span className="text-sm text-gray-900">
                                            ${(p.cantidad * p.precioUnitario).toLocaleString()}
                                          </span>
                                          <button
                                            type="button"
                                            className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-600 rounded-md"
                                            onClick={() => {
                                              setFormData(prev => ({
                                                ...prev,
                                                productosReposicion: prev.productosReposicion.filter(pr => pr.productoId !== p.productoId)
                                              }));
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/40 rounded-lg border flex justify-between items-baseline gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Sale</span>
                          <span className="text-sm font-semibold text-red-600">
                            -${formData.productosSeleccionados.reduce((acc, ps) => {
                              const prod = productos.find(p => p.id === ps.productoId);
                              return acc + (prod?.precio || 0) * ps.cantidad;
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 bg-muted/40 rounded-lg border flex justify-between items-baseline gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Entra</span>
                          <span className="text-sm font-semibold text-emerald-600">
                            +${formData.productosReposicion.reduce((acc, pr) => acc + pr.cantidad * pr.precioUnitario, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 border rounded-lg flex justify-between items-center gap-3">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-semibold text-gray-900">Diferencial de ajuste</span>
                          <span className="text-xs text-muted-foreground">Balance neto al pedido</span>
                        </div>
                        <span className="text-lg font-semibold tabular-nums shrink-0">
                          {(() => {
                            const totalDev = formData.productosSeleccionados.reduce((acc, ps) => {
                              const prod = productos.find(p => p.id === ps.productoId);
                              return acc + (prod?.precio || 0) * ps.cantidad;
                            }, 0);
                            const totalRep = formData.productosReposicion.reduce((acc, pr) => acc + pr.cantidad * pr.precioUnitario, 0);
                            const diff = totalRep - totalDev;
                            return (diff >= 0 ? "+" : "") + "$" + diff.toLocaleString();
                          })()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                Cancelar
              </Button>
              {activeTab !== "venta" && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    if (activeTab === "reposicion") setActiveTab("devolucion");
                    else if (activeTab === "devolucion") setActiveTab("venta");
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Regresar
                </Button>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
              {activeTab !== "reposicion" ? (
                <Button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black border-none flex-1 sm:flex-initial"
                  onClick={() => {
                    if (activeTab === "venta") setActiveTab("devolucion");
                    else if (activeTab === "devolucion") setActiveTab("reposicion");
                  }}
                  disabled={
                    (activeTab === "venta" && !ventaEncontrada) ||
                    (activeTab === "devolucion" && (formData.productosSeleccionados.length === 0 || !saleValidity?.isValid))
                  }
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black border-none flex-1 sm:flex-initial"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!ventaEncontrada || formData.productosSeleccionados.length === 0 || !saleValidity?.isValid || totalReposicionCant > totalDevueltoCant}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Procesar devolución
                </Button>
              )}
            </div>
          </DialogFooter>

          {/* Dialogo de Confirmación de Impacto */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl max-w-sm">
              <AlertDialogHeader>
                <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <AlertDialogTitle className="text-xl font-black text-center">Confirmar Operación</AlertDialogTitle>
                <AlertDialogDescription className="text-center space-y-4 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                    Estás a punto de registrar un cambio. Esta acción tendrá los siguientes efectos:
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-1 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                        <Package className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-[10px] font-medium text-slate-600">
                        <span className="font-black text-blue-600 uppercase tracking-tighter mr-1">Inventario:</span> Se descontarán las unidades de reposición. Los devueltos no volverán a stock por ser defectuosos.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <FileText className="h-3 w-3 text-emerald-600" />
                      </div>
                      <p className="text-[10px] font-medium text-slate-600">
                        <span className="font-black text-emerald-600 uppercase tracking-tighter mr-1">Finanzas:</span> El <span className="underline">Total del Pedido</span> se ajustará según la diferencia de precios.
                      </p>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex gap-2">
                <AlertDialogCancel className="rounded-xl font-bold text-xs h-11 flex-1 border-slate-200">Revisar</AlertDialogCancel>
                <AlertDialogAction 
                  className="rounded-xl font-black text-xs h-11 flex-1 bg-black hover:bg-slate-800"
                  onClick={handleGuardarDevolucion}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Diálogo de Confirmación de Anulación */}
          <AlertDialog open={isAnularDialogOpen} onOpenChange={setIsAnularDialogOpen}>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl max-w-md">
              <AlertDialogHeader>
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <AlertDialogTitle className="text-xl font-black text-center text-red-600">¿Anular esta Devolución?</AlertDialogTitle>
                <AlertDialogDescription className="text-center pt-2">
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-800 text-xs font-medium leading-relaxed mb-4">
                    Atención: Esta acción invalidará el ticket, revertirá el estado del pedido y re-ajustará el stock correspondientemente. Esta operación no se puede deshacer.
                  </div>
                  {devolucionToAnular && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                          <Receipt className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Referencia</p>
                          <p className="text-sm font-black text-gray-900 leading-none">DEV-{String(devolucionToAnular.id).padStart(3, '0')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Cliente</p>
                          <p className="text-sm font-black text-gray-900 leading-none">
                            {(() => {
                                const userVenta = ventas.find(v => Number(v.id) === Number(devolucionToAnular.ventaPedidoId));
                                const usuario = userVenta ? usuarios.find(u => u.id === userVenta.usuarioId) : null;
                                return usuario ? `${usuario.nombres} ${usuario.apellidos}` : "N/A";
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 flex gap-3">
                <AlertDialogCancel 
                  onClick={() => setDevolucionToAnular(null)}
                  className="rounded-xl font-bold text-xs h-12 flex-1 border-gray-200"
                >
                  Regresar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAnularDevolucion}
                  className="rounded-xl font-bold text-xs h-12 flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-200"
                >
                  Sí, Anular Ticket
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </div>
  );
};
