import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

import { Devolucion } from '../types';
import { 
  ArrowLeft,
  User,
  ShoppingBag,
  Calendar,
  Package
} from 'lucide-react';

interface DetalleDevolucionProps {
  devolucion: Devolucion;
  onBack: () => void;
}

export const DetalleDevolucion: React.FC<DetalleDevolucionProps> = ({ devolucion, onBack }) => {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Aceptada': return 'bg-green-500';
      case 'Anulada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1>Detalle de Devolución</h1>
            <p className="text-muted-foreground">
              {devolucion.numeroDevolucion}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(devolucion.estado)} text-white`}>
          {devolucion.estado}
        </Badge>
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número:</span>
                <span className="font-medium">{devolucion.numeroDevolucion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge className={`${getStatusColor(devolucion.estado)} text-white`}>
                  {devolucion.estado}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Solicitud:</span>
                <span>{devolucion.fechaSolicitud.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Devolución:</span>
                <span>{devolucion.fechaDevolucion.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{devolucion.cliente.nombre} {devolucion.cliente.apellido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{devolucion.cliente.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono:</span>
                <span>{devolucion.cliente.telefono}</span>
              </div>
            </CardContent>
          </Card>

          {/* Venta Relacionada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Venta Relacionada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número:</span>
                <span className="font-medium">{devolucion.pedido.numeroPedido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{devolucion.pedido.numeroPedido.startsWith('PED') ? 'Pedido' : 'Venta'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Montos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Montos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto Total:</span>
                <span className="font-medium">${devolucion.montoTotal.toLocaleString()}</span>
              </div>
              {devolucion.montoAprobado !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto Aprobado:</span>
                  <span className="font-medium">${devolucion.montoAprobado.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Motivo de Devolución */}
        <Card>
          <CardHeader>
            <CardTitle>Motivo de Devolución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-muted-foreground">Motivo:</span>
              <p className="font-medium mt-1">{devolucion.motivo}</p>
            </div>
            {devolucion.descripcion && (
              <div>
                <span className="text-muted-foreground">Descripción:</span>
                <p className="mt-1 p-3 bg-muted rounded-lg">{devolucion.descripcion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productos a Devolver */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos a Devolver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devolucion.productos?.map((producto, index) => (
                <div key={index} className="border rounded-lg p-4 bg-card">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-medium">{producto.nombre}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Categoría:</span>
                          <span className="ml-2">{producto.categoria}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estado:</span>
                          <span className="ml-2">{producto.estadoProducto}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Motivo:</span>
                          <span className="ml-2">{producto.motivoDevolucion}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Precio Unitario:</span>
                          <span className="ml-2">${producto.precio.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1 ml-4">
                      <div className="text-sm text-muted-foreground">Cantidad</div>
                      <div className="text-lg font-semibold">{producto.cantidadDevolver}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                      <div className="font-medium">
                        ${(producto.precio * producto.cantidadDevolver).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No hay productos especificados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Observaciones Internas */}
        {devolucion.observacionesInternas && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="p-3 bg-muted rounded-lg">{devolucion.observacionesInternas}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
