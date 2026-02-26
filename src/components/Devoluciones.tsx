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
} from "lucide-react";
import {
  getDevoluciones,
  getDetalleDevoluciones,
  getVentaPedidos,
  getProductos,
  getUsuarios,
  createDevolucion,
  createDetalleDevolucion,
  updateDevolucion,
  getVentaPedidoById
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
      setDevoluciones(devs || []);
      setDetallesDevolucion(dets || []);
      setUsuarios(usr || []);
      setProductos(prods || []);
      setVentas(vts || []);
    } catch (error) {
      console.error("Error sincronizando devoluciones:", error);
      toast.error("Error al conectar con el servidor central");
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
      productosSeleccionados: [],
    });
    setVentaEncontrada(null);
    setSaleValidity(null);
  };

  const handleBuscarVenta = async (query: string) => {
    if (!query) return;
    setBuscandoVenta(true);

    try {
      // Intentamos obtener el detalle completo directamente de la API para asegurar los sub-niveles (detalles)
      const venda = await getVentaPedidoById(parseInt(query));

      if (venda) {
        setVentaEncontrada(venda);
        setFormData(prev => ({ ...prev, ventaPedidoId: venda.id || 0 }));

        // Calcular vigencia
        if (venda.fechaCreacion) {
          const fechaVenta = new Date(venda.fechaCreacion);
          const hoy = new Date();
          const mesesVigencia = venda.vigenciaDevolucion || 1;

          const fechaLimite = new Date(fechaVenta);
          fechaLimite.setMonth(fechaLimite.getMonth() + mesesVigencia);

          const diffTime = fechaLimite.getTime() - hoy.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffTime > 0) {
            setSaleValidity({
              isValid: true,
              message: `Vigente por ${diffDays} días más`,
              daysLeft: diffDays
            });
          } else {
            setSaleValidity({
              isValid: false,
              message: `Garantía expirada (Venció el ${fechaLimite.toLocaleDateString()})`
            });
            toast.warning("Venta fuera de vigencia", {
              description: "El periodo de garantía para esta venta ha expirado."
            });
          }
        } else {
          setSaleValidity({ isValid: true, message: "Sin restricción de fecha detectada" });
        }
      }
    } catch (error) {
      console.error("Error al buscar venta:", error);
      toast.error("Venta no localizada", {
        description: "Verifique que el ID de venta sea correcto y exista en la base de datos."
      });
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
        fechaDevolucion: new Date().toISOString(),
        motivo: formData.motivo,
        estadoId: 5, // Status Aceptada (Basado en lógica previa)
        montoTotal: formData.productosSeleccionados.reduce((acc, p) => {
          const prod = productos.find(pr => pr.id === p.productoId);
          return acc + (prod?.precio || 0) * p.cantidad;
        }, 0)
      };

      const response = await createDevolucion(nuevaDev);
      const devId = response.id || response.Id;

      if (devId) {
        // Enviar detalles
        for (const p of formData.productosSeleccionados) {
          await createDetalleDevolucion({
            devolucionId: devId,
            productoId: p.productoId,
            cantidad: p.cantidad,
            motivo: p.motivo
          });
        }
        toast.success("Devolución Guardada", {
          description: "Los registros se han actualizado correctamente."
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
      toast.success("Devolución Anulada", {
        description: `El ticket #DEV-${dev.id} ha sido marcado como anulado.`
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
    <div className="space-y-6 p-6">
      {/* Card principal con todo integrado */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Gestión de Devoluciones</CardTitle>
              <CardDescription>
                Administra los retornos y garantías de ventas procesadas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadInitialData} variant="outline" size="icon" className="bg-white border-slate-200">
                <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={isNewDialogOpen} onOpenChange={(open: boolean) => {
                setIsNewDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-[rgb(21,93,252)] hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Devolución
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                  {/* ... Contenido del diálogo (se mantiene igual) ... */}
                  <div className="p-6 border-b bg-slate-50/50">
                    <DialogTitle className="text-xl font-bold text-slate-900">Registrar Garantía / Retorno</DialogTitle>
                    <DialogDescription>Inicie el trámite vinculando una venta autorizada.</DialogDescription>
                  </div>
                  <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                    <div className="space-y-2">
                      <Label htmlFor="venta-search" className="text-xs font-bold text-slate-500 uppercase">Referencia de venta o pedido</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="venta-search"
                            placeholder="Ingrese ID de Pedido (ej: 14)..."
                            className="pl-9 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                            onKeyPress={(e) => e.key === 'Enter' && handleBuscarVenta((e.target as HTMLInputElement).value)}
                          />
                        </div>
                        <Button className="h-11 px-6 bg-slate-900" onClick={() => {
                          const el = document.getElementById('venta-search') as HTMLInputElement;
                          handleBuscarVenta(el.value);
                        }}>
                          {buscandoVenta ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Buscar"}
                        </Button>
                      </div>
                    </div>
                    {ventaEncontrada && (
                      <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg shadow-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Cliente Titular</p>
                            <p className="text-sm font-semibold truncate">{getClienteInfo(ventaEncontrada.usuarioId)}</p>
                            <p className="text-[10px] text-slate-500 mt-1">ID Usuario: {ventaEncontrada.usuarioId}</p>
                          </div>
                          <div className={`rounded-xl p-4 shadow-lg flex flex-col justify-center ${saleValidity?.isValid ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-red-50 text-red-700 border border-red-100 shadow-red-50'}`}>
                            <p className="text-[10px] opacity-80 font-bold uppercase mb-0.5 text-center">Estado de Vigencia</p>
                            <p className="text-xs font-bold text-center">{saleValidity?.message}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Fecha de Venta</p>
                            <p className="text-sm font-semibold text-slate-700">{ventaEncontrada.fechaCreacion ? new Date(ventaEncontrada.fechaCreacion).toLocaleDateString() : "No registrada"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Total Venta</p>
                            <p className="text-sm font-bold text-slate-900">${ventaEncontrada.total.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase">Seleccionar producto de la compra</Label>
                          <Select onValueChange={(val: string) => handleAgregarProducto(parseInt(val), 1, "Devolución por garantía")}>
                            <SelectTrigger className="h-11 bg-white">
                              <SelectValue placeholder="Busque productos adquiridos en esta venta..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {ventaEncontrada.detalleVenta_Pedido && ventaEncontrada.detalleVenta_Pedido.length > 0 ? (
                                ventaEncontrada.detalleVenta_Pedido.map(d => (
                                  <SelectItem key={d.productoId} value={d.productoId.toString()}>
                                    {getProductoNombre(d.productoId)} (Adquirido: {d.cantidad} ud)
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-xs text-slate-500 italic text-center">
                                  No se detectaron ítems en el detalle de esta venta.
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-slate-400 italic font-medium px-1">
                            * Solo se muestran los productos que el cliente llevó en esta compra.
                          </p>
                        </div>

                        {formData.productosSeleccionados.length > 0 && (
                          <div className="rounded-lg border border-slate-200 divide-y overflow-hidden shadow-sm">
                            {formData.productosSeleccionados.map(p => (
                              <div key={p.productoId} className="flex justify-between items-center p-3 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Package className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">{getProductoNombre(p.productoId)}</p>
                                    <p className="text-[10px] text-slate-500">Cantidad a devolver: {p.cantidad}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50" onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    productosSeleccionados: prev.productosSeleccionados.filter(ps => ps.productoId !== p.productoId)
                                  }));
                                }}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Motivo de la devolución</Label>
                      <Textarea
                        placeholder="Escriba aquí la razón del retorno o desperfecto reportado..."
                        className="min-h-[100px] bg-white border-slate-200"
                        value={formData.motivo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                    <Button variant="ghost" className="font-medium text-slate-500" onClick={() => setIsNewDialogOpen(false)}>Cancelar</Button>
                    <Button
                      disabled={!ventaEncontrada || formData.productosSeleccionados.length === 0 || !saleValidity?.isValid}
                      className={`px-8 rounded-lg shadow-lg ${!saleValidity?.isValid ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                      onClick={handleGuardarDevolucion}
                    >
                      Confirmar Proceso
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID de Ticket o Nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de garantía" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Ver todos los casos</SelectItem>
                  <SelectItem value="Aprobado">Aprobado</SelectItem>
                  <SelectItem value="Anulado">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla de devoluciones */}
          {(searchTerm !== "" || filterStatus !== "all") && paginatedDevoluciones.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron devoluciones</h3>
              <p className="text-muted-foreground mb-4">No hay registros que coincidan con los filtros aplicados</p>
              <Button onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-[120px]">ID Devolución</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Venta/Pedido</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Cargando devoluciones...
                      </TableCell>
                    </TableRow>
                  ) : paginatedDevoluciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No hay devoluciones registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDevoluciones.map((dev) => (
                      <TableRow key={dev.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-500">
                          #DEV-{dev.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-black">
                            {getClienteInfo(dev.ventaPedidoId)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono text-xs">
                          VNT-{dev.ventaPedidoId}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(dev.estadoId)} text-white border-none py-1 rounded-full text-[10px] font-bold uppercase`}>
                            {getStatusText(dev.estadoId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerDetalle(dev)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportPDF(dev)}
                              title="Exportar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={dev.estadoId === 3}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                                  title="Anular devolución"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Está seguro de anular esta devolución?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción marcará la devolución #DEV-{dev.id} como anulada. Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleAnularDevolucion(dev)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Confirmar Anulación
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDevoluciones.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemName="devoluciones"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
