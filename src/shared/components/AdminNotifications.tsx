import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getProductos, getVentaPedidos, getEstados } from '@/shared/services/api';

interface AdminNotificationsProps {
  onNavigate: (view: any) => void;
  onAdminNavigate?: (view: string) => void;
}

export function AdminNotifications({ onNavigate, onAdminNavigate }: AdminNotificationsProps) {
  // Alertas
  const [totalAlerts, setTotalAlerts] = useState<number>(0);

  // Tracking para emitir notificaciones
  const knownOrderIds = React.useRef<Set<number>>(new Set());
  const isFirstLoad = React.useRef(true);
  
  const handleNavigateToPedidos = useCallback(() => {
    if (onAdminNavigate) {
      onAdminNavigate('pedidos');
    } else {
      onNavigate('admin');
      if (onAdminNavigate) onAdminNavigate('pedidos');
    }
  }, [onAdminNavigate, onNavigate]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [productos, pedidos, estados] = await Promise.all([
        getProductos(),
        getVentaPedidos(),
        getEstados(),
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
                onClick: () => handleNavigateToPedidos()
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

      const today = new Date();
      const expiringInstallments = pedidos.filter((p: any) => {
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

      setTotalAlerts(lowStockProducts.length + pendingOrders.length + expiringInstallments.length);

    } catch (error) {
      console.error("Error fetching notifications badging:", error);
    }
  }, [handleNavigateToPedidos]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000); 
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  // Ocultado temporalmente por solicitud: return <Button>...</Button>;
  // Retornamos null para que corra los procesos silenciosos pero no se vea en el Header.
  return null;
}
