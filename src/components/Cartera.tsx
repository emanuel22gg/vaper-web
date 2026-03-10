import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    DollarSign,
    Calendar,
    AlertCircle,
    ChevronRight,
    Filter,
    ArrowUpRight,
    TrendingDown,
    Clock,
    User,
    Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getVentaPedidos, getUsuarios, getAbonos } from '../services/api';
import { VentaPedidoDto, UsuarioDto, VentaAbonoDto } from '../types';
import { toast } from 'sonner';

interface DebtorInfo {
    pedidoId: number;
    clienteId: number;
    clienteNombre: string;
    clienteDocumento: string;
    fechaCreacion: string;
    fechaVencimiento: Date;
    totalPedido: number;
    totalAbonado: number;
    saldoPendiente: number;
    plazoMeses: number;
    diasRestantes: number;
    estadoAlerta: 'danger' | 'warning' | 'success';
}

interface CarteraProps {
    onVerAbonos?: (pedido: VentaPedidoDto) => void;
}

export const Cartera: React.FC<CarteraProps> = ({ onVerAbonos }) => {
    const [pedidos, setPedidos] = useState<VentaPedidoDto[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
    const [abonos, setAbonos] = useState<VentaAbonoDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pedidosData, usuariosData, abonosData] = await Promise.all([
                getVentaPedidos(),
                getUsuarios(),
                getAbonos()
            ]);

            // Solo nos interesan pedidos en estado "En Abonos" (ID: 6)
            setPedidos(pedidosData.filter(p => p.estadoId === 6));
            setUsuarios(usuariosData);
            setAbonos(abonosData);
        } catch (error) {
            console.error("Error loading cartera data:", error);
            toast.error("Error al cargar datos de cartera");
        } finally {
            setLoading(false);
        }
    };

    const processedData = useMemo(() => {
        const today = new Date();

        return pedidos.map(pedido => {
            const usuario = usuarios.find(u => u.id === pedido.usuarioId);
            const pedidoAbonos = abonos.filter(a => a.ventaPedidoId === pedido.id && a.estado);

            const totalAbonado = pedidoAbonos.reduce((sum, a) => sum + a.monto, 0);
            const saldoPendiente = pedido.total - totalAbonado;

            // Calcular fecha de vencimiento
            const fechaInicio = pedido.fechaCreacion ? new Date(pedido.fechaCreacion) : new Date();
            const fechaVencimiento = new Date(fechaInicio);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (pedido.plazoAbonos || 1));

            // Calcular días restantes
            const diffTime = fechaVencimiento.getTime() - today.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let estadoAlerta: 'danger' | 'warning' | 'success' = 'success';
            if (diasRestantes < 0) estadoAlerta = 'danger';
            else if (diasRestantes <= 7) estadoAlerta = 'warning';

            return {
                pedidoId: pedido.id!,
                clienteId: pedido.usuarioId,
                clienteNombre: usuario ? `${usuario.nombres} ${usuario.apellidos}` : `ID: ${pedido.usuarioId}`,
                clienteDocumento: usuario ? usuario.numeroDocumento : 'N/A',
                fechaCreacion: pedido.fechaCreacion || '',
                fechaVencimiento,
                totalPedido: pedido.total,
                totalAbonado,
                saldoPendiente,
                plazoMeses: pedido.plazoAbonos || 0,
                diasRestantes,
                estadoAlerta,
                pedidoOriginal: pedido
            };
        }).filter(item => {
            const search = searchTerm.toLowerCase();
            return (
                item.clienteNombre.toLowerCase().includes(search) ||
                item.clienteDocumento.includes(search) ||
                item.pedidoId.toString().includes(search)
            );
        });
    }, [pedidos, usuarios, abonos, searchTerm]);

    const stats = useMemo(() => {
        return {
            totalCartera: processedData.reduce((sum, item) => sum + item.totalPedido, 0),
            totalPendiente: processedData.reduce((sum, item) => sum + item.saldoPendiente, 0),
            vencidos: processedData.filter(item => item.estadoAlerta === 'danger').length,
            porVencer: processedData.filter(item => item.estadoAlerta === 'warning').length,
            clientesDeudores: new Set(processedData.map(item => item.clienteId)).size
        };
    }, [processedData]);

    const getStatusBadge = (alerta: string, dias: number) => {
        if (alerta === 'danger') return <Badge variant="destructive" className="flex gap-1 items-center"><AlertCircle className="h-3 w-3" /> Vencido ({Math.abs(dias)}d)</Badge>;
        if (alerta === 'warning') return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 flex gap-1 items-center"><Clock className="h-3 w-3" /> Vence en {dias}d</Badge>;
        return <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 flex gap-1 items-center">Al día ({dias}d)</Badge>;
    };

    return (
        <div className="space-y-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cartera de Clientes</h1>
                <p className="text-gray-500 text-lg font-medium">Gestiona y monitorea las cuentas por cobrar y plazos de abonos.</p>
            </div>

            {/* Resumen de Cartera */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">Total en Cartera</CardDescription>
                        <CardTitle className="text-2xl">${stats.totalCartera.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-blue-600 font-bold">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Valor total de pedidos a crédito
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">Saldo Pendiente</CardDescription>
                        <CardTitle className="text-2xl">${stats.totalPendiente.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-indigo-600 font-bold">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Capital por recaudar
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">Pedidos Vencidos</CardDescription>
                        <CardTitle className="text-2xl text-red-600">{stats.vencidos}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-red-600 font-bold">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Requieren atención inmediata
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Clientes</CardDescription>
                        <CardTitle className="text-2xl">{stats.clientesDeudores}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-600 font-bold">
                            <User className="h-3 w-3 mr-1" />
                            Usuarios con deuda activa
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Detalle de Deudores</CardTitle>
                            <CardDescription>Lista completa de pedidos con saldo pendiente y semáforo de pagos.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar cliente, documento o pedido..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-bold">Cliente / Pedido</TableHead>
                                    <TableHead className="font-bold">Saldo Pendiente</TableHead>
                                    <TableHead className="font-bold">Progreso Pago</TableHead>
                                    <TableHead className="font-bold">Vencimiento</TableHead>
                                    <TableHead className="font-bold">Estado</TableHead>
                                    <TableHead className="text-right font-bold">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                                                <p className="text-sm font-medium text-gray-500">Cargando datos de cartera...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : processedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            No se encontraron deudas activas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    processedData.map((item) => (
                                        <TableRow key={item.pedidoId} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{item.clienteNombre}</span>
                                                    <span className="text-xs text-gray-500">Pedido #{item.pedidoId} • Doc: {item.clienteDocumento}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-gray-900">${item.saldoPendiente.toLocaleString()}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-black">De ${item.totalPedido.toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[140px]">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                                                        <span>{Math.round((item.totalAbonado / item.totalPedido) * 100)}% Pagado</span>
                                                        <span>${item.totalAbonado.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 shadow-sm ${item.estadoAlerta === 'danger' ? 'bg-red-500' :
                                                                    item.estadoAlerta === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                                                                }`}
                                                            style={{ width: `${(item.totalAbonado / item.totalPedido) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium text-gray-700">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{item.fechaVencimiento.toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Plazo: {item.plazoMeses} {item.plazoMeses === 1 ? 'Mes' : 'Meses'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(item.estadoAlerta, item.diasRestantes)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold h-9 gap-2 shadow-sm"
                                                    onClick={() => onVerAbonos && onVerAbonos(item.pedidoOriginal as VentaPedidoDto)}
                                                >
                                                    <Receipt className="h-3.5 w-3.5" />
                                                    Cobrar
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
