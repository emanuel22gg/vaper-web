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
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { AbonosIndividuales } from "./AbonosIndividuales";
import { DetallePedido } from "./DetallePedido";
import { VentaPedidoDto, UsuarioDto, Producto } from "../types";
import { getVentaPedidos, getUsuarios, updateVentaPedido } from "../services/api";
import { CreateVentaPedidoDialog } from "./pedidos/CreateVentaPedidoDialog";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusName = (id: number) => {
    switch (id) {
      case 1: return "pendiente";
      case 2: return "entregado";
      case 3: return "cancelado";
      default: return "desconocido";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pedidosData, usuariosData] = await Promise.all([
        getVentaPedidos(),
        getUsuarios()
      ]);
      setPedidos(pedidosData);
      setUsuarios(usuariosData);
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

  const filteredPedidos = pedidos.filter((pedido) => {
    const usuarioName = getUsuarioName(pedido.usuarioId).toLowerCase();
    const statusName = getStatusName(pedido.estadoId).toLowerCase();

    const matchesSearch =
      usuarioName.includes(searchTerm.toLowerCase()) ||
      pedido.metodoPago.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || statusName === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

    if (pedido.detalleVentaPedidos && pedido.detalleVentaPedidos.length > 0) {
      yPosition = addTitle("PRODUCTOS", yPosition);
      pedido.detalleVentaPedidos.forEach((detalle) => {
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
          // Si el nuevo estado es entregado (2), guardamos la fecha de entrega
          fechaEntrega: newStatusId === 2 ? now : pedidoToUpdate.fechaEntrega
        };

        await updateVentaPedido(pedidoToUpdate.id!, updatedPedido);

        const updatedPedidos = pedidos.map((p) =>
          p.id === pedidoToUpdate.id ? updatedPedido : p
        );

        setPedidos(updatedPedidos);
        setIsStatusDialogOpen(false);
        setPedidoToUpdate(null);
        setNewStatusId(0);

        toast.success("Estado actualizado", {
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
    setIsCreateDialogOpen(true);
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
                  placeholder="Buscar por cliente o método de pago..."
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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido ID</TableHead>
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
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">#{pedido.id}</TableCell>
                      <TableCell>{getUsuarioName(pedido.usuarioId)}</TableCell>
                      <TableCell>
                        {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${pedido.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(getStatusName(pedido.estadoId))} text-white flex items-center space-x-1 w-fit`}>
                          {getStatusIcon(getStatusName(pedido.estadoId))}
                          <span className="capitalize">{getStatusName(pedido.estadoId)}</span>
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
                            title="Cambiar estado"
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

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {Math.min(startIndex + 1, filteredPedidos.length)} a {Math.min(startIndex + itemsPerPage, filteredPedidos.length)} de {filteredPedidos.length} pedidos
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <div className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
                  <SelectItem value="1">Pendiente</SelectItem>
                  <SelectItem value="2">Entregado</SelectItem>
                  <SelectItem value="3">Cancelado</SelectItem>
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

      <CreateVentaPedidoDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
};
