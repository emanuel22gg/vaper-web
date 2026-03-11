import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import {
    ShoppingBag,
    RefreshCw,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    IdCard,
    User,
    Loader2,
    CheckCircle,
    XCircle,
    Info,
    History
} from 'lucide-react';
import { UsuarioDto, VentaPedidoDto, DevolucionDto } from '../types';
import { getVentaPedidos, getDevoluciones } from '../services/api';

interface ClientDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: UsuarioDto | null;
    onEdit?: (cliente: UsuarioDto) => void;
}

export const ClientDetailDialog: React.FC<ClientDetailDialogProps> = ({
    isOpen,
    onOpenChange,
    cliente,
    onEdit
}) => {
    const [pedidosCliente, setPedidosCliente] = useState<VentaPedidoDto[]>([]);
    const [devolucionesCliente, setDevolucionesCliente] = useState<DevolucionDto[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (isOpen && cliente) {
                try {
                    setLoadingHistory(true);
                    const [allVentas, allDevoluciones] = await Promise.all([
                        getVentaPedidos(),
                        getDevoluciones()
                    ]);
                    setPedidosCliente(allVentas.filter(v => v.usuarioId === cliente.id));
                    setDevolucionesCliente(allDevoluciones.filter(d => {
                        return allVentas.some(v => v.id === d.ventaPedidoId && v.usuarioId === cliente.id);
                    }));
                } catch (error) {
                    console.error("Error loading client history in Dialog:", error);
                } finally {
                    setLoadingHistory(false);
                }
            }
        };

        fetchHistory();
    }, [isOpen, cliente]);

    if (!cliente) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto modal-scroll p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Detalles del Cliente</DialogTitle>
                    <DialogDescription>
                        Información completa del cliente y su historial comercial
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Información Principal - Estilo Proveedor */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                {cliente.nombres} {cliente.apellidos}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                ID: #{cliente.id} • {cliente.tipoDocumento} {cliente.numeroDocumento}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <Badge
                                variant={cliente.estadoUsuario ? "default" : "secondary"}
                                className={cliente.estadoUsuario ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}
                            >
                                {cliente.estadoUsuario ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {cliente.estadoUsuario ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                    </div>

                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="info" className="flex items-center gap-2">
                                <Info className="h-4 w-4" /> Información General
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex items-center gap-2">
                                <History className="h-4 w-4" /> Historial Comercial
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-6">
                            {/* Datos de Identificación */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <IdCard className="h-4 w-4" />
                                    Identificación y Perfil
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Documento</Label>
                                        <p className="text-sm">{cliente.tipoDocumento} {cliente.numeroDocumento}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Tipo de Cliente</Label>
                                        <p className="text-sm">{cliente.tipoCliente || 'Minorista'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Fecha de Nacimiento</Label>
                                        <p className="text-sm">
                                            {cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString() : 'No registrada'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Código de Usuario</Label>
                                        <p className="text-sm">#{cliente.id}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Información de Contacto */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Información de Contacto
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Email</Label>
                                        <p className="text-sm">{cliente.correo}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Teléfono</Label>
                                        <p className="text-sm flex items-center gap-1.5">
                                            <Phone className="h-3 w-3 text-gray-400" />
                                            {cliente.telefono}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Dirección</Label>
                                        <p className="text-sm flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3 text-gray-400" />
                                            {cliente.direccion}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-gray-500">Ubicación</Label>
                                        <p className="text-sm">
                                            {cliente.ciudad}{cliente.barrio ? `, ${cliente.barrio}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-6">
                            {loadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-sm text-gray-500 font-medium font-sans">Cargando historial comercial...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                <ShoppingBag className="h-4 w-4 text-blue-600" />
                                                Historial de Ventas ({pedidosCliente.length})
                                            </h4>
                                            <span className="text-xs font-bold text-green-700">
                                                Total Ventas: ${pedidosCliente.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="border rounded-lg overflow-hidden bg-white">
                                            <Table>
                                                <TableHeader className="bg-gray-50">
                                                    <TableRow>
                                                        <TableHead className="text-[10px] font-bold uppercase">Referencia</TableHead>
                                                        <TableHead className="text-[10px] font-bold uppercase">Fecha</TableHead>
                                                        <TableHead className="text-right text-[10px] font-bold uppercase">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pedidosCliente.length > 0 ? (
                                                        pedidosCliente.map((p) => (
                                                            <TableRow key={p.id} className="text-xs hover:bg-gray-50 transition-colors">
                                                                <TableCell className="font-medium text-blue-600">VNT-{p.id}</TableCell>
                                                                <TableCell>{p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : 'N/A'}</TableCell>
                                                                <TableCell className="text-right font-semibold">${p.total.toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center py-8 text-gray-400 italic">
                                                                Sin registros de ventas.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold flex items-center gap-1.5">
                                            <RefreshCw className="h-4 w-4 text-orange-600" />
                                            Historial de Devoluciones ({devolucionesCliente.length})
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden bg-white">
                                            <Table>
                                                <TableHeader className="bg-gray-50">
                                                    <TableRow>
                                                        <TableHead className="text-[10px] font-bold uppercase">ID Dev</TableHead>
                                                        <TableHead className="text-[10px] font-bold uppercase">Fecha</TableHead>
                                                        <TableHead className="text-right text-[10px] font-bold uppercase">Monto</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {devolucionesCliente.length > 0 ? (
                                                        devolucionesCliente.map((d) => (
                                                            <TableRow key={d.id} className="text-xs hover:bg-gray-50 transition-colors">
                                                                <TableCell className="font-medium text-orange-600">DEV-{d.id}</TableCell>
                                                                <TableCell>{new Date(d.fechaDevolucion).toLocaleDateString()}</TableCell>
                                                                <TableCell className="text-right font-semibold text-red-600">-${d.montoTotal.toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center py-8 text-gray-400 italic">
                                                                Sin registros de devoluciones.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="p-6 pt-0 border-t mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    {onEdit && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                            onOpenChange(false);
                            onEdit(cliente);
                        }}>
                            Editar Cliente
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
