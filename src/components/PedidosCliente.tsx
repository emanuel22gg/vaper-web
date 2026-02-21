import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
} from 'lucide-react';

// Datos simulados de pedidos
const pedidosData = [
  {
    id: 1,
    numeroPedido: 'PED-001',
    fecha: new Date('2024-02-10'),
    estado: 'Entregado',
    total: 385000,
    productos: [
      {
        id: '1',
        nombre: 'Vape Desechable 2000 puffs',
        cantidad: 3,
        precio: 25000,
        imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      },
      {
        id: '2',
        nombre: 'Pod System Premium',
        cantidad: 1,
        precio: 180000,
        imagen: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=300&h=300&fit=crop',
      },
      {
        id: '3',
        nombre: 'Líquido Premium 60ml',
        cantidad: 4,
        precio: 35000,
        imagen: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=300&h=300&fit=crop',
      },
    ],
    direccionEnvio: {
      direccion: 'Calle 50 #45-23',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      telefono: '3001234567',
    },
    cliente: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '3001234567',
    },
  },
  {
    id: 2,
    numeroPedido: 'PED-002',
    fecha: new Date('2024-02-12'),
    estado: 'En Proceso',
    total: 320000,
    productos: [
      {
        id: '4',
        nombre: 'Mod Avanzado 100W',
        cantidad: 1,
        precio: 320000,
        imagen: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=300&h=300&fit=crop',
      },
    ],
    direccionEnvio: {
      direccion: 'Carrera 70 #34-12',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      telefono: '3001234567',
    },
    cliente: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '3001234567',
    },
  },
  {
    id: 3,
    numeroPedido: 'PED-003',
    fecha: new Date('2024-02-14'),
    estado: 'Pendiente',
    total: 195000,
    productos: [
      {
        id: '6',
        nombre: 'Kit Iniciación Completo',
        cantidad: 1,
        precio: 150000,
        imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      },
      {
        id: '5',
        nombre: 'Bobinas de Repuesto Pack x5',
        cantidad: 1,
        precio: 45000,
        imagen: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=300&h=300&fit=crop',
      },
    ],
    direccionEnvio: {
      direccion: 'Calle 10 Sur #30-50',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      telefono: '3001234567',
    },
    cliente: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '3001234567',
    },
  },
  {
    id: 4,
    numeroPedido: 'PED-004',
    fecha: new Date('2024-02-08'),
    estado: 'Cancelado',
    total: 180000,
    productos: [
      {
        id: '2',
        nombre: 'Pod System Premium',
        cantidad: 1,
        precio: 180000,
        imagen: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=300&h=300&fit=crop',
      },
    ],
    direccionEnvio: {
      direccion: 'Avenida 80 #45-12',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      telefono: '3001234567',
    },
    cliente: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '3001234567',
    },
  },
  {
    id: 5,
    numeroPedido: 'PED-005',
    fecha: new Date('2024-02-15'),
    estado: 'Enviado',
    total: 215000,
    productos: [
      {
        id: '1',
        nombre: 'Vape Desechable 2000 puffs',
        cantidad: 2,
        precio: 25000,
        imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      },
      {
        id: '3',
        nombre: 'Líquido Premium 60ml',
        cantidad: 3,
        precio: 35000,
        imagen: 'https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=300&h=300&fit=crop',
      },
      {
        id: '5',
        nombre: 'Bobinas de Repuesto Pack x5',
        cantidad: 2,
        precio: 45000,
        imagen: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=300&h=300&fit=crop',
      },
    ],
    direccionEnvio: {
      direccion: 'Calle 50 #45-23',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      telefono: '3001234567',
    },
    cliente: {
      nombre: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '3001234567',
    },
  },
];

export const PedidosCliente: React.FC = () => {
  const [selectedPedido, setSelectedPedido] = useState<typeof pedidosData[0] | null>(null);

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
                      <span className="text-gray-700">{selectedPedido.cliente.nombre}</span>
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

                {/* Dirección de envío */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-900">
                      <MapPin className="h-5 w-5 mr-2 text-yellow-500" />
                      Dirección de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-gray-700">
                    <p>{selectedPedido.direccionEnvio.direccion}</p>
                    <p>
                      {selectedPedido.direccionEnvio.ciudad}, {selectedPedido.direccionEnvio.departamento}
                    </p>
                    <p className="flex items-center pt-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedPedido.direccionEnvio.telefono}
                    </p>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
