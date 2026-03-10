import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Calendar,
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import { DevolucionDto, DetalleDevolucionDto, ProductoDto, UsuarioDto, VentaPedidoDto } from '../types';
import { getDetalleDevoluciones, getProductos, getUsuarios, getVentaPedidos } from '../services/api';

interface DetalleDevolucionProps {
  devolucion: DevolucionDto;
  onBack: () => void;
}

export const DetalleDevolucion: React.FC<DetalleDevolucionProps> = ({ devolucion, onBack }) => {
  const [detalles, setDetalles] = useState<DetalleDevolucionDto[]>([]);
  const [productos, setProductos] = useState<ProductoDto[]>([]);
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [venta, setVenta] = useState<VentaPedidoDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allDetalles, allProds, allUsers, allVentas] = await Promise.all([
          getDetalleDevoluciones(),
          getProductos(),
          getUsuarios(),
          getVentaPedidos()
        ]);

        const filteredDetalles = allDetalles.filter((d: DetalleDevolucionDto) => d.devolucionId === devolucion.id);
        const foundVenta = allVentas.find((v: VentaPedidoDto) => v.id === devolucion.ventaPedidoId);
        const foundUser = foundVenta ? allUsers.find((u: UsuarioDto) => u.id === foundVenta.usuarioId) : null;

        setDetalles(filteredDetalles);
        setProductos(allProds);
        setVenta(foundVenta || null);
        setUsuario(foundUser || null);
      } catch (err) {
        console.error("Error cargando detalles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [devolucion.id, devolucion.ventaPedidoId]);

  const getStatusColor = (estadoId: number) => {
    switch (estadoId) {
      case 5: return 'bg-green-500';
      case 3:
      case 4: return 'bg-red-500';
      default: return 'bg-slate-500';
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

  const getProductoNombre = (id: number) => {
    return productos.find(p => p.id === id)?.nombreProducto || `Item #${id}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-500 font-medium">Cargando información técnica...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Devolución</h1>
            <p className="text-sm text-muted-foreground">
              {`Expediente técnico para la devolución DEV-${String(devolucion.id).padStart(3, '0')}`}
            </p>
          </div>
        </div>
        <Badge className={cn(
          "flex items-center gap-1 w-fit capitalize text-white border-none px-4 py-1",
          devolucion.estadoId === 5 ? "bg-black hover:bg-black/90" :
            (devolucion.estadoId === 3 || devolucion.estadoId === 4) ? "bg-red-600 hover:bg-red-700" : "bg-amber-500"
        )}>
          {devolucion.estadoId === 5 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {getStatusText(devolucion.estadoId)}
        </Badge>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Documento:</span>
              <span className="font-medium">{usuario?.numeroDocumento || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{usuario?.correo || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Información del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Venta Referencia:</span>
              <span className="font-medium">{`VEN-${String(devolucion.ventaPedidoId).padStart(3, '0')}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha Devolución:</span>
              <span className="font-medium">{new Date(devolucion.fechaDevolucion).toLocaleDateString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto Devuelto:</span>
              <span className="font-bold text-blue-600">${devolucion.montoTotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Justificación de la Devolución</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
            {devolucion.motivo || "No se especificó un motivo para esta devolución."}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Productos Devueltos</h4>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Motivo Específico</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detalles.map((det) => {
                const prod = productos.find(p => p.id === det.productoId);
                return (
                  <TableRow key={det.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{getProductoNombre(det.productoId)}</span>
                        <span className="text-xs text-muted-foreground">ID: {det.productoId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {det.motivo || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{det.cantidad}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${((prod?.precio || 0) * det.cantidad).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
