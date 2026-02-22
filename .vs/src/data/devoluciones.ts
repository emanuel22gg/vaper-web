import { Devolucion } from '../types';

export const devolucionesIniciales: Devolucion[] = [
  {
    id: 'DEV-001',
    numeroVenta: 'VEN-001',
    fechaCreacion: '2024-01-15T10:30:00Z',
    estado: 'Aprobada',
    cliente: {
      id: 'CLI-001',
      nombre: 'Juan Carlos Pérez',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567'
    },
    medioContacto: 'Email',
    motivoDevolucion: 'Producto defectuoso',
    descripcionDetallada: 'El vaporizador no enciende y presenta problemas de batería',
    productos: [
      {
        id: 'PROD-001',
        nombre: 'Vaporizador Elegante Pro',
        cantidad: 1,
        precio: 150000,
        subtotal: 150000,
        motivo: 'Defecto de fábrica'
      }
    ],
    subtotal: 150000,
    total: 150000,
    creadoPor: 'Admin',
    fechaActualizacion: '2024-01-16T09:00:00Z'
  },
  {
    id: 'DEV-002',
    numeroVenta: 'VEN-002',
    fechaCreacion: '2024-01-18T14:15:00Z',
    estado: 'Aprobada',
    cliente: {
      id: 'CLI-002',
      nombre: 'María García López',
      email: 'maria.garcia@email.com',
      telefono: '+57 301 987 6543'
    },
    medioContacto: 'Teléfono',
    motivoDevolucion: 'No cumple expectativas',
    descripcionDetallada: 'El producto no tiene la potencia esperada según la descripción',
    productos: [
      {
        id: 'PROD-002',
        nombre: 'Kit Inicial Vape',
        cantidad: 1,
        precio: 89000,
        subtotal: 89000,
        motivo: 'Especificaciones incorrectas'
      }
    ],
    subtotal: 89000,
    total: 89000,
    creadoPor: 'Admin',
    fechaActualizacion: '2024-01-19T09:00:00Z'
  },
  {
    id: 'DEV-003',
    numeroVenta: 'VEN-003',
    fechaCreacion: '2024-01-22T09:45:00Z',
    estado: 'Completada',
    cliente: {
      id: 'CLI-003',
      nombre: 'Carlos López Martínez',
      email: 'carlos.lopez@email.com',
      telefono: '+57 302 456 7890'
    },
    medioContacto: 'WhatsApp',
    motivoDevolucion: 'Producto dañado en envío',
    descripcionDetallada: 'El paquete llegó con daños visibles y el producto no funciona',
    productos: [
      {
        id: 'PROD-003',
        nombre: 'Essence Premium',
        cantidad: 2,
        precio: 37500,
        subtotal: 75000,
        motivo: 'Daño en transporte'
      }
    ],
    subtotal: 75000,
    total: 75000,
    creadoPor: 'Admin',
    fechaActualizacion: '2024-01-23T11:30:00Z'
  },
  {
    id: 'DEV-004',
    numeroVenta: 'VEN-004',
    fechaCreacion: '2024-01-25T16:20:00Z',
    estado: 'Aprobada',
    cliente: {
      id: 'CLI-004',
      nombre: 'Ana Martínez Silva',
      email: 'ana.martinez@email.com',
      telefono: '+57 303 654 3210'
    },
    medioContacto: 'Email',
    motivoDevolucion: 'Error en el pedido',
    descripcionDetallada: 'Se envió un modelo diferente al solicitado',
    productos: [
      {
        id: 'PROD-004',
        nombre: 'Vape Compacto Max',
        cantidad: 1,
        precio: 120000,
        subtotal: 120000,
        motivo: 'Producto incorrecto'
      }
    ],
    subtotal: 120000,
    total: 120000,
    creadoPor: 'Admin',
    fechaActualizacion: '2024-01-25T16:20:00Z'
  },
  {
    id: 'DEV-005',
    numeroVenta: 'VEN-005',
    fechaCreacion: '2024-02-02T11:10:00Z',
    estado: 'Aprobada',
    cliente: {
      id: 'CLI-005',
      nombre: 'Luis Rodríguez Castro',
      email: 'luis.rodriguez@email.com',
      telefono: '+57 304 789 0123'
    },
    medioContacto: 'Teléfono',
    motivoDevolucion: 'Garantía de fábrica',
    descripcionDetallada: 'Falla en el sistema de calentamiento después de 2 semanas de uso',
    productos: [
      {
        id: 'PROD-005',
        nombre: 'Advanced Vaporizer X1',
        cantidad: 1,
        precio: 200000,
        subtotal: 200000,
        motivo: 'Falla técnica'
      }
    ],
    subtotal: 200000,
    total: 200000,
    creadoPor: 'Admin',
    fechaActualizacion: '2024-02-03T08:45:00Z'
  }
];

export const productosInventario = [
  { id: 'PROD-001', nombre: 'Vaporizador Elegante Pro', precio: 150000, stock: 25 },
  { id: 'PROD-002', nombre: 'Kit Inicial Vape', precio: 89000, stock: 40 },
  { id: 'PROD-003', nombre: 'Essence Premium', precio: 37500, stock: 60 },
  { id: 'PROD-004', nombre: 'Vape Compacto Max', precio: 120000, stock: 30 },
  { id: 'PROD-005', nombre: 'Advanced Vaporizer X1', precio: 200000, stock: 15 },
  { id: 'PROD-006', nombre: 'Starter Kit Básico', precio: 65000, stock: 50 },
  { id: 'PROD-007', nombre: 'Premium Mod 500W', precio: 280000, stock: 10 },
  { id: 'PROD-008', nombre: 'Liquid Pod System', precio: 95000, stock: 35 },
  { id: 'PROD-009', nombre: 'Crystal Clear Vape', precio: 175000, stock: 20 },
  { id: 'PROD-010', nombre: 'Mini Portable Vape', precio: 55000, stock: 45 }
];
