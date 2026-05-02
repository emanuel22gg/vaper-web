import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, AlertCircle, Clock, Package, ChevronRight, BellRing, UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { getProductos, getVentaPedidos, getEstados, getUsuarios } from '@/shared/services/api';

interface AdminNotificationsViewProps {
  onNavigate: (view: string, payload?: any) => void;
}

export function AdminNotificationsView({ onNavigate }: AdminNotificationsViewProps) {
  const [loading, setLoading] = useState(false);
  
  // Alertas
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [expiringInstallments, setExpiringInstallments] = useState<any[]>([]);
  const [pendingClients, setPendingClients] = useState<any[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [productos, pedidos, estados, usuarios] = await Promise.all([
        getProductos(),
        getVentaPedidos(),
        getEstados(),
        getUsuarios(),
      ]);

      const lowStock = productos.filter((p: any) => p.stock <= 5 && p.estado);
      setLowStockProducts(lowStock);

      const estadoPendiente = estados.find((e: any) => e.nombreEstado.toLowerCase() === 'pendiente');
      const pendienteId = estadoPendiente ? estadoPendiente.id : 2;
      
      const pends = pedidos.filter((p: any) => p.estadoId === pendienteId && p.tipoVenta === 'Pedido');
      const sortedPends = pends.sort((a, b) => {
        const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
        return dateB - dateA;
      });
      setPendingOrders(sortedPends);

      const today = new Date();
      const expiring = pedidos.filter((p: any) => {
        if (p.estadoId === 6 || (p.plazoAbonos && p.plazoAbonos > 0)) {
            const fechaInicio = p.fechaCreacion ? new Date(p.fechaCreacion) : new Date();
            const fechaVencimiento = new Date(fechaInicio);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (p.plazoAbonos || 1));
            
            const diffTime = fechaVencimiento.getTime() - today.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return p.estadoId === 6 && diasRestantes <= 7;
        }
        return false;
      });

      setExpiringInstallments(expiring);

      const pendingCli = usuarios.filter((u: any) => u.rolId === 3 && !u.estadoUsuario && u.documentoUrl);
      setPendingClients(pendingCli);

      setLastCheck(new Date());

    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const totalAlerts = lowStockProducts.length + pendingOrders.length + expiringInstallments.length + pendingClients.length;

  if (loading && totalAlerts === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-medium">Cargando Centro de Notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="h-6 w-6 text-blue-600" />
            Centro de Notificaciones
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Gestione eventos críticos, aprobaciones y alertas del sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">
            Última actualización: {lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            Actualizar
          </Button>
        </div>
      </div>

      {totalAlerts === 0 ? (
        <Card className="border-dashed shadow-sm text-center py-16">
          <CardContent className="pt-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellRing className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">¡Todo se encuentra al día!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              No tienes ninguna alerta pendiente. El inventario, los abonos y los despachos están al corriente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Columna Clientes */}
          <Card className="shadow-sm border-purple-100 flex flex-col">
            <CardHeader className="bg-purple-50/50 border-b border-purple-100 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                    Clientes Pendientes
                  </CardTitle>
                  <CardDescription className="text-purple-600/70 mt-1">Por Autorizar</CardDescription>
                </div>
                <Badge className="bg-purple-600 font-bold hover:bg-purple-700">{pendingClients.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {pendingClients.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Sin clientes por autorizar.</div>
              ) : (
                <div className="divide-y divide-gray-50 flex flex-col max-h-[500px] overflow-y-auto">
                  {pendingClients.map((client) => (
                    <div key={client.id} className="p-4 hover:bg-purple-50/30 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100/50 p-2 rounded-lg text-purple-600">
                           <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Cliente #{String(client.id).padStart(3, '0')}</p>
                          <p className="text-xs font-semibold text-gray-500">
                             {client.numeroDocumento}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-purple-600 opacity-0 group-hover:opacity-100" onClick={() => onNavigate('clientes', client.numeroDocumento)}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna Pedidos */}
          <Card className="shadow-sm border-blue-100 flex flex-col">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    Nuevos Pedidos
                  </CardTitle>
                  <CardDescription className="text-blue-600/70 mt-1">Por Despachar</CardDescription>
                </div>
                <Badge className="bg-blue-600 font-bold hover:bg-blue-700">{pendingOrders.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {pendingOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Sin pedidos pendientes.</div>
              ) : (
                <div className="divide-y divide-gray-50 flex flex-col max-h-[500px] overflow-y-auto">
                  {pendingOrders.map((pedido, idx) => (
                    <div key={pedido.id} className="p-4 hover:bg-blue-50/30 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100/50 p-2 rounded-lg text-blue-600">
                           <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Pedido #{String(pedido.id).padStart(3, '0')}</p>
                          <p className="text-xs font-semibold text-gray-500">
                             {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString() : 'N/A'} • Total: ${Number(pedido.total || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-blue-600 opacity-0 group-hover:opacity-100" onClick={() => onNavigate('pedidos', pedido.id)}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna Inventario */}
          <Card className="shadow-sm border-amber-100 flex flex-col">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-600" />
                    Stock Crítico
                  </CardTitle>
                  <CardDescription className="text-amber-600/70 mt-1">Requieren abastecimiento</CardDescription>
                </div>
                <Badge className="bg-amber-500 font-bold hover:bg-amber-600 text-white">{lowStockProducts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
               {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Stock estable.</div>
              ) : (
                <div className="divide-y divide-gray-50 flex flex-col max-h-[500px] overflow-y-auto">
                  {lowStockProducts.map((prod) => (
                    <div key={prod.id} className="p-4 hover:bg-amber-50/30 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-amber-100/50 p-2 rounded-lg text-amber-600 shrink-0">
                           <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-gray-800 truncate">{prod.nombreProducto}</p>
                          <p className="text-xs font-semibold text-amber-600">
                             ¡Quedan {prod.stock} {prod.stock === 1 ? 'unidad' : 'unidades'}!
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-amber-600 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => onNavigate('productos', prod.nombreProducto)}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna Cartera */}
          <Card className="shadow-sm border-red-100 flex flex-col">
            <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Cobranza Alerta
                  </CardTitle>
                  <CardDescription className="text-red-600/70 mt-1">Abonos próximos a vencer</CardDescription>
                </div>
                <Badge className="bg-red-600 font-bold hover:bg-red-700 text-white">{expiringInstallments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {expiringInstallments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Sin plazos por vencer.</div>
              ) : (
                <div className="divide-y divide-gray-50 flex flex-col max-h-[500px] overflow-y-auto">
                  {expiringInstallments.map((abono) => {
                      const fechaInicio = abono.fechaCreacion ? new Date(abono.fechaCreacion) : new Date();
                      const fechaVencimiento = new Date(fechaInicio);
                      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (abono.plazoAbonos || 1));
                      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={abono.id} className="p-4 hover:bg-red-50/30 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg text-white ${diasRestantes < 0 ? 'bg-red-500' : 'bg-orange-400'}`}>
                              {diasRestantes < 0 ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">Pedido #{String(abono.id).padStart(3, '0')}</p>
                              <p className={`text-xs font-bold ${diasRestantes < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                {diasRestantes < 0 ? `¡Vencido hace ${Math.abs(diasRestantes)}d!` : `Vence en ${diasRestantes} días`}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-600 opacity-0 group-hover:opacity-100" onClick={() => onNavigate('cartera', abono.id)}>
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
