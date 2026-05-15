import React, { useState, useEffect, useMemo } from "react";
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
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { TablePagination } from '@/shared/ui/TablePagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { VentaPedidoDto, UsuarioDto, Producto } from "@/shared/types";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { getVentaPedidos, getUsuarios, updateVentaPedido, getEstados, getDetalleVentaPedidos, notificarEstadoPedido } from "@/shared/services/api";
import { CreateVentaPedidoView } from "../pedidos/CreateVentaPedidoView";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  Eye,
  Edit3,
  Search,
  Package,
  ShoppingCart,
  Info,
  User,
  MapPin,
  CreditCard,
  Loader2
} from "lucide-react";
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';

interface PedidosProps {
  onNavigateToDetail?: (id: string) => void;
  initialSearchTerm?: string;
}

export const Pedidos: React.FC<PedidosProps> = ({
  onNavigateToDetail,
  initialSearchTerm = '',
}) => {
  // Estados para pedidos y UI
  const [pedidos, setPedidos] = useState<VentaPedidoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filterStatus, setFilterStatus] = useState("all");
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedPedido, setSelectedPedido] = useState<VentaPedidoDto | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pedidoToUpdate, setPedidoToUpdate] = useState<VentaPedidoDto | null>(null);
  const [newStatusId, setNewStatusId] = useState<number>(0);

  // Estados para mostrar detalle completo del pedido
  const [showDetallePedido, setShowDetallePedido] = useState(false);

  // Estados para crear pedido
  const [showCreateView, setShowCreateView] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusName = (id: number) => {
    const status = statuses.find(s => s.id === id);
    if (!status) return "cargando...";
    const name = status.nombreEstado.toLowerCase();
    if (name === 'anulado' || name === 'anulada') return 'cancelado';
    return name;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pedidosData, usuariosData, estadosData, productosData, detallesData] = await Promise.all([
        getVentaPedidos(),
        getUsuarios(),
        getEstados(),
        fetch('/api/Productoes').then(res => res.json()),
        getDetalleVentaPedidos()
      ]);

      // Mapear detalles a sus respectivos pedidos
      const pedidosConDetalles = pedidosData.map(pedido => ({
        ...pedido,
        detalleVenta_Pedido: detallesData.filter(
          (d: any) => Number(d.ventaPedidoId ?? d.VentaPedidoId) === Number(pedido.id)
        )
      })).sort((a, b) => (b.id || 0) - (a.id || 0));

      setPedidos(pedidosConDetalles);
      setUsuarios(usuariosData);
      setStatuses(estadosData);
      setProductos(productosData.map((p: any) => ({
        id: p.id,
        nombreProducto: p.nombreProducto,
        precio: p.precio,
        stock: p.stock,
        categoriaId: p.categoriaId,
        descripcion: p.descripcion,
        idImagen: p.idImagen,
        estado: p.estado
      })));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioName = (usuarioId: number) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : `ID: ${usuarioId}`;
  };

  const getUsuarioDocument = (usuarioId: number) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.numeroDocumento : "N/A";
  };

  // Filtrado derivado de los estados (uso de useMemo para evitar desincronización y crashes)
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const term = (searchTerm || "").toLowerCase().trim();
      const usuarioName = getUsuarioName(pedido.usuarioId).toLowerCase();
      const statusName = getStatusName(pedido.estadoId).toLowerCase();
      const idMatch = pedido.id?.toString().includes(term) || term === `#${pedido.id}`;

      const matchesSearch =
        term === "" ||
        usuarioName.includes(term) ||
        (pedido.metodoPago || "").toLowerCase().includes(term) ||
        getUsuarioDocument(pedido.usuarioId).toLowerCase().includes(term) ||
        idMatch;

      const matchesStatus =
        filterStatus === "all" || statusName === filterStatus;

      const matchesTipo = pedido.tipoVenta !== 'Venta';

      return matchesSearch && matchesStatus && matchesTipo;
    });
  }, [pedidos, searchTerm, filterStatus, usuarios, statuses]); // Dependencias completas

  const totalPages = Math.max(
    Math.ceil(filteredPedidos.length / itemsPerPage),
    1,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPedidos = filteredPedidos.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (estado: string) => {
    const s = estado.toLowerCase();
    if (s.includes('completa') || s.includes('entrega') || s.includes('aceptad')) return "text-green-600";
    if (s.includes('enviado')) return "text-blue-600";
    if (s.includes('despachan') || s.includes('preparan')) return "text-cyan-600";
    if (s.includes('pendien')) return "text-amber-600";
    if (s.includes('abono')) return "text-indigo-600";
    if (s.includes('anula') || s.includes('cancel')) return "text-red-600";
    return "text-slate-600";
  };

  const getStatusIcon = (estado: string) => {
    const s = estado.toLowerCase();
    if (s.includes('completa') || s.includes('entrega') || s.includes('aceptad')) return <CheckCircle className="h-3 w-3" />;
    if (s.includes('enviado')) return <ShoppingCart className="h-3 w-3" />;
    if (s.includes('despachan') || s.includes('preparan')) return <Package className="h-3 w-3" />;
    if (s.includes('pendien')) return <Clock className="h-3 w-3" />;
    if (s.includes('abono')) return <Receipt className="h-3 w-3" />;
    if (s.includes('anula') || s.includes('cancel')) return <XCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getStatusVariant = (estado: string) => {
    const s = estado.toLowerCase();
    if (s.includes('completa') || s.includes('entrega') || s.includes('aceptad')) return "default" as const;
    if (s.includes('enviado') || s.includes('despachan')) return "secondary" as const;
    if (s.includes('abono')) return "outline" as const;
    if (s.includes('anula') || s.includes('cancel')) return "destructive" as const;
    return "secondary" as const;
  };
  // Eliminado getStatusIcon previo para evitar duplicados si existía


  const handleExportToPDF = async (pedido: VentaPedidoDto) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      const formatDateStr = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-CO');
      };

      const cliente = usuarios.find(u => u.id === pedido.usuarioId);

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
      doc.text("ORDEN DE PEDIDO", pageWidth / 2, y, { align: "center" });
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
      doc.text(`Cliente: ${cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'N/A'}`, margin, y);
      y += 6;
      doc.text(`C.C./NIT: ${cliente?.numeroDocumento || 'N/A'}`, margin, y);
      y += 6;
      doc.text(`Teléfono: ${cliente?.telefono || 'N/A'}`, margin, y);
      y += 6;
      doc.text(`Dirección: ${pedido.direccionEntrega || 'Regístrate'}`, margin, y);
      y += 6;
      doc.text(`${pedido.ciudadEntrega || ''}, ${pedido.departamentoEntrega || ''}`, margin, y);

      // Columna Derecha: Datos del Pedido
      let yDerecha = y - 31;
      doc.setFont("helvetica", "bold");
      doc.text("INFO PEDIDO", pageWidth - margin - 50, yDerecha);
      yDerecha += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Número: #${pedido.id}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Fecha: ${pedido.fechaCreacion ? formatDateStr(pedido.fechaCreacion) : 'N/A'}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Estado: ${getStatusName(pedido.estadoId).toUpperCase()}`, pageWidth - margin - 50, yDerecha);
      yDerecha += 6;
      doc.text(`Método Pago: ${pedido.metodoPago || 'N/A'}`, pageWidth - margin - 50, yDerecha);

      y = Math.max(y, yDerecha) + 15;

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Código", margin + 5, y + 7);
      doc.text("Producto", margin + 30, y + 7);
      doc.text("Cant", margin + 100, y + 7);
      doc.text("Precio", margin + 120, y + 7);
      doc.text("Subtotal", margin + 150, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      // Table Content
      if (pedido.detalleVenta_Pedido && pedido.detalleVenta_Pedido.length > 0) {
        pedido.detalleVenta_Pedido.forEach((detalle: any) => {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          
          const productoInfo = productos.find(p => p.id === detalle.productoId);
          const nombreProducto = productoInfo?.nombreProducto || `Producto #${detalle.productoId}`;
          
          doc.text(String(detalle.productoId), margin + 5, y + 7);
          doc.text(nombreProducto.substring(0, 45), margin + 30, y + 7);
          doc.text(String(detalle.cantidad), margin + 100, y + 7);
          doc.text(`$${detalle.precioUnitario.toLocaleString()}`, margin + 120, y + 7);
          doc.text(`$${detalle.subtotal.toLocaleString()}`, margin + 150, y + 7);
          y += 8;
        });
      }

      y += 5;
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Totals
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", margin + 120, y);
      doc.text(`$${pedido.subtotal.toLocaleString()}`, margin + 150, y);
      y += 7;
      doc.text("Envío:", margin + 120, y);
      doc.text(`$${pedido.envio.toLocaleString()}`, margin + 150, y);
      y += 7;
      doc.setFontSize(14);
      doc.text("TOTAL:", margin + 120, y);
      doc.text(`$${pedido.total.toLocaleString()}`, margin + 150, y);

      y += 30;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado el ${formatDateStr(new Date())} a las ${new Date().toLocaleTimeString("es-ES")}`, pageWidth / 2, y, { align: "center" });
      doc.text("Vaper One - Sistema de Gestión de Pedidos", pageWidth / 2, y + 4, { align: "center" });

      doc.save(`Pedido_${pedido.id}.pdf`);
      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
    }
  };

  const handleVerDetalles = (pedido: VentaPedidoDto) => {
    setSelectedPedido(pedido);
    setShowDetallePedido(true);
  };

  const handleCambiarEstado = (pedido: VentaPedidoDto) => {
    setPedidoToUpdate(pedido);
    setNewStatusId(pedido.estadoId);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (pedidoToUpdate && newStatusId) {
      try {
        setIsUpdatingStatus(true);
        const now = new Date().toISOString();
        const updatedPedido: VentaPedidoDto = {
          ...pedidoToUpdate,
          estadoId: newStatusId,
          // Si el nuevo estado es entregado (1), guardamos la fecha de entrega
          // El ID 1 corresponde a "Entregado" según el API
          fechaEntrega: newStatusId === 1 ? now : pedidoToUpdate.fechaEntrega
        };

        // Si el estado cambia a Despachando/Enviado/Entregado y ANTES no lo era, deducir inventario
        const isDespachandoEnAdelante = (estadoId: number) => {
          const name = getStatusName(estadoId).toLowerCase();
          return ['despachando', 'enviado', 'entregado'].includes(name);
        };

        if (isDespachandoEnAdelante(newStatusId) && !isDespachandoEnAdelante(pedidoToUpdate.estadoId)) {
          const syncToast = toast.loading('Sincronizando inventario...');
          try {
            let detallesRaw: any[] = pedidoToUpdate.detalleVenta_Pedido ||
              (pedidoToUpdate as any).detalleVentaPedidos ||
              (pedidoToUpdate as any).DetalleVentaPedidos ||
              [];

            // Fallback si los detalles no vienen completos en la consulta principal
            if (detallesRaw.length === 0) {
              const detRes = await fetch('/api/DetalleVentaPedidoes');
              if (detRes.ok) {
                const allDetalles = await detRes.json();
                detallesRaw = allDetalles.filter((d: any) => Number(d.ventaPedidoId) === Number(pedidoToUpdate.id));
              }
            }

            // Actualizar stock de cada producto
            for (const item of detallesRaw) {
              const getRes = await fetch(`/api/Productoes/${item.productoId}`);
              if (getRes.ok) {
                const pOriginal = await getRes.json();
                // Asegurar que el stock no sea negativo si no lo deseamos, o dejarlo deducir libremente
                const nuevoStock = Math.max(0, (pOriginal.stock || 0) - (item.cantidad || 0));

                await fetch(`/api/Productoes/${item.productoId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...pOriginal, stock: nuevoStock })
                });
              }
            }
            toast.dismiss(syncToast);
          } catch (e) {
            console.error("Error al sincronizar inventario al entregar pedido:", e);
            toast.error("Advertencia: No se pudo descontar todo el inventario de la API.");
          }
        }

        await updateVentaPedido(pedidoToUpdate.id!, updatedPedido);

        // Notificar al cliente por correo sobre el cambio de estado
        try {
          await notificarEstadoPedido(pedidoToUpdate.id!);
        } catch (e) {
          console.warn("No se pudo enviar notificación de estado al cliente:", e);
        }

        // Forzar refresco completo para asegurar consistencia con el backend
        await fetchData();

        setIsStatusDialogOpen(false);
        setPedidoToUpdate(null);
        setNewStatusId(0);

        toast.success("Estado actualizado y sincronizado", {
          description: `El pedido ahora está en estado: ${getStatusName(newStatusId)}.`,
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("No se pudo actualizar el estado");
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const getPedidoNumeroDisplay = (pedido: VentaPedidoDto) => {
    return `Pedido #${pedido.id}`;
  };

  const handleCreatePedido = () => {
    setShowCreateView(true);
  };



  return (
    <div className="space-y-6 p-6">
      <Dialog
        open={showCreateView}
        onOpenChange={(open: boolean) => {
          if (!open) setShowCreateView(false);
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
          <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-900">Nuevo pedido</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Complete cada paso para registrar el pedido en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 pt-6">
            <CreateVentaPedidoView
              embedInDialog
              onBack={() => setShowCreateView(false)}
              onSuccess={() => {
                setShowCreateView(false);
                fetchData();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, documento o nombre del cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Array.from(new Set(statuses
                    .filter(s => {
                      const name = s.nombreEstado.toLowerCase();
                      return ['pendiente', 'despachando', 'enviado', 'entregado', 'anulada', 'anulado', 'cancelado'].includes(name);
                    })
                    .map(s => {
                      const name = s.nombreEstado.toLowerCase();
                      if (name === 'pendiente') return 'pendiente';
                      if (name === 'despachando') return 'despachando';
                      if (name === 'enviado') return 'enviado';
                      if (name === 'entregado') return 'entregado';
                      return 'cancelado';
                    })
                  )).map(label => (
                    <SelectItem key={label} value={label} className="capitalize">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido ID</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <LoadingScreen message="Cargando pedidos..." />
                    </TableCell>
                  </TableRow>
                ) : paginatedPedidos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No se encontraron pedidos.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPedidos.map((pedido) => (
                    <TableRow key={`order-${pedido.id}`}>
                      <TableCell className="font-medium">#{pedido.id}</TableCell>
                      <TableCell>{getUsuarioDocument(pedido.usuarioId)}</TableCell>
                      <TableCell>{getUsuarioName(pedido.usuarioId)}</TableCell>
                      <TableCell>
                        {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${pedido.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(getStatusName(pedido.estadoId))}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(getStatusName(pedido.estadoId))}
                          <span className="capitalize">
                            {getStatusName(pedido.estadoId)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerDetalles(pedido)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCambiarEstado(pedido)}
                            disabled={getStatusName(pedido.estadoId) === 'entregado' || getStatusName(pedido.estadoId) === 'cancelado'}
                            title={getStatusName(pedido.estadoId) === 'entregado' || getStatusName(pedido.estadoId) === 'cancelado'
                              ? "No se puede cambiar el estado de un pedido finalizado"
                              : "Cambiar estado"}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportToPDF(pedido)}
                            title="Exportar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPedidos.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="pedidos"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isStatusDialogOpen} onOpenChange={(open) => { if (!isUpdatingStatus) setIsStatusDialogOpen(open); }}>
        <DialogContent className="p-4" style={{ width: '380px', maxWidth: '90vw' }}>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base">Actualizar Estado</DialogTitle>
            <DialogDescription className="text-xs">
              Pedido #{pedidoToUpdate?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 flex flex-col gap-1">
            {[
              { label: 'Pendiente',    icon: '🕐', colorSelected: 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-300' },
              { label: 'Despachando', icon: '📦', colorSelected: 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'   },
              { label: 'Enviado',     icon: '🚚', colorSelected: 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300' },
              { label: 'Entregado',   icon: '✅', colorSelected: 'border-green-400 bg-green-50 ring-1 ring-green-300' },
              { label: 'Cancelado',   icon: '❌', colorSelected: 'border-red-400 bg-red-50 ring-1 ring-red-300'      },
            ].map((option) => {
              const match = statuses.find(s =>
                s.nombreEstado.toLowerCase() === option.label.toLowerCase() ||
                (option.label === 'Cancelado' && ['anulada','anulado','cancelado'].includes(s.nombreEstado.toLowerCase()))
              );
              if (!match) return null;
              const isSelected = newStatusId === match.id;
              const isCurrent = pedidoToUpdate?.estadoId === match.id;
              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setNewStatusId(match.id)}
                  disabled={isUpdatingStatus}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all text-left
                    ${isSelected ? option.colorSelected : 'border-gray-200 bg-white hover:bg-gray-50'}
                    ${isUpdatingStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-sm">{option.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{option.label}</span>
                  {isSelected && <CheckCircle className="h-4 w-4 text-gray-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <DialogFooter className="gap-1.5 pt-1">
            <Button variant="outline" size="sm" className="h-8 text-sm" onClick={() => setIsStatusDialogOpen(false)} disabled={isUpdatingStatus}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8 text-sm"
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus || newStatusId === pedidoToUpdate?.estadoId}
            >
              {isUpdatingStatus ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Actualizando...</>
              ) : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog
        open={showDetallePedido}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setShowDetallePedido(false);
            setSelectedPedido(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
          {selectedPedido && (
            <>
              <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles del Pedido</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                      Información completa del pedido y artículos.
                    </DialogDescription>
                  </div>
                  <Badge 
                    variant={getStatusVariant(getStatusName(selectedPedido.estadoId))}
                    className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                      getStatusVariant(getStatusName(selectedPedido.estadoId)) === "default"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : getStatusVariant(getStatusName(selectedPedido.estadoId)) === "destructive"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}
                  >
                    <span className="capitalize">{getStatusName(selectedPedido.estadoId)}</span>
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-10">
                {/* Cabecera */}
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                    <Receipt className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Pedido #{selectedPedido.id}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span className="font-mono text-gray-400">{selectedPedido.fechaCreacion ? new Date(selectedPedido.fechaCreacion).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {getUsuarioName(selectedPedido.usuarioId)}
                      </span>
                    </p>
                  </div>
                </div>

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
                      <ShoppingCart className="h-4 w-4" /> Productos ({(selectedPedido as any).detalleVenta_Pedido?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detalles del Cliente</h4>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-500 flex items-center gap-1"><User className="h-3 w-3" /> Cliente</Label>
                          <p className="text-sm font-medium text-gray-900">{getUsuarioName(selectedPedido.usuarioId)}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-500">Documento</Label>
                          <p className="text-sm font-medium text-gray-900">{getUsuarioDocument(selectedPedido.usuarioId)}</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs font-medium text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Dirección de Entrega</Label>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPedido.direccionEntrega ? (
                              <>{selectedPedido.direccionEntrega}, {selectedPedido.ciudadEntrega || ''}, {selectedPedido.departamentoEntrega || ''}</>
                            ) : "No especificada (Regístrate)"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pago y Envío</h4>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-500 flex items-center gap-1"><CreditCard className="h-3 w-3" /> Método de Pago</Label>
                          <p className="text-sm font-medium text-gray-900">{selectedPedido.metodoPago || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-500">Referencia Pago</Label>
                          <p className="text-sm font-medium text-gray-900">{(selectedPedido as any).referenciaPago || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-500">Tipo de Venta</Label>
                          <p className="text-sm font-medium text-gray-900">{selectedPedido.tipoVenta || "Venta"}</p>
                        </div>
                        {selectedPedido.comprobanteUrl && (
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs font-medium text-gray-500">Comprobante de pago</Label>
                            <div>
                              <a
                                href={selectedPedido.comprobanteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                              >
                                <Receipt className="h-4 w-4" /> Ver comprobante de pago
                              </a>
                            </div>
                          </div>
                        )}
                        {selectedPedido.observaciones && (
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs font-medium text-gray-500">Observaciones</Label>
                            <p className="text-sm font-medium text-gray-900">{selectedPedido.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resumen Financiero</h4>
                      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-medium text-gray-900">${(selectedPedido.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Envío</span>
                          <span className="font-medium text-gray-900">${(selectedPedido.envio || 0).toLocaleString()}</span>
                        </div>
                        <Separator className="bg-gray-200" />
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-xl font-black text-blue-600">${selectedPedido.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="productos" className="space-y-8 animate-in fade-in-50 duration-500">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Artículos</h4>
                        <div className="text-xs font-bold text-gray-900">
                          Total: <span className="text-blue-600 font-black">${selectedPedido.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="text-[10px] font-bold uppercase tracking-tight h-10">Producto</TableHead>
                              <TableHead className="text-center text-[10px] font-bold uppercase tracking-tight h-10">Cant.</TableHead>
                              <TableHead className="text-right text-[10px] font-bold uppercase tracking-tight h-10">P. Unitario</TableHead>
                              <TableHead className="text-right text-[10px] font-bold uppercase tracking-tight h-10">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(selectedPedido as any).detalleVenta_Pedido?.map((detalle: any, idx: number) => (
                              <TableRow key={detalle.id || idx} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                <TableCell className="text-xs font-medium text-gray-900">
                                  {productos.find(p => p.id === detalle.productoId)?.nombreProducto || "Producto"}
                                </TableCell>
                                <TableCell className="text-xs text-center text-gray-600">{detalle.cantidad}</TableCell>
                                <TableCell className="text-right text-xs text-gray-600">${(detalle.precioUnitario || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right text-sm font-bold text-gray-900">${(detalle.subtotal || 0).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                            {(!(selectedPedido as any).detalleVenta_Pedido || (selectedPedido as any).detalleVenta_Pedido.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                                  No hay productos registrados en este pedido
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="p-8 border-t border-gray-100 flex items-center gap-3 bg-white">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetallePedido(false);
                    setSelectedPedido(null);
                  }}
                  className="h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200"
                >
                  Cerrar Detalle
                </Button>
                <Button 
                  className="h-10 px-6 bg-gray-900 text-white font-medium hover:bg-black transition-all" 
                  onClick={() => handleExportToPDF(selectedPedido)}
                >
                  Descargar PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
