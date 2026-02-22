import React, { useState } from 'react';
import { ArrowLeft, Plus, Eye, Download, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';
import { toast } from "sonner";
import { VentaPedidoDto } from '../types';

interface AbonoIndividual {
  id: string;
  fecha: string;
  cliente: string;
  monto: number;
  metodoPago: string;
  estado: 'Registrado' | 'Anulado';
}

interface AbonosIndividualesProps {
  pedido: VentaPedidoDto;
  onBack: () => void;
}

export const AbonosIndividuales: React.FC<AbonosIndividualesProps> = ({ pedido, onBack }) => {
  // Lista de abonos (actualmente mock)
  const [abonosIndividuales, setAbonosIndividuales] = useState<AbonoIndividual[]>([]);

  // Estados para el modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAbono, setNewAbono] = useState({
    monto: '',
    metodoPago: '',
  });

  // Estados para modal de detalle
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAbono, setSelectedAbono] = useState<AbonoIndividual | null>(null);

  // Estados para confirmación de anulación
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [abonoToAnular, setAbonoToAnular] = useState<AbonoIndividual | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalAbonos = abonosIndividuales
    .filter(abono => abono.estado === 'Registrado')
    .reduce((sum, abono) => sum + abono.monto, 0);

  const saldoPendiente = pedido.total - totalAbonos;

  const totalItems = abonosIndividuales.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = abonosIndividuales.slice(startIndex, startIndex + itemsPerPage);

  const generateNextAbonoId = () => {
    return `ABN-${pedido.id}-${(abonosIndividuales.length + 1).toString().padStart(3, '0')}`;
  };

  const handleAddAbono = () => {
    if (!newAbono.monto || !newAbono.metodoPago) {
      toast.error("Complete todos los campos");
      return;
    }

    const montoAbono = parseFloat(newAbono.monto);
    if (montoAbono > saldoPendiente) {
      toast.error(`El monto no puede superar el saldo (${saldoPendiente})`);
      return;
    }

    const nuevoAbono: AbonoIndividual = {
      id: generateNextAbonoId(),
      fecha: new Date().toLocaleDateString(),
      cliente: "Cliente", // Simplificado para este contexto
      monto: montoAbono,
      metodoPago: newAbono.metodoPago,
      estado: 'Registrado',
    };

    setAbonosIndividuales([...abonosIndividuales, nuevoAbono]);
    setNewAbono({ monto: '', metodoPago: '' });
    setIsAddDialogOpen(false);
    toast.success("Abono registrado");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Pedidos
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Abono para Pedido #{pedido.id}</DialogTitle>
                  <DialogDescription>Ingrese los detalles del pago recibido.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Monto a Abonar</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newAbono.monto}
                      onChange={(e) => setNewAbono({ ...newAbono, monto: e.target.value })}
                    />
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
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddAbono}>Guardar Abono</Button>
                </DialogFooter>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {abonosIndividuales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      No hay abonos registrados para este pedido.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((abono) => (
                    <TableRow key={abono.id}>
                      <TableCell className="font-mono text-xs">{abono.id}</TableCell>
                      <TableCell>{abono.fecha}</TableCell>
                      <TableCell className="font-bold">${abono.monto.toLocaleString()}</TableCell>
                      <TableCell>{abono.metodoPago}</TableCell>
                      <TableCell>
                        <Badge className={abono.estado === 'Registrado' ? 'bg-green-500' : 'bg-red-500'}>
                          {abono.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
