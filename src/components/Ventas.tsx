import React, { useState, useEffect, useMemo } from 'react';
import { updateVentaPedido, getVentaPedidoById } from '../services/api';
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
  const d = new Date(date);
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

const ventasIniciales: Venta[] = [
  {
    id: 1,
    numeroVenta: 'VNT-001',
    fecha: '2024-01-15',
    clienteId: 1,
    nombreCliente: 'Carlos Rodríguez',
    telefonoCliente: '+57 300 123 4567',
    emailCliente: 'carlos@email.com',
    items: [
      { id: 1, productoId: 1, nombreProducto: 'Vape Desechable 2000 puffs', cantidad: 2, precioUnitario: 25000, subtotal: 50000 },
      { id: 2, productoId: 3, nombreProducto: 'Líquido Frutal 30ml', cantidad: 1, precioUnitario: 35000, subtotal: 35000 }
    ],
    subtotal: 85000,
    descuento: 5000,
    impuestos: 0,
    total: 80000,
    estado: 'aceptada',
    metodoPago: 'Tarjeta de crédito',
    tipoVenta: 'directa',
    pagos: [
      { id: 1, fecha: '2024-01-15', monto: 80000, metodoPago: 'tarjeta', referencia: 'TXN-456789' }
    ],
    cotizacionId: 1,
    fechaCreacion: '2024-01-15T10:30:00',
    fechaActualizacion: '2024-01-15T10:35:00',
    creadoPor: 'María González'
  },
  {
    id: 2,
    numeroVenta: 'VNT-002',
    fecha: '2024-01-16',
    clienteId: 2,
    nombreCliente: 'Ana María López',
    telefonoCliente: '+57 301 987 6543',
    emailCliente: 'ana@email.com',
    items: [
      { id: 3, productoId: 2, nombreProducto: 'Pod System Premium', cantidad: 1, precioUnitario: 80000, subtotal: 80000 }
    ],
    subtotal: 80000,
    descuento: 0,
    impuestos: 0,
    total: 80000,
    estado: 'aceptada',
    metodoPago: 'Efectivo + Transferencia',
    tipoVenta: 'pedido',
    pedidoId: 1,
    pagos: [
      { id: 2, fecha: '2024-01-16', monto: 50000, metodoPago: 'efectivo' },
      { id: 3, fecha: '2024-01-18', monto: 30000, metodoPago: 'transferencia', referencia: 'TRANS-789123' }
    ],
    fechaCreacion: '2024-01-16T14:20:00',
    fechaActualizacion: '2024-01-18T09:15:00',
    creadoPor: 'José Martínez'
  },
  {
    id: 3,
    numeroVenta: 'VNT-003',
    fecha: '2024-01-17',
    clienteId: 3,
    nombreCliente: 'Pedro Sánchez',
    telefonoCliente: '+57 302 456 7890',
    emailCliente: 'pedro@email.com',
    items: [
      { id: 4, productoId: 4, nombreProducto: 'Mod Premium 80W', cantidad: 1, precioUnitario: 150000, subtotal: 150000 },
      { id: 5, productoId: 5, nombreProducto: 'Coil Resistencia 0.5ohm', cantidad: 3, precioUnitario: 12000, subtotal: 36000 }
    ],
    subtotal: 186000,
    descuento: 10000,
    impuestos: 0,
    total: 176000,
    estado: 'aceptada',
    metodoPago: 'Transferencia',
    tipoVenta: 'directa',
    pagos: [
      { id: 10, fecha: '2024-01-17', monto: 176000, metodoPago: 'transferencia', referencia: 'TRF-123456' }
    ],
    fechaCreacion: '2024-01-17T16:45:00',
    fechaActualizacion: '2024-01-17T16:45:00',
    creadoPor: 'Laura Herrera'
  },
  {
    id: 4,
    numeroVenta: 'VNT-004',
    fecha: '2024-01-18',
    clienteId: 4,
    nombreCliente: 'Lucía Fernández',
    telefonoCliente: '+57 315 888 9999',
    emailCliente: 'lucia@email.com',
    items: [
      { id: 6, productoId: 6, nombreProducto: 'Líquido Premium 60ml', cantidad: 2, precioUnitario: 55000, subtotal: 110000 }
    ],
    subtotal: 110000,
    descuento: 0,
    impuestos: 20900,
    total: 130900,
    estado: 'aceptada',
    metodoPago: 'Efectivo',
    tipoVenta: 'directa',
    pagos: [
      { id: 4, fecha: '2024-01-18', monto: 130900, metodoPago: 'efectivo' }
    ],
    fechaCreacion: '2024-01-18T11:20:00',
    fechaActualizacion: '2024-01-18T11:25:00',
    creadoPor: 'Carlos Ruiz'
  },
  {
    id: 5,
    numeroVenta: 'VNT-005',
    fecha: '2024-01-19',
    clienteId: 5,
    nombreCliente: 'Miguel Torres',
    telefonoCliente: '+57 320 777 8888',
    emailCliente: 'miguel@email.com',
    items: [
      { id: 7, productoId: 7, nombreProducto: 'Batería Externa 2600mAh', cantidad: 1, precioUnitario: 45000, subtotal: 45000 }
    ],
    subtotal: 45000,
    descuento: 0,
    impuestos: 8550,
    total: 53550,
    estado: 'anulada',
    metodoPago: 'Transferencia',
    tipoVenta: 'directa',
    motivoAnulacion: 'Cliente canceló por demora en entrega',
    pagos: [],
    fechaCreacion: '2024-01-19T14:30:00',
    fechaActualizacion: '2024-01-19T14:30:00',
    creadoPor: 'Ana Méndez'
  },
  {
    id: 6,
    numeroVenta: 'VNT-006',
    fecha: '2024-01-20',
    clienteId: 6,
    nombreCliente: 'Isabella Ramírez',
    telefonoCliente: '+57 318 555 6666',
    emailCliente: 'isabella@email.com',
    items: [
      { id: 8, productoId: 8, nombreProducto: 'Vape Desechable 5000 puffs', cantidad: 1, precioUnitario: 40000, subtotal: 40000 },
      { id: 9, productoId: 3, nombreProducto: 'Líquido Frutal 30ml', cantidad: 2, precioUnitario: 35000, subtotal: 70000 }
    ],
    subtotal: 110000,
    descuento: 5500,
    impuestos: 19855,
    total: 124355,
    estado: 'aceptada',
    metodoPago: 'Tarjeta de débito',
    tipoVenta: 'directa',
    pagos: [
      { id: 11, fecha: '2024-01-20', monto: 124355, metodoPago: 'tarjeta', referencia: 'TDB-987654' }
    ],
    fechaCreacion: '2024-01-20T09:15:00',
    fechaActualizacion: '2024-01-20T09:20:00',
    creadoPor: 'Roberto Silva'
  },
  {
    id: 7,
    numeroVenta: 'VNT-007',
    fecha: '2024-01-21',
    clienteId: 7,
    nombreCliente: 'Diego Morales',
    telefonoCliente: '+57 310 444 5555',
    emailCliente: 'diego@email.com',
    items: [
      { id: 10, productoId: 2, nombreProducto: 'Pod System Premium', cantidad: 2, precioUnitario: 80000, subtotal: 160000 },
      { id: 11, productoId: 5, nombreProducto: 'Coil Resistencia 0.5ohm', cantidad: 4, precioUnitario: 12000, subtotal: 48000 }
    ],
    subtotal: 208000,
    descuento: 10000,
    impuestos: 37620,
    total: 235620,
    estado: 'aceptada',
    metodoPago: 'Efectivo + Transferencia',
    tipoVenta: 'pedido',
    pedidoId: 2,
    pagos: [
      { id: 12, fecha: '2024-01-21', monto: 100000, metodoPago: 'efectivo' },
      { id: 13, fecha: '2024-01-21', monto: 135620, metodoPago: 'transferencia', referencia: 'TRANS-456789' }
    ],
    fechaCreacion: '2024-01-21T13:45:00',
    fechaActualizacion: '2024-01-21T13:50:00',
    creadoPor: 'Patricia Moreno'
  },
  {
    id: 8,
    numeroVenta: 'VNT-008',
    fecha: '2024-01-22',
    clienteId: 8,
    nombreCliente: 'Carolina Vega',
    telefonoCliente: '+57 322 333 4444',
    emailCliente: 'carolina@email.com',
    items: [
      { id: 12, productoId: 6, nombreProducto: 'Líquido Premium 60ml', cantidad: 3, precioUnitario: 55000, subtotal: 165000 }
    ],
    subtotal: 165000,
    descuento: 0,
    impuestos: 31350,
    total: 196350,
    estado: 'aceptada',
    metodoPago: 'Transferencia',
    tipoVenta: 'directa',
    pagos: [
      { id: 14, fecha: '2024-01-22', monto: 196350, metodoPago: 'transferencia', referencia: 'BANK-789456' }
    ],
    fechaCreacion: '2024-01-22T16:30:00',
    fechaActualizacion: '2024-01-22T16:35:00',
    creadoPor: 'Fernando Castro'
  },
  {
    id: 9,
    numeroVenta: 'VNT-009',
    fecha: '2024-01-23',
    clienteId: 9,
    nombreCliente: 'Alejandro Torres',
    telefonoCliente: '+57 316 222 3333',
    emailCliente: 'alejandro@email.com',
    items: [
      { id: 13, productoId: 1, nombreProducto: 'Vape Desechable 2000 puffs', cantidad: 5, precioUnitario: 25000, subtotal: 125000 },
      { id: 14, productoId: 7, nombreProducto: 'Batería Externa 2600mAh', cantidad: 1, precioUnitario: 45000, subtotal: 45000 }
    ],
    subtotal: 170000,
    descuento: 8500,
    impuestos: 30685,
    total: 192185,
    estado: 'anulada',
    metodoPago: 'Efectivo',
    tipoVenta: 'directa',
    motivoAnulacion: 'Cliente solicitó cancelación por cambio de decisión',
    pagos: [],
    fechaCreacion: '2024-01-23T10:20:00',
    fechaActualizacion: '2024-01-23T11:45:00',
    creadoPor: 'Valentina López'
  },
  {
    id: 10,
    numeroVenta: 'VNT-010',
    fecha: '2024-01-24',
    clienteId: 10,
    nombreCliente: 'Sebastián Cruz',
    telefonoCliente: '+57 314 111 2222',
    emailCliente: 'sebastian@email.com',
    items: [
      { id: 15, productoId: 4, nombreProducto: 'Mod Premium 80W', cantidad: 1, precioUnitario: 150000, subtotal: 150000 },
      { id: 16, productoId: 6, nombreProducto: 'Líquido Premium 60ml', cantidad: 1, precioUnitario: 55000, subtotal: 55000 },
      { id: 17, productoId: 5, nombreProducto: 'Coil Resistencia 0.5ohm', cantidad: 2, precioUnitario: 12000, subtotal: 24000 }
    ],
    subtotal: 229000,
    descuento: 15000,
    impuestos: 40660,
    total: 254660,
    estado: 'aceptada',
    metodoPago: 'Tarjeta de crédito',
    tipoVenta: 'pedido',
    pedidoId: 3,
    pagos: [
      { id: 15, fecha: '2024-01-24', monto: 254660, metodoPago: 'tarjeta', referencia: 'TCC-654321' }
    ],
    fechaCreacion: '2024-01-24T14:10:00',
    fechaActualizacion: '2024-01-24T14:15:00',
    creadoPor: 'Gabriel Ramos'
  },
  {
    id: 11,
    numeroVenta: 'VNT-011',
    fecha: '2024-01-25',
    clienteId: 11,
    nombreCliente: 'Natalia Herrera',
    telefonoCliente: '+57 313 999 0000',
    emailCliente: 'natalia@email.com',
    items: [
      { id: 18, productoId: 8, nombreProducto: 'Vape Desechable 5000 puffs', cantidad: 2, precioUnitario: 40000, subtotal: 80000 }
    ],
    subtotal: 80000,
    descuento: 0,
    impuestos: 15200,
    total: 95200,
    estado: 'aceptada',
    metodoPago: 'Efectivo',
    tipoVenta: 'directa',
    pagos: [
      { id: 16, fecha: '2024-01-25', monto: 95200, metodoPago: 'efectivo' }
    ],
    fechaCreacion: '2024-01-25T11:30:00',
    fechaActualizacion: '2024-01-25T11:35:00',
    creadoPor: 'Ricardo Moreno'
  },
  {
    id: 12,
    numeroVenta: 'VNT-012',
    fecha: '2024-01-26',
    clienteId: 12,
    nombreCliente: 'Camila Mendoza',
    telefonoCliente: '+57 312 888 7777',
    emailCliente: 'camila@email.com',
    items: [
      { id: 19, productoId: 3, nombreProducto: 'Líquido Frutal 30ml', cantidad: 4, precioUnitario: 35000, subtotal: 140000 },
      { id: 20, productoId: 1, nombreProducto: 'Vape Desechable 2000 puffs', cantidad: 1, precioUnitario: 25000, subtotal: 25000 }
    ],
    subtotal: 165000,
    descuento: 8250,
    impuestos: 29782,
    total: 186532,
    estado: 'aceptada',
    metodoPago: 'Transferencia',
    tipoVenta: 'directa',
    pagos: [
      { id: 17, fecha: '2024-01-26', monto: 186532, metodoPago: 'transferencia', referencia: 'WIRE-123789' }
    ],
    fechaCreacion: '2024-01-26T15:45:00',
    fechaActualizacion: '2024-01-26T15:50:00',
    creadoPor: 'Alejandro Ruiz'
  },
  {
    id: 13,
    numeroVenta: 'VNT-013',
    fecha: '2024-01-27',
    clienteId: 13,
    nombreCliente: 'Andrés Vargas',
    telefonoCliente: '+57 311 666 5555',
    emailCliente: 'andres@email.com',
    items: [
      { id: 21, productoId: 7, nombreProducto: 'Batería Externa 2600mAh', cantidad: 2, precioUnitario: 45000, subtotal: 90000 },
      { id: 22, productoId: 5, nombreProducto: 'Coil Resistencia 0.5ohm', cantidad: 6, precioUnitario: 12000, subtotal: 72000 }
    ],
    subtotal: 162000,
    descuento: 12000,
    impuestos: 28500,
    total: 178500,
    estado: 'anulada',
    metodoPago: 'Tarjeta de débito',
    tipoVenta: 'directa',
    motivoAnulacion: 'Producto defectuoso reportado por el cliente',
    pagos: [],
    fechaCreacion: '2024-01-27T12:20:00',
    fechaActualizacion: '2024-01-27T16:30:00',
    creadoPor: 'Carmen López'
  },
  {
    id: 14,
    numeroVenta: 'VNT-014',
    fecha: '2024-01-28',
    clienteId: 14,
    nombreCliente: 'Valeria Castro',
    telefonoCliente: '+57 319 444 3333',
    emailCliente: 'valeria@email.com',
    items: [
      { id: 23, productoId: 2, nombreProducto: 'Pod System Premium', cantidad: 1, precioUnitario: 80000, subtotal: 80000 },
      { id: 24, productoId: 3, nombreProducto: 'Líquido Frutal 30ml', cantidad: 3, precioUnitario: 35000, subtotal: 105000 }
    ],
    subtotal: 185000,
    descuento: 9250,
    impuestos: 33392,
    total: 209142,
    estado: 'aceptada',
    metodoPago: 'Efectivo + Tarjeta',
    tipoVenta: 'directa',
    pagos: [
      { id: 18, fecha: '2024-01-28', monto: 100000, metodoPago: 'efectivo' },
      { id: 19, fecha: '2024-01-28', monto: 109142, metodoPago: 'tarjeta', referencia: 'TJT-987123' }
    ],
    fechaCreacion: '2024-01-28T09:40:00',
    fechaActualizacion: '2024-01-28T09:45:00',
    creadoPor: 'Miguel Castro'
  },
  {
    id: 15,
    numeroVenta: 'VNT-015',
    fecha: '2024-01-29',
    clienteId: 15,
    nombreCliente: 'Joaquín Silva',
    telefonoCliente: '+57 317 222 1111',
    emailCliente: 'joaquin@email.com',
    items: [
      { id: 25, productoId: 6, nombreProducto: 'Líquido Premium 60ml', cantidad: 2, precioUnitario: 55000, subtotal: 110000 },
      { id: 26, productoId: 8, nombreProducto: 'Vape Desechable 5000 puffs', cantidad: 1, precioUnitario: 40000, subtotal: 40000 }
    ],
    subtotal: 150000,
    descuento: 0,
    impuestos: 28500,
    total: 178500,
    estado: 'aceptada',
    metodoPago: 'Transferencia',
    tipoVenta: 'directa',
    pagos: [
      { id: 20, fecha: '2024-01-29', monto: 178500, metodoPago: 'transferencia', referencia: 'BANK-456123' }
    ],
    fechaCreacion: '2024-01-29T13:15:00',
    fechaActualizacion: '2024-01-29T13:20:00',
    creadoPor: 'Isabella Torres'
  }
];

