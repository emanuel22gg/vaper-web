import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { updateVentaPedido, getVentaPedidoById, createVentaPedido, createDetalleVentaPedido, getVentaPedidos, getDetalleVentaPedidos } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { cn } from './ui/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TablePagination } from './ui/TablePagination';
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar as CalendarIcon,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  XCircle,
  MoreHorizontal,
  Check,
  ChevronsUpDown,
  FileText,
  TrendingUp,
  Users,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Función helper para formatear fechas
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  // Si la fecha es un string YYYY-MM-DD, añadir tiempo para evitar problemas de zona horaria
  const dateStr = typeof date === 'string' && date.length === 10 ? `${date}T12:00:00` : date;
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Interfaces para tipado
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  numeroDocumento: string;
}

interface ItemVenta {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Pago {
  id: number;
  fecha: string;
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
  referencia?: string;
  notas?: string;
}

interface Venta {
  id: number;
  numeroVenta: string;
  fecha: string;
  clienteId: number;
  nombreCliente: string;
  telefonoCliente: string;
  emailCliente: string;
  items: ItemVenta[];
  subtotal: number;
  descuento: number;
  impuestos?: number;
  envio?: number;
  total: number;
  estado: 'aceptada' | 'anulada'; // Cambiado: aceptada y anulada
  metodoPago: string;
  tipoVenta: 'directa' | 'pedido'; // Nuevo campo
  pedidoId?: number; // Para ventas por pedido
  notas?: string;
  pagos: Pago[];
  cotizacionId?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
  motivoAnulacion?: string;
}

// Datos simulados

// Datos simulados eliminados para usar API real
const ventasIniciales: Venta[] = [];

export const Ventas: React.FC = () => {
  // Inicialización de ventas vacía para cargar desde API
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoadingVentas, setIsLoadingVentas] = useState(false);

  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [clientesDisponibles, setClientesDisponibles] = useState<Usuario[]>([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Filtrado derivado de los estados (uso de useMemo para evitar desincronización)
  const ventasFiltradas = useMemo(() => {
    let result = [...ventas];

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const isNumeric = /^\d+$/.test(term); // Verificar si el término es puramente numérico

      result = result.filter(venta => {
        // 1. Si es un número buscar coincidencia EXACTA por ID
        if (isNumeric) {
          return venta.id.toString() === term;
        }

        // 2. Si es texto, buscar en Nombre, Email y Número de venta (Excluyendo teléfonos)
        const matchesName = venta.nombreCliente.toLowerCase().includes(term);
        const matchesEmail = venta.emailCliente.toLowerCase().includes(term);
        const matchesVentaNum = venta.numeroVenta.toLowerCase().includes(term);

        return matchesName || matchesEmail || matchesVentaNum;
      });
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      result = result.filter(venta => venta.estado === filtroEstado);
    }

    return result;
  }, [ventas, searchTerm, filtroEstado]);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Estados para pedidos pendientes
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string>('');

  // Eliminado LocalStorage sync para usar API real

  // Estados de paginación mejorados
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Estados para crear venta - MODIFICADO: sin vendedor, con tipoVenta y descuento
  const [formData, setFormData] = useState({
    clienteId: '',
    nombreCliente: '',
    fecha: new Date().toISOString().split('T')[0],
    tipoVenta: 'directa' as 'directa' | 'pedido',
    pedidoId: '',
    metodoPago: '',
    descuento: 0,
    items: [] as ItemVenta[]
  });

  // Estados para agregar productos
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [openClientes, setOpenClientes] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [openProductos, setOpenProductos] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Filtrado de clientes para el buscador en diálogo de nueva venta
  const clientesFiltradosParaBusqueda = useMemo(() => {
    const term = clientSearchTerm.toLowerCase().trim();
    if (!term) return clientesDisponibles;
    return clientesDisponibles.filter(cliente =>
      `${cliente.nombres} ${cliente.apellidos}`.toLowerCase().includes(term) ||
      cliente.numeroDocumento.toLowerCase().includes(term)
    );
  }, [clientesDisponibles, clientSearchTerm]);

  // Filtrado de productos para el buscador
  const productosFiltradosParaBusqueda = useMemo(() => {
    const term = productSearchTerm.toLowerCase().trim();
    if (!term) return productosDisponibles;
    return productosDisponibles.filter(producto =>
      producto.nombre.toLowerCase().includes(term)
    );
  }, [productosDisponibles, productSearchTerm]);

  // Estados para pagos
  const [newPago, setNewPago] = useState({
    monto: 0,
    metodoPago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'otro',
    referencia: '',
    notas: ''
  });

  // Estados para anulación
  const [motivoAnulacion, setMotivoAnulacion] = useState('');



  // Cargar productos desde la API
  const fetchProductos = async () => {
    setIsLoadingProductos(true);
    try {
      const response = await fetch('/api/Productoes');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();

      // Mapear los datos de la API al formato Producto
      const productosMapeados: Producto[] = data.map((p: any) => ({
        id: p.id,
        nombre: p.nombreProducto,
        precio: p.precio,
        stock: p.stock || 0,
        categoria: `Categoría ${p.categoriaId}`
      }));

      setProductosDisponibles(productosMapeados);
      return productosMapeados;
    } catch (error) {
      console.error('Error fetching productos:', error);
      toast.error('No se pudieron cargar los productos de la API');
      return [];
    } finally {
      setIsLoadingProductos(false);
    }
  };

  // Cargar clientes desde la API
  const fetchClientes = async () => {
    setIsLoadingClientes(true);
    try {
      const response = await fetch('/api/Usuarios');
      if (!response.ok) throw new Error('Error al cargar clientes');
      const data = await response.json();

      // Filtrar usuarios de prueba o sistema (IDs 1 y 2)
      const clientesFiltrados = data.filter((u: Usuario) => u.id !== 1 && u.id !== 2);
      setClientesDisponibles(clientesFiltrados);
      return clientesFiltrados;
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('No se pudieron cargar los clientes de la API');
      return [];
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingVentas(true);
      const [prods, cats] = await Promise.all([fetchProductos(), fetchClientes()]);
      await fetchVentas(prods, cats);
      setIsLoadingVentas(false);
    };
    loadData();
  }, []);

