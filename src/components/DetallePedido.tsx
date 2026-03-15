import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
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
    addText(`Barrio: ${(pedido as any).barrio || cliente?.barrio || '---'}`, margin, y);
    y += 6;
    addText(`Ubicación: ${pedido.ciudadEntrega || cliente?.ciudad || '---'}, ${pedido.departamentoEntrega || cliente?.departamento || '---'}`, margin, y);
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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Botón Volver - Estilo refinado */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onVolver} 
          className="group gap-2 text-gray-400 hover:text-gray-900 transition-all duration-200 pl-0"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Volver al panel principal</span>
        </Button>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white">
        {/* Cabecera del Documento - Minimalista y Profesional */}
        <div className="p-8 md:p-10 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Comprobante de Pedido</h1>
                <span className="px-3 py-1 bg-gray-50 text-gray-400 font-mono text-xs rounded-full border border-gray-100">
                  #{pedido.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">Emitido el {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}</span>
                </span>
                {pedido.fechaEntrega && (
                  <span className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50/50 px-2.5 py-0.5 rounded-full border border-emerald-100/50">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span className="font-medium">Entregado</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`${statusConfig.bg.replace('100', '50')} ${statusConfig.text} px-4 py-1.5 rounded-full flex items-center gap-2 capitalize font-bold text-[12px] border-none shadow-sm`}
              >
                <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
                {statusName}
              </Badge>
              <Button 
                onClick={handleExportPDF} 
                className="bg-gray-900 text-white hover:bg-black font-medium h-10 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Cuerpo del Documento - Grid de información limpia */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Cliente */}
          <div className="p-8 md:p-10 border-r border-gray-50">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-8">Información del Solicitante</h4>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-50 rounded w-1/2" />
                <div className="h-4 bg-gray-50 rounded w-1/3" />
              </div>
            ) : cliente ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{cliente.nombres} {cliente.apellidos}</p>
                  <p className="text-sm text-gray-500 mt-1 font-mono">{cliente.tipoDocumento} {cliente.numeroDocumento}</p>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{cliente.correo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{cliente.telefono}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-2xl text-center">
                <p className="text-sm text-gray-400 italic">Información del cliente no vinculada</p>
              </div>
            )}
          </div>

          {/* Logística */}
          <div className="p-8 md:p-10 bg-gray-50/30">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-8">Detalles de Entrega y Facturación</h4>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 border border-blue-50 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{pedido.direccionEntrega || 'Dirección no especificada'}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    <span className="font-medium">{pedido.ciudadEntrega || cliente?.ciudad || '---'}, {pedido.departamentoEntrega || cliente?.departamento || '---'}</span>
                    <br />
                    <span className="uppercase text-[10px] font-bold tracking-tight text-gray-400">Barrio: {(pedido as any).barrio || cliente?.barrio || '---'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase block leading-none mb-1">Pago</Label>
                    <p className="text-xs font-bold text-gray-900">{pedido.metodoPago}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase block leading-none mb-1">Envío</Label>
                    <p className="text-xs font-bold text-gray-900">{formatCurrency(pedido.envio)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Artículos del Pedido</h4>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase">{(pedido.detalleVenta_Pedido || []).length} Productos</span>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Precio</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Cant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-300 italic">Sincronizando con almacén...</td>
                  </tr>
                ) : (pedido.detalleVenta_Pedido || []).length > 0 ? (
                  (pedido.detalleVenta_Pedido || []).map((detalle, idx) => {
                    const prod = getProducto(detalle.productoId);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-gray-900">{prod ? prod.nombreProducto : `Producto #${detalle.productoId}`}</p>
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-gray-500 font-medium font-mono">
                          {formatCurrency((detalle as any).precioUnitario || (detalle as any).precio)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex h-7 px-2.5 items-center justify-center bg-gray-100 text-gray-700 font-bold rounded-lg text-xs">
                            {detalle.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-gray-900 font-mono">
                          {formatCurrency(detalle.subtotal || (((detalle as any).precioUnitario || (detalle as any).precio || 0) * (detalle.cantidad || 0)))}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-300 italic text-sm">Vacío</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen Final de Importes */}
          <div className="mt-10 flex justify-end">
            <div className="w-full md:w-80 space-y-4 pt-6">
              <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span>Total Bruto</span>
                <span className="font-mono">{formatCurrency(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span>Logística de Envío</span>
                <span className="font-mono">{formatCurrency(pedido.envio)}</span>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Total a Pagar</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="h-10" />
    </div>
  );
};