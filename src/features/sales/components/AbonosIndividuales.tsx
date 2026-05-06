import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, Download, XCircle, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Receipt } from 'lucide-react';
import jsPDF from "jspdf";
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
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
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Separator } from '@/shared/ui/separator';
import { toast } from "sonner";
import { VentaPedidoDto, VentaAbonoDto, UsuarioDto } from '@/shared/types';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { getAbonos, getAbonosByPedido, createAbono, updateAbono, updateVentaPedido, getUsuarioById } from '@/shared/services/api';

// Adaptar el DTO para el componente local
type AbonoIndividual = VentaAbonoDto;

interface AbonosIndividualesProps {
  pedido: VentaPedidoDto;
  onBack: () => void;
}

export const AbonosIndividuales: React.FC<AbonosIndividualesProps> = ({ pedido, onBack }) => {
  // Lista de abonos reales
  const [abonosIndividuales, setAbonosIndividuales] = useState<AbonoIndividual[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);

  // Estados para el modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAbono, setNewAbono] = useState({
    monto: '',
    metodoPago: '',
  });

  // Efecto para cargar abonos reales
  useEffect(() => {
    fetchData();
  }, [pedido.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener abonos filtrados por pedido (Optimizado)
      let pedidoAbonos: any[] = [];
      try {
        pedidoAbonos = await getAbonosByPedido(pedido.id!);
      } catch (error: any) {
        // FALLBACK: Si el endpoint nuevo da 404 (no desplegado), traemos todo y filtramos local
        if (error.response?.status === 404) {
          console.warn("Endpoint optimizado de abonos no encontrado (404). Usando fallback local.");
          const allAbonos = await getAbonos();
          pedidoAbonos = allAbonos.filter((a: any) => a.ventaPedidoId === pedido.id);
        } else {
          throw error;
        }
      }

      const clienteInfo = await getUsuarioById(pedido.usuarioId);
      setUsuarios([clienteInfo]);
      
      setAbonosIndividuales(pedidoAbonos);
    } catch (error) {
      console.error("Error fetching abonos:", error);
      toast.error("Error al cargar el historial de abonos");
    } finally {
      setLoading(false);
    }
  };

  // Estados para modal de detalle
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAbono, setSelectedAbono] = useState<AbonoIndividual | null>(null);

  // Estados para confirmación de anulación
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [abonoToAnular, setAbonoToAnular] = useState<AbonoIndividual | null>(null);

  // Estados de guardado
  const [isSavingAbono, setIsSavingAbono] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Función para formatear como moneda COP (sin $)
  const formatCOPInput = (value: string) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("de-DE").format(parseInt(rawValue));
  };

  // Función para obtener el número puro
  const getRawNumber = (formattedValue: string) => {
    return parseFloat(formattedValue.replace(/\./g, "")) || 0;
  };

  const totalAbonos = abonosIndividuales
    .filter(abono => abono.estado === true)
    .reduce((sum, abono) => sum + abono.monto, 0);

  const saldoPendiente = pedido.total - totalAbonos;

  const totalItems = abonosIndividuales.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = abonosIndividuales.slice(startIndex, startIndex + itemsPerPage);

  const handleAddAbono = async () => {
    if (!newAbono.monto || !newAbono.metodoPago) {
      toast.error("Complete todos los campos");
      return;
    }

    const montoAbono = getRawNumber(newAbono.monto);
    if (montoAbono <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (montoAbono > saldoPendiente) {
      toast.error(`El monto no puede superar el saldo (${saldoPendiente})`);
      return;
    }

    if (montoAbono < 10000 && saldoPendiente >= 10000) {
      toast.error("El abono mínimo permitido es de $10.000 COP.");
      return;
    }

    const nuevoSaldo = saldoPendiente - montoAbono;
    if (nuevoSaldo > 0 && nuevoSaldo < 10000) {
      toast.error(`No puede dejar un saldo pendiente inferior a $10.000 COP. Cancele la totalidad o ajuste el abono.`);
      return;
    }

    try {
      setIsSavingAbono(true);

      await createAbono({
        id: 0,
        ventaPedidoId: pedido.id!,
        monto: montoAbono,
        metodoPago: newAbono.metodoPago,
        estado: true,
        saldoRestante: nuevoSaldo,
        fecha: new Date().toISOString()
      });

      if (nuevoSaldo === 0) {
        await updateVentaPedido(pedido.id!, {
          ...pedido,
          estadoId: 1,
          fechaEntrega: new Date().toISOString()
        });
        toast.info("¡Pedido liquidado por completo! Estado actualizado a Entregado.");
      }

      await fetchData();
      setNewAbono({ monto: '', metodoPago: '' });
      setIsAddDialogOpen(false);
      toast.success("Abono registrado con éxito");
    } catch (error) {
      console.error("Error creating abono:", error);
      toast.error("No se pudo registrar el abono");
    } finally {
      setIsSavingAbono(false);
    }
  };

  const handleAnularAbono = async () => {
    if (!abonoToAnular) return;

    try {
      setLoading(true);

      const montoAnulado = abonoToAnular.monto;
      const nuevoSaldoPedido = pedido.total - (totalAbonos - montoAnulado);

      // CORRECCIÓN: Enviar datos limpios (estado false, fecha ISO)
      await updateAbono(Number(abonoToAnular.id), {
        ...abonoToAnular,
        estado: false // Anulado
      });

      if (pedido.estadoId === 1 && nuevoSaldoPedido > 0) {
        await updateVentaPedido(pedido.id!, {
          ...pedido,
          estadoId: 6
        });
        toast.info("El pedido ha vuelto al estado 'En Abonos' debido a la anulación del pago.");
      }

      await fetchData();
      setIsAnularDialogOpen(false);
      setAbonoToAnular(null);
      toast.success("Abono anulado correctamente", {
        description: `El saldo pendiente de la cuenta subió a $${nuevoSaldoPedido.toLocaleString()}`
      });
    } catch (error) {
      console.error("Error anular abono:", error);
      toast.error("No se pudo anular el abono");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = (abono: AbonoIndividual) => {
    const doc = new jsPDF();
    const cliente = usuarios.find(u => u.id === pedido.usuarioId);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(21, 93, 252); // Azul principal
    doc.text("COMPROBANTE DE ABONO", 105, 30, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Comprobante N°: AB-${abono.id}`, 20, 50);
    doc.text(`Fecha de Registro: ${abono.fecha}`, 190, 50, { align: "right" });

    // Cuadro de Información
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 60, 170, 40, "F");

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL CLIENTE", 25, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente Desconocido'}`, 25, 80);
    doc.text(`Cédula/Documento: ${cliente?.numeroDocumento || 'N/A'}`, 25, 90);

    // Detalles del Pago
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DEL PAGO", 20, 120);
    doc.line(20, 122, 190, 122);

    doc.setFont("helvetica", "normal");
    doc.text("Referencia de Pedido:", 20, 135);
    doc.text(`#${pedido.id}`, 190, 135, { align: "right" });

    doc.text("Método de Pago:", 20, 145);
    doc.text(`${abono.metodoPago}`, 190, 145, { align: "right" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MONTO ABONADO:", 20, 165);
    doc.setTextColor(21, 93, 252);
    doc.text(`$${abono.monto.toLocaleString()} COP`, 190, 165, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Saldo Restante:", 20, 175);
    doc.text(`$${abono.saldoRestante.toLocaleString()} COP`, 190, 175, { align: "right" });

    doc.setDrawColor(0, 0, 0);
    doc.line(60, 240, 150, 240);
    doc.text("Firma Autorizada", 105, 250, { align: "center" });

    doc.save(`Abono_${abono.id}_Pedido_${pedido.id}.pdf`);
    toast.success("Comprobante generado con éxito");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Ventas
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Abonos del Pedido #{pedido.id}</h1>
          <p className="text-sm text-muted-foreground">
            Saldo Pendiente: <span className="font-bold text-red-600">${saldoPendiente.toLocaleString()}</span> de ${pedido.total.toLocaleString()}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Historial de Pagos</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Abono
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-none shadow-lg p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white">
                  <DialogTitle className="text-xl font-bold text-gray-900">Nuevo Abono para Pedido #{pedido.id}</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mt-1">Ingrese los detalles del pago recibido.</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label>Monto a Abonar (COP)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold z-10">$</span>
                      <Input
                        type="text"
                        placeholder="0"
                        value={newAbono.monto}
                        onChange={(e) => setNewAbono({ ...newAbono, monto: formatCOPInput(e.target.value) })}
                        className={`pl-8 font-bold ${getRawNumber(newAbono.monto) > saldoPendiente ? 'border-red-500 focus-visible:ring-red-500 text-red-600' : ''}`}
                      />
                    </div>
                    {newAbono.monto && getRawNumber(newAbono.monto) > 0 && (
                      <div className="mt-2 text-xs font-bold transition-all">
                        {getRawNumber(newAbono.monto) > saldoPendiente ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Error: Supera el saldo pendiente (${saldoPendiente.toLocaleString()})
                          </span>
                        ) : (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Nuevo saldo: ${(saldoPendiente - getRawNumber(newAbono.monto)).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <Select onValueChange={(v: string) => setNewAbono({ ...newAbono, metodoPago: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="px-8 py-6 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewAbono({ monto: '', metodoPago: '' });
                  }} className="min-w-[100px]">Cancelar</Button>
                  <Button
                    onClick={handleAddAbono}
                    disabled={!newAbono.monto || getRawNumber(newAbono.monto) <= 0 || getRawNumber(newAbono.monto) > saldoPendiente || !newAbono.metodoPago || isSavingAbono}
                    className="bg-black hover:bg-gray-800 text-white font-bold min-w-[150px]"
                  >
                    {isSavingAbono ? "Guardando..." : "Guardar Abono"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Abono</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <LoadingScreen message="Cargando abonos..." />
                    </TableCell>
                  </TableRow>
                ) : abonosIndividuales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      No hay abonos registrados para este pedido.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((abono) => (
                    <TableRow key={abono.id}>
                      <TableCell className="font-mono text-xs">{abono.id}</TableCell>
                      <TableCell>{new Date(abono.fecha).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">${abono.monto.toLocaleString()}</TableCell>
                      <TableCell>{abono.metodoPago}</TableCell>
                      <TableCell>
                        <Badge className={(abono.estado === true || (abono.estado as any) === 'Registrado') ? 'bg-green-500' : 'bg-red-500'}>
                          {abono.estado === true ? 'Registrado' : 'Anulado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAbono(abono);
                              setIsDetailDialogOpen(true);
                            }}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportarPDF(abono)}
                            disabled={abono.estado !== true}
                            title="Descargar comprobante"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setAbonoToAnular(abono);
                              setIsAnularDialogOpen(true);
                            }}
                            disabled={abono.estado !== true}
                            title="Anular abono"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalle de Abono */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-lg p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[rgb(21,93,252)]" />
              Detalle del Abono #{selectedAbono?.id}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Información completa del pago registrado.
            </DialogDescription>
          </DialogHeader>
          {selectedAbono && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Pedido ID</p>
                  <p className="font-bold text-gray-900 text-base">#{pedido.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Fecha de Registro</p>
                  <p className="font-bold text-gray-900 text-base">{new Date(selectedAbono.fecha).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1 col-span-2 border-t pt-4 mt-2">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Cliente</p>
                  <p className="font-bold text-gray-900 text-base">{usuarios.find(u => u.id === pedido.usuarioId) ? `${usuarios.find(u => u.id === pedido.usuarioId)?.nombres} ${usuarios.find(u => u.id === pedido.usuarioId)?.apellidos}` : 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Doc: {usuarios.find(u => u.id === pedido.usuarioId)?.numeroDocumento}</p>
                </div>
                <div className="space-y-1 border-t pt-4 mt-2">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Monto Abonado</p>
                  <p className="font-black text-[rgb(21,93,252)] text-xltracking-tight tabular-nums">${selectedAbono.monto.toLocaleString()}</p>
                </div>
                <div className="space-y-1 border-t pt-4 mt-2">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Saldo al Momento</p>
                  <p className="font-bold text-gray-500 text-lg tabular-nums">${selectedAbono.saldoRestante.toLocaleString()}</p>
                </div>
                <div className="space-y-1 border-t pt-4 mt-2">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Método de Pago</p>
                  <Badge variant="outline" className="font-bold border-blue-100 bg-blue-50 text-blue-700">{selectedAbono.metodoPago}</Badge>
                </div>
                <div className="space-y-1 border-t pt-4 mt-2">
                  <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Estado</p>
                  <Badge className={selectedAbono.estado === true ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}>
                    {selectedAbono.estado === true ? 'Registrado' : 'Anulado'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <div className="px-8 py-6 border-t bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="min-w-[100px]">Cerrar</Button>
            <Button className="bg-[rgb(21,93,252)] hover:bg-blue-700 text-white min-w-[150px]" onClick={() => selectedAbono && handleExportarPDF(selectedAbono)}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Anulación */}
      <AlertDialog open={isAnularDialogOpen} onOpenChange={setIsAnularDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de anular este abono?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el abono como "Anulado" y el saldo del pedido se verá afectado. Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-bold">Resumen de anulación:</p>
                <p>Abono #{abonoToAnular?.id} por un valor de <span className="font-bold">${abonoToAnular?.monto.toLocaleString()}</span></p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAbonoToAnular(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAnularAbono}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Anulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
