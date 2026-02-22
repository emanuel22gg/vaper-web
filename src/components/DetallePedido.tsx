import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { VentaPedidoDto, UsuarioDto, Producto } from '../types/index';
import { getUsuarios, getProductos, getVentaPedidoById } from '../services/api';
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
  UserCheck
} from 'lucide-react';
import { toast } from "sonner";
import jsPDF from 'jspdf';

interface DetallePedidoProps {
  pedido: VentaPedidoDto;
  onVolver: () => void;
}

export const DetallePedido: React.FC<DetallePedidoProps> = ({ pedido: pedidoProp, onVolver }) => {
  const [pedido, setPedido] = useState<VentaPedidoDto>(pedidoProp);
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Intentar obtener el pedido completo si el que viene por prop no tiene detalles
        const [usuariosData, productosData, fullPedido] = await Promise.all([
          getUsuarios(),
          getProductos(),
          getVentaPedidoById(pedidoProp.id!)
        ]);

        setUsuarios(usuariosData);
        setProductos(productosData);
        if (fullPedido) {
          const finalPedido = Array.isArray(fullPedido) ? fullPedido[0] : fullPedido;
          console.group("DEBUG PEDIDO");
          console.log("Keys found:", Object.keys(finalPedido));
          console.groupEnd();

          // Toast de diagnóstico temporal
          if (process.env.NODE_ENV === 'development') {
            const keys = Object.keys(finalPedido).join(', ');
            toast.info("Campos recibidos: " + keys, { duration: 10000 });
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

  const getStatusName = (id: number) => {
    switch (id) {
      case 1: return "pendiente";
      case 2: return "entregado";
      case 3: return "cancelado";
      default: return "desconocido";
    }
  };

  const statusName = getStatusName(pedido.estadoId);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'entregado': return { color: 'bg-emerald-600', icon: <CalendarCheck className="h-4 w-4" />, bg: 'bg-emerald-50', text: 'text-emerald-700' };
      case 'pendiente': return { color: 'bg-amber-500', icon: <Clock className="h-4 w-4" />, bg: 'bg-amber-50', text: 'text-amber-700' };
      case 'cancelado': return { color: 'bg-rose-600', icon: <Truck className="h-4 w-4" />, bg: 'bg-rose-50', text: 'text-rose-700' };
      default: return { color: 'bg-slate-500', icon: <Clock className="h-4 w-4" />, bg: 'bg-slate-50', text: 'text-slate-700' };
    }
  };

  const statusConfig = getStatusConfig(statusName);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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
      if (!obj) return [];
      const names = ['detalleVentaPedidos', 'DetalleVentaPedidos', 'detalleVentaPedido', 'detallePedidos', 'DetallePedidos', 'detalleVentas', 'detalles', 'DetalleVentas', 'items'];
      for (const name of names) {
        if (Array.isArray(obj[name]) && obj[name].length > 0) return obj[name];
      }
      if (obj.data) {
        for (const name of names) {
          if (Array.isArray(obj.data[name]) && obj.data[name].length > 0) return obj.data[name];
        }
      }
      return obj.detalleVentaPedidos || obj.DetalleVentaPedidos || [];
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300">
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
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold">Creado:</span> {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleString() : '---'}
              </span>
              {pedido.fechaEntrega && (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Entregado: {new Date(pedido.fechaEntrega).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${statusConfig.bg} ${statusConfig.text} border-transparent px-4 py-1.5 rounded-lg flex items-center gap-2 capitalize font-bold text-xs`}>
            {statusConfig.icon}
            {statusName}
          </Badge>
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2 font-bold h-9">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Card 1: Información del Cliente */}
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                    <p className="text-lg font-bold text-gray-900">{cliente.nombres} {cliente.apellidos}</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">E-mail</p>
                      <p className="text-sm font-medium text-gray-700 truncate">{cliente.correo}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Teléfono</p>
                      <p className="text-sm font-medium text-gray-700">{cliente.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Documento</p>
                      <p className="text-sm font-medium text-gray-700">{cliente.numeroDocumento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border col-span-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Barrio</p>
                      <p className="text-sm font-medium text-gray-700">{cliente.barrio || '---'}</p>
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

        {/* Card 2: Productos y Artículos */}
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="p-5 border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              2. Artículos del Pedido
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
                  ) : (() => {
                    // Buscar detalles de forma ultra-resiliente
                    const getDetalles = (obj: any) => {
                      if (!obj) return [];
                      // Lista de posibles nombres de campo para los items
                      const names = [
                        'detalleVentaPedidos',
                        'DetalleVentaPedidos',
                        'detalleVentaPedido',
                        'detallePedidos',
                        'DetallePedidos',
                        'detalleVentas',
                        'detalles',
                        'items',
                        'DetalleVentas'
                      ];

                      // Primero buscar en el objeto raíz, luego en .data
                      for (const name of names) {
                        if (Array.isArray(obj[name]) && obj[name].length > 0) return obj[name];
                      }
                      if (obj.data) {
                        for (const name of names) {
                          if (Array.isArray(obj.data[name]) && obj.data[name].length > 0) return obj.data[name];
                        }
                      }

                      // Si no se encontró nada con contenido, devolver el primero que exista aunque esté vacío
                      return obj.detalleVentaPedidos || obj.DetalleVentaPedidos || obj.detalles || [];
                    };

                    const detalles = getDetalles(pedido);

                    if (detalles && detalles.length > 0) {
                      return detalles.map((detalle: any, idx: number) => {
                        const prod = getProducto(detalle.productoId);
                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-900">{prod ? prod.nombreProducto : `Producto ID: ${detalle.productoId}`}</p>
                              <p className="text-[10px] text-gray-400 font-medium tracking-tight">Ref: {detalle.productoId}</p>
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
                      });
                    } else {
                      return (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium text-sm">
                            <div className="flex flex-col items-center gap-2">
                              <p>Este pedido no tiene artículos registrados.</p>
                              <p className="text-[10px] text-gray-400 font-normal">Campos en pedido: {Object.keys(pedido).join(', ')}</p>
                              {process.env.NODE_ENV === 'development' && (
                                <details className="text-[8px] text-gray-300 mt-2 text-left max-w-xs overflow-auto">
                                  <summary>Ver JSON Crudo</summary>
                                  <pre>{JSON.stringify(pedido, null, 2)}</pre>
                                </details>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })()}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50/50 p-6 border-t flex flex-col items-end gap-1">
              <div className="flex justify-between w-64 text-sm text-gray-500">
                <span>Productos Subtotal:</span>
                <span className="font-medium">{formatCurrency(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between w-64 text-sm text-gray-500">
                <span>Costo de Envío:</span>
                <span className="font-medium">{formatCurrency(pedido.envio)}</span>
              </div>
              <div className="flex justify-between w-64 text-base font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span>TOTAL PEDIDO:</span>
                <span className="text-blue-600">{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Logística y Resumen Final */}
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="p-5 border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
              <Truck className="h-5 w-5 text-emerald-600" />
              3. Entrega y Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dirección de Envío</p>
                    <p className="text-base font-bold text-gray-900 leading-snug">
                      {pedido.direccionEntrega || (cliente ? cliente.direccion : '---')}
                    </p>
                    <p className="text-xs text-gray-600 font-bold mt-1">
                      Barrio: <span className="text-gray-900">{pedido.barrio || (cliente ? cliente.barrio : '---')}</span>
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-0.5 capitalize">
                      {((pedido.ciudadEntrega || (cliente ? cliente.ciudad : '')) || '---').toLowerCase()},
                      {((pedido.departamentoEntrega || '---')).toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Método de Pago</p>
                      <p className="text-sm font-bold text-gray-900 leading-none">{pedido.metodoPago}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Costo Envío</p>
                      <p className="text-sm font-bold text-gray-900 leading-none">{formatCurrency(pedido.envio)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-end border-l pl-8">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Neto a Pagar</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">
                  {formatCurrency(pedido.total)}
                </p>
                <p className="text-[10px] text-blue-600 font-bold mt-1">Total Comprobante generado correctamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
