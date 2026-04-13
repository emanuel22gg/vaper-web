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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { getVentaPedidos, getUsuarios, getAbonos } from '@/shared/services/api';
import { VentaPedidoDto, UsuarioDto, VentaAbonoDto } from '@/shared/types';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

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

            // Interesan pedidos en "En Abonos" (6) y los ya "Pagados/Entregados" (1) para historial
            setPedidos(pedidosData.filter(p => p.estadoId === 6 || p.estadoId === 1));
            setUsuarios(usuariosData);
            setAbonos(abonosData);
        } catch (error) {
            console.error("Error loading cartera data:", error);
            toast.error("Error al cargar datos de cartera");
        } finally {
            setLoading(false);
        }
    };

    // Estadísticas globales (siempre visibles)
    const stats = useMemo(() => {
        const today = new Date();
        // Las estadísticas solo cuentan deudas ACTIVAS (Estado 6)
        const baseData = pedidos
            .filter(p => p.estadoId === 6)
            .map(pedido => {
                const pedidoAbonos = abonos.filter(a => a.ventaPedidoId === pedido.id && a.estado);
                const totalAbonado = pedidoAbonos.reduce((sum, a) => sum + a.monto, 0);
                const saldoPendiente = pedido.total - totalAbonado;

            const fechaInicio = pedido.fechaCreacion ? new Date(pedido.fechaCreacion) : new Date();
            const fechaVencimiento = new Date(fechaInicio);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (pedido.plazoAbonos || 1));
            const diffTime = fechaVencimiento.getTime() - today.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                totalPedido: pedido.total,
                saldoPendiente,
                isVencido: diasRestantes < 0,
                clienteId: pedido.usuarioId
            };
        });

        return {
            totalCartera: baseData.reduce((sum, item) => sum + item.totalPedido, 0),
            totalPendiente: baseData.reduce((sum, item) => sum + item.saldoPendiente, 0),
            vencidos: baseData.filter(item => item.isVencido).length,
            clientesDeudores: new Set(baseData.map(item => item.clienteId)).size
        };
    }, [pedidos, abonos]);

    // Resultados filtrados por búsqueda
    const processedResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const today = new Date();
        const search = searchQuery.toLowerCase();

        return pedidos
            .map(pedido => {
                const usuario = usuarios.find(u => u.id === pedido.usuarioId);
                const pedidoAbonos = abonos.filter(a => a.ventaPedidoId === pedido.id && a.estado);

                const totalAbonado = pedidoAbonos.reduce((sum, a) => sum + a.monto, 0);
                const saldoPendiente = pedido.total - totalAbonado;

                const fechaInicio = pedido.fechaCreacion ? new Date(pedido.fechaCreacion) : new Date();
                const fechaVencimiento = new Date(fechaInicio);
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (pedido.plazoAbonos || 1));
                const diffTime = fechaVencimiento.getTime() - today.getTime();
                const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let estadoAlerta: 'danger' | 'warning' | 'success' | 'paid' = 'success';
                if (saldoPendiente <= 0 || pedido.estadoId === 1) estadoAlerta = 'paid';
                else if (diasRestantes < 0) estadoAlerta = 'danger';
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
            })
            .filter(item => {
                return (
                    item.clienteNombre.toLowerCase().includes(search) ||
                    item.clienteDocumento.includes(search) ||
                    item.pedidoId.toString() === search // Búsqueda exacta por ID es mejor si es por ID específico
                );
            });
    }, [pedidos, usuarios, abonos, searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
    };

    const getStatusBadge = (alerta: string, dias: number) => {
        if (alerta === 'paid') return <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100 flex gap-1 items-center font-bold">Liquidado</Badge>;
        if (alerta === 'danger') return <Badge variant="destructive" className="flex gap-1 items-center"><AlertCircle className="h-3 w-3" /> Vencido ({Math.abs(dias)}d)</Badge>;
        if (alerta === 'warning') return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 flex gap-1 items-center"><Clock className="h-3 w-3" /> Vence en {dias}d</Badge>;
        return <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 flex gap-1 items-center">Al día ({dias}d)</Badge>;
    };

    return (
        <div className="space-y-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cartera y Cobranzas</h1>
                <p className="text-gray-500 text-lg font-medium">Panel de control de créditos y seguimiento de deudores.</p>
            </div>

            {/* Resumen de Cartera */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-600">Total en Cartera</CardDescription>
                        <CardTitle className="text-2xl font-bold">${stats.totalCartera.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Créditos Otorgados
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-indigo-600">Saldo por Recaudar</CardDescription>
                        <CardTitle className="text-2xl font-bold">${stats.totalPendiente.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-indigo-600 font-bold bg-indigo-50 w-fit px-2 py-1 rounded">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Capital Pendiente
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-red-600">Pedidos Vencidos</CardDescription>
                        <CardTitle className="text-2xl font-bold text-red-600">{stats.vencidos}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-red-600 font-bold bg-red-50 w-fit px-2 py-1 rounded">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Alerta de Mora
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider text-emerald-600">Clientes Deudores</CardDescription>
                        <CardTitle className="text-2xl font-bold">{stats.clientesDeudores}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded">
                            <User className="h-3 w-3 mr-1" />
                            Usuarios Únicos
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Buscador Simplificado */}
            <div className="py-4">
                <Card className="max-w-4xl mx-auto border-2 border-gray-100 shadow-md overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold">Ingresa el nombre del cliente, cédula o número de pedido para ver el estado de cuenta</p>
                    </div>
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Ej: Juan Perez, 1085233... o Pedido #125"
                                    className="h-14 text-lg border-2 border-gray-100 focus:border-gray-500 rounded-xl bg-gray-50/50"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value === '') setHasSearched(false);
                                    }}
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="h-14 px-8 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-lg transition-all active:scale-95"
                            >
                                Buscar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Resultados de Búsqueda */}
            <div className="space-y-4">
                {(hasSearched || searchQuery !== '') && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Resultados de la Búsqueda</CardTitle>
                                    <CardDescription>Se encontraron {processedResults.length} registros para "{searchQuery}"</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
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
                                        ) : processedResults.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-gray-500 font-medium">
                                                    No se encontraron deudas activas con esos términos.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            processedResults.map((item) => (
                                                <TableRow key={item.pedidoId} className="hover:bg-gray-50/50 transition-colors">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{item.clienteNombre}</span>
                                                            <span className="text-xs text-gray-500">Pedido #{item.pedidoId} • Doc: {item.clienteDocumento}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 text-lg tracking-tight">${item.saldoPendiente.toLocaleString()}</span>
                                                            <span className="text-[10px] text-gray-400 uppercase font-bold">De ${item.totalPedido.toLocaleString()}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-[140px]">
                                                        <div className="space-y-1.5 pr-4">
                                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight text-gray-500">
                                                                <span>{item.totalPedido > 0 ? Math.round((item.totalAbonado / item.totalPedido) * 100) : 0}% Pagado</span>
                                                                <span>${item.totalAbonado.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                    className={`h-full transition-all duration-500 shadow-sm ${item.estadoAlerta === 'danger' ? 'bg-red-500' :
                                                                            item.estadoAlerta === 'warning' ? 'bg-amber-500' : 
                                                                            item.estadoAlerta === 'paid' ? 'bg-blue-500' : 'bg-emerald-500'
                                                                        }`}
                                                                    style={{ width: `${item.totalPedido > 0 ? (item.totalAbonado / item.totalPedido) * 100 : 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 font-medium text-gray-700">
                                                            <Calendar className="h-4 text-gray-400" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold">{item.fechaVencimiento.toLocaleDateString()}</span>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Plazo: {item.plazoMeses} {item.plazoMeses === 1 ? 'Cuota' : 'Cuotas'}</span>
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
                                                            className={`font-bold h-9 gap-2 ${item.estadoAlerta === 'paid' 
                                                                ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                                                                : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                                                            onClick={() => onVerAbonos && onVerAbonos(item.pedidoOriginal as VentaPedidoDto)}
                                                        >
                                                            <Receipt className="h-3.5 w-3.5" />
                                                            {item.estadoAlerta === 'paid' ? 'VER COBROS' : 'COBRAR'}
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
                )}
            </div>
        </div>
    );
};
