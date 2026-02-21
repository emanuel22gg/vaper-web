import React, { useState } from 'react';
import { ArrowLeft, Plus, Eye, Download, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { toast } from "sonner";

interface AbonoIndividual {
  id: string;
  fecha: string;
  cliente: string;
  monto: number;
  metodoPago: string;
  estado: 'Registrado' | 'Anulado';
}

interface AbonosIndividualesProps {
  pedidoId: string;
  onBack: () => void;
}

// Datos mock basados en el pedido específico
const getAbonosIniciales = (pedidoId: string): AbonoIndividual[] => {
  const clientePorPedido: { [key: string]: string } = {
    'PED-2024-001': 'María González',
    'PED-2024-002': 'Juan Pérez',
    'PED-2024-003': 'Ana López',
    'PED-2024-004': 'Carmen Ruiz',
    'PED-2024-005': 'Diego Vargas',
    'PED-2024-006': 'María González',
  };

  const clienteNombre = clientePorPedido[pedidoId] || 'Cliente Desconocido';

  // Solo devolver datos si es un pedido específico para demostrar
  if (pedidoId === 'PED-2024-001') {
    return [
      {
        id: 'ABNI-001',
        fecha: '15/03/2024',
        cliente: clienteNombre,
        monto: 50000,
        metodoPago: 'Efectivo',
        estado: 'Registrado',
      },
      {
        id: 'ABNI-002',
        fecha: '16/03/2024',
        cliente: clienteNombre,
        monto: 75000,
        metodoPago: 'Transferencia',
        estado: 'Registrado',
      },
      {
        id: 'ABNI-003',
        fecha: '17/03/2024',
        cliente: clienteNombre,
        monto: 30000,
        metodoPago: 'Efectivo',
        estado: 'Registrado',
      },
      {
        id: 'ABNI-004',
        fecha: '18/03/2024',
        cliente: clienteNombre,
        monto: 15400,
        metodoPago: 'Transferencia',
        estado: 'Anulado',
      },
    ];
  }

  return [];
};

// Información del pedido (mock data)
const getPedidoInfo = (pedidoId: string) => {
  const pedidosInfo: { [key: string]: { total: number; cliente: string } } = {
    'PED-2024-001': { total: 170400, cliente: 'María González' },
    'PED-2024-002': { total: 191800, cliente: 'Juan Pérez' },
    'PED-2024-003': { total: 374600, cliente: 'Ana López' },
    'PED-2024-004': { total: 95000, cliente: 'Carmen Ruiz' },
    'PED-2024-005': { total: 220800, cliente: 'Diego Vargas' },
    'PED-2024-006': { total: 118200, cliente: 'María González' },
  };

  return pedidosInfo[pedidoId] || { total: 0, cliente: 'Cliente Desconocido' };
};

export function AbonosIndividuales({ pedidoId, onBack }: AbonosIndividualesProps) {
  // Lista de abonos con datos iniciales
  const [abonosIndividuales, setAbonosIndividuales] = useState<AbonoIndividual[]>(getAbonosIniciales(pedidoId));
  
  // Estados para el modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAbono, setNewAbono] = useState({
    monto: '',
    metodoPago: '',
  });

  // Estados para modal de detalle
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAbono, setSelectedAbono] = useState<AbonoIndividual | null>(null);

  // Estados para confirmación de anulación
  const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
  const [abonoToAnular, setAbonoToAnular] = useState<AbonoIndividual | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Mostrar 3 items por página

  // Información del pedido
  const pedidoInfo = getPedidoInfo(pedidoId);
  
  // Calcular total de abonos realizados (solo los registrados)
  const totalAbonos = abonosIndividuales
    .filter(abono => abono.estado === 'Registrado')
    .reduce((sum, abono) => sum + abono.monto, 0);
  
  // Calcular saldo pendiente
  const saldoPendiente = pedidoInfo.total - totalAbonos;

  // Cálculos para paginación
  const totalItems = abonosIndividuales.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = abonosIndividuales.slice(startIndex, endIndex);
  const showingFrom = totalItems > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, totalItems);

  // Función para generar ID autoincrementable
  const generateNextAbonoId = () => {
    const maxId = abonosIndividuales.length > 0 
      ? Math.max(...abonosIndividuales.map((a) => {
          const match = a.id.match(/ABNI-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }))
      : 0;
    return `ABNI-${(maxId + 1).toString().padStart(3, '0')}`;
  };

  // Función para agregar abono
  const handleAddAbono = () => {
    if (!newAbono.monto || !newAbono.metodoPago) {
      toast.error("Error", {
        description: "Por favor completa todos los campos obligatorios."
      });
      return;
    }

    const montoAbono = parseFloat(newAbono.monto);
    if (montoAbono > saldoPendiente) {
      toast.error("Error", {
        description: `El monto del abono no puede ser mayor al saldo pendiente (${saldoPendiente.toLocaleString()}).`
      });
      return;
    }

    if (montoAbono <= 0) {
      toast.error("Error", {
        description: "El monto del abono debe ser mayor a 0."
      });
      return;
    }

    const nuevoAbono: AbonoIndividual = {
      id: generateNextAbonoId(),
      fecha: new Date().toLocaleDateString(),
      cliente: pedidoInfo.cliente,
      monto: montoAbono,
      metodoPago: newAbono.metodoPago,
      estado: 'Registrado',
    };

    setAbonosIndividuales([...abonosIndividuales, nuevoAbono]);
    
    // Ir a la última página para mostrar el nuevo abono
    const newTotalItems = abonosIndividuales.length + 1;
    const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
    setCurrentPage(newTotalPages);
    
    // Limpiar formulario
    setNewAbono({
      monto: '',
      metodoPago: '',
    });
    setIsAddDialogOpen(false);

    toast.success("Abono agregado", {
      description: `El abono ${nuevoAbono.id} ha sido registrado exitosamente.`
    });
  };

  // Funciones para las acciones
  const handleVerDetalle = (abono: AbonoIndividual) => {
    setSelectedAbono(abono);
    setIsDetailDialogOpen(true);
  };

  const handleExportarPDF = (abono: AbonoIndividual) => {
    // Generar HTML para el PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Abono ${abono.id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
            color: #1f2937;
          }
          .document-title { 
            font-size: 20px; 
            color: #4b5563;
            margin-top: 10px;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: #f9fafb;
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 15px;
            color: #1f2937;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
          }
          .info-item { 
            display: flex; 
            flex-direction: column;
          }
          .info-label { 
            font-weight: bold; 
            color: #6b7280; 
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value { 
            font-size: 14px;
            color: #1f2937;
          }
          .amount { 
            font-size: 18px; 
            font-weight: bold; 
            color: #059669;
          }
          .status { 
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-registrado { 
            background-color: #dcfce7; 
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          .status-anulado { 
            background-color: #fee2e2; 
            color: #dc2626;
            border: 1px solid #fecaca;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          .remaining-balance {
            color: #dc2626;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Sistema de Gestión Empresarial</div>
          <div class="document-title">Detalle de Abono #${abono.id}</div>
        </div>

        <div class="section">
          <div class="section-title">Información del Abono</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Monto</span>
              <span class="info-value amount">${abono.monto.toLocaleString()} COP</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha</span>
              <span class="info-value">${abono.fecha}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="status ${abono.estado === 'Registrado' ? 'status-registrado' : 'status-anulado'}">${abono.estado}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Forma de pago</span>
              <span class="info-value">${abono.metodoPago}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Información del Pedido</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Pedido</span>
              <span class="info-value">#${pedidoId}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cliente</span>
              <span class="info-value">${abono.cliente}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total del Pedido</span>
              <span class="info-value">${pedidoInfo.total.toLocaleString()} COP</span>
            </div>
            <div class="info-item">
              <span class="info-label">Saldo Restante</span>
              <span class="info-value remaining-balance">${saldoPendiente.toLocaleString()} COP</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Información Adicional</div>
          <div class="info-item">
            <span class="info-label">Registrado por</span>
            <span class="info-value">Administrador</span>
          </div>
        </div>

        <div class="footer">
          <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          <p>Sistema de Gestión Empresarial - Módulo de Abonos</p>
        </div>
      </body>
      </html>
    `;

    // Crear ventana nueva para el PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(pdfContent);
      newWindow.document.close();
      
      // Esperar a que se cargue el contenido y luego imprimir
      newWindow.onload = function() {
        newWindow.print();
      };

      toast.success("PDF generado", {
        description: `PDF del abono ${abono.id} abierto en nueva pestaña`
      });
    } else {
      toast.error("Error", {
        description: "No se pudo abrir una nueva ventana. Verifica los bloqueadores de ventanas emergentes."
      });
    }
  };

  const handleAnularAbono = (abono: AbonoIndividual) => {
    if (abono.estado === 'Anulado') {
      toast.error("Error", {
        description: "Este abono ya está anulado."
      });
      return;
    }
    setAbonoToAnular(abono);
    setIsAnularDialogOpen(true);
  };

  const handleConfirmAnularAbono = () => {
    if (abonoToAnular) {
      const updatedAbonos = abonosIndividuales.map(abono =>
        abono.id === abonoToAnular.id
          ? { ...abono, estado: 'Anulado' as const }
          : abono
      );
      setAbonosIndividuales(updatedAbonos);
      setIsAnularDialogOpen(false);
      setAbonoToAnular(null);

      toast.success("Abono anulado", {
        description: `El abono ${abonoToAnular.id} ha sido anulado exitosamente.`
      });
    }
  };

  const getStatusBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Registrado':
        return 'default'; // Verde
      case 'Anulado':
        return 'destructive'; // Rojo
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>Abonos del Pedido {pedidoId}</h1>
          <p className="text-muted-foreground">
            Cliente: {pedidoInfo.cliente} | Total: ${pedidoInfo.total.toLocaleString()} | Saldo pendiente: ${saldoPendiente.toLocaleString()}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Abonos Individuales</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar abono a este pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Abono</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo abono para el pedido {pedidoId}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="abono-id">ID Abono</Label>
                      <Input
                        id="abono-id"
                        value={generateNextAbonoId()}
                        disabled
                        className="bg-gray-50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha</Label>
                      <Input
                        id="fecha"
                        value={new Date().toLocaleDateString()}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value="Registrado"
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-pedido">Total del Pedido</Label>
                      <Input
                        id="total-pedido"
                        value={`${pedidoInfo.total.toLocaleString()}`}
                        disabled
                        className="bg-gray-50 font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="saldo-pendiente">Saldo Pendiente</Label>
                      <Input
                        id="saldo-pendiente"
                        value={`${Math.max(saldoPendiente - parseFloat(newAbono.monto || '0'), 0).toLocaleString()}`}
                        disabled
                        className="bg-red-50 font-semibold text-red-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto del Abono *</Label>
                    <Input
                      id="monto"
                      type="number"
                      placeholder="0.00"
                      value={newAbono.monto}
                      onChange={(e) => setNewAbono({ ...newAbono, monto: e.target.value })}
                      max={saldoPendiente}
                    />
                    <p className="text-sm text-muted-foreground">
                      Máximo disponible: ${saldoPendiente.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metodo-pago">Método de Pago *</Label>
                    <Select
                      value={newAbono.metodoPago}
                      onValueChange={(value) => setNewAbono({ ...newAbono, metodoPago: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setNewAbono({ monto: '', metodoPago: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddAbono}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abonosIndividuales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay abonos registrados para este pedido
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((abono) => (
                    <TableRow key={abono.id}>
                      <TableCell>{abono.cliente}</TableCell>
                      <TableCell>{abono.fecha}</TableCell>
                      <TableCell>
                        <span>${abono.monto.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{abono.metodoPago}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(abono.estado)}
                          className={abono.estado === 'Registrado' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                        >
                          {abono.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerDetalle(abono)}
                            title="Ver detalles del abono"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportarPDF(abono)}
                            title="Exportar a PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnularAbono(abono)}
                            title="Anular abono"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={abono.estado === 'Anulado'}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Información de paginación y controles */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {totalItems > 0 ? (
                `Mostrando ${showingFrom} a ${showingTo} de ${totalItems} abonos`
              ) : (
                'No hay abonos para mostrar'
              )}
            </div>
            
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm">
                  Página {currentPage} de {totalPages}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalle del abono */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Abono #{selectedAbono?.id}</span>
            </DialogTitle>
            <DialogDescription>
              Detalles completos del abono realizado al pedido {pedidoId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAbono && (
            <div className="space-y-6">
              {/* Información del abono */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Monto</Label>
                    <p className="font-semibold text-lg">${selectedAbono.monto.toLocaleString()} COP</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fecha</Label>
                    <p className="font-medium">{selectedAbono.fecha}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={getStatusBadgeVariant(selectedAbono.estado)}
                        className={selectedAbono.estado === 'Registrado' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                      >
                        {selectedAbono.estado}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Forma de pago</Label>
                    <p className="font-medium">{selectedAbono.metodoPago}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información del pedido */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Pedido</Label>
                    <p className="font-semibold">#{pedidoId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Cliente</Label>
                    <p className="font-medium">{selectedAbono.cliente}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Total</Label>
                    <p className="font-semibold">${pedidoInfo.total.toLocaleString()} COP</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Saldo restante</Label>
                    <p className="font-semibold text-red-600">${saldoPendiente.toLocaleString()} COP</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información adicional */}
              <div>
                <Label className="text-sm text-muted-foreground">Registrado por</Label>
                <p className="font-medium">Administrador</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmar anulación */}
      <AlertDialog open={isAnularDialogOpen} onOpenChange={setIsAnularDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Confirmar Anulación de Abono</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea anular el abono{" "}
              <span className="font-semibold">
                {abonoToAnular?.id}
              </span>{" "}
              por un monto de{" "}
              <span className="font-semibold">
                ${abonoToAnular?.monto.toLocaleString()}
              </span>
              ? Esta acción no se puede deshacer y el saldo del pedido se verá afectado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAnularAbono}
              className="bg-red-600 hover:bg-red-700"
            >
              Anular Abono
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
