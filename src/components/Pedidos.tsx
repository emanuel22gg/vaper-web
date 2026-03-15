import React, { useState, useEffect, useMemo } from "react";
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
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { AbonosIndividuales } from "./AbonosIndividuales";
import { DetallePedido } from "./DetallePedido";
import { TablePagination } from './ui/TablePagination';
import { VentaPedidoDto, UsuarioDto, Producto } from "../types";
import { getVentaPedidos, getUsuarios, updateVentaPedido, getEstados, getDetalleVentaPedidos } from "../services/api";
import { CreateVentaPedidoView } from "./pedidos/CreateVentaPedidoView";
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
} from "lucide-react";
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';

interface PedidosProps {
  onNavigateToDetail?: (id: string) => void;
}

export const Pedidos: React.FC<PedidosProps> = ({
  onNavigateToDetail,
}) => {
  // Estados para pedidos y UI
  const [pedidos, setPedidos] = useState<VentaPedidoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedPedido, setSelectedPedido] = useState<VentaPedidoDto | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pedidoToUpdate, setPedidoToUpdate] = useState<VentaPedidoDto | null>(null);
  const [newStatusId, setNewStatusId] = useState<number>(0);

  // Estados para navegación a abonos individuales
  const [showAbonosIndividuales, setShowAbonosIndividuales] = useState(false);
  const [selectedPedidoForAbonos, setSelectedPedidoForAbonos] = useState<VentaPedidoDto | null>(null);

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
        detalleVenta_Pedido: detallesData.filter((d: any) => d.ventaPedidoId === pedido.id)
      }));

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
    if (s.includes('pendien')) return "text-amber-600";
    if (s.includes('abono')) return "text-indigo-600";
    if (s.includes('anula') || s.includes('cancel')) return "text-red-600";
    return "text-slate-600";
  };

  const getStatusIcon = (estado: string) => {
    const s = estado.toLowerCase();
    if (s.includes('completa') || s.includes('entrega') || s.includes('aceptad')) return <CheckCircle className="h-3 w-3" />;
    if (s.includes('pendien')) return <Clock className="h-3 w-3" />;
    if (s.includes('abono')) return <Receipt className="h-3 w-3" />;
    if (s.includes('anula') || s.includes('cancel')) return <XCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getStatusVariant = (estado: string) => {
    const s = estado.toLowerCase();
    if (s.includes('completa') || s.includes('entrega') || s.includes('aceptad')) return "default" as const;
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
      // Signatures
      if (y > 250) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(10);
      doc.line(margin, y, margin + 60, y);
      doc.text("Firma del Cliente", margin, y + 5);

      doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
      doc.text("Autorizado por", pageWidth - margin - 60, y + 5);

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
        setLoading(true);
        const now = new Date().toISOString();
        const updatedPedido: VentaPedidoDto = {
          ...pedidoToUpdate,
          estadoId: newStatusId,
          // Si el nuevo estado es entregado (1), guardamos la fecha de entrega
          // El ID 1 corresponde a "Entregado" según el API
          fechaEntrega: newStatusId === 1 ? now : pedidoToUpdate.fechaEntrega
        };

        // Si el estado cambia a Entregado (1) desde otro estado, deducir inventario
        if (newStatusId === 1 && pedidoToUpdate.estadoId !== 1) {
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
        setLoading(false);
      }
    }
  };

  const handleVerAbonos = (pedido: VentaPedidoDto) => {
    setSelectedPedidoForAbonos(pedido);
    setShowAbonosIndividuales(true);
  };

  const getPedidoNumeroDisplay = (pedido: VentaPedidoDto) => {
    return `Pedido #${pedido.id}`;
  };

  const handleCreatePedido = () => {
    setShowCreateView(true);
  };

  if (showAbonosIndividuales && selectedPedidoForAbonos) {
    return (
      <AbonosIndividuales
        pedido={selectedPedidoForAbonos}
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

  if (showCreateView) {
    return (
      <div className="p-6">
        <CreateVentaPedidoView
          onBack={() => setShowCreateView(false)}
          onSuccess={() => {
            setShowCreateView(false);
            fetchData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
                      return ['pendiente', 'entregado', 'anulada', 'anulado', 'cancelado', 'en abonos', 'abonos'].includes(name);
                    })
                    .map(s => {
                      const name = s.nombreEstado.toLowerCase();
                      if (name === 'pendiente') return 'pendiente';
                      if (name === 'entregado') return 'entregado';
                      if (name.includes('abono')) return 'en abonos';
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
                    <TableCell colSpan={6} className="text-center py-10">
                      Cargando pedidos...
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerAbonos(pedido)}
                            title="Ver abonos"
                            disabled={pedido.estadoId !== 6}
                            className={pedido.estadoId === 6 ? "border-indigo-200 text-indigo-600 hover:bg-indigo-50" : ""}
                          >
                            <Receipt className="h-4 w-4" />
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

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
            <DialogDescription>
              Cambie el estado del pedido #{pedidoToUpdate?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={newStatusId.toString()} onValueChange={(v: string) => setNewStatusId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {statuses
                    .reduce((acc: { id: number, label: string }[], s) => {
                      const name = s.nombreEstado.toLowerCase();
                      let label = '';
                      if (name === 'pendiente') label = 'Pendiente';
                      else if (name === 'entregado') label = 'Entregado';
                      else if (name.includes('abono')) label = 'En Abonos';
                      else if (name === 'anulada' || name === 'anulado' || name === 'cancelado') label = 'Cancelado';

                      if (label && !acc.find(item => item.label === label)) {
                        acc.push({ id: s.id, label });
                      }
                      return acc;
                    }, [])
                    .map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateStatus}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
