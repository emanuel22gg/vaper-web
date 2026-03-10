import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
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
    Ban
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {cliente.nombres} {cliente.apellidos}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <Badge variant={cliente.estadoUsuario ? "default" : "destructive"} className="text-[10px] h-5">
                                    {cliente.estadoUsuario ? "Activo" : "Inactivo"}
                                </Badge>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    ID: #{cliente.id}
                                </span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="basic" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">General</TabsTrigger>
                        <TabsTrigger value="commercial">Novedades</TabsTrigger>
                        <TabsTrigger value="history">Historial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-1">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <IdCard className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identificación</p>
                                        <p className="text-sm font-semibold text-slate-700">{cliente.tipoDocumento} {cliente.numeroDocumento}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo electrónico</p>
                                        <p className="text-sm font-semibold text-slate-700 underline decoration-blue-200">{cliente.correo}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono / WhatsApp</p>
                                        <p className="text-sm font-semibold text-slate-700">{cliente.telefono}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {cliente.ciudad}{cliente.barrio ? `, ${cliente.barrio}` : ''}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{cliente.direccion}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString() : 'No registrada'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="commercial" className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-1">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Clasificación</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <Building2 className="h-5 w-5 text-blue-500" />
                                        <span className="text-lg font-bold text-slate-800">{cliente.tipoCliente || 'Minorista'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Estado Operativo</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                        {cliente.estadoUsuario ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="text-lg font-bold text-green-600">Verificado</span>
                                            </>
                                        ) : (
                                            <>
                                                <Ban className="h-5 w-5 text-red-400" />
                                                <span className="text-lg font-bold text-red-500">Restringido</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Total Compras</p>
                                <p className="text-xl font-bold text-blue-700">{pedidosCliente.length}</p>
                            </div>
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-center">
                                <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Devoluciones</p>
                                <p className="text-xl font-bold text-orange-700">{devolucionesCliente.length}</p>
                            </div>
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 text-center">
                                <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Acumulado</p>
                                <p className="text-xl font-bold text-green-700">
                                    ${pedidosCliente.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-1">
                        {loadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-sm text-gray-500 font-medium">Cargando expediente comercial...</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                                        Historial de Compras ({pedidosCliente.length})
                                    </h4>
                                    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="text-[10px] font-bold uppercase">Referencia</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase">Fecha</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase">Estado</TableHead>
                                                    <TableHead className="text-right text-[10px] font-bold uppercase">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pedidosCliente.length > 0 ? (
                                                    pedidosCliente.map((p) => (
                                                        <TableRow key={p.id} className="text-xs hover:bg-slate-50 transition-colors">
                                                            <TableCell className="font-mono text-blue-600">VNT-{p.id}</TableCell>
                                                            <TableCell>{p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 leading-tight">
                                                                    {p.estadoId === 1 ? 'Entregado' : 'Pendiente'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold">${p.total.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-gray-400 italic">
                                                            Sin registros de compras previos.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-orange-600" />
                                        Historial de Devoluciones ({devolucionesCliente.length})
                                    </h4>
                                    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="text-[10px] font-bold uppercase">ID Dev</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase">Fecha</TableHead>
                                                    <TableHead className="text-[10px] font-bold uppercase">Motivo</TableHead>
                                                    <TableHead className="text-right text-[10px] font-bold uppercase">Monto</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {devolucionesCliente.length > 0 ? (
                                                    devolucionesCliente.map((d) => (
                                                        <TableRow key={d.id} className="text-xs hover:bg-slate-50 transition-colors">
                                                            <TableCell className="font-mono text-orange-600">DEV-{d.id}</TableCell>
                                                            <TableCell>{new Date(d.fechaDevolucion).toLocaleDateString()}</TableCell>
                                                            <TableCell className="max-w-[150px] truncate">{d.motivo || 'N/A'}</TableCell>
                                                            <TableCell className="text-right font-bold text-red-600">-${d.montoTotal.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-gray-400 italic">
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

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    {onEdit && (
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black border-none" onClick={() => {
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
