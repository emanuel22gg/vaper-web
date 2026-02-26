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
  AlertCircle
} from 'lucide-react';
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
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expediente de Devolución</h1>
            <p className="text-slate-500 text-sm">Registro ID: #{devolucion.id}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(devolucion.estadoId)} text-white px-4 py-1.5 rounded-full font-bold uppercase text-[10px]`}>
          {getStatusText(devolucion.estadoId)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-xl">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" /> Auditoría Temporal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Fecha de Registro</span>
              <span className="font-semibold">{new Date(devolucion.fechaDevolucion).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Hora del Proceso</span>
              <span className="font-semibold">{new Date(devolucion.fechaDevolucion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" /> Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Nombre Titular</span>
              <span className="font-semibold">{usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No consignado'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Contacto</span>
              <span className="font-semibold">{usuario?.telefono || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-xl">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" /> Venta Vinculada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Referencia Venta</span>
              <span className="font-semibold">VNT-{venta?.id || devolucion.ventaPedidoId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Total Transacción</span>
              <span className="font-bold text-slate-900">${venta?.total.toLocaleString() || '0'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-sm font-bold">Resumen de Justificación</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-slate-100/50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed italic">
              "{devolucion.motivo || 'Sin descripción detallada del motivo de retorno.'}"
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-6">
          <CardTitle className="text-lg flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-400" /> Desglose de Productos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="px-6 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Referencia</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Motivo Técnico</TableHead>
                <TableHead className="text-center font-bold text-slate-500 uppercase text-[10px] tracking-wider">Cánt.</TableHead>
                <TableHead className="text-right px-6 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Saldo Devuelto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detalles.length > 0 ? (
                detalles.map((det) => (
                  <TableRow key={det.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="px-6">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-900">{getProductoNombre(det.productoId)}</p>
                        <p className="text-[10px] text-slate-400">ID Prod: {det.productoId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-400" />
                        <span className="text-xs text-slate-600">{det.motivo || 'Defecto técnico'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-bold px-3">
                        {det.cantidad}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 font-bold text-slate-900">
                      ${((productos.find(p => p.id === det.productoId)?.precio || 0) * det.cantidad).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-slate-400 italic">
                    Sin detalles registrados para esta devolución.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Consolidado:</span>
            <span className="text-2xl font-black text-blue-600 font-mono italic">
              ${devolucion.montoTotal.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
