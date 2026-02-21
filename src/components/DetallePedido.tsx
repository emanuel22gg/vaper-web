import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Pedido } from '../types';
import { 
  ArrowLeft,
  Download,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  Package,
  Truck,
  CreditCard,
  Star,
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DetallePedidoProps {
  pedido: Pedido;
  onVolver: () => void;
}

export const DetallePedido: React.FC<DetallePedidoProps> = ({ pedido, onVolver }) => {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Entregado': return 'bg-green-500';
      case 'En Camino': return 'bg-blue-500';
      case 'En Preparación': return 'bg-yellow-500';
      case 'Confirmado': return 'bg-cyan-500';
      case 'Pendiente': return 'bg-orange-500';
      case 'Cancelado': return 'bg-red-500';
      case 'Anulado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Entregado': return <CheckCircle className="h-4 w-4" />;
      case 'En Camino': return <Truck className="h-4 w-4" />;
      case 'En Preparación': return <Package className="h-4 w-4" />;
      case 'Confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'Pendiente': return <Clock className="h-4 w-4" />;
      case 'Cancelado': return <AlertCircle className="h-4 w-4" />;
      case 'Anulado': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (metodo: string) => {
    switch (metodo) {
      case 'Efectivo': return '💵';
      case 'Tarjeta Crédito': return '💳';
      case 'Tarjeta Débito': return '💳';
      case 'Transferencia': return '🏦';
      case 'PSE': return '🏛️';
      case 'Nequi': return '📱';
      case 'Daviplata': return '📱';
      default: return '💰';
    }
  };

  const exportarPDF = async () => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 20;

      // Configurar fuente
      doc.setFont('helvetica');

      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE PEDIDO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(14);
      doc.text(pedido.numeroPedido || pedido.id, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Información básica
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN GENERAL', 15, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha del Pedido: ${pedido.fechaPedido ? pedido.fechaPedido.toLocaleDateString() : 'N/A'}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Estado: ${pedido.estado}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Método de Pago: ${pedido.metodoPago}`, 15, yPosition);
      yPosition += 7;
      if (pedido.fechaEntregaEstimada) {
        doc.text(`Entrega Estimada: ${pedido.fechaEntregaEstimada.toLocaleDateString()}`, 15, yPosition);
        yPosition += 7;
      }
      if (pedido.fechaEntrega) {
        doc.text(`Fecha de Entrega: ${pedido.fechaEntrega.toLocaleDateString()}`, 15, yPosition);
        yPosition += 7;
      }
      yPosition += 10;

      // Información del cliente
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL CLIENTE', 15, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre: ${pedido.cliente.nombre} ${pedido.cliente.apellido || ''}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Email: ${pedido.cliente.email}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Teléfono: ${pedido.cliente.telefono}`, 15, yPosition);
      yPosition += 15;

      // Dirección de entrega
      if (pedido.direccionEntrega) {
        doc.setFont('helvetica', 'bold');
        doc.text('DIRECCIÓN DE ENTREGA', 15, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text(`Dirección: ${pedido.direccionEntrega.direccion}`, 15, yPosition);
        yPosition += 7;
        doc.text(`Ciudad: ${pedido.direccionEntrega.ciudad}, ${pedido.direccionEntrega.departamento}`, 15, yPosition);
        yPosition += 7;
        if (pedido.direccionEntrega.codigoPostal) {
          doc.text(`Código Postal: ${pedido.direccionEntrega.codigoPostal}`, 15, yPosition);
          yPosition += 7;
        }
        if (pedido.direccionEntrega.instrucciones) {
          doc.text('Instrucciones:', 15, yPosition);
          yPosition += 7;
          const instruccionesLineas = doc.splitTextToSize(pedido.direccionEntrega.instrucciones, pageWidth - 30);
          doc.text(instruccionesLineas, 15, yPosition);
          yPosition += instruccionesLineas.length * 7;
        }
        yPosition += 10;
      }

      // Productos del pedido
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCTOS DEL PEDIDO', 15, yPosition);
      yPosition += 10;

      pedido.productos.forEach((producto, index) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${producto.nombre}`, 15, yPosition);
        yPosition += 7;
        if (producto.categoria) {
          doc.text(`   Categoría: ${producto.categoria}`, 15, yPosition);
          yPosition += 7;
        }
        if (producto.especificaciones) {
          let especificacionesText = '   Especificaciones: ';
          if (producto.especificaciones.sabor) especificacionesText += `${producto.especificaciones.sabor} `;
          if (producto.especificaciones.nicotina) especificacionesText += `${producto.especificaciones.nicotina} `;
          if (producto.especificaciones.tamaño) especificacionesText += `${producto.especificaciones.tamaño}`;
          doc.text(especificacionesText, 15, yPosition);
          yPosition += 7;
        }
        doc.text(`   Cantidad: ${producto.cantidad} | Precio: ${producto.precio.toLocaleString()}`, 15, yPosition);
        yPosition += 7;
        doc.text(`   Subtotal: ${producto.subtotal.toLocaleString()}`, 15, yPosition);
        if (producto.descuento && producto.descuento > 0) {
          yPosition += 7;
          doc.text(`   Descuento: -${producto.descuento.toLocaleString()}`, 15, yPosition);
        }
        yPosition += 10;
      });

      // Resumen financiero
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN FINANCIERO', 15, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotal: ${pedido.subtotal.toLocaleString()}`, 15, yPosition);
      yPosition += 7;
      if (pedido.descuento && pedido.descuento > 0) {
        doc.text(`Descuento: -${pedido.descuento.toLocaleString()}`, 15, yPosition);
        yPosition += 7;
      }
      doc.text(`Impuestos: ${pedido.impuestos ? pedido.impuestos.toLocaleString() : '0'}`, 15, yPosition);
      yPosition += 7;
      doc.text(`Costo de Envío: ${pedido.costoEnvio ? pedido.costoEnvio.toLocaleString() : '0'}`, 15, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: ${pedido.total.toLocaleString()}`, 15, yPosition);
      yPosition += 15;

      // Observaciones
      if (pedido.observaciones) {
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES', 15, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        const observacionesLineas = doc.splitTextToSize(pedido.observaciones, pageWidth - 30);
        doc.text(observacionesLineas, 15, yPosition);
        yPosition += observacionesLineas.length * 7 + 10;
      }

      // Repartidor
      if (pedido.repartidor) {
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DE ENTREGA', 15, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text(`Repartidor: ${pedido.repartidor}`, 15, yPosition);
        yPosition += 7;
        if (pedido.tiempoEstimadoEntrega) {
          doc.text(`Tiempo Estimado: ${pedido.tiempoEstimadoEntrega} minutos`, 15, yPosition);
          yPosition += 7;
        }
        yPosition += 10;
      }

      // Calificación
      if (pedido.calificacion) {
        doc.setFont('helvetica', 'bold');
        doc.text('CALIFICACIÓN DEL CLIENTE', 15, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text(`Puntuación: ${pedido.calificacion}/5 estrellas`, 15, yPosition);
        yPosition += 7;
        if (pedido.comentarioCliente) {
          doc.text('Comentario:', 15, yPosition);
          yPosition += 7;
          const comentarioLineas = doc.splitTextToSize(pedido.comentarioCliente, pageWidth - 30);
          doc.text(comentarioLineas, 15, yPosition);
          yPosition += comentarioLineas.length * 7 + 10;
        }
      }

      // Pie de página
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Documento generado el ${new Date().toLocaleDateString('es-ES')}`, 15, doc.internal.pageSize.height - 15);

      // Descargar el PDF
      doc.save(`pedido-${pedido.numeroPedido || pedido.id}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onVolver}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pedidos
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle del Pedido</h1>
            <p className="text-gray-600">{pedido.numeroPedido}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className={`${getStatusColor(pedido.estado)} flex items-center space-x-1 px-3 py-1`}>
            {getStatusIcon(pedido.estado)}
            <span>{pedido.estado}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-lg font-semibold">
                {pedido.cliente.nombre} {pedido.cliente.apellido}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Contacto</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{pedido.cliente.telefono}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{pedido.cliente.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-500">Dirección de Entrega</label>
              <div className="flex items-start space-x-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p>{pedido.direccionEntrega.direccion}</p>
                  <p className="text-sm text-gray-600">
                    {pedido.direccionEntrega.ciudad}, {pedido.direccionEntrega.departamento}
                  </p>
                  {pedido.direccionEntrega.codigoPostal && (
                    <p className="text-sm text-gray-600">CP: {pedido.direccionEntrega.codigoPostal}</p>
                  )}
                  {pedido.direccionEntrega.instrucciones && (
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Instrucciones:</strong> {pedido.direccionEntrega.instrucciones}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Pedido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Información del Pedido</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha del Pedido</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p>{pedido.fechaPedido.toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{pedido.fechaPedido.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Entrega Estimada</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p>{pedido.fechaEntregaEstimada.toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{pedido.fechaEntregaEstimada.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {pedido.fechaEntrega && (
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Entrega Real</label>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p>{pedido.fechaEntrega.toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{pedido.fechaEntrega.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-500">Método de Pago</label>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getPaymentMethodIcon(pedido.metodoPago)}</span>
                <span className="font-medium">{pedido.metodoPago}</span>
              </div>
            </div>

            {pedido.repartidor && (
              <div>
                <label className="text-sm font-medium text-gray-500">Repartidor</label>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span>{pedido.repartidor}</span>
                </div>
              </div>
            )}

            {pedido.tiempoEstimadoEntrega && (
              <div>
                <label className="text-sm font-medium text-gray-500">Tiempo Estimado</label>
                <p>{pedido.tiempoEstimadoEntrega} minutos</p>
              </div>
            )}

            {pedido.observaciones && (
              <div>
                <label className="text-sm font-medium text-gray-500">Observaciones</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{pedido.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calificación y Comentarios */}
        {pedido.calificacion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Calificación del Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Puntuación</label>
                {renderStarRating(pedido.calificacion)}
              </div>
              
              {pedido.comentarioCliente && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Comentario</label>
                  <div className="flex items-start space-x-2">
                    <MessageCircle className="h-4 w-4 text-gray-400 mt-1" />
                    <p className="text-sm bg-blue-50 p-3 rounded italic">
                      "{pedido.comentarioCliente}"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Productos Solicitados */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Solicitados</CardTitle>
          <CardDescription>
            {pedido.productos.length} productos en este pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pedido.productos.map((producto, index) => (
              <div key={producto.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{producto.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      <Badge variant="outline" className="mr-2">{producto.categoria}</Badge>
                      {producto.especificaciones && (
                        <span>
                          {producto.especificaciones.sabor && `${producto.especificaciones.sabor} • `}
                          {producto.especificaciones.nicotina && `${producto.especificaciones.nicotina} • `}
                          {producto.especificaciones.tamaño && producto.especificaciones.tamaño}
                        </span>
                      )}
                    </p>
                    <div className="text-sm text-gray-500 mt-1">
                      Cantidad: <span className="font-semibold">{producto.cantidad}</span> x ${producto.precio.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">${producto.subtotal.toLocaleString()}</div>
                  {producto.descuento && (
                    <div className="text-sm text-green-600">-${producto.descuento.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Resumen de Totales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${pedido.subtotal.toLocaleString()}</span>
              </div>
              
              {pedido.descuento && pedido.descuento > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span>-${pedido.descuento.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Impuestos:</span>
                <span>${pedido.impuestos.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Costo de Envío:</span>
                <span>${pedido.costoEnvio.toLocaleString()}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${pedido.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
