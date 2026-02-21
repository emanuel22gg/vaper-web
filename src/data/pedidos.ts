import { Pedido } from '../types';

export const pedidosParaAbonos: Pedido[] = [
  {
    id: 'PED-2024-001',
    numeroPedido: 'PED-2024-001',
    fechaPedido: new Date('2024-01-15T10:30:00Z'),
    metodoPago: 'Efectivo',
    cliente: {
      id: 'CLI-001',
      nombre: 'Juan Carlos Pérez',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567'
    },
    productos: [
      {
        id: 'PROD-001',
        nombre: 'Vaporizador Elegante Pro',
        cantidad: 2,
        precio: 150000,
        subtotal: 300000
      },
      {
        id: 'PROD-002',
        nombre: 'Kit Inicial Vape',
        cantidad: 1,
        precio: 89000,
        subtotal: 89000
      }
    ],
    subtotal: 389000,
    total: 389000,
    fechaCreacion: '2024-01-15T10:30:00Z',
    estado: 'Pendiente',
    fechaActualizacion: '2024-01-15T10:30:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 'PED-2024-002',
    numeroPedido: 'PED-2024-002',
    fechaPedido: new Date('2024-01-19T14:15:00Z'),
    metodoPago: 'PSE',
    cliente: {
      id: 'CLI-002',
      nombre: 'María García López',
      email: 'maria.garcia@email.com',
      telefono: '+57 301 987 6543'
    },
    productos: [
      {
        id: 'PROD-005',
        nombre: 'Advanced Vaporizer X1',
        cantidad: 1,
        precio: 200000,
        subtotal: 200000
      },
      {
        id: 'PROD-008',
        nombre: 'Liquid Pod System',
        cantidad: 3,
        precio: 95000,
        subtotal: 285000
      }
    ],
    subtotal: 485000,
    total: 485000,
    fechaCreacion: '2024-01-18T14:15:00Z',
    estado: 'Confirmado',
    fechaActualizacion: '2024-01-18T14:15:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 'PED-2024-003',
    numeroPedido: 'PED-2024-003',
    fechaPedido: new Date('2024-01-22T09:45:00Z'),
    metodoPago: 'Transferencia',
    cliente: {
      id: 'CLI-003',
      nombre: 'Carlos López Martínez',
      email: 'carlos.lopez@email.com',
      telefono: '+57 302 456 7890'
    },
    productos: [
      {
        id: 'PROD-003',
        nombre: 'Essence Premium',
        cantidad: 5,
        precio: 37500,
        subtotal: 187500
      },
      {
        id: 'PROD-006',
        nombre: 'Starter Kit Básico',
        cantidad: 2,
        precio: 65000,
        subtotal: 130000
      }
    ],
    subtotal: 317500,
    total: 317500,
    fechaCreacion: '2024-01-22T09:45:00Z',
    estado: 'En Proceso',
    fechaActualizacion: '2024-01-22T09:45:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 'PED-2024-004',
    numeroPedido: 'PED-2024-004',
    fechaPedido: new Date('2024-01-25T16:20:00Z'),
    metodoPago: 'Tarjeta de Crédito',
    cliente: {
      id: 'CLI-004',
      nombre: 'Ana Martínez Silva',
      email: 'ana.martinez@email.com',
      telefono: '+57 303 654 3210'
    },
    productos: [
      {
        id: 'PROD-007',
        nombre: 'Premium Mod 500W',
        cantidad: 1,
        precio: 280000,
        subtotal: 280000
      }
    ],
    subtotal: 280000,
    total: 280000,
    fechaCreacion: '2024-01-25T16:20:00Z',
    estado: 'Pendiente',
    fechaActualizacion: '2024-01-25T16:20:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 'PED-2024-005',
    numeroPedido: 'PED-2024-005',
    fechaPedido: new Date('2024-02-02T11:10:00Z'),
    metodoPago: 'Nequi',
    cliente: {
      id: 'CLI-005',
      nombre: 'Luis Rodríguez Castro',
      email: 'luis.rodriguez@email.com',
      telefono: '+57 304 789 0123'
    },
    productos: [
      {
        id: 'PROD-009',
        nombre: 'Crystal Clear Vape',
        cantidad: 2,
        precio: 175000,
        subtotal: 350000
      },
      {
        id: 'PROD-010',
        nombre: 'Mini Portable Vape',
        cantidad: 4,
        precio: 55000,
        subtotal: 220000
      }
    ],
    subtotal: 570000,
    total: 570000,
    fechaCreacion: '2024-02-02T11:10:00Z',
    estado: 'Pendiente',
    fechaActualizacion: '2024-02-02T11:10:00Z',
    creadoPor: 'Admin'
  }
];