export const Ventas: React.FC = () => {
  // Inicialización de ventas desde LocalStorage o datos iniciales
  const [ventas, setVentas] = useState<Venta[]>(() => {
    const savedVentas = typeof window !== 'undefined' ? localStorage.getItem('vaper_web_ventas') : null;
    return savedVentas ? JSON.parse(savedVentas) : ventasIniciales;
  });

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

  // Guardar ventas en LocalStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('vaper_web_ventas', JSON.stringify(ventas));
  }, [ventas]);

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

  // Filtrado de clientes para el buscador en diálogo de nueva venta
  const clientesFiltradosParaBusqueda = useMemo(() => {
    const term = clientSearchTerm.toLowerCase().trim();
    if (!term) return clientesDisponibles;
    return clientesDisponibles.filter(cliente =>
      `${cliente.nombres} ${cliente.apellidos}`.toLowerCase().includes(term) ||
      cliente.numeroDocumento.toLowerCase().includes(term)
    );
  }, [clientesDisponibles, clientSearchTerm]);

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
    } catch (error) {
      console.error('Error fetching productos:', error);
      toast.error('No se pudieron cargar los productos de la API');
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
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('No se pudieron cargar los clientes de la API');
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Efecto para carga inicial de productos y clientes
  useEffect(() => {
    fetchProductos();
    fetchClientes();
  }, []);

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

      const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const montoDescuento = (subtotal * formData.descuento) / 100;
      const total = subtotal - montoDescuento;

      const nuevaVenta: Venta = {
        id: Math.max(...ventas.map(v => v.id)) + 1,
        numeroVenta: `VNT-${String(ventas.length + 1).padStart(3, '0')}`,
        fecha: formData.fecha,
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
            fecha: formData.fecha,
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

      setVentas([...ventas, nuevaVenta]);
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
                estadoId: 3 // 3 = Cancelado
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
      'aceptada': { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' },
      'anulada': { variant: 'destructive' as const, icon: <X className="h-3 w-3" />, color: 'text-red-600' }
    };

    const config = variants[estado as keyof typeof variants] || variants.aceptada;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
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
      // Crear contenido HTML de la venta para el PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Venta ${venta.numeroVenta}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #333; }
            .document-type { font-size: 18px; margin-top: 10px; color: #666; }
            .info-section { margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-pagada { background-color: #d4edda; color: #155724; }
            .status-anulada { background-color: #f8d7da; color: #721c24; }
            .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">VAPELAND COMPANY</div>
            <div class="document-type">FACTURA DE VENTA</div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span><span class="label">Número de Venta:</span> ${venta.numeroVenta}</span>
              <span><span class="label">Fecha:</span> ${formatDate(venta.fecha)}</span>
            </div>
            <div class="info-row">
              <span><span class="label">Cliente:</span> ${venta.nombreCliente}</span>
              <span><span class="label">Estado:</span> <span class="status-badge status-${venta.estado}">${venta.estado.toUpperCase()}</span></span>
            </div>
            <div class="info-row">
              <span><span class="label">Teléfono:</span> ${venta.telefonoCliente}</span>
              <span><span class="label">Email:</span> ${venta.emailCliente}</span>
            </div>
            <div class="info-row">
              <span><span class="label">Tipo de Venta:</span> ${venta.tipoVenta === 'pedido' ? 'Pedido' : 'Directa'}</span>
              <span><span class="label">Método de Pago:</span> ${venta.metodoPago}</span>
            </div>
            ${venta.motivoAnulacion ? `<div class="info-row"><span><span class="label">Motivo Anulación:</span> ${venta.motivoAnulacion}</span></div>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${venta.items.map(item => `
                <tr>
                  <td>${item.nombreProducto}</td>
                  <td>${item.cantidad}</td>
                  <td>$${item.precioUnitario.toLocaleString()}</td>
                  <td>$${item.subtotal.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            ${venta.descuento > 0 ? `
            <div class="total-row">
              <span class="label">Descuento:</span>
              <span>-$${venta.descuento.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row final-total">
              <span class="label">TOTAL:</span>
              <span>$${venta.total.toLocaleString()}</span>
            </div>
          </div>

          ${venta.pagos.length > 0 ? `
          <div class="info-section">
            <h3>Información de Pagos</h3>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                ${venta.pagos.map(pago => `
                  <tr>
                    <td>${formatDate(pago.fecha)}</td>
                    <td>${pago.metodoPago.charAt(0).toUpperCase() + pago.metodoPago.slice(1)}</td>
                    <td>$${pago.monto.toLocaleString()}</td>
                    <td>${pago.referencia || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div>Firma del Cliente</div>
            </div>
            <div class="signature-box">
              <div>Firma del Vendedor</div>
            </div>
          </div>

          <div class="footer">
            <p>Generado el ${formatDate(new Date())} por ${venta.creadoPor}</p>
            <p>VAPELAND COMPANY - Sistema de Gestión de Ventas</p>
          </div>
        </body>
        </html>
      `;

      // Crear blob y descargar
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `venta-${venta.numeroVenta}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`PDF de la venta ${venta.numeroVenta} descargado exitosamente`);
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
                  <TableCell className="font-medium text-blue-600">#{venta.id}</TableCell>
                  <TableCell>{venta.nombreCliente}</TableCell>
                  <TableCell>
                    <Badge variant={venta.tipoVenta === 'pedido' ? 'secondary' : 'outline'}>
                      {venta.tipoVenta === 'pedido' ? 'Pedido' : 'Directa'}
                    </Badge>
                  </TableCell>
                  <TableCell>${venta.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${venta.estado === "aceptada"
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      {venta.estado === "aceptada" ? "Aceptada" : "Anulada"}
                    </Badge>
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
              {/* Fecha y Tipo de Venta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="text-sm">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoVenta" className="text-sm">Tipo de Venta</Label>
                  <Select value={formData.tipoVenta} onValueChange={(value: 'directa' | 'pedido') => setFormData({ ...formData, tipoVenta: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="directa">Venta Directa</SelectItem>
                      <SelectItem value="pedido">Venta por Pedido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="clienteId" className="text-sm">Cliente</Label>
                <Popover open={openClientes} onOpenChange={setOpenClientes}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openClientes}
                      className="w-full justify-between font-normal bg-background border-input"
                    >
                      {formData.clienteId
                        ? clientesDisponibles.find(
                          (cliente) => cliente.id.toString() === formData.clienteId
                        )
                          ? `${clientesDisponibles.find((c) => c.id.toString() === formData.clienteId)?.nombres} ${clientesDisponibles.find((c) => c.id.toString() === formData.clienteId)?.apellidos}`
                          : "Seleccionar cliente"
                        : "Seleccionar cliente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar por nombre o documento..."
                        className="h-9"
                        value={clientSearchTerm}
                        onValueChange={setClientSearchTerm}
                      />
                      <CommandList>
                        {isLoadingClientes ? (
                          <div className="flex items-center justify-center p-4">
                            <Clock className="h-4 w-4 animate-spin mr-2 text-primary" />
                            <span className="text-sm">Cargando clientes...</span>
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                            <CommandGroup>
                              {clientesFiltradosParaBusqueda.map((cliente) => (
                                <CommandItem
                                  key={cliente.id}
                                  value={`${cliente.nombres} ${cliente.apellidos} ${cliente.numeroDocumento}`}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      clienteId: cliente.id.toString(),
                                      nombreCliente: `${cliente.nombres} ${cliente.apellidos}`
                                    });
                                    setSelectedPedidoId(''); // Resetear pedido al cambiar cliente
                                    setClientSearchTerm(''); // Limpiar búsqueda
                                    setOpenClientes(false);
                                  }}
                                  className="flex flex-col items-start py-2 px-3"
                                >
                                  <div className="flex items-center w-full justify-between">
                                    <span className="font-medium">{cliente.nombres} {cliente.apellidos}</span>
                                    {formData.clienteId === cliente.id.toString() && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Doc: {cliente.numeroDocumento} | Tel: {cliente.telefono}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Producto</Label>
                      <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingProductos ? (
                            <div className="flex items-center justify-center p-4">
                              <Clock className="h-4 w-4 animate-spin mr-2 text-primary" />
                              <span className="text-sm">Cargando productos...</span>
                            </div>
                          ) : productosDisponibles.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No hay productos disponibles
                            </div>
                          ) : (
                            productosDisponibles.map(producto => (
                              <SelectItem key={producto.id} value={producto.id.toString()} disabled={producto.stock <= 0}>
                                <div className="flex justify-between w-full items-center">
                                  <span>{producto.nombre} - ${producto.precio.toLocaleString()}</span>
                                  <Badge variant={producto.stock > 5 ? "secondary" : "destructive"} className="ml-2">
                                    {producto.stock} disp.
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
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
                      <div className="flex items-end">
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
                </div>
              )}

              {/* Productos Seleccionados */}
              {formData.items.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-medium">Productos Seleccionados</h4>

                  {/* Lista con scroll independiente para móvil */}
                  <div className="space-y-2 max-h-[200px] sm:max-h-[250px] overflow-y-auto pr-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4>Resumen Financiero</h4>
                    <div className="space-y-2">
                      {selectedVenta.descuento > 0 && (
                        <div className="flex justify-between">
                          <span>Descuento:</span>
                          <span>-${selectedVenta.descuento.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>${selectedVenta.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información de pagos */}
                  <div>
                    <h4>Pagos Registrados</h4>
                    {selectedVenta.pagos.length > 0 ? (
                      <div className="space-y-2">
                        {selectedVenta.pagos.map((pago) => (
                          <div key={pago.id} className="border rounded p-3">
                            <div className="flex justify-between">
                              <span>{pago.metodoPago.charAt(0).toUpperCase() + pago.metodoPago.slice(1)}:</span>
                              <span>${pago.monto.toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(pago.fecha)}
                              {pago.referencia && ` - Ref: ${pago.referencia}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay pagos registrados</p>
                    )}
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
