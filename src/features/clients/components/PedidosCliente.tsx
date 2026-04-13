import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { ImageWithFallback } from '@/shared/components/figma/ImageWithFallback';
import {
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AuthContext } from '@/shared/contexts/AuthContext';
import { getVentaPedidos, getDetalleVentaPedidos, getProductos, getEstados, getAllImages, getAbonos } from '@/shared/services/api';
import { VentaAbonoDto } from '@/shared/types';

interface PedidoUI {
  id: number;
  numeroPedido: string;
  fecha: Date;
  estado: string;
  estadoId: number;
  plazoAbonos: number | null;
  abonos: VentaAbonoDto[];
  total: number;
  productos: {
    id: string;
    nombre: string;
    cantidad: number;
    precio: number;
    imagen: string;
  }[];
  direccionEnvio: {
    direccion: string;
    barrio: string;
    ciudad: string;
    departamento: string;
    telefono: string;
    envio: number;
    metodoPago: string;
  };
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    cedula: string;
  };
}

export const PedidosCliente: React.FC = () => {
  const { user } = useContext(AuthContext) as any;
  const [selectedPedido, setSelectedPedido] = useState<PedidoUI | null>(null);
  const [pedidosData, setPedidosData] = useState<PedidoUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        if (!user) return;
        
        const [pedidosApi, detallesApi, productosApi, estadosApi, imagesApi, abonosApi] = await Promise.all([
          getVentaPedidos(),
          getDetalleVentaPedidos(),
          getProductos(),
          getEstados(),
          getAllImages(),
          getAbonos()
        ]);

        const productosConImagen = productosApi.map(p => {
          const matchingImage = imagesApi.find(img => img.idImagen === p.idImagen);
          return {
            ...p,
            imagen: matchingImage ? matchingImage.urlimagen : p.imagen
          };
        });

        // Filtrar pedidos del cliente logueado
        const misPedidos = pedidosApi.filter(p => p.usuarioId === Number(user.id));
        
        const pedidosMapeados: PedidoUI[] = misPedidos.map(pedido => {
          // Obtener estado
          const estadoObj = estadosApi.find(e => e.id === pedido.estadoId);
          const nombreEstado = estadoObj ? estadoObj.nombreEstado : 'Desconocido';

          // Obtener detalles
          const detallesDelPedido = detallesApi.filter(d => d.ventaPedidoId === pedido.id);
          const productosAgregados = detallesDelPedido.map(detalle => {
            const prodInfo = productosConImagen.find(p => p.id === detalle.productoId);
            return {
              id: detalle.productoId.toString(),
              nombre: prodInfo ? prodInfo.nombreProducto : 'Producto Desconocido',
              cantidad: detalle.cantidad,
              precio: detalle.precioUnitario,
              imagen: prodInfo?.imagen || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
            };
          });

          const abonosDelPedido = abonosApi.filter(a => a.ventaPedidoId === pedido.id);

          const isRecogida = pedido.direccionEntrega === 'Recogida en tienda' || pedido.ciudadEntrega === 'N/A';
          let metodoPagoDisplay = pedido.metodoPago || 'Efectivo';
          if (pedido.metodoPago === 'Otro' || (pedido.plazoAbonos && pedido.plazoAbonos > 0)) {
              metodoPagoDisplay = 'Abonos';
          } else if (pedido.metodoPago === 'Efectivo') {
              metodoPagoDisplay = isRecogida ? 'Pago en tienda' : 'Contraentrega';
          }

          return {
            id: pedido.id || 0,
            numeroPedido: `PED-${(pedido.id || 0).toString().padStart(3, '0')}`,
            fecha: pedido.fechaCreacion ? new Date(pedido.fechaCreacion) : new Date(),
            estado: nombreEstado,
            estadoId: pedido.estadoId,
            plazoAbonos: pedido.plazoAbonos || null,
            abonos: abonosDelPedido,
            total: pedido.total || 0,
            productos: productosAgregados,
            direccionEnvio: {
              direccion: pedido.direccionEntrega || '',
              barrio: (pedido as any).barrio || user.barrio || '',
              ciudad: pedido.ciudadEntrega || '',
              departamento: pedido.departamentoEntrega || '',
              telefono: user.telefono || '',
              envio: pedido.envio || 0,
              metodoPago: metodoPagoDisplay,
            },
            cliente: {
              nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              email: user.email || '',
              telefono: user.telefono || '',
              cedula: user.numeroDocumento || '',
            }
          };
        });

        // Ordenar por ID descendente (más recientes primero)
        setPedidosData(pedidosMapeados.sort((a, b) => b.id - a.id));

      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return 'bg-green-500';
      case 'Enviado':
        return 'bg-blue-500';
      case 'En Proceso':
        return 'bg-yellow-500';
      case 'Pendiente':
        return 'bg-gray-500';
      case 'Cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return <CheckCircle className="h-5 w-5" />;
      case 'Enviado':
        return <Truck className="h-5 w-5" />;
      case 'En Proceso':
        return <Clock className="h-5 w-5" />;
      case 'Pendiente':
        return <Package className="h-5 w-5" />;
      case 'Cancelado':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-600">
          Revisa el estado y detalles de tus pedidos
        </p>
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        </div>
      ) : pedidosData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No hay pedidos</h3>
          <p className="text-gray-500">Aún no has realizado ninguna compra.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4">
        {pedidosData.map((pedido) => (
          <Card
            key={pedido.id}
            className="hover:shadow-lg transition-shadow border-gray-200"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    Pedido #{pedido.numeroPedido}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {pedido.fecha.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </div>
                <Badge className={`${getEstadoColor(pedido.estado)} text-white flex items-center gap-1`}>
                  {getEstadoIcon(pedido.estado)}
                  {pedido.estado}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Productos (mostrar solo los primeros 2) */}
                <div className="space-y-2">
                  {pedido.productos.slice(0, 2).map((producto, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <ImageWithFallback
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {producto.cantidad} x ${producto.precio.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {pedido.productos.length > 2 && (
                    <p className="text-xs text-gray-500 pl-2">
                      +{pedido.productos.length - 2} producto(s) más
                    </p>
                  )}
                </div>

                {/* Total y botón */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Total del pedido</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${pedido.total.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPedido(pedido)}
                    className="border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-black"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Dialog de detalle de pedido */}
      <Dialog open={!!selectedPedido} onOpenChange={() => setSelectedPedido(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPedido && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl">
                      Pedido #{selectedPedido.numeroPedido}
                    </DialogTitle>
                    <DialogDescription className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedPedido.fecha.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </DialogDescription>
                  </div>
                  <Badge className={`${getEstadoColor(selectedPedido.estado)} text-white flex items-center gap-2 text-lg px-4 py-2`}>
                    {getEstadoIcon(selectedPedido.estado)}
                    {selectedPedido.estado}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Información del cliente */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-900">
                      <User className="h-5 w-5 mr-2 text-yellow-500" />
                      Información del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700 font-medium">{selectedPedido.cliente.nombre}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">C.C. {selectedPedido.cliente.cedula}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">{selectedPedido.cliente.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">{selectedPedido.cliente.telefono}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Dirección y Pago */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-900">
                      <MapPin className="h-5 w-5 mr-2 text-yellow-500" />
                      Dirección y Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500 inline" /> Dirección
                      </p>
                      <p className="ml-5">{selectedPedido.direccionEnvio.direccion}</p>
                      <p className="ml-5">Barrio: {selectedPedido.direccionEnvio.barrio || 'N/A'}</p>
                      <p className="ml-5">{selectedPedido.direccionEnvio.ciudad}, {selectedPedido.direccionEnvio.departamento}</p>
                    </div>
                    <div>
                      <p className="font-medium flex items-center">
                        <Truck className="h-4 w-4 mr-1 text-gray-500 inline" /> Envío
                      </p>
                      <p className="ml-5 flex items-center">
                        {selectedPedido.direccionEnvio.direccion === 'Recogida en tienda' || selectedPedido.direccionEnvio.ciudad === 'N/A' ? (
                          <><Store className="h-4 w-4 mr-1 text-blue-600" /> Recogida en tienda</>
                        ) : (
                          <><Truck className="h-4 w-4 mr-1 text-green-600" /> A domicilio</>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium flex items-center">
                        <CreditCard className="h-4 w-4 mr-1 text-gray-500 inline" /> Método de pago
                      </p>
                      <p className="ml-5">{selectedPedido.direccionEnvio.metodoPago}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Productos del pedido */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-900">
                      <Package className="h-5 w-5 mr-2 text-yellow-500" />
                      Productos ({selectedPedido.productos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPedido.productos.map((producto, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <ImageWithFallback
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{producto.nombre}</p>
                              <p className="text-sm text-gray-600">
                                ${producto.precio.toLocaleString()} x {producto.cantidad}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ${(producto.precio * producto.cantidad).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Total */}
                      <div className="border-t-2 border-gray-300 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            Total del Pedido
                          </span>
                          <span className="text-2xl font-bold text-yellow-600">
                            ${selectedPedido.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Estado del pedido */}
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-400/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-900">
                      {getEstadoIcon(selectedPedido.estado)}
                      <span className="ml-2">Estado del Pedido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getEstadoColor(selectedPedido.estado)}`} />
                        <span className="font-medium text-gray-900">{selectedPedido.estado}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedPedido.estado === 'Entregado' && 'Tu pedido ha sido entregado exitosamente.'}
                        {selectedPedido.estado === 'Enviado' && 'Tu pedido está en camino. Lo recibirás pronto.'}
                        {selectedPedido.estado === 'En Proceso' && 'Estamos preparando tu pedido para el envío.'}
                        {selectedPedido.estado === 'Pendiente' && 'Tu pedido está pendiente de confirmación.'}
                        {selectedPedido.estado === 'Cancelado' && 'Este pedido ha sido cancelado.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(selectedPedido.plazoAbonos || (selectedPedido.abonos && selectedPedido.abonos.length > 0)) && (
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-900">
                      <Clock className="h-5 w-5 mr-2 text-blue-500" />
                      Detalles de Abonos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Resumen */}
                      <div className="flex justify-between items-center bg-white p-4 rounded-md border border-blue-100 shadow-sm">
                        <div>
                           <p className="text-sm font-semibold text-gray-700">Total Abonado</p>
                           <p className="text-xl font-bold text-blue-600">${selectedPedido.abonos.reduce((sum, a) => sum + (a.estado ? a.monto : 0), 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-semibold text-gray-700">Saldo Pendiente</p>
                           <p className="text-xl font-bold text-red-600">${(selectedPedido.total - selectedPedido.abonos.reduce((sum, a) => sum + (a.estado ? a.monto : 0), 0)).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Lista */}
                      {selectedPedido.abonos.filter(a => a.estado).length > 0 ? (
                         <div className="space-y-2">
                           <p className="text-sm font-semibold text-gray-700">Historial de Pagos:</p>
                           <div className="bg-white rounded-md border border-gray-100 overflow-hidden divide-y">
                             {selectedPedido.abonos.filter(a => a.estado).map(abono => (
                               <div key={abono.id} className="flex justify-between text-sm items-center p-3">
                                 <span className="text-gray-600">{new Date(abono.fecha).toLocaleDateString()}</span>
                                 <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">{abono.metodoPago}</span>
                                 <span className="font-bold text-green-600">+${abono.monto.toLocaleString()}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                      ) : (
                         <p className="text-sm text-gray-500 italic">Aún no tienes abonos registrados.</p>
                      )}

                      {/* Notificación Whatsapp */}
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-yellow-800 shadow-sm">
                         <div className="flex items-start gap-3">
                           <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 mt-0.5" />
                           <div>
                             <p className="font-bold mb-1 text-yellow-900">Plazo acordado: {selectedPedido.plazoAbonos || 1} mes(es)</p>
                             <p className="text-yellow-800">
                               Para realizar el cobro de tu próxima cuota, por favor comunícate a nuestra línea de WhatsApp enviando tu número de pedido.
                             </p>
                           </div>
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
