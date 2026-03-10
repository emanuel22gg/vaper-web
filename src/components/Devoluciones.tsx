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
import { Textarea } from "./ui/textarea";
import { TablePagination } from './ui/TablePagination';
import { DetalleDevolucion } from "./DetalleDevolucion";
import { toast } from "sonner";
import {
  Search,
  Eye,
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
  ArrowRightCircle,
  ShieldCheck,
  History,
  Receipt,
  CheckCircle,
  Check
} from "lucide-react";
import { cn } from "./ui/utils";
import { Separator } from "./ui/separator";
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
  getDetalleVentaPedidos
} from "../services/api";
import {
  DevolucionDto,
  DetalleDevolucionDto,
  VentaPedidoDto,
  ProductoDto,
  UsuarioDto
} from "../types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

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
  });

  const [saleValidity, setSaleValidity] = useState<{ isValid: boolean; message: string; daysLeft?: number } | null>(null);

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
        const venta = vts.find(v => v.id === d.ventaPedidoId);
        const cliente = venta ? usr.find(u => u.id === venta.usuarioId) : null;
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
        // Traer detalles de la venta desde el endpoint correspondiente
        const todosLosDetalles = await getDetalleVentaPedidos();
        const detallesVenta = todosLosDetalles.filter((d: any) => d.ventaPedidoId === venda.id);

        const vendaConDetalles = {
          ...venda,
          detalleVenta_Pedido: detallesVenta
        };

        setVentaEncontrada(vendaConDetalles);
        setFormData(prev => ({ ...prev, ventaPedidoId: venda.id || 0 }));

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
      const nuevaDev: DevolucionDto = {
        ventaPedidoId: ventaEncontrada.id!,
        fechaDevolucion: new Date(formData.fechaDevolucion).toISOString(),
        motivo: formData.motivo,
        descripcion: formData.motivo, // Mapeo solicitado por el usuario
        estadoId: 5, // Status Aceptada
        montoTotal: formData.productosSeleccionados.reduce((acc, p) => {
          const prod = productos.find(pr => pr.id === p.productoId);
          return acc + (prod?.precio || 0) * p.cantidad;
        }, 0)
      };

      const response = await createDevolucion(nuevaDev);
      const devId = response.id || response.Id;

      if (devId) {
        // Enviar detalles y actualizar stock
        for (const p of formData.productosSeleccionados) {
          // 1. Guardar detalle
          await createDetalleDevolucion({
            devolucionId: devId,
            productoId: p.productoId,
            cantidad: p.cantidad,
            motivo: p.motivo
          });

          // 2. Incrementar stock del producto (ya que vuelve a la tienda)
          const prodOriginal = productos.find(pr => pr.id === p.productoId);
          if (prodOriginal) {
            await updateProducto(p.productoId, {
              ...prodOriginal,
              stock: prodOriginal.stock + p.cantidad
            });
          }
        }

        toast.success("Devolución Guardada", {
          description: "Los registros y el stock se han actualizado correctamente."
        });
        setIsNewDialogOpen(false);
        loadInitialData(); // Sincronizar UI
      }
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
    doc.text(`Concepto: ${devolucion.motivo || "Garantía General"}`, 20, 87);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento generado automáticamente por el sistema VAPER Admin.", 20, 130);

    doc.save(`Devolucion_PRV_${devolucion.id}.pdf`);
    toast.success("Descarga iniciada");
  };

  const handleAnularDevolucion = async (dev: DevolucionDto) => {
    try {
      if (!dev.id) return;
      await updateDevolucion(dev.id, {
        ...dev,
        estadoId: 3 // Anulado
      });

      // Revertir stock (DISMINUIR stock ya que el producto "no volvió" realmente)
      const detallesTicket = detallesDevolucion.filter(det => det.devolucionId === dev.id);
      for (const det of detallesTicket) {
        const prod = productos.find(p => p.id === det.productoId);
        if (prod) {
          await updateProducto(det.productoId, {
            ...prod,
            stock: Math.max(0, prod.stock - det.cantidad)
          });
        }
      }

      toast.success("Devolución Anulada", {
        description: `Ticket #DEV-${dev.id} invalidado y stock revertido.`
      });
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
      case 5: return "Aprobado";
      case 3: return "Anulado";
      case 4: return "Cancelado";
      default: return "Pendiente";
    }
  };

  const getClienteInfo = (usuarioId: number) => {
    const u = usuarios.find(usr => usr.id === usuarioId);
    return u ? `${u.nombres} ${u.apellidos}` : `Usuario #${usuarioId}`;
  };

  const getProductoNombre = (productoId: number) => {
    return productos.find(p => p.id === productoId)?.nombreProducto || `Item #${productoId}`;
  };

  const handleVerDetalle = (dev: DevolucionDto) => {
    setSelectedDevolucion(dev);
    setCurrentView("detail");
  };

  // --- FILTERED LISTS ---
  const filteredDevoluciones = devoluciones.filter(d => {
    const userVenta = ventas.find(v => v.id === d.ventaPedidoId);
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

  // Consideramos defectuosos todos los detalles por defecto en esta implementación demo,
  // pero el filtro real sería por el campo 'motivo' que contenga 'defectuoso'.
  const defectiveDetails = detallesDevolucion.filter(det => true);

  // --- RENDER VIEWS ---
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
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Anulado">Anulado</SelectItem>
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
                  const userVenta = ventas.find(v => v.id === dev.ventaPedidoId);
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
                            onClick={() => handleAnularDevolucion(dev)}
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
        if (!open) resetForm();
        setIsNewDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[780px] max-h-[92vh] overflow-hidden p-0 border shadow-2xl rounded-2xl bg-white flex flex-col">
          <DialogHeader className="p-5 pb-3 shrink-0 border-b bg-slate-50/50">
            <DialogTitle className="text-xl font-black text-slate-900">Registrar Nueva Devolución</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium tracking-tight">
              Siga los pasos para localizar la venta y detallar los productos a devolver.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="venta" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 mt-3 shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-0.5 h-9">
                <TabsTrigger value="venta" className="font-bold text-xs">1. Localizar Venta</TabsTrigger>
                <TabsTrigger value="devolucion" disabled={!ventaEncontrada} className="font-bold text-xs">2. Detalle de Devolución</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 modal-scroll">
              <TabsContent value="venta" className="mt-0 space-y-6 animate-in fade-in duration-300">
                {/* Buscador */}
                <div className="max-w-md mx-auto space-y-2 pt-2">
                  <Label htmlFor="venta-id" className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Referencia (ID Venta)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="venta-search-input"
                        placeholder="ID de venta"
                        className="h-10 pl-10 rounded-xl border-slate-200 focus-visible:ring-blue-600/20 font-bold text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleBuscarVenta((e.target as HTMLInputElement).value)}
                      />
                    </div>
                    <Button
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 font-black text-xs shadow-md transition-all active:scale-95"
                      onClick={() => {
                        const el = document.getElementById('venta-search-input') as HTMLInputElement;
                        handleBuscarVenta(el.value);
                      }}
                      disabled={buscandoVenta}
                    >
                      {buscandoVenta ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Localizar"}
                    </Button>
                  </div>
                </div>

                {ventaEncontrada && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-300 pt-2 border-t mt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{getClienteInfo(ventaEncontrada.usuarioId)}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Resumen del Cliente</p>
                      </div>
                      <Badge className="ml-auto bg-blue-50 text-blue-700 border-blue-100 font-black text-[10px]">
                        VENTA #{ventaEncontrada.id}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(() => {
                        const u = usuarios.find(usr => usr.id === ventaEncontrada.usuarioId);
                        return (
                          <>
                            <div className="p-2.5 bg-white border rounded-lg shadow-sm">
                              <Label className="text-[9px] uppercase font-bold text-slate-400 leading-none">Identificación</Label>
                              <p className="text-xs font-semibold text-slate-700 mt-1">{u?.tipoDocumento} {u?.numeroDocumento}</p>
                            </div>
                            <div className="p-2.5 bg-white border rounded-lg shadow-sm">
                              <Label className="text-[9px] uppercase font-bold text-slate-400 leading-none">Fecha Pedido</Label>
                              <p className="text-xs font-semibold text-slate-700 mt-1">{new Date(ventaEncontrada.fechaCreacion!).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="p-2.5 bg-white border rounded-lg shadow-sm">
                              <Label className="text-[9px] uppercase font-bold text-slate-400 leading-none">Tipo Operación</Label>
                              <p className="text-xs font-semibold text-slate-700 mt-1">{ventaEncontrada.tipoVenta || 'Venta'}</p>
                            </div>
                            <div className="p-2.5 bg-white border rounded-lg shadow-sm">
                              <Label className="text-[9px] uppercase font-bold text-slate-400 leading-none">Total Venta</Label>
                              <p className="text-xs font-black text-blue-600 mt-1">${ventaEncontrada.total?.toLocaleString()}</p>
                            </div>
                            <div className="p-2.5 bg-white border rounded-lg shadow-sm md:col-span-4 flex justify-between items-center">
                              <Label className="text-[9px] uppercase font-bold text-slate-400">Vigencia garantía</Label>
                              <p className="text-xs font-semibold text-slate-700">{ventaEncontrada.vigenciaDevolucion ? `${ventaEncontrada.vigenciaDevolucion} días registrados` : 'No especificado'}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="devolucion" className="mt-0 space-y-5 animate-in fade-in duration-300">
                {ventaEncontrada && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={cn(
                        "p-3 rounded-xl border flex items-center gap-3",
                        saleValidity?.isValid ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"
                      )}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          saleValidity?.isValid ? "bg-emerald-100" : "bg-red-100"
                        )}>
                          {saleValidity?.isValid ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Garantía</p>
                          <p className="text-xs font-black line-clamp-1">{saleValidity?.message}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border rounded-xl shadow-sm space-y-1">
                        <Label className="text-[9px] uppercase font-bold text-slate-400">Fecha Devolución</Label>
                        <Input
                          type="date"
                          value={formData.fechaDevolucion}
                          onChange={(e) => setFormData(p => ({ ...p, fechaDevolucion: e.target.value }))}
                          className="h-8 rounded-lg border-slate-200 font-bold text-xs bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Artículos a Devolver</Label>
                      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow className="h-8">
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead className="text-[9px] font-bold uppercase py-1">Producto</TableHead>
                              <TableHead className="text-center text-[9px] font-bold uppercase py-1">Stock Original</TableHead>
                              <TableHead className="text-center text-[9px] font-bold uppercase py-1 w-[120px]">Devolver</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(ventaEncontrada.detalleVenta_Pedido || []).map((p) => {
                              const selectedItem = formData.productosSeleccionados.find(ps => ps.productoId === p.productoId);
                              const isSelected = !!selectedItem;

                              return (
                                <TableRow key={p.productoId} className={cn("h-12 transition-colors", isSelected ? "bg-blue-50/30" : "")}>
                                  <TableCell className="text-center py-1">
                                    <div
                                      className={cn(
                                        "h-4 w-4 mx-auto rounded border flex items-center justify-center cursor-pointer transition-all",
                                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300"
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
                                  <TableCell className="py-1">
                                    <p className="font-bold text-slate-700 text-xs">{getProductoNombre(p.productoId)}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">${p.precioUnitario.toLocaleString()}</p>
                                  </TableCell>
                                  <TableCell className="text-center font-bold text-slate-400 text-xs py-1">{p.cantidad}</TableCell>
                                  <TableCell className="text-center py-1">
                                    {isSelected ? (
                                      <div className="flex items-center justify-center bg-white rounded-lg border border-slate-200 p-0.5">
                                        <button
                                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-50 text-slate-500"
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
                                          <ChevronLeft className="h-3 w-3" />
                                        </button>
                                        <span className="w-6 text-center font-black text-blue-600 text-xs">
                                          {selectedItem?.cantidad}
                                        </span>
                                        <button
                                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-50 text-slate-500"
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
                                          <ChevronRight className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] font-bold text-slate-300 uppercase italic">Pendiente</span>
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
                      <Label htmlFor="motivo" className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Motivo / Justificación</Label>
                      <Textarea
                        id="motivo"
                        placeholder="Motivo detallado..."
                        value={formData.motivo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        className="min-h-[60px] rounded-xl border-slate-200 focus-visible:ring-blue-600/20 text-xs font-medium"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-5 border-t shrink-0 flex flex-row items-center justify-between">
            <Button
              variant="outline"
              className="font-bold border-slate-200 text-xs h-9"
              onClick={() => setIsNewDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-black text-white hover:bg-slate-800 px-8 h-10 font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-30 text-xs"
              onClick={handleGuardarDevolucion}
              disabled={!ventaEncontrada || formData.productosSeleccionados.length === 0 || !saleValidity?.isValid}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-2" />
              Finalizar Devolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