  const fetchVentas = async (currentProds?: Producto[], currentClientes?: Usuario[]) => {
    try {
      const [ventasRaw, detallesRaw] = await Promise.all([
        getVentaPedidos(),
        getDetalleVentaPedidos()
      ]);

      const prods = currentProds || productosDisponibles;
      const clients = currentClientes || clientesDisponibles;

      const ventasMapeadas: Venta[] = ventasRaw
        .filter((v: any) => v.tipoVenta === 'Pedido' ? (v.estadoId === 1 || (v.estadoId === 3 && v.observaciones?.includes('[Cancelado desde Ventas]'))) : true)
        .map(v => {
          const cliente = clients.find(c => c.id === v.usuarioId);
          const detallesVenta = detallesRaw.filter(d => d.ventaPedidoId === v.id);

          return {
            id: v.id || 0,
            numeroVenta: `VNT-${String(v.id).padStart(3, '0')}`,
            fecha: v.fechaCreacion?.split('T')[0] || new Date().toISOString().split('T')[0],
            clienteId: v.usuarioId,
            nombreCliente: cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente Desconocido',
            telefonoCliente: cliente?.telefono || '',
            emailCliente: cliente?.correo || '',
            items: detallesVenta.map(d => {
              const prod = prods.find(p => p.id === d.productoId);
              return {
                id: d.id || 0,
                productoId: d.productoId,
                nombreProducto: prod?.nombre || 'Producto Desconocido',
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                subtotal: d.subtotal
              };
            }),
            subtotal: v.subtotal,
            descuento: Math.max(0, Math.round((v.subtotal + (v.envio || 0)) - v.total)),
            envio: v.envio || 0,
            total: v.total,
            estado: v.estadoId === 1 ? 'aceptada' : 'anulada',
            metodoPago: v.metodoPago,
            tipoVenta: v.tipoVenta === 'Venta' ? 'directa' : 'pedido',
            pedidoId: v.id,
            fechaCreacion: v.fechaCreacion || '',
            fechaActualizacion: v.fechaCreacion || '',
            creadoPor: 'Sistema',
            pagos: []
          };
        });

      setVentas(ventasMapeadas);
    } catch (error) {
      console.error('Error fetching ventas:', error);
      toast.error('No se pudieron cargar las ventas de la API');
    }
  };

  // Cargar productos al abrir el diálogo de creación
  useEffect(() => {
    if (isCreateDialogOpen) {
      setIsConfirmed(false);
      fetchProductos();
    }
  }, [isCreateDialogOpen]);

  // Cargar pedidos pendientes cuando cambia el cliente y el tipo de venta es pedido
  useEffect(() => {
    const fetchPedidos = async () => {
      if (!formData.clienteId || formData.tipoVenta !== 'pedido') {
        setPedidosPendientes([]);
        return;
      }

      setIsLoadingPedidos(true);
      try {
        const response = await fetch('/api/VentaPedidos');
        if (!response.ok) throw new Error('Error al cargar pedidos');
        const data = await response.json();

        // Filtrar por el cliente seleccionado y estado pendiente (ID 2 según análisis)
        const pendientes = data.filter((p: any) =>
          p.usuarioId === parseInt(formData.clienteId) && p.estadoId === 2
        );
        setPedidosPendientes(pendientes);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
        toast.error('No se pudieron cargar los pedidos pendientes');
      } finally {
        setIsLoadingPedidos(false);
      }
    };

    fetchPedidos();
  }, [formData.clienteId, formData.tipoVenta]);

  // Manejar selección de pedido para auto-llenado
  const handleSelectPedido = async (pedidoId: string) => {
    setSelectedPedidoId(pedidoId);
    if (!pedidoId) return;

    const loadingToast = toast.loading(`Cargando detalles del pedido #${pedidoId}...`);

    try {
      const response = await fetch(`/api/VentaPedidos/${pedidoId}`);
      if (!response.ok) throw new Error('Error al cargar detalles del pedido');
      const pedido = await response.json();

      // 0. Antes de cargar el nuevo pedido, devolvemos el stock LOCALMENTE (ya que no se ha descontado en el servidor aún para pedidos)
      // Si antes era una venta directa o un pedido ya cargado, restauramos el stock local de los productos para refrescar la UI
      setProductosDisponibles(prevProd => {
        let currentProds = [...prevProd];
        formData.items.forEach(item => {
          currentProds = currentProds.map(p =>
            p.id === item.productoId ? { ...p, stock: p.stock + item.cantidad } : p
          );
        });
        return currentProds;
      });

      // Mapear los items del pedido a items de venta (probamos varias nomenclaturas de la API)
      let detallesRaw = pedido.detalleVenta_Pedido ||
        pedido.detalleVentaPedidos ||
        pedido.DetalleVentaPedidos ||
        pedido.detallePedidos ||
        pedido.DetallePedidos || [];

      // FALLBACK: Si no vienen en el pedido, los buscamos directamente en el endpoint de detalles
      if (detallesRaw.length === 0) {
        try {
          const detRes = await fetch('/api/DetalleVentaPedidoes');
          if (detRes.ok) {
            const allDetalles = await detRes.json();
            detallesRaw = allDetalles.filter((d: any) =>
              Number(d.ventaPedidoId) === Number(pedidoId)
            );
          }
        } catch (e) {
          console.error("Error en fallback de detalles:", e);
        }
      }

      const itemsVenta: ItemVenta[] = [];

      detallesRaw.forEach((detalle: any, index: number) => {
        const producto = productosDisponibles.find(p => p.id === detalle.productoId);
        if (producto) {
          itemsVenta.push({
            id: index + 1,
            productoId: detalle.productoId,
            nombreProducto: producto.nombre,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario || detalle.precio || producto.precio || 0,
            subtotal: detalle.subtotal || ((detalle.precioUnitario || detalle.precio || producto.precio || 0) * detalle.cantidad)
          });
        }
      });

      // NO SINCRONIZAMOS EN EL SERVIDOR TODAVÍA PARA EVITAR 503
      // Solo actualizamos el estado local para feedback visual inmediato

      // Actualizar el formulario con los datos del pedido
      setFormData(prev => ({
        ...prev,
        items: itemsVenta,
        metodoPago: pedido.metodoPago || prev.metodoPago,
        descuento: pedido.descuento || 0,
        pedidoId: pedidoId
      }));

      // Actualizar stock localmente
      setProductosDisponibles(prevProd => {
        let updatedProds = [...prevProd];
        itemsVenta.forEach(item => {
          updatedProds = updatedProds.map(p =>
            p.id === item.productoId ? { ...p, stock: p.stock - item.cantidad } : p
          );
        });
        return updatedProds;
      });

      if (itemsVenta.length === 0) {
        toast.warning(`El pedido #${pedidoId} no tiene productos válidos`, { id: loadingToast });
      }
    } catch (error) {
      console.error('Error fetching pedido details:', error);
      toast.error('No se pudieron cargar los datos del pedido', { id: loadingToast });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado, itemsPerPage]);

