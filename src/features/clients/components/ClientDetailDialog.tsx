import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Separator } from '@/shared/ui/separator';
import { Label } from '@/shared/ui/label';
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
import { UsuarioDto, VentaPedidoDto, DevolucionDto } from '@/shared/types';
import { getVentaPedidos, getDevoluciones, updateUsuario, deleteUsuario } from '@/shared/services/api';
import { toast } from 'sonner';
import { Shield, Trash2 } from 'lucide-react';

interface ClientDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cliente: UsuarioDto | null;
    onEdit?: (cliente: UsuarioDto) => void;
    onRefresh?: () => void;
}

export const ClientDetailDialog: React.FC<ClientDetailDialogProps> = ({
    isOpen,
    onOpenChange,
    cliente,
    onEdit,
    onRefresh
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
            <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles del Cliente</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Perfil completo e historial de transacciones comerciales.
                        </DialogDescription>
                    </div>
                    <Badge 
                        variant={cliente.estadoUsuario ? "default" : "secondary"}
                        className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                            cliente.estadoUsuario 
                            ? "bg-green-50 text-green-700 border-green-100" 
                            : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                    >
                        {cliente.estadoUsuario ? "Cuenta Activa" : "Cuenta Inactiva"}
                    </Badge>
                </div>
            </DialogHeader>

            <div className="p-8 space-y-10">
                {/* Cabecera de Identidad */}
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {cliente.nombres} {cliente.apellidos}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span className="font-mono text-gray-400">ID: #{cliente.id}</span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                                <IdCard className="h-3.5 w-3.5" />
                                {cliente.tipoDocumento} {cliente.numeroDocumento}
                            </span>
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
                        <TabsTrigger 
                            value="info" 
                            className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                        >
                            <Info className="h-4 w-4" /> Información General
                        </TabsTrigger>
                        <TabsTrigger 
                            value="history" 
                            className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                        >
                            <History className="h-4 w-4" /> Historial Comercial
                        </TabsTrigger>
                        {cliente.documentoUrl && (
                            <TabsTrigger 
                                value="documento" 
                                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
                            >
                                <Shield className="h-4 w-4" /> Documento (Validación)
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
                        {/* Identificación */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Identificación y Perfil</h4>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Documento de Identidad</Label>
                                    <p className="text-sm font-medium text-gray-900">{cliente.tipoDocumento} {cliente.numeroDocumento}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Tipo de Cliente</Label>
                                    <p className="text-sm font-medium text-gray-900">{cliente.tipoCliente || 'Minorista'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Fecha de Nacimiento</Label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No registrada'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Código de Sistema</Label>
                                    <p className="text-sm font-medium text-gray-900">USR-{cliente.id}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-gray-100" />

                        {/* Contacto */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Información de Contacto</h4>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Correo Electrónico</Label>
                                    <p className="text-sm font-medium text-gray-900 truncate">{cliente.correo}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Teléfono</Label>
                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                        {cliente.telefono}
                                    </p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label className="text-xs font-medium text-gray-500">Dirección de Residencia</Label>
                                    <p className="text-sm font-medium text-gray-900 flex items-start gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                        <span>{cliente.direccion}</span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-500">Ciudad / Barrio</Label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {cliente.ciudad}{cliente.barrio ? `, ${cliente.barrio}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-8 animate-in fade-in-50 duration-500">
                        {loadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-sm text-gray-500 font-medium">Cargando historial comercial...</p>
                            </div>
                        ) : (
                            <>
                                {/* Ventas */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Historial de Ventas ({pedidosCliente.length})</h4>
                                        <div className="text-xs font-bold text-gray-900">
                                            Total Acumulado: <span className="text-blue-600 font-black">${pedidosCliente.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-tight h-10">Referencia</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-tight h-10">Fecha</TableHead>
                                                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-tight h-10">Monto Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pedidosCliente.length > 0 ? (
                                                    pedidosCliente.map((p) => (
                                                        <TableRow key={p.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                                            <TableCell className="text-xs font-bold text-blue-600">VNT-{p.id}</TableCell>
                                                            <TableCell className="text-xs text-gray-600">{p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : 'N/A'}</TableCell>
                                                            <TableCell className="text-right text-sm font-bold text-gray-900">${p.total.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-10 text-gray-400 text-xs italic">
                                                            No hay registros de ventas para este cliente.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Devoluciones */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Historial de Devoluciones ({devolucionesCliente.length})</h4>
                                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-tight h-10">Referencia</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase tracking-tight h-10">Fecha</TableHead>
                                                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-tight h-10">Impacto Monto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {devolucionesCliente.length > 0 ? (
                                                    devolucionesCliente.map((d) => (
                                                        <TableRow key={d.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                                            <TableCell className="text-xs font-bold text-orange-600">DEV-{d.id}</TableCell>
                                                            <TableCell className="text-xs text-gray-600">{new Date(d.fechaDevolucion).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-right text-sm font-bold text-red-600">-${d.montoTotal.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-10 text-gray-400 text-xs italic">
                                                            No hay registros de devoluciones para este cliente.
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

                    {cliente.documentoUrl && (
                        <TabsContent value="documento" className="space-y-8 animate-in fade-in-50 duration-500">
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="h-3.5 w-3.5" /> Comprobante de Identidad
                                </h4>
                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="text-sm">
                                        <span className="text-gray-500 font-medium">Fecha de Nacimiento declarada: </span>
                                        <span className="font-bold text-gray-900">
                                            {cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento + 'T00:00:00').toLocaleDateString() : 'No registrada'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500 font-medium">Documento: </span>
                                        <span className="font-bold text-gray-900">{cliente.numeroDocumento}</span>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex justify-center p-4">
                                    <img 
                                        src={cliente.documentoUrl} 
                                        alt="Documento de Identidad" 
                                        className="max-w-full max-h-[400px] object-contain rounded-md shadow-sm"
                                    />
                                </div>
                                {!cliente.estadoUsuario && (
                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <Button 
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                            onClick={async () => {
                                                try {
                                                    await deleteUsuario(cliente.id);
                                                    toast.success('Cliente rechazado y eliminado.');
                                                    onOpenChange(false);
                                                    if (onRefresh) onRefresh();
                                                } catch (error) {
                                                    toast.error('Error al eliminar cliente');
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Rechazar y Eliminar
                                        </Button>
                                        <Button 
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={async () => {
                                                try {
                                                    const updatedClient = { ...cliente, estadoUsuario: true, documentoUrl: "" };
                                                    await updateUsuario(cliente.id, updatedClient);
                                                    toast.success('Cliente aprobado y activado correctamente. El documento ha sido eliminado por seguridad y espacio.');
                                                    onOpenChange(false);
                                                    if (onRefresh) onRefresh();
                                                } catch (error) {
                                                    toast.error('Error al aprobar cliente');
                                                }
                                            }}
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
                                            Aprobar y Activar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            <DialogFooter className="p-8 border-t border-gray-100 flex items-center gap-3 bg-white">
                <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200"
                >
                    Cerrar Detalle
                </Button>
                {onEdit && (
                    <Button 
                        className="h-10 px-6 bg-gray-900 text-white font-medium hover:bg-black transition-all" 
                        onClick={() => {
                            onOpenChange(false);
                            onEdit(cliente);
                        }}
                    >
                        Editar Información
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
};
