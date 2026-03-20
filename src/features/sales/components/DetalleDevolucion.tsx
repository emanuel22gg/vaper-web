import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
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
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Receipt,
  DollarSign
} from 'lucide-react';
import { Separator } from '@/shared/ui/separator';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/ui/utils';
import { DevolucionDto, DetalleDevolucionDto, ProductoDto, UsuarioDto, VentaPedidoDto } from '@/shared/types';
import { getDetalleDevoluciones, getProductos, getUsuarios, getVentaPedidos, getDetalleVentaPedidos } from '@/shared/services/api';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

interface DetalleDevolucionProps {
  devolucion: DevolucionDto;
  onBack: () => void;
}

export const DetalleDevolucion: React.FC<DetalleDevolucionProps> = ({ devolucion, onBack }) => {
  const [detalles, setDetalles] = useState<DetalleDevolucionDto[]>([]);
  const [productos, setProductos] = useState<ProductoDto[]>([]);
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [venta, setVenta] = useState<VentaPedidoDto | null>(null);
  const [allOrderDetails, setAllOrderDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allDetalles, allProds, allUsers, allVentas, allDetailsVentas] = await Promise.all([
          getDetalleDevoluciones(),
          getProductos(),
          getUsuarios(),
          getVentaPedidos(),
          getDetalleVentaPedidos()
        ]);

        const filteredDetalles = allDetalles.filter((d: DetalleDevolucionDto) => d.devolucionId === devolucion.id);
        const foundVenta = allVentas.find((v: VentaPedidoDto) => v.id === devolucion.ventaPedidoId);
        const foundUser = foundVenta ? allUsers.find((u: UsuarioDto) => u.id === foundVenta.usuarioId) : null;

        setDetalles(filteredDetalles);
        setProductos(allProds);
        setVenta(foundVenta || null);
        setUsuario(foundUser || null);
        setAllOrderDetails(allDetailsVentas);
      } catch (err) {
        console.error("Error cargando detalles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [devolucion.id, devolucion.ventaPedidoId]);

  const getStatusConfig = (estadoId: number) => {
    switch (estadoId) {
      case 5: return { 
        className: 'bg-blue-50 text-blue-700 border-blue-100', 
        icon: <CheckCircle className="h-3 w-3" />, 
        label: 'Aceptada' 
      };
      case 3:
      case 4: return { 
        className: 'bg-red-50 text-red-700 border-red-100', 
        icon: <XCircle className="h-3 w-3" />, 
        label: 'Anulada' 
      };
      default: return { 
        className: 'bg-slate-50 text-slate-700 border-slate-100', 
        icon: <Clock className="h-3 w-3" />, 
        label: 'Pendiente' 
      };
    }
  };

  const statusConfig = getStatusConfig(devolucion.estadoId);

  const getProductoNombre = (id: number) => {
    return productos.find(p => p.id === id)?.nombreProducto || `Item #${id}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-500 font-medium">Cargando detalles de reposición...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Botón Volver */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="group gap-2 text-gray-400 hover:text-gray-900 transition-all duration-200 pl-0"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Volver a devoluciones</span>
        </Button>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white">
        {/* Cabecera */}
        <div className="p-8 md:p-10 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Detalle de Devolución</h1>
                <span className="px-3 py-1 bg-gray-50 text-gray-400 font-mono text-xs rounded-full border border-gray-100">
                  #{devolucion.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">Emitido el {new Date(devolucion.fechaDevolucion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500 font-mono lowercase">
                  <Receipt className="h-4 w-4 text-gray-300" />
                  ven-{devolucion.ventaPedidoId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn("flex items-center gap-1.5 w-fit capitalize font-bold px-4 py-1.5 rounded-full border shadow-none text-[12px]", statusConfig.className)}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Cliente */}
          <div className="p-8 md:p-10 border-r border-gray-50">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-8">Información del Cliente</h4>
            <div className="space-y-6">
              {usuario ? (
                <>
                  <div>
                    <p className="text-xl font-bold text-gray-900 leading-tight">{usuario.nombres} {usuario.apellidos}</p>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{usuario.tipoDocumento} {usuario.numeroDocumento}</p>
                  </div>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">{usuario.correo || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">{usuario.telefono || 'N/A'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-gray-50 rounded-2xl text-center">
                  <p className="text-sm text-gray-400 italic">Usuario no vinculado</p>
                </div>
              )}
            </div>
          </div>

          {/* Información Técnica */}
          <div className="p-8 md:p-10 bg-gray-50/30">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-8">Resumen de Garantía y Cambio</h4>
            <div className="space-y-8">
              {(() => {
                const desc = devolucion.descripcion || "";
                
                // Formato Nuevo: MOTIVO: {x} ||| REPOSICION: {y}
                // Formato Viejo: [MOTIVO]: {x} | [REPOSICIÓN]: {y}
                
                let motive = desc;
                let replacement = "";

                if (desc.includes(" ||| REPOSICION: ")) {
                  const parts = desc.split(" ||| REPOSICION: ");
                  motive = parts[0].replace("MOTIVO: ", "");
                  replacement = parts[1] || "";
                } else if (desc.includes(" | [REPOSICIÓN]: ")) {
                  const parts = desc.split(" | [REPOSICIÓN]: ");
                  motive = parts[0].replace("[MOTIVO]: ", "");
                  replacement = parts[1] || "";
                } else if (desc.startsWith("[MOTIVO]: ")) {
                  motive = desc.replace("[MOTIVO]: ", "");
                } else if (desc.startsWith("MOTIVO: ")) {
                  motive = desc.replace("MOTIVO: ", "");
                }

                return (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 border border-blue-50 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Motivo de Garantía</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed italic">
                          "{motive || "No se especificó un motivo para esta devolución."}"
                        </p>
                      </div>
                    </div>

                    {replacement && (
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500 border border-amber-50 shrink-0">
                          <RefreshCw className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Productos Entregados (Cambio)</p>
                          <p className="text-xs text-amber-600 mt-1 leading-relaxed font-medium">
                            {replacement}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase block leading-none mb-1">Valor Total Repuesto</Label>
                    <p className="text-sm font-black text-emerald-600 leading-none">{formatCurrency(devolucion.montoTotal)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Productos Recibidos (Devueltos)</h4>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase">{detalles.length} Item(s) devuelto(s)</span>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción del Item</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Cant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Monto Unit.</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detalles.length > 0 ? (
                  detalles.map((det, idx) => {
                    // Usar allOrderDetails si venta.detalleVenta_Pedido no tiene los datos
                    const detalleVenta = (venta?.detalleVenta_Pedido || allOrderDetails).find(d => d.id === det.detalleVentaPedidoId);
                    const productoIdReal = detalleVenta?.productoId;
                    const prod = productoIdReal ? productos.find(p => p.id === productoIdReal) : undefined;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-gray-900">
                            {productoIdReal ? getProductoNombre(productoIdReal) : `Cargando producto...`}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Ref Venta #{det.detalleVentaPedidoId}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex h-7 px-2.5 items-center justify-center bg-gray-100 text-gray-700 font-bold rounded-lg text-xs">
                            {det.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-gray-500 font-medium font-mono">
                          {formatCurrency(prod?.precio || 0)}
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-gray-900 font-mono">
                          {formatCurrency((prod?.precio || 0) * det.cantidad)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-300 italic text-sm">Sin artículos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Importe Total de la Devolución */}
          <div className="mt-10 flex justify-end">
            <div className="w-full md:w-80 space-y-4 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Total Repuesto</span>
                <span className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">{formatCurrency(devolucion.montoTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="h-10" />
    </div>
  );
};


