import React, { useState, useEffect } from 'react';
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
  categoria: string;
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
  impuestos: number;
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
const productosDisponibles: Producto[] = [
  { id: 1, nombre: 'Vape Desechable 2000 puffs', precio: 25000, categoria: 'Desechables' },
  { id: 2, nombre: 'Pod System Premium', precio: 80000, categoria: 'Pods' },
  { id: 3, nombre: 'Líquido Frutal 30ml', precio: 35000, categoria: 'Líquidos' },
  { id: 4, nombre: 'Mod Premium 80W', precio: 150000, categoria: 'Mods' },
  { id: 5, nombre: 'Coil Resistencia 0.5ohm', precio: 12000, categoria: 'Accesorios' },
  { id: 6, nombre: 'Líquido Premium 60ml', precio: 55000, categoria: 'Líquidos' },
  { id: 7, nombre: 'Batería Externa 2600mAh', precio: 45000, categoria: 'Accesorios' },
  { id: 8, nombre: 'Vape Desechable 5000 puffs', precio: 40000, categoria: 'Desechables' }
];

// Datos simulados de pedidos
const pedidosDisponibles = [
  { id: 1, numero: 'PED-001', cliente: 'Ana María López', items: ['Pod System Premium'] },
  { id: 2, numero: 'PED-002', cliente: 'Carlos Pérez', items: ['Vape Desechable 2000 puffs', 'Líquido Frutal 30ml'] },
  { id: 3, numero: 'PED-003', cliente: 'Valentina López', items: ['Mod Premium 80W', 'Líquido Premium 60ml'] }
];

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
    impuestos: 15200,
    total: 95200,
    estado: 'aceptada',
    metodoPago: 'Tarjeta de crédito',
    tipoVenta: 'directa',
    pagos: [
      { id: 1, fecha: '2024-01-15', monto: 95200, metodoPago: 'tarjeta', referencia: 'TXN-456789' }
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
    impuestos: 15200,
    total: 95200,
    estado: 'aceptada',
    metodoPago: 'Efectivo + Transferencia',
    tipoVenta: 'pedido',
    pedidoId: 1,
    pagos: [
      { id: 2, fecha: '2024-01-16', monto: 50000, metodoPago: 'efectivo' },
      { id: 3, fecha: '2024-01-18', monto: 45200, metodoPago: 'transferencia', referencia: 'TRANS-789123' }
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
    impuestos: 33440,
    total: 209440,
    estado: 'aceptada',
    metodoPago: 'Transferencia',
    tipoVenta: 'directa',
    pagos: [
      { id: 10, fecha: '2024-01-17', monto: 209440, metodoPago: 'transferencia', referencia: 'TRF-123456' }
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
  const [ventas, setVentas] = useState<Venta[]>(ventasIniciales);
  const [ventasFiltradas, setVentasFiltradas] = useState<Venta[]>(ventasIniciales);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState<Venta | null>(null);

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

  // Estados para pagos
  const [newPago, setNewPago] = useState({
    monto: 0,
    metodoPago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'otro',
    referencia: '',
    notas: ''
  });

  // Estados para anulación
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  // Efectos
  useEffect(() => {
    filtrarVentas();
  }, [ventas, searchTerm, filtroEstado]);

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado, itemsPerPage]);

  // Auto-completar campos cuando se selecciona un pedido
  useEffect(() => {
    if (formData.tipoVenta === 'pedido' && formData.pedidoId) {
      const pedido = pedidosDisponibles.find(p => p.id === parseInt(formData.pedidoId));
      if (pedido) {
        setFormData(prev => ({
          ...prev,
          nombreCliente: pedido.cliente,
          clienteId: pedido.id.toString()
        }));

        // Auto-llenar productos del pedido
        const itemsPedido: ItemVenta[] = pedido.items.map((nombreProducto, index) => {
          const producto = productosDisponibles.find(p => p.nombre === nombreProducto);
          if (producto) {
            return {
              id: index + 1,
              productoId: producto.id,
              nombreProducto: producto.nombre,
              cantidad: 1,
              precioUnitario: producto.precio,
              subtotal: producto.precio
            };
          }
          return null;
        }).filter(Boolean) as ItemVenta[];

        setFormData(prev => ({
          ...prev,
          items: itemsPedido
        }));
      }
    }
  }, [formData.tipoVenta, formData.pedidoId]);

  // Funciones de filtrado
  const filtrarVentas = () => {
    let ventasFiltradas = [...ventas];

    // Filtro por búsqueda
    if (searchTerm) {
      ventasFiltradas = ventasFiltradas.filter(venta =>
        venta.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venta.telefonoCliente.includes(searchTerm) ||
        venta.emailCliente.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      ventasFiltradas = ventasFiltradas.filter(venta => venta.estado === filtroEstado);
    }

    setVentasFiltradas(ventasFiltradas);
  };

  // Funciones CRUD - MODIFICADO: solo crear venta, sin editar
  const handleCreateVenta = () => {
    if (!formData.nombreCliente || formData.items.length === 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const subtotalConDescuento = subtotal - formData.descuento;
    const impuestos = Math.round(subtotalConDescuento * 0.19);

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
      descuento: formData.descuento,
      impuestos: impuestos,
      total: subtotalConDescuento + impuestos,
      estado: 'aceptada', // Todas las ventas nuevas son aceptadas
      metodoPago: formData.metodoPago,
      tipoVenta: formData.tipoVenta,
      pedidoId: formData.tipoVenta === 'pedido' && formData.pedidoId ? parseInt(formData.pedidoId) : undefined,
      notas: '', // Campo eliminado, valor por defecto
      pagos: [
        {
          id: 1,
          fecha: formData.fecha,
          monto: subtotalConDescuento + impuestos,
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
    toast.success('Venta creada exitosamente');
  };

  const handleDeleteVenta = () => {
    if (ventaToDelete) {
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
      toast.success('Venta anulada exitosamente');
    }
  };

  // Función para agregar producto
  const agregarProducto = () => {
    if (!selectedProducto) return;

    const producto = productosDisponibles.find(p => p.id === parseInt(selectedProducto));
    if (!producto) return;

    const nuevoItem: ItemVenta = {
      id: Math.max(...(formData.items.map(i => i.id) || [0])) + 1,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidad: cantidad,
      precioUnitario: producto.precio,
      subtotal: producto.precio * cantidad
    };

    setFormData({
      ...formData,
      items: [...formData.items, nuevoItem]
    });

    setSelectedProducto('');
    setCantidad(1);
  };

  // Función para eliminar producto
  const eliminarProducto = (itemId: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
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
            <div class="total-row">
              <span class="label">Subtotal:</span>
              <span>$${venta.subtotal.toLocaleString()}</span>
            </div>
            ${venta.descuento > 0 ? `
            <div class="total-row">
              <span class="label">Descuento:</span>
              <span>-$${venta.descuento.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span class="label">Impuestos (19%):</span>
              <span>$${venta.impuestos.toLocaleString()}</span>
            </div>
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
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black border-none w-full lg:w-auto">
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
                placeholder="Buscar por cliente, teléfono o email..."
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
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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

                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="nombreCliente" className="text-sm">Cliente</Label>
                <Input
                  id="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="w-full"
                />
              </div>

              {/* Método de Pago y Descuento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metodoPago" className="text-sm">Método de Pago</Label>
                  <Select value={formData.metodoPago} onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}>
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
                  <Label htmlFor="descuento" className="text-sm">Descuento</Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="0"
                    value={formData.descuento}
                    onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Agregar Productos */}
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
                        {productosDisponibles.map(producto => (
                          <SelectItem key={producto.id} value={producto.id.toString()}>
                            {producto.nombre} - ${producto.precio.toLocaleString()}
                          </SelectItem>
                        ))}
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
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="whitespace-nowrap">Cantidad: {item.cantidad}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="whitespace-nowrap">Precio: ${item.precioUnitario.toLocaleString()}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="whitespace-nowrap font-medium">Subtotal: ${item.subtotal.toLocaleString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarProducto(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3 sm:my-4" />

                  {/* Resumen de Totales */}
                  <div className="space-y-2 bg-muted/20 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">${formData.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}</span>
                    </div>
                    {formData.descuento > 0 && (
                      <div className="flex justify-between text-sm sm:text-base text-red-600">
                        <span>Descuento:</span>
                        <span className="font-medium">-${formData.descuento.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">Impuestos (19%):</span>
                      <span className="font-medium">${Math.round((formData.items.reduce((sum, item) => sum + item.subtotal, 0) - formData.descuento) * 0.19).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base sm:text-lg pt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">${((formData.items.reduce((sum, item) => sum + item.subtotal, 0) - formData.descuento) + Math.round((formData.items.reduce((sum, item) => sum + item.subtotal, 0) - formData.descuento) * 0.19)).toLocaleString()}</span>
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
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateVenta}
              disabled={!formData.nombreCliente || formData.items.length === 0}
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-none w-full sm:w-auto"
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
                    <div><strong>Teléfono:</strong> {selectedVenta.telefonoCliente}</div>
                    <div><strong>Email:</strong> {selectedVenta.emailCliente}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Tipo:</strong> {selectedVenta.tipoVenta === 'pedido' ? 'Pedido' : 'Directa'}</div>
                    <div><strong>Estado:</strong> {getEstadoBadge(selectedVenta.estado)}</div>
                    <div><strong>Método de Pago:</strong> {selectedVenta.metodoPago}</div>
                    <div><strong>Creado por:</strong> {selectedVenta.creadoPor}</div>
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
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${selectedVenta.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedVenta.descuento > 0 && (
                        <div className="flex justify-between">
                          <span>Descuento:</span>
                          <span>-${selectedVenta.descuento.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Impuestos (19%):</span>
                        <span>${selectedVenta.impuestos.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
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
            {selectedVenta && (
              <Button onClick={() => downloadVentaPDF(selectedVenta)}>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            )}
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
              <Label htmlFor="motivoAnulacion">Motivo de anulación</Label>
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