  // Funciones CRUD - MODIFICADO: solo crear venta, sin editar
  const handleCreateVenta = async () => {
    if (!formData.nombreCliente || formData.items.length === 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const loadingToast = toast.loading('Guardando venta...');

    try {
      setIsConfirmed(true);

      // 1. Si es venta por pedido, ahora sí sincronizamos el stock en el servidor de forma masiva
      // Y actualizamos el estado del pedido a 'entregado'
      if (formData.tipoVenta === 'pedido' && formData.pedidoId) {
        const syncToast = toast.loading('Sincronizando inventario y pedido...');
        try {
          // Actualizar stock de productos
          for (const item of formData.items) {
            const getRes = await fetch(`/api/Productoes/${item.productoId}`);
            if (getRes.ok) {
              const pOriginal = await getRes.json();
              await fetch(`/api/Productoes/${item.productoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock - item.cantidad })
              });
            }
          }

          // Actualizar estado del pedido a 'entregado' (ID 1)
          const pedidoIdNum = parseInt(formData.pedidoId);
          const pedidoOriginal = await getVentaPedidoById(pedidoIdNum);
          if (pedidoOriginal) {
            const now = new Date().toISOString();
            const updatedPedido = {
              ...pedidoOriginal,
              estadoId: 1, // 1 = Entregado
              fechaEntrega: now
            };
            await updateVentaPedido(pedidoIdNum, updatedPedido);
          }

          toast.success('Inventario y pedido sincronizados', { id: syncToast });
        } catch (e) {
          console.error("Error en sincronización final:", e);
          toast.error("Error al sincronizar inventario o pedido", { id: syncToast });
        }
      }

      // (En una app real, aquí se enviaría el POST de la venta al backend)
      // --- INTEGRACIÓN CON LA API PARA VENTA DIRECTA ---
      if (formData.tipoVenta === 'directa') {
        try {
          const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
          const montoDescuento = (subtotal * formData.descuento) / 100;
          const total = subtotal - montoDescuento;

          // 1. Crear la cabecera del VentaPedido
          const payloadVenta: any = {
            usuarioId: parseInt(formData.clienteId) || 3, // ID 3 como fallback si no hay cliente (ajustar según DB)
            estadoId: 1, // 1 = Entregado/Completado para venta directa
            metodoPago: formData.metodoPago,
            direccionEntrega: "Venta Presencial",
            ciudadEntrega: "Local",
            departamentoEntrega: "Local",
            barrio: "Local",
            observaciones: "Venta directa desde caja",
            subtotal: subtotal,
            descuento: montoDescuento > 0 ? montoDescuento : 0,
            envio: 0,
            total: total,
            tipoVenta: "Venta" // <--- REVERTIDO: Ocultar de Pedidos usando el tipo estándar
          };

          const responseVenta = await createVentaPedido(payloadVenta);
          const createdVentaId = responseVenta.id || responseVenta.Id || responseVenta.ID;

          if (createdVentaId) {
            // 2. Crear los detalles y actualizar stock
            for (const item of formData.items) {
              await createDetalleVentaPedido({
                ventaPedidoId: createdVentaId,
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal
              });

              // Actualizar stock para venta directa
              const getRes = await fetch(`/api/Productoes/${item.productoId}`);
              if (getRes.ok) {
                const pOriginal = await getRes.json();
                await fetch(`/api/Productoes/${item.productoId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock - item.cantidad })
                });
              }
            }
          }
        } catch (apiError) {
          console.error("Error al guardar venta en la API:", apiError);
          // Continuamos para guardar localmente aunque falle la API (o podrías lanzar error)
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const montoDescuento = (subtotal * formData.descuento) / 100;
      const total = subtotal - montoDescuento;

      const nuevaVenta: Venta = {
        id: Math.max(...ventas.map(v => v.id)) + 1,
        numeroVenta: `VNT-${String(ventas.length + 1).padStart(3, '0')}`,
        fecha: today,
        clienteId: parseInt(formData.clienteId) || 0,
        nombreCliente: formData.nombreCliente,
        telefonoCliente: '', // Campo eliminado, valor por defecto
        emailCliente: '', // Campo eliminado, valor por defecto
        items: formData.items,
        subtotal: subtotal,
        descuento: montoDescuento,
        impuestos: 0,
        total: total,
        estado: 'aceptada',
        metodoPago: formData.metodoPago,
        tipoVenta: formData.tipoVenta,
        pedidoId: formData.tipoVenta === 'pedido' && formData.pedidoId ? parseInt(formData.pedidoId) : undefined,
        notas: '',
        pagos: [
          {
            id: 1,
            fecha: today,
            monto: total,
            metodoPago: formData.metodoPago === 'Efectivo' ? 'efectivo' :
              formData.metodoPago === 'Tarjeta' ? 'tarjeta' :
                formData.metodoPago === 'Transferencia' ? 'transferencia' : 'otro'
          }
        ],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: 'Usuario Actual'
      };

      // Refrescar lista de ventas desde la API
      await fetchVentas();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Venta creada e inventario actualizado con éxito', { id: loadingToast });
    } catch (error) {
      console.error('Error al crear venta:', error);
      toast.error('Hubo un error al procesar la venta. El inventario podría estar desincronizado.', { id: loadingToast });
    }
  };

