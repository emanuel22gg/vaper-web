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
import { getVentaPedidos, getUsuarios, updateVentaPedido, getEstados } from "../services/api";
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
      const [pedidosData, usuariosData, estadosData] = await Promise.all([
        getVentaPedidos(),
        getUsuarios(),
        getEstados()
      ]);
      setPedidos(pedidosData);
      setUsuarios(usuariosData);
      setStatuses(estadosData);
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


  const handleExportToPDF = (pedido: VentaPedidoDto) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    let yPosition = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.width;
    const leftMargin = 20;
    const rightMargin = 20;
    const maxWidth = pageWidth - leftMargin - rightMargin;

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * lineHeight;
    };

    const addTitle = (title: string, y: number) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, leftMargin, y);
      doc.setFont("helvetica", "normal");
      return y + lineHeight + 2;
    };

    const addSeparator = (y: number) => {
      doc.line(leftMargin, y, pageWidth - rightMargin, y);
      return y + 5;
    };

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PEDIDO", leftMargin, yPosition);
    yPosition += 15;
    yPosition = addSeparator(yPosition);

    const usuarioName = getUsuarioName(pedido.usuarioId);
    yPosition = addTitle("INFORMACIÓN DEL CLIENTE", yPosition);
    yPosition = addWrappedText(`Nombre: ${usuarioName}`, leftMargin, yPosition, maxWidth);
    yPosition += 5;

    yPosition = addTitle("INFORMACIÓN DEL PEDIDO", yPosition);
    yPosition = addWrappedText(`Pedido ID: ${pedido.id}`, leftMargin, yPosition, maxWidth);
    yPosition = addWrappedText(`Fecha: ${pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString() : 'N/A'}`, leftMargin, yPosition, maxWidth);
    yPosition = addWrappedText(`Estado: ${getStatusName(pedido.estadoId).toUpperCase()}`, leftMargin, yPosition, maxWidth);
    yPosition = addWrappedText(`Método de Pago: ${pedido.metodoPago}`, leftMargin, yPosition, maxWidth);
    yPosition += 5;

    if (pedido.detalleVenta_Pedido && pedido.detalleVenta_Pedido.length > 0) {
      yPosition = addTitle("PRODUCTOS", yPosition);
      pedido.detalleVenta_Pedido.forEach((detalle: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        yPosition = addWrappedText(
          `• Producto ID: ${detalle.productoId} | Cantidad: ${detalle.cantidad} | Subtotal: $${detalle.subtotal.toLocaleString()}`,
          leftMargin,
          yPosition,
          maxWidth
        );
        yPosition += 2;
      });
      yPosition += 5;
    }

    yPosition = addTitle("DIRECCIÓN DE ENTREGA", yPosition);
    yPosition = addWrappedText(`${pedido.direccionEntrega || 'No especificada'}`, leftMargin, yPosition, maxWidth);
    yPosition = addWrappedText(`${pedido.ciudadEntrega || ''}, ${pedido.departamentoEntrega || ''}`, leftMargin, yPosition, maxWidth);
    yPosition += 5;

    yPosition = addSeparator(yPosition);
    yPosition = addWrappedText(`Subtotal: $${pedido.subtotal.toLocaleString()}`, leftMargin, yPosition, maxWidth);
    yPosition = addWrappedText(`Envío: $${pedido.envio.toLocaleString()}`, leftMargin, yPosition, maxWidth);
    yPosition = addWrappedText(`TOTAL: $${pedido.total.toLocaleString()}`, leftMargin, yPosition, maxWidth, 12);

    doc.save(`Pedido_${pedido.id}.pdf`);
    toast.success("PDF exportado", {
      description: `El pedido #${pedido.id} se ha descargado exitosamente.`,
    });
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
