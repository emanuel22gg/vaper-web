import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { VentaPedidoDto, UsuarioDto, Producto } from '../types/index';
import { getUsuarios, getProductos, getVentaPedidoById, getEstados, getDetalleVentaPedidos } from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Package,
  CreditCard,
  Truck,
  ShoppingBag,
  DollarSign,
  Download,
  CalendarCheck,
  ChevronRight,
  UserCheck,
  XCircle,
  Receipt
} from 'lucide-react';
import { toast } from "sonner";
import jsPDF from 'jspdf';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

interface DetallePedidoProps {
  pedido: VentaPedidoDto;
  onVolver: () => void;
}

export const DetallePedido: React.FC<DetallePedidoProps> = ({ pedido: pedidoProp, onVolver }) => {
  const [pedido, setPedido] = useState<VentaPedidoDto>(pedidoProp);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usuariosData, productosData, fullPedido, estadosData, allDetalles] = await Promise.all([
          getUsuarios(),
          getProductos(),
          getVentaPedidoById(pedidoProp.id!),
          getEstados(),
          getDetalleVentaPedidos()
        ]);

        const map: Record<number, string> = {};
        estadosData.forEach((e: any) => {
          map[e.id] = e.nombreEstado.toLowerCase();
        });
        setStatusMap(map);

        setUsuarios(usuariosData);
        setProductos(productosData);

        if (fullPedido) {
          const finalPedido = Array.isArray(fullPedido) ? fullPedido[0] : fullPedido;
          // Filtrado robusto de detalles para asegurar que aparezcan siempre
          const orderDetalles = allDetalles.filter((d: any) =>
            Number(d.ventaPedidoId) === Number(pedidoProp.id)
          );
          if (orderDetalles.length > 0) {
            finalPedido.detalleVenta_Pedido = orderDetalles;
          }
          setPedido(finalPedido);
        }
      } catch (error) {
        console.error("Error loading data for detail:", error);
        toast.error("Error al sincronizar datos del pedido");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pedidoProp.id]);

  const getUsuario = (id: number) => usuarios.find(u => u.id === id);
  const getProducto = (id: number) => productos.find(p => p.id === id);
  const cliente = getUsuario(pedido.usuarioId);

  const getStatusDisplayName = (id: number) => {
    const status = statusMap[id];
    if (!status) return "cargando...";
    return status;
  };

  const statusName = getStatusDisplayName(pedido.estadoId);

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('completa') || s.includes('entrega')) return { color: 'bg-emerald-600', iconName: 'calendar-check', bg: 'bg-emerald-100', text: 'text-emerald-800 border-emerald-200' };
    if (s.includes('pendien')) return { color: 'bg-amber-500', iconName: 'clock', bg: 'bg-amber-100', text: 'text-amber-800 border-amber-200' };
    if (s.includes('abono')) return { color: 'bg-indigo-600', iconName: 'receipt', bg: 'bg-indigo-100', text: 'text-indigo-800 border-indigo-200' };
    if (s.includes('anula') || s.includes('cancel')) return { color: 'bg-rose-600', iconName: 'x-circle', bg: 'bg-rose-100', text: 'text-rose-800 border-rose-200' };
    return { color: 'bg-slate-500', iconName: 'clock', bg: 'bg-slate-100', text: 'text-slate-800 border-slate-200' };
  };

  const statusConfig = getStatusConfig(statusName);

  const renderStatusIcon = (name: string) => {
    switch (name) {
      case 'calendar-check': return <CalendarCheck key="icon-check" className="h-4 w-4" />;
      case 'clock': return <Clock key="icon-clock" className="h-4 w-4" />;
      case 'receipt': return <Receipt key="icon-receipt" className="h-4 w-4" />;
      case 'x-circle': return <XCircle key="icon-x" className="h-4 w-4" />;
      default: return <Clock key="icon-default" className="h-4 w-4" />;
    }
  };


  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 30;

    const addText = (text: string, x: number, y: number, size = 10, font = 'helvetica', style = 'normal') => {
      doc.setFont(font, style);
      doc.setFontSize(size);
      doc.text(text, x, y);
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    addText('RESUMEN DE PEDIDO', margin, 15, 16, 'helvetica', 'bold');
    addText(`ID: #${pedido.id}`, margin, 25, 10);
    doc.setTextColor(255, 255, 255);
    addText(statusName.toUpperCase(), 160, 25, 12, 'helvetica', 'bold');

    doc.setTextColor(0, 0, 0);
    y = 55;

    addText('CLIENTE', margin, y, 11, 'helvetica', 'bold');
    y += 8;
    if (cliente) {
      addText(`Nombre: ${cliente.nombres} ${cliente.apellidos}`, margin, y);
      y += 6;
      addText(`Documento: ${cliente.numeroDocumento}`, margin, y);
      y += 6;
      addText(`Teléfono: ${cliente.telefono}`, margin, y);
    }

    y += 12;
    addText('ENTREGA Y PAGO', margin, y, 11, 'helvetica', 'bold');
    y += 8;
    addText(`Dirección: ${pedido.direccionEntrega}`, margin, y);
    y += 6;
    addText(`Ubicación: ${pedido.ciudadEntrega}, ${pedido.departamentoEntrega}`, margin, y);
    y += 6;
    addText(`Método: ${pedido.metodoPago}`, margin, y);

    y += 15;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y - 5, 170, 8, 'F');
    addText('ARTÍCULO', margin + 2, y, 9, 'helvetica', 'bold');
    addText('PRECIO', 110, y, 9, 'helvetica', 'bold');
    addText('CANT', 140, y, 9, 'helvetica', 'bold');
    addText('SUBTOTAL', 170, y, 9, 'helvetica', 'bold');
    y += 10;

    // Buscar detalles de forma ultra-resiliente para el PDF
    const getDetallesPDF = (obj: any) => {
      return obj.detalleVenta_Pedido || [];
    };

    const detallesPDF = getDetallesPDF(pedido);

    detallesPDF.forEach((item: any) => {
      const prod = getProducto(item.productoId);
      addText(prod ? prod.nombreProducto : `ID: ${item.productoId}`, margin + 2, y, 9);
      addText(formatCurrency(item.precioUnitario || item.precio), 110, y, 9);
      addText(item.cantidad.toString(), 142, y, 9);
      addText(formatCurrency(item.subtotal || ((item.precioUnitario || 0) * (item.cantidad || 0))), 170, y, 9);
      y += 8;
    });

    y += 10;
    doc.line(margin, y, 190, y);
    y += 10;
    addText('Subtotal:', 130, y, 10);
    addText(formatCurrency(pedido.subtotal), 170, y, 10);
    y += 6;
    addText('Envío:', 130, y, 10);
    addText(formatCurrency(pedido.envio), 170, y, 10);
    y += 10;
    addText('TOTAL:', 130, y, 12, 'helvetica', 'bold');
    addText(formatCurrency(pedido.total), 165, y, 12, 'helvetica', 'bold');

    doc.save(`Pedido_${pedido.id}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header Simplificado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onVolver} className="h-10 w-10 rounded-lg shadow-sm">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Detalle Pedido</h1>
              <Badge variant="outline" className="font-mono text-xs">#{pedido.id}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
              <span key="created-at" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold">Creado:</span>
                <span key="date-created">{pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleString() : '---'}</span>
              </span>
              <span key="delivery-container" className="flex items-center">
                {(pedido.estadoId === 1 || pedido.fechaEntrega) ? (
                  <span key="delivered-at" className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span key="date-delivered">
                      {pedido.fechaEntrega ? `Entregado: ${new Date(pedido.fechaEntrega).toLocaleString()}` : 'Entregado (Registro pendiente)'}
                    </span>
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            key={`status-badge-${pedido.id}-${pedido.estadoId}`}
            variant="outline"
            className={`${statusConfig.bg} ${statusConfig.text} px-4 py-1.5 rounded-lg flex items-center gap-2 capitalize font-bold text-xs shadow-sm shadow-black/5`}
          >
            <span key="badge-content" className="flex items-center gap-2">
              {renderStatusIcon(statusConfig.iconName)}
              <span key="status-text">{statusName}</span>
            </span>
          </Badge>
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2 font-bold h-9">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: Información del Cliente */}
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-white h-full">
          <CardHeader className="p-5 border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
              <UserCheck className="h-5 w-5 text-blue-600" />
              1. Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            ) : cliente ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                    <p className="text-base font-bold text-gray-900 capitalize">{cliente.nombres} {cliente.apellidos}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Documento</p>
                    <p className="text-base font-bold text-gray-900">{cliente.tipoDocumento} {cliente.numeroDocumento}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">E-mail</p>
                      <p className="text-sm font-medium text-gray-700 truncate">{cliente.correo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Teléfono</p>
                      <p className="text-sm font-medium text-gray-700">{cliente.telefono}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-xl border-gray-100 italic text-gray-400">
                Información del cliente no disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Logística y Pago */}
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-white h-full">
          <CardHeader className="p-5 border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
              <Truck className="h-5 w-5 text-emerald-600" />
              2. Entrega y Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dirección de Envío</p>
                  <p className="text-base font-bold text-gray-900 leading-snug">
                    {pedido.direccionEntrega || (cliente ? cliente.direccion : '---')}
                  </p>
                  <p className="text-xs text-gray-600 font-bold mt-2">
                    Barrio: <span className="text-gray-900">{(pedido as any).barrio || (cliente ? cliente.barrio : '---')}</span>
                  </p>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    Ciudad: <span className="text-gray-900 capitalize">{((pedido.ciudadEntrega || (cliente ? cliente.ciudad : '')) || '---').toLowerCase()}</span>
                  </p>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    Departamento: <span className="text-gray-900 capitalize">{((pedido.departamentoEntrega || (cliente ? cliente.departamento : '') || '---')).toLowerCase()}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border">
                  <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Método</p>
                    <p className="text-sm font-bold text-gray-900 leading-none">{pedido.metodoPago}</p>
                    {pedido.estadoId === 6 && pedido.plazoAbonos && (
                      <p className="text-[10px] text-indigo-600 font-black uppercase mt-1">Plazo: {pedido.plazoAbonos} {pedido.plazoAbonos === 1 ? 'Mes' : 'Meses'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border">
                  <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Envío</p>
                    <p className="text-sm font-bold text-gray-900 leading-none">{formatCurrency(pedido.envio)}</p>
                  </div>
                </div>
              </div>

              {pedido.observaciones && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mt-4">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Observaciones</p>
                  <p className="text-sm text-amber-900 font-medium leading-relaxed italic">"{pedido.observaciones}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card 3: Productos y Artículos */}
      <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="p-5 border-b bg-gray-50/50">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            3. Artículos del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Precio</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cantidad</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                      Cargando productos...
                    </td>
                  </tr>
                ) : (pedido.detalleVenta_Pedido || []).length > 0 ? (
                  (pedido.detalleVenta_Pedido || []).map((detalle: any, idx: number) => {
                    const prod = getProducto(detalle.productoId);
                    return (
                      <tr key={`item-${detalle.productoId}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{prod ? prod.nombreProducto : `Producto ID: ${detalle.productoId}`}</p>
                          {/*<p className="text-[10px] text-gray-400 font-medium tracking-tight">Ref: {detalle.productoId}</p>*/}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {formatCurrency(detalle.precioUnitario || detalle.precio)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-700 text-xs">
                            {detalle.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(detalle.subtotal || ((detalle.precioUnitario || 0) * (detalle.cantidad || 0)))}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium text-sm">
                      No hay artículos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50/50 p-6 border-t flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="hidden md:block">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Resumen de Totales</p>
            </div>
            <div className="flex flex-col items-end gap-1 w-full md:w-auto">
              <div className="flex justify-between w-full md:w-64 text-sm text-gray-500">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between w-full md:w-64 text-sm text-gray-500">
                <span>Costo Envío:</span>
                <span className="font-medium">{formatCurrency(pedido.envio)}</span>
              </div>
              <div className="flex justify-between w-full md:w-64 text-base font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span className="text-lg">TOTAL:</span>
                <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Acciones */}
      <div className="flex justify-center pt-4">
        <Button onClick={onVolver} variant="ghost" className="text-gray-400 hover:text-gray-900 font-bold gap-2 text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" />
          Cerrar Detalle
        </Button>
      </div>
    </div>
  );
};