  const handleDeleteVenta = async () => {
    if (ventaToDelete) {
      const loadingToast = toast.loading(`Anulando venta y restaurando inventario...`);

      try {
        // 1. Restaurar stock de cada item en el servidor
        for (const item of ventaToDelete.items) {
          const getRes = await fetch(`/api/Productoes/${item.productoId}`);
          if (getRes.ok) {
            const pOriginal = await getRes.json();
            await fetch(`/api/Productoes/${item.productoId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock + item.cantidad })
            });
          }
        }

        // 2. Refrescar productos disponibles localmente
        fetchProductos();

        // 3. Si era una venta por pedido, cancelamos el pedido en el servidor
        if (ventaToDelete.tipoVenta === 'pedido' && ventaToDelete.pedidoId) {
          const cancelPedidoToast = toast.loading('Cancelando pedido asociado...');
          try {
            const pedidoIdNum = ventaToDelete.pedidoId;
            const pedidoOriginal = await getVentaPedidoById(pedidoIdNum);
            if (pedidoOriginal) {
              const updatedPedido = {
                ...pedidoOriginal,
                estadoId: 3, // 3 = Cancelado
                observaciones: pedidoOriginal.observaciones ? `${pedidoOriginal.observaciones} [Cancelado desde Ventas]` : '[Cancelado desde Ventas]'
              };
              await updateVentaPedido(pedidoIdNum, updatedPedido);
              toast.success('Pedido asociado cancelado', { id: cancelPedidoToast });
            }
          } catch (e) {
            console.error("Error al cancelar pedido asociado:", e);
            toast.error("Error al cancelar el pedido en el servidor", { id: cancelPedidoToast });
          }
        }

        // 4. Marcar como anulada en el estado local
        const ventaAnulada = {
          ...ventaToDelete,
          estado: 'anulada' as const,
          motivoAnulacion: motivoAnulacion || 'Venta anulada por el sistema',
          fechaActualizacion: new Date().toISOString()
        };

        setVentas(ventas.map(v => v.id === ventaToDelete.id ? ventaAnulada : v));
        setIsDeleteDialogOpen(false);
        setVentaToDelete(null);
        setMotivoAnulacion('');
        toast.success('Venta anulada e inventario restaurado exitosamente', { id: loadingToast });
      } catch (error) {
        console.error('Error al anular venta:', error);
        toast.error('Hubo un error al restaurar el inventario.', { id: loadingToast });
      }
    }
  };

  // Función para agregar producto
  const agregarProducto = async () => {
    if (!selectedProducto) return;

    const producto = productosDisponibles.find(p => p.id === parseInt(selectedProducto));
    if (!producto) return;

    // Verificar si el producto ya existe en la lista
    const itemExistente = formData.items.find(item => item.productoId === producto.id);
    if (itemExistente) {
      toast.error('El producto ya fue agregado');
      return;
    }

    // 1. Validar stock localmente
    if (cantidad > producto.stock) {
      toast.error(`Stock insuficiente. Solo quedan ${producto.stock} unidades de ${producto.nombre}`);
      return;
    }

    const loadingToast = toast.loading(`Actualizando stock de ${producto.nombre}...`);

    try {
      // 2. Sincronizar con el servidor
      const getRes = await fetch(`/api/Productoes/${producto.id}`);
      if (!getRes.ok) throw new Error('No se pudo verificar el stock en el servidor');
      const pOriginal = await getRes.json();

      if (pOriginal.stock < cantidad) {
        toast.error('El stock en el servidor ha cambiado y no es suficiente.', { id: loadingToast });
        fetchProductos();
        return;
      }

      const putRes = await fetch(`/api/Productoes/${producto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock - cantidad })
      });

      if (!putRes.ok) throw new Error('Error al actualizar servidor');

      // 3. Actualizar estado local
      const maxId = formData.items.length > 0 ? Math.max(...formData.items.map(i => i.id)) : 0;
      const nuevoItem: ItemVenta = {
        id: maxId + 1,
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad
      };

      setProductosDisponibles(prev => prev.map(p =>
        p.id === producto.id ? { ...p, stock: p.stock - cantidad } : p
      ));

      setFormData({
        ...formData,
        items: [...formData.items, nuevoItem]
      });

      setSelectedProducto('');
      setCantidad(1);
      toast.success(`${producto.nombre} agregado e inventario actualizado`, { id: loadingToast });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast.error('No se pudo actualizar el inventario', { id: loadingToast });
    }
  };
  // Función para eliminar producto
  const eliminarProducto = async (itemId: number) => {
    const item = formData.items.find(i => i.id === itemId);
    if (!item) return;

    const loadingToast = toast.loading(`Restaurando stock de ${item.nombreProducto}...`);

    try {
      const getRes = await fetch(`/api/Productoes/${item.productoId}`);
      if (!getRes.ok) throw new Error('No se pudo obtener el producto del servidor');
      const pOriginal = await getRes.json();

      const putRes = await fetch(`/api/Productoes/${item.productoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock + item.cantidad })
      });

      if (!putRes.ok) throw new Error('Error al restaurar stock en el servidor');

      // Actualizar localmente
      setProductosDisponibles(prev => prev.map(p =>
        p.id === item.productoId ? { ...p, stock: p.stock + item.cantidad } : p
      ));

      setFormData({
        ...formData,
        items: formData.items.filter(i => i.id !== itemId)
      });
      toast.success('Stock restaurado exitosamente', { id: loadingToast });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      toast.error('Error al sincronizar con el servidor', { id: loadingToast });
    }
  };

  // Función para restaurar stock globalmente (usada al cancelar o cerrar diálogo sin guardar)
  const handleRestoreStock = async () => {
    if (formData.items.length === 0) return;

    // Solo restauramos en el servidor si la venta es DIRECTA, 
    // porque en PEDIDO no se descontó nada en el servidor hasta el final.
    if (formData.tipoVenta === 'pedido') {
      // Solo refrescamos localmente para devolver lo que quitamos de la UI
      fetchProductos();
      return;
    }

    const loadingToast = toast.loading('Restaurando inventario...');
    try {
      for (const item of formData.items) {
        const getRes = await fetch(`/api/Productoes/${item.productoId}`);
        if (getRes.ok) {
          const pOriginal = await getRes.json();
          await fetch(`/api/Productoes/${item.productoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock + item.cantidad })
          });
        }
      }
      toast.success('Inventario restaurado correctamente', { id: loadingToast });
    } catch (error) {
      console.error('Error restaurando stock:', error);
      toast.error('Error al restaurar inventario', { id: loadingToast });
    }
  };

  const cambiarCantidad = async (itemId: number, delta: number) => {
    const item = formData.items.find(i => i.id === itemId);
    if (!item) return;

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;

    const loadingToast = toast.loading('Actualizando inventario...');
    try {
      const getRes = await fetch(`/api/Productoes/${item.productoId}`);
      if (!getRes.ok) throw new Error('No se pudo verificar stock');
      const pOriginal = await getRes.json();

      // Si queremos aumentar, verificamos stock
      if (delta > 0 && pOriginal.stock < delta) {
        toast.error('No hay stock suficiente para aumentar la cantidad', { id: loadingToast });
        return;
      }

      const putRes = await fetch(`/api/Productoes/${item.productoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pOriginal, stock: pOriginal.stock - delta })
      });

      if (!putRes.ok) throw new Error('Error al actualizar servidor');

      // Actualizar localmente
      setProductosDisponibles(prev => prev.map(p =>
        p.id === item.productoId ? { ...p, stock: p.stock - delta } : p
      ));

      setFormData({
        ...formData,
        items: formData.items.map(i => i.id === itemId ? {
          ...i,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * i.precioUnitario
        } : i)
      });
      toast.success('Cantidad actualizada', { id: loadingToast });
    } catch (error) {
      console.error('Error cambiando cantidad:', error);
      toast.error('Error al sincronizar con el servidor', { id: loadingToast });
    }
  };

  const handleTipoVentaChange = async (value: 'directa' | 'pedido') => {
    if (value === formData.tipoVenta) return;

    // Restaurar stock actual si hay items
    if (formData.items.length > 0) {
      await handleRestoreStock();
    }

    // Resetear datos relacionados (manteniendo el cliente)
    setFormData(prev => ({
      ...prev,
      tipoVenta: value,
      fecha: new Date().toISOString().split('T')[0],
      items: [],
      pedidoId: '',
      metodoPago: '',
      descuento: 0
    }));
    setSelectedPedidoId('');
  };

  // Funciones auxiliares - MODIFICADO: sin vendedor, con tipoVenta y descuento
  const resetForm = () => {
    setFormData({
      clienteId: '',
      nombreCliente: '',
      fecha: new Date().toISOString().split('T')[0],
      tipoVenta: 'directa',
      pedidoId: '',
      metodoPago: '',
      descuento: 0,
      items: []
    });
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'aceptada': { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'bg-black hover:bg-black/90' },
      'anulada': { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" />, color: 'bg-red-600 hover:bg-red-700' }
    };

    const config = variants[estado as keyof typeof variants] || variants.aceptada;

    return (
      <Badge
        variant={config.variant}
        className={cn("flex items-center gap-1 w-fit capitalize", config.color)}
      >
        {config.icon}
        {estado}
      </Badge>
    );
  };

  // Función para mostrar alerta de anulación
  const confirmAnularVenta = (venta: Venta) => {
    if (venta.estado === 'anulada') return;

    setVentaToDelete(venta);
    setIsDeleteDialogOpen(true);
  };

  // Función para generar y descargar PDF de la venta
  const downloadVentaPDF = (venta: Venta) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(33, 33, 33);
      doc.text("Vaper One", pageWidth / 2, y, { align: "center" });
      y += 10;
      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text("FACTURA DE VENTA", pageWidth / 2, y, { align: "center" });

      y += 15;
      doc.setDrawColor(33, 33, 33);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);

      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);

      // Info Section
      doc.setFont("helvetica", "bold");
      doc.text("Número de Venta:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(venta.numeroVenta, margin + 35, y);

      doc.setFont("helvetica", "bold");
      doc.text("Fecha:", pageWidth - margin - 50, y);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(venta.fecha), pageWidth - margin - 35, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Cliente:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(venta.nombreCliente, margin + 35, y);

      doc.setFont("helvetica", "bold");
      doc.text("Estado:", pageWidth - margin - 50, y);
      doc.setFont("helvetica", "normal");
      doc.text(venta.estado.toUpperCase(), pageWidth - margin - 35, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Tipo de Venta:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(venta.tipoVenta === 'pedido' ? 'Pedido' : 'Directa', margin + 35, y);

      doc.setFont("helvetica", "bold");
      doc.text("Método Pago:", pageWidth - margin - 50, y);
      doc.setFont("helvetica", "normal");
      doc.text(venta.metodoPago, pageWidth - margin - 23, y);

      if (venta.motivoAnulacion) {
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("Motivo Anulación:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(venta.motivoAnulacion, margin + 35, y);
      }

      y += 15;

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Producto", margin + 5, y + 7);
      doc.text("Cant", margin + 100, y + 7);
      doc.text("Precio", margin + 120, y + 7);
      doc.text("Subtotal", margin + 150, y + 7);

      y += 10;
      doc.setFont("helvetica", "normal");

      // Table Content
      venta.items.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(item.nombreProducto.substring(0, 45), margin + 5, y + 7);
        doc.text(String(item.cantidad), margin + 100, y + 7);
        doc.text(`$${item.precioUnitario.toLocaleString()}`, margin + 120, y + 7);
        doc.text(`$${item.subtotal.toLocaleString()}`, margin + 150, y + 7);
        y += 8;
      });

      y += 5;
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Totals
      doc.setFont("helvetica", "bold");
      if (venta.descuento > 0) {
        doc.text("Descuento:", margin + 120, y);
        doc.text(`-$${venta.descuento.toLocaleString()}`, margin + 150, y);
        y += 7;
      }
      doc.setFontSize(14);
      doc.text("TOTAL:", margin + 120, y);
      doc.text(`$${venta.total.toLocaleString()}`, margin + 150, y);

      y += 30;
      // Signatures
      if (y > 250) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(10);
      doc.line(margin, y, margin + 60, y);
      doc.text("Firma del Cliente", margin, y + 5);

      doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
      doc.text("Firma del Vendedor", pageWidth - margin - 60, y + 5);

      y += 30;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generado el ${formatDate(new Date())} por ${venta.creadoPor}`, pageWidth / 2, y, { align: "center" });
      doc.text("Vaper One - Sistema de Gestión de Ventas", pageWidth / 2, y + 4, { align: "center" });

      doc.save(`venta-${venta.numeroVenta}.pdf`);
      toast.success(`PDF de la venta ${venta.numeroVenta} generado exitosamente`);
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error('Error generating PDF:', error);
    }
  };

  // Cálculos de paginación mejorados
  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVentas = ventasFiltradas.slice(startIndex, endIndex);

  // Funciones de paginación
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Generar números de página para mostrar
  const generatePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-6">
      {/* Header con título, filtros y botón - TODO EN UNO */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        {/* Título y botón en la misma línea */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-[14px]">Gestión de Ventas</h1>
            <p className="text-muted-foreground text-sm">
              Administra y controla todas las ventas del sistema
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-black hover:bg-gray-800 text-white border-none w-full lg:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>

        {/* Filtros de búsqueda */}
        <div className="flex flex-col lg:flex-row gap-4 items-end pt-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Buscar por ID (número) o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="aceptada">Aceptada</SelectItem>
                <SelectItem value="anulada">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Separador */}
        <Separator className="my-4" />

        {/* Tabla de ventas */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVentas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell className="font-medium text-black">{venta.numeroVenta}</TableCell>
                  <TableCell>{venta.nombreCliente}</TableCell>
                  <TableCell>
                    <Badge variant={venta.tipoVenta === 'pedido' ? 'secondary' : 'outline'}>
                      {venta.tipoVenta === 'pedido' ? 'Pedido' : 'Directa'}
                    </Badge>
                  </TableCell>
                  <TableCell>${venta.total.toLocaleString()}</TableCell>
                  <TableCell>
                    {getEstadoBadge(venta.estado)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVenta(venta);
                          setIsDetailDialogOpen(true);
                        }}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadVentaPDF(venta)}
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmAnularVenta(venta)}
                        disabled={venta.estado === 'anulada'}
                        title="Anular venta"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación mejorada */}
        {totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={ventasFiltradas.length}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
            itemName="ventas"
          />
        )}
      </div>

      {/* Modal de crear nueva venta */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open: boolean) => {
        if (!open && formData.items.length > 0 && !isConfirmed) {
          handleRestoreStock();
        }
        if (!open) {
          setClientSearchTerm('');
        }
        setIsCreateDialogOpen(open);
      }}>
        <DialogContent className="max-w-[98vw] sm:max-w-[95vw] md:max-w-[700px] lg:max-w-[800px] h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
            <DialogTitle className="text-lg sm:text-xl">Nueva Venta</DialogTitle>
            <DialogDescription className="text-sm">
              Crea una nueva venta en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="space-y-4 sm:space-y-5">
              {/* Cliente y Tipo de Venta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="clienteSearch" className="text-sm">Cliente</Label>
                  <div className="relative group">
                    {formData.clienteId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full z-10"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, clienteId: '', nombreCliente: '' }));
                          setClientSearchTerm('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Input
                      id="clienteSearch"
                      placeholder="Buscar por nombre o documento..."
                      className={cn(
                        "h-10 transition-all border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20",
                        formData.clienteId ? "pl-10 bg-primary/[0.02]" : "px-4"
                      )}
                      value={formData.clienteId && !clientSearchTerm
                        ? (clientesDisponibles.find(c => c.id.toString() === formData.clienteId)
                          ? `${clientesDisponibles.find(c => c.id.toString() === formData.clienteId)?.nombres} ${clientesDisponibles.find(c => c.id.toString() === formData.clienteId)?.apellidos}`
                          : clientSearchTerm)
                        : clientSearchTerm
                      }
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value);
                        setOpenClientes(true);
                        if (formData.clienteId) {
                          setFormData(prev => ({ ...prev, clienteId: '', nombreCliente: '' }));
                        }
                      }}
                      onFocus={() => setOpenClientes(true)}
                    />
                  </div>

                  {openClientes && (clientSearchTerm || isLoadingClientes) && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-2xl max-h-72 overflow-hidden border-muted-foreground/20 animate-in fade-in zoom-in-95 duration-200">
                      {isLoadingClientes ? (
                        <div className="flex items-center justify-center p-6 text-muted-foreground">
                          <Clock className="h-4 w-4 animate-spin mr-3 text-primary" />
                          <span className="text-sm font-medium">Buscando clientes...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="p-2 border-b bg-muted/30">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                              Resultados de búsqueda
                            </span>
                          </div>
                          <div className="overflow-y-auto p-1 max-h-60 custom-scrollbar">
                            {clientesFiltradosParaBusqueda.length > 0 ? (
                              clientesFiltradosParaBusqueda.map((cliente) => (
                                <button
                                  key={cliente.id}
                                  className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-primary/5 rounded-md text-left transition-all group group-hover:pl-4"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      clienteId: cliente.id.toString(),
                                      nombreCliente: `${cliente.nombres} ${cliente.apellidos}`
                                    });
                                    setSelectedPedidoId('');
                                    setClientSearchTerm('');
                                    setOpenClientes(false);
                                  }}
                                >
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors italic">
                                        {cliente.nombres} {cliente.apellidos}
                                      </span>
                                      {formData.clienteId === cliente.id.toString() && (
                                        <Check className="h-3 w-3 text-primary shrink-0" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                      <span className="text-[11px] font-medium bg-muted px-1.5 rounded leading-tight border border-border/50">
                                        Doc: {cliente.numeroDocumento}
                                      </span>
                                      <span className="text-[11px] text-muted-foreground italic">
                                        Tel: {cliente.telefono}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-8 text-center flex flex-col items-center gap-2">
                                <Search className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium text-muted-foreground">No se encontraron clientes</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaCreacion" className="text-sm">Fecha de Creación</Label>
                  <Input
                    id="fechaCreacion"
                    value={formatDate(formData.fecha)}
                    readOnly
                    disabled
                    className="bg-muted text-muted-foreground w-full cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Selector de Pedido Pendiente (Solo para Tipo Pedido) */}
              {formData.tipoVenta === 'pedido' && formData.clienteId && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="pedidoId" className="text-sm font-medium text-primary">Pedido Pendiente</Label>
                  {isLoadingPedidos ? (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 border rounded-md bg-muted/20">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Buscando pedidos pendientes...</span>
                    </div>
                  ) : pedidosPendientes.length > 0 ? (
                    <Select value={selectedPedidoId} onValueChange={handleSelectPedido}>
                      <SelectTrigger className="w-full border-primary/50 bg-primary/5">
                        <SelectValue placeholder="Selecciona un pedido para cargar items" />
                      </SelectTrigger>
                      <SelectContent>
                        {pedidosPendientes.map((pedido) => (
                          <SelectItem key={pedido.id} value={pedido.id.toString()}>
                            Pedido #{pedido.id} - Total: ${pedido.total.toLocaleString()} - {formatDate(pedido.fechaCreacion)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-amber-600 p-2 border border-amber-200 rounded-md bg-amber-50">
                      <AlertCircle className="h-4 w-4" />
                      <span>Este cliente no tiene pedidos pendientes.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Método de Pago y Descuento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metodoPago" className="text-sm">Método de Pago</Label>
                  <Select value={formData.metodoPago} onValueChange={(value: string) => setFormData({ ...formData, metodoPago: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descuento" className="text-sm">Descuento (%)</Label>
                  <div className="relative">
                    <Input
                      id="descuento"
                      type="text"
                      inputMode="decimal"
                      value={formData.descuento === 0 ? '' : formData.descuento.toString()}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (val === '' || (/^\d*\.?\d*$/.test(val) && parseFloat(val) <= 100)) {
                          setFormData({ ...formData, descuento: val === '' ? 0 : parseFloat(val) });
                        }
                      }}
                      placeholder="0"
                      className="w-full pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Agregar Productos (Solo para Venta Directa) */}
              {formData.tipoVenta === 'directa' && (
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-medium">Agregar Productos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-end">
                    <div className="space-y-2 relative">
                      <Label className="text-sm">Producto</Label>
                      <div className="relative group">
                        {selectedProducto && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full z-10"
                            onClick={() => {
                              setSelectedProducto('');
                              setProductSearchTerm('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Input
                          placeholder="Escribir nombre del producto..."
                          className={cn(
                            "h-10 transition-all border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20",
                            selectedProducto ? "pl-10 bg-primary/[0.02]" : "px-4"
                          )}
                          value={selectedProducto && !productSearchTerm
                            ? (productosDisponibles.find(p => p.id.toString() === selectedProducto)?.nombre || productSearchTerm)
                            : productSearchTerm
                          }
                          onChange={(e) => {
                            setProductSearchTerm(e.target.value);
                            setOpenProductos(true);
                            if (selectedProducto) {
                              setSelectedProducto('');
                            }
                          }}
                          onFocus={() => setOpenProductos(true)}
                        />
                      </div>

                      {openProductos && (productSearchTerm || isLoadingProductos) && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-2xl max-h-72 overflow-hidden border-muted-foreground/20 animate-in fade-in zoom-in-95 duration-200">
                          {isLoadingProductos ? (
                            <div className="flex items-center justify-center p-6 text-muted-foreground">
                              <Clock className="h-4 w-4 animate-spin mr-3 text-primary" />
                              <span className="text-sm font-medium">Buscando productos...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col h-full">
                              <div className="p-2 border-b bg-muted/30 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                                  Productos Disponibles
                                </span>
                              </div>
                              <div className="overflow-y-auto p-1 max-h-60 custom-scrollbar">
                                {productosFiltradosParaBusqueda.length > 0 ? (
                                  productosFiltradosParaBusqueda.map((producto) => (
                                    <button
                                      key={producto.id}
                                      disabled={producto.stock <= 0}
                                      className={cn(
                                        "w-full flex items-center gap-3 py-2.5 px-3 rounded-md text-left transition-all group",
                                        producto.stock <= 0
                                          ? "opacity-50 cursor-not-allowed bg-muted/20"
                                          : "hover:bg-primary/5 group-hover:pl-4"
                                      )}
                                      onClick={() => {
                                        setSelectedProducto(producto.id.toString());
                                        setProductSearchTerm('');
                                        setOpenProductos(false);
                                      }}
                                    >
                                      <div className={cn(
                                        "h-8 w-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                                        producto.stock <= 0 ? "bg-muted" : "bg-primary/10 group-hover:bg-primary/20"
                                      )}>
                                        <FileText className={cn("h-4 w-4", producto.stock <= 0 ? "text-muted-foreground" : "text-primary")} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className={cn(
                                            "font-semibold text-sm truncate transition-colors italic",
                                            producto.stock > 0 && "group-hover:text-primary"
                                          )}>
                                            {producto.nombre}
                                          </span>
                                          <span className="font-bold text-xs text-primary shrink-0">
                                            ${producto.precio.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <Badge
                                            variant={producto.stock > 5 ? "secondary" : "destructive"}
                                            className="text-[8px] px-1 py-0 h-4 min-h-0 flex items-center"
                                          >
                                            {producto.stock} disp.
                                          </Badge>
                                        </div>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-8 text-center flex flex-col items-center gap-2">
                                    <Search className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm font-medium text-muted-foreground">No se encontraron productos</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm">Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                          className="w-full"
                        />
                      </div>
                      <Button
                        onClick={agregarProducto}
                        disabled={!selectedProducto}
                        className="bg-gray-600 hover:bg-gray-700 w-full sm:w-auto px-6"
                      >
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Agregar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Productos Seleccionados */}
              {formData.items.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium">Productos Seleccionados</h4>

                  {/* Lista con scroll independiente para móvil */}
                  <div className="space-y-2">
                    {formData.items.map((item) => (
                      <div key={item.id} className="flex items-start sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/30 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{item.nombreProducto}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1.5">
                            {/* Solo mostrar controles de cantidad y eliminar para Venta Directa */}
                            {formData.tipoVenta === 'directa' ? (
                              <>
                                <div className="flex items-center border rounded-md bg-background h-7">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => cambiarCantidad(item.id, -1)}
                                    className="h-6 w-6 rounded-r-none border-r hover:bg-muted"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-2.5 text-xs font-semibold min-w-[2rem] text-center">
                                    {item.cantidad}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => cambiarCantidad(item.id, 1)}
                                    className="h-6 w-6 rounded-l-none border-l hover:bg-muted"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                  <span className="whitespace-nowrap">Precio: ${item.precioUnitario.toLocaleString()}</span>
                                  <span>•</span>
                                  <span className="whitespace-nowrap font-medium text-foreground">Subtotal: ${item.subtotal.toLocaleString()}</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                                <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">Cantidad: {item.cantidad}</span>
                                <span className="whitespace-nowrap">Precio: ${item.precioUnitario.toLocaleString()}</span>
                                <span>•</span>
                                <span className="whitespace-nowrap font-medium text-foreground">Subtotal: ${item.subtotal.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {formData.tipoVenta === 'directa' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarProducto(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3 sm:my-4" />

                  {/* Resumen de Totales */}
                  <div className="space-y-2 bg-muted/20 p-3 sm:p-4 rounded-lg">
                    {formData.descuento > 0 && (
                      <div className="flex justify-between text-sm sm:text-base text-red-600">
                        <span>Descuento ({formData.descuento}%):</span>
                        <span className="font-medium">-${((formData.items.reduce((sum, item) => sum + item.subtotal, 0) * formData.descuento) / 100).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg pt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">${(formData.items.reduce((sum, item) => sum + item.subtotal, 0) - (formData.items.reduce((sum, item) => sum + item.subtotal, 0) * formData.descuento / 100)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay productos */}
              {formData.items.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Calculator className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">No hay productos agregados</p>
                  <p className="text-xs sm:text-sm mt-1">Selecciona un producto para comenzar</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0 bg-background">
            <Button variant="outline" onClick={() => {
              handleRestoreStock();
              setIsCreateDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateVenta}
              disabled={!formData.nombreCliente || formData.items.length === 0}
              className="bg-black hover:bg-gray-800 text-white border-none w-full sm:w-auto"
            >
              Crear Venta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalle de venta */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] modal-scroll">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
            <DialogDescription>
              Información completa de la venta {selectedVenta?.numeroVenta}
            </DialogDescription>
          </DialogHeader>

          {selectedVenta && (
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div><strong>Número:</strong> {selectedVenta.numeroVenta}</div>
                    <div><strong>Fecha:</strong> {formatDate(selectedVenta.fecha)}</div>
                    <div><strong>Cliente:</strong> {selectedVenta.nombreCliente}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Tipo:</strong> {selectedVenta.tipoVenta === 'pedido' ? 'Pedido' : 'Directa'}</div>
                    <div><strong>Estado:</strong> {getEstadoBadge(selectedVenta.estado)}</div>
                    <div><strong>Método de Pago:</strong> {selectedVenta.metodoPago}</div>
                    {selectedVenta.motivoAnulacion && (
                      <div><strong>Motivo Anulación:</strong> {selectedVenta.motivoAnulacion}</div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Productos */}
                <div>
                  <h4>Productos</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unitario</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedVenta.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.nombreProducto}</TableCell>
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>${item.precioUnitario.toLocaleString()}</TableCell>
                            <TableCell>${item.subtotal.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                {/* Resumen financiero */}
                <div className="space-y-4">
                  <div className="max-w-md ml-auto">
                    <h4 className="border-b pb-2 mb-3">Resumen Financiero</h4>
                    <div className="space-y-2">
                      {selectedVenta.descuento > 0 && (
                        <div className="flex justify-between">
                          <span>Descuento:</span>
                          <span>-${selectedVenta.descuento.toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedVenta.envio || 0) > 0 && selectedVenta.tipoVenta === 'pedido' && (
                        <div className="flex justify-between">
                          <span>Envío:</span>
                          <span>+${(selectedVenta.envio || 0).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>${selectedVenta.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de anulación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de la venta a "anulada". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="motivoAnulacion" className="mb-2 block">Motivo de anulación</Label>
              <Textarea
                id="motivoAnulacion"
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                placeholder="Describe el motivo de la anulación..."
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMotivoAnulacion('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVenta} className="bg-red-600 hover:bg-red-700">
              Anular Venta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
