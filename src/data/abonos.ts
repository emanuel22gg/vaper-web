import { Abono } from '../types';

export const abonosIniciales: Abono[] = [
  {
    id: 1,
    fechaCreacion: '2024-01-16T10:30:00Z',
    cliente: {
      id: 'CLI-001',
      nombre: 'Juan Carlos Pérez',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567'
    },
    idPedido: 'PED-2024-001',
    montoPedido: 389000,
    montoAbono: 200000,
    metodoPago: 'Transferencia',
    estado: 'Registrado',
    saldoRestante: 189000,
    observaciones: 'Primer abono del pedido',
    fechaActualizacion: '2024-01-16T10:30:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 2,
    fechaCreacion: '2024-01-19T14:15:00Z',
    cliente: {
      id: 'CLI-002',
      nombre: 'María García López',
      email: 'maria.garcia@email.com',
      telefono: '+57 301 987 6543'
    },
    idPedido: 'PED-2024-002',
    montoPedido: 485000,
    montoAbono: 485000,
    metodoPago: 'Transferencia',
    estado: 'Registrado',
    saldoRestante: 0,
    observaciones: 'Pago completo del pedido',
    fechaActualizacion: '2024-01-19T14:15:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 3,
    fechaCreacion: '2024-01-24T09:45:00Z',
    cliente: {
      id: 'CLI-003',
      nombre: 'Carlos López Martínez',
      email: 'carlos.lopez@email.com',
      telefono: '+57 302 456 7890'
    },
    idPedido: 'PED-2024-003',
    montoPedido: 317500,
    montoAbono: 150000,
    metodoPago: 'Efectivo',
    estado: 'Registrado',
    saldoRestante: 167500,
    observaciones: 'Abono inicial del 50%',
    fechaActualizacion: '2024-01-24T09:45:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 4,
    fechaCreacion: '2024-01-26T16:20:00Z',
    cliente: {
      id: 'CLI-004',
      nombre: 'Ana Martínez Silva',
      email: 'ana.martinez@email.com',
      telefono: '+57 303 654 3210'
    },
    idPedido: 'PED-2024-004',
    montoPedido: 280000,
    montoAbono: 140000,
    metodoPago: 'Transferencia',
    estado: 'Registrado',
    saldoRestante: 140000,
    observaciones: 'Pago del 50% del pedido',
    fechaActualizacion: '2024-01-26T16:20:00Z',
    creadoPor: 'Admin'
  },
  {
    id: 5,
    fechaCreacion: '2024-02-03T11:10:00Z',
    cliente: {
      id: 'CLI-005',
      nombre: 'Luis Rodríguez Castro',
      email: 'luis.rodriguez@email.com',
      telefono: '+57 304 789 0123'
    },
    idPedido: 'PED-2024-005',
    montoPedido: 570000,
    montoAbono: 100000,
    metodoPago: 'Efectivo',
    estado: 'Registrado',
    saldoRestante: 470000,
    observaciones: 'Anticipo en efectivo',
    fechaActualizacion: '2024-02-03T11:10:00Z',
    creadoPor: 'Admin'
  }
];
