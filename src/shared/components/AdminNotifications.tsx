import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProductos, getVentaPedidos, getEstados, getUsuarios, getAbonos } from '@/shared/services/api';
import { Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

interface AdminNotificationsProps {}

export function AdminNotifications({}: AdminNotificationsProps = {}) {
  const navigate = useNavigate();
  // Alertas
  const [totalAlerts, setTotalAlerts] = useState<number>(0);

  // Tracking para emitir notificaciones
  const knownOrderIds = React.useRef<Set<number>>(new Set());
  const knownPendingClientIds = React.useRef<Set<number>>(new Set());
  const isFirstLoad = React.useRef(true);
  
  const handleNavigateToCenter = useCallback(() => {
    navigate('/admin/notificaciones');
  }, [navigate]);

  const handleNavigateToPedidos = useCallback((pedidoId?: string) => {
    navigate('/admin/pedidos', { state: { payload: pedidoId } });
  }, [navigate]);

  const handleNavigateToClientes = useCallback((documento?: string) => {
    navigate('/admin/clientes', { state: { payload: documento } });
  }, [navigate]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [productos, pedidos, estados, usuarios, abonos] = await Promise.all([
        getProductos(),
        getVentaPedidos(),
        getEstados(),
        getUsuarios(),
        getAbonos(),
      ]);

      const lowStockProducts = productos.filter((p: any) => p.stock <= 5 && p.estado);
      
      const estadoPendiente = estados.find((e: any) => e.nombreEstado.toLowerCase() === 'pendiente');
      const pendienteId = estadoPendiente ? estadoPendiente.id : 2;
      const pendingOrders = pedidos.filter((p: any) => p.estadoId === pendienteId && p.tipoVenta === 'Pedido');

      // Lógica de toast de notificaciones para Nuevos Pedidos
      const currentPendingIds = pendingOrders.map((p: any) => p.id);
      
      if (isFirstLoad.current) {
        currentPendingIds.forEach((id: number) => knownOrderIds.current.add(id));
        isFirstLoad.current = false;
      } else {
        const newlyAdded = currentPendingIds.filter((id: number) => !knownOrderIds.current.has(id));
        
        if (newlyAdded.length > 0) {
          if (newlyAdded.length === 1) {
            toast.info(`¡Tienes un pedido nuevo (Pedido #${String(newlyAdded[0]).padStart(3, '0')})!`, {
              description: 'Dirígete a la sección de pedidos para despacharlo.',
              icon: '🛒',
              duration: 8000,
              action: {
                label: 'Ir a Pedidos',
                onClick: () => handleNavigateToPedidos(newlyAdded[0].toString())
              }
            });
          } else {
            toast.info(`¡Han entrado ${newlyAdded.length} pedidos nuevos!`, {
              description: 'Dirígete a la sección de pedidos para despacharlos.',
              icon: '🛒',
              duration: 8000,
              action: {
                label: 'Ir a Pedidos',
                onClick: () => handleNavigateToPedidos()
              }
            });
          }
          
          newlyAdded.forEach((id: number) => knownOrderIds.current.add(id));
        }
      }

      // Lógica de toast de notificaciones para Clientes Pendientes
      const pendingClients = usuarios.filter((u: any) => u.rolId === 3 && !u.estadoUsuario && u.documentoUrl);
      const currentPendingClientIds = pendingClients.map((u: any) => u.id);

      if (isFirstLoad.current) {
        currentPendingClientIds.forEach((id: number) => knownPendingClientIds.current.add(id));
        // isFirstLoad.current se cambia a false más abajo
      } else {
        const newlyAddedClients = currentPendingClientIds.filter((id: number) => !knownPendingClientIds.current.has(id));
        
        if (newlyAddedClients.length > 0) {
          if (newlyAddedClients.length === 1) {
            const client = pendingClients.find((c: any) => c.id === newlyAddedClients[0]);
            toast.info(`¡Tienes un cliente pendiente por autorizar!`, {
              description: `El cliente ${client?.nombres || ''} ${client?.apellidos || ''} (Doc: ${client?.numeroDocumento || ''}) se está registrando. Autorízalo.`,
              icon: '👤',
              duration: 8000,
              action: {
                label: 'Ir a Clientes',
                onClick: () => handleNavigateToClientes(client?.numeroDocumento)
              }
            });
          } else {
            toast.info(`¡Hay ${newlyAddedClients.length} clientes pendientes por autorizar!`, {
              description: 'Dirígete a la sección de clientes para autorizarlos.',
              icon: '👤',
              duration: 8000,
              action: {
                label: 'Ir a Clientes',
                onClick: () => handleNavigateToClientes()
              }
            });
          }
          
          newlyAddedClients.forEach((id: number) => knownPendingClientIds.current.add(id));
        }
      }

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }

      const today = new Date();
      const expiringInstallments = pedidos.filter((p: any) => {
        if (p.plazoAbonos !== null) {
            const pedidoAbonos = abonos.filter((a: any) => a.ventaPedidoId === p.id && a.estado);
            const totalAbonado = pedidoAbonos.reduce((sum: number, a: any) => sum + a.monto, 0);
            const saldoPendiente = p.total - totalAbonado;
            
            if (saldoPendiente <= 0) return false;

            const fechaInicio = p.fechaCreacion ? new Date(p.fechaCreacion) : new Date();
            const fechaVencimiento = new Date(fechaInicio);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (p.plazoAbonos || 1));
            
            const diffTime = fechaVencimiento.getTime() - today.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diasRestantes <= 7;
        }
        return false;
      });

      setTotalAlerts(lowStockProducts.length + pendingOrders.length + expiringInstallments.length + pendingClients.length);

    } catch (error) {
      console.error("Error fetching notifications badging:", error);
    }
  }, [handleNavigateToPedidos, handleNavigateToClientes]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000); 
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  return (
    <Button
      variant="outline"
      className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 transition-all rounded-full h-9 px-3 flex items-center justify-center gap-2 shadow-sm"
      onClick={handleNavigateToCenter}
      title="Centro de Notificaciones"
    >
      <Bell className="h-4 w-4" />
      {totalAlerts > 0 && (
        <span className="text-red-500 text-sm font-bold">
          {totalAlerts > 99 ? '99+' : totalAlerts}
        </span>
      )}
    </Button>
  );
}
