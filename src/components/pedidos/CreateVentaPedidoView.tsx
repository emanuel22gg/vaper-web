import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
    Search,
    Plus,
    Minus,
    Trash2,
    User,
    Package,
    CreditCard,
    Truck,
    ShoppingCart,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Calendar,
    ArrowLeft
} from "lucide-react";
import { getUsuarioByDocumento, getProductos, createVentaPedido, getDepartments, getCitiesByDepartment, createDetalleVentaPedido, getEstados, updateVentaPedido } from "../../services/api";
import { UsuarioDto, Producto, VentaPedidoDto, DepartmentColombian, CityColombian, DetalleVentaPedidoDto } from "../../types";
import { toast } from "sonner";
import { cn } from "../ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "../ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface CreateVentaPedidoViewProps {
    onBack: () => void;
    onSuccess: () => void;
}

export const CreateVentaPedidoView: React.FC<CreateVentaPedidoViewProps> = ({
    onBack,
    onSuccess,
}) => {
    // Estado de navegación
    const [activeTab, setActiveTab] = useState("cliente");

    // Estado del Cliente
    const [documentoSearch, setDocumentoSearch] = useState("");
    const [clienteEncontrado, setClienteEncontrado] = useState<UsuarioDto | null>(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);

    // Estado de Productos
    const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
    const [searchProducto, setSearchProducto] = useState("");
    const [loadingProductos, setLoadingProductos] = useState(false);

    // Carrito de compras
    const [carrito, setCarrito] = useState<Array<{ producto: Producto; cantidad: number }>>([]);

    // Datos del pedido
    const [metodoPago, setMetodoPago] = useState("Efectivo");
    const [direccionEntrega, setDireccionEntrega] = useState("");
    const [ciudadEntrega, setCiudadEntrega] = useState("");
    const [departamentoEntrega, setDepartamentoEntrega] = useState("");
    const [barrio, setBarrio] = useState("");
    const [costoEnvio, setCostoEnvio] = useState(0);
    const [observaciones, setObservaciones] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [plazoAbonos, setPlazoAbonos] = useState<number>(1);

    // Estados para Geografía (API Colombia)
    const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
    const [cities, setCities] = useState<CityColombian[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [isDeptPopoverOpen, setIsDeptPopoverOpen] = useState(false);
    const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);

    // Estados para Dirección Estructurada
    const [addrParts, setAddrParts] = useState({
        tipoVia: '',
        viaPrincipal: '',
        viaSecundaria: '',
        placa: ''
    });

    const [vigenciaDevolucion, setVigenciaDevolucion] = useState<number>(1);

    const getEstadoAbonosId = async () => {
        try {
            const estados = await getEstados();
            const estadoAbonos = estados.find((e: any) => e.nombreEstado.toLowerCase().includes('abono'));
            console.log("Estados encontrados:", estados);
            console.log("Estado Abono identificado:", estadoAbonos);
            return estadoAbonos ? estadoAbonos.id : 6; // Fallback forzado a 6 si no se encuentra pero es abono
        } catch (error) {
            console.error("Error al obtener ID del estado Abonos:", error);
            return 2;
        }
    };

    const tiposVia = ['Calle', 'Carrera', 'Transversal', 'Diagonal', 'Circular', 'Avenida', 'Pasaje'];

    useEffect(() => {
        loadProductos();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
            setDepartments(sortedData);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    useEffect(() => {
        if (selectedDepartment) {
            const fetchCities = async () => {
                try {
                    const dept = departments.find(d => d.name === selectedDepartment);
                    if (dept) {
                        const data = await getCitiesByDepartment(dept.id);
                        const sortedCities = [...data].sort((a, b) => a.name.localeCompare(b.name));
                        setCities(sortedCities);
                    }
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };
            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedDepartment, departments]);

    // Concatenación de dirección en tiempo real
    useEffect(() => {
        const { tipoVia, viaPrincipal, viaSecundaria, placa } = addrParts;
        if (tipoVia && viaPrincipal && viaSecundaria && placa) {
            const fullAddr = `${tipoVia} ${viaPrincipal} # ${viaSecundaria}-${placa}`;
            setDireccionEntrega(fullAddr);
        }
    }, [addrParts]);

    const formatCOP = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val);
    };

    const handleCostoEnvioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove everything except numbers
        const rawValue = e.target.value.replace(/\D/g, "");

        // If empty, set to 0, otherwise convert to number to remove leading zeros
        const numericValue = rawValue === "" ? 0 : parseInt(rawValue, 10);

        setCostoEnvio(numericValue);
    };

    const loadProductos = async () => {
        try {
            setLoadingProductos(true);
            const data = await getProductos();
            setProductosDisponibles(data);
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("No se pudieron cargar los productos");
        } finally {
            setLoadingProductos(false);
        }
    };

    const handleBuscarCliente = async () => {
        if (!documentoSearch.trim()) return;

        try {
            setBuscandoCliente(true);
            const cliente = await getUsuarioByDocumento(documentoSearch);
            if (cliente) {
                setClienteEncontrado(cliente);
                setDireccionEntrega(cliente.direccion || "");
                setCiudadEntrega(cliente.ciudad || "");
                setBarrio(cliente.barrio || "");
                setDepartamentoEntrega(cliente.departamento || "");
                setSelectedDepartment(cliente.departamento || "");
                toast.success("Cliente localizado");
            } else {
                setClienteEncontrado(null);
                toast.error("Cliente no encontrado en el sistema");
            }
        } catch (error) {
            console.error("Error searching client:", error);
            toast.error("Error al buscar cliente");
        } finally {
            setBuscandoCliente(false);
        }
    };

    const agregarAlCarrito = (producto: Producto) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.producto.id === producto.id);
            if (existe) {
                return prev.map((item) =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, { producto, cantidad: 1 }];
        });
        toast.success(`${producto.nombreProducto} agregado`);
    };

    const actualizarCantidad = (id: number, delta: number) => {
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.producto.id === id) {
                    const nuevaCantidad = Math.max(1, item.cantidad + delta);
                    return { ...item, cantidad: nuevaCantidad };
                }
                return item;
            })
        );
    };

    const eliminarDelCarrito = (id: number) => {
        setCarrito((prev) => prev.filter((item) => item.producto.id !== id));
    };

    const calcularSubtotal = () => {
        return carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    };

    const calcularTotal = () => {
        return calcularSubtotal() + Number(costoEnvio);
    };

    const handleGuardarPedido = async () => {
        if (!clienteEncontrado) {
            toast.error("Debe seleccionar un cliente");
            return;
        }
        if (carrito.length === 0) {
            toast.error("Debe agregar al menos un producto");
            return;
        }

        try {
            setGuardando(true);

            // Determinar estado basado en el método de pago (6 = En Abonos, 2 = Pendiente)
            const estadoFinal = metodoPago === "Abonos" ? 6 : 2;

            const pedidoData: VentaPedidoDto = {
                usuarioId: clienteEncontrado.id,
                estadoId: estadoFinal,
                metodoPago: metodoPago === "Abonos" ? "Otro" : metodoPago,
                direccionEntrega,
                ciudadEntrega,
                departamentoEntrega,
                //barrio,
                observaciones,
                plazoAbonos: metodoPago === "Abonos" ? Number(plazoAbonos) : null,
                subtotal: calcularSubtotal(),
                envio: Number(costoEnvio),
                total: calcularTotal(),
                vigenciaDevolucion: vigenciaDevolucion,
                tipoVenta: "Pedido",
                detalleVenta_Pedido: carrito.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.producto.precio,
                    subtotal: item.producto.precio * item.cantidad
                }))
            };

            const response = await createVentaPedido(pedidoData);
            const createdOrderId = response.id || response.Id || (response.data && response.data.id);

            if (!createdOrderId) {
                throw new Error("No se pudo obtener el ID del pedido creado");
            }

            // Save order details (products) individually since the backend doesn't process them in the main request
            for (const item of carrito) {
                const detalleData = {
                    ventaPedidoId: createdOrderId,
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.producto.precio,
                    subtotal: item.producto.precio * item.cantidad
                };
                await createDetalleVentaPedido(detalleData);
            }

            toast.success("Pedido registrado con éxito", {
                description: `ID del pedido: ${createdOrderId}`
            });
            onSuccess();
        } catch (error) {
            console.error("Error creating order:", error);
            toast.error("Error al guardar el pedido");
        } finally {
            setGuardando(false);
        }
    };

    const productosFiltrados = searchProducto.length >= 2
        ? productosDisponibles.filter(p =>
            p.nombreProducto.toLowerCase().includes(searchProducto.toLowerCase()) && p.estado
        )
        : [];

    return (
        <Card className="shadow-lg border-none" translate="no">
            <CardHeader className="p-4 border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100 h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                Crear Nuevo Pedido
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Siga los pasos para registrar un nuevo pedido en el sistema.
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-4 border-b py-1.5 bg-gray-50/50">
                        <TabsList className="grid w-full max-w-xl grid-cols-4 bg-transparent h-9">
                            <TabsTrigger value="cliente" className="data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm rounded-md transition-all px-3 py-1 text-xs font-semibold">
                                1. Cliente
                            </TabsTrigger>
                            <TabsTrigger value="productos" className="data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm rounded-md transition-all px-3 py-1 text-xs font-semibold">
                                2. Productos
                            </TabsTrigger>
                            <TabsTrigger value="vigencia" className="data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm rounded-md transition-all px-3 py-1 text-xs font-semibold">
                                3. Garantía
                            </TabsTrigger>
                            <TabsTrigger value="entrega" className="data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-sm rounded-md transition-all px-3 py-1 text-xs font-semibold">
                                4. Entrega & Pago
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4">
                        {/* Contenido Pestaña 1: Cliente */}
                        <TabsContent value="cliente" className="space-y-4 mt-0">
                            <div className="space-y-4 max-w-2xl mx-auto">
                                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 flex items-start gap-3">
                                    <div className="bg-gray-800 p-1.5 rounded-lg">
                                        <User className="h-4 w-4 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-black uppercase tracking-tight leading-none">Buscar Cliente</p>
                                        <p className="text-xs text-gray-500 mt-1">Ingrese la cédula para cargar datos automáticamente.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border">
                                    <div className="flex-1 space-y-1.5">
                                        <Label htmlFor="documento" className="text-xs font-bold text-gray-700 ml-0.5">Número de Cédula / Documento</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="documento"
                                                placeholder="Ej: 123456789"
                                                value={documentoSearch}
                                                onChange={(e) => setDocumentoSearch(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleBuscarCliente()}
                                                className="pl-9 h-10 text-sm shadow-sm border-gray-200 focus:ring-1 focus:ring-yellow-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleBuscarCliente} disabled={buscandoCliente} className="h-10 px-6 bg-gray-600 hover:bg-gray-800 shadow-md font-bold text-sm text-white transition-all active:scale-95">
                                        {buscandoCliente ? "..." : "Localizar Cliente"}
                                    </Button>
                                </div>

                                {clienteEncontrado ? (
                                    <div className="p-4 border border-green-200 bg-green-50 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="bg-green-600 p-1 rounded-full">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                            <span className="text-base font-bold text-green-900">Cliente Identificado</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Nombre Completo</span>
                                                <p className="text-sm font-bold text-gray-900 capitalize">
                                                    {clienteEncontrado.nombres} {clienteEncontrado.apellidos}
                                                </p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Documento</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.tipoDocumento} {clienteEncontrado.numeroDocumento}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Correo</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.correo}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Teléfono</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.telefono}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Dirección</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.direccion || "No registrada"}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Barrio</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.barrio || "No registrado"}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Ciudad</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.ciudad || "No registrada"}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Departamento</span>
                                                <p className="text-sm font-bold text-gray-900">{clienteEncontrado.departamento || "No registrado"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 space-y-2 bg-gray-50/50">

                                        <p className="text-xs font-medium italic">Seleccione un cliente para continuar.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="productos" className="mt-0">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Zona de Selección (Oculta por defecto) - 50% */}
                                <div className="flex-1 lg:w-1/2">
                                    <div className="bg-white border rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
                                        <div className="bg-gray-50/80 px-4 py-3 border-b">
                                            <span className="text-lg font-black text-black uppercase tracking-tight">Seleccionar Productos</span>
                                        </div>

                                        <div className="p-3 border-b bg-white">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                <Input
                                                    placeholder="Escriba aquí para buscar..."
                                                    className="h-8 pl-8 text-xs shadow-none border-gray-100 focus:ring-2 focus:ring-yellow-500/10 bg-gray-50/50 rounded-lg font-medium"
                                                    value={searchProducto}
                                                    onChange={(e) => setSearchProducto(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-gray-50/30 overflow-hidden">
                                            {searchProducto.length < 2 ? (
                                                <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                                                    <div className="max-w-[180px]">
                                                        <p className="text-[10px] text-gray-400 mt-1 text-center">Escriba el nombre del producto para filtrar resultados</p>
                                                    </div>
                                                </div>
                                            ) : loadingProductos ? (
                                                <div className="h-[300px] flex flex-col items-center justify-center text-gray-300 animate-pulse">
                                                    <p className="text-[10px] font-bold">Buscando productos...</p>
                                                </div>
                                            ) : productosFiltrados.length === 0 ? (
                                                <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-2">
                                                    <p className="text-[10px] font-bold italic">No se encontraron productos</p>
                                                </div>
                                            ) : (
                                                <ScrollArea className="h-[320px]">
                                                    <div className="divide-y divide-gray-100 bg-white">
                                                        {productosFiltrados.map((p) => (
                                                            <div
                                                                key={p.id}
                                                                className="flex items-center justify-between p-2 hover:bg-gray-100 transition-colors cursor-pointer group"
                                                                onClick={() => agregarAlCarrito(p)}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 pr-2 py-1">
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-[10.5px] text-gray-800 uppercase truncate group-hover:text-black">
                                                                            <span>{p.nombreProducto}</span>
                                                                        </p>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-black text-gray-900">${p.precio.toLocaleString()}</span>
                                                                            <span className={cn(
                                                                                "text-[9px] font-black px-1 rounded-sm",
                                                                                p.stock <= 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                                                            )}>STK: {p.stock}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="h-6 w-6 rounded bg-gray-800 flex items-center justify-center text-yellow-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <Plus className="h-3 w-3" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen y Carrito - 50% */}
                                <div className="flex-1 lg:w-1/2">
                                    <div className="h-full flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden">
                                        <div className="bg-gray-50/80 px-4 py-3 border-b flex items-center justify-between">
                                            <span className="text-lg font-black text-black uppercase tracking-tight">Tu Pedido</span>
                                            <Badge className="bg-gray-200 text-gray-800 font-black text-[10px] h-5 px-2 rounded-full border-none">{carrito.length}</Badge>
                                        </div>

                                        <ScrollArea className="flex-1 h-[280px]">
                                            {carrito.length === 0 ? (
                                                <div className="h-[280px] flex flex-col items-center justify-center text-gray-300 space-y-2 py-10 opacity-40">
                                                    <ShoppingCart className="h-8 w-8" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Vació</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {carrito.map((item) => (
                                                        <div key={item.producto.id} className="p-3 hover:bg-gray-50/50 transition-colors animate-in slide-in-from-right-1">
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                                        <p className="font-bold text-[10.5px] text-gray-800 uppercase truncate leading-tight flex-1">
                                                                            <span>{item.producto.nombreProducto}</span>
                                                                        </p>
                                                                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 shrink-0">
                                                                            <button onClick={() => actualizarCantidad(item.producto.id, -1)} className="h-5 w-5 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-600"><Minus className="h-2.5 w-2.5" /></button>
                                                                            <span className="w-6 text-center text-[10.5px] font-black text-gray-900">{item.cantidad}</span>
                                                                            <button onClick={() => actualizarCantidad(item.producto.id, 1)} className="h-5 w-5 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-600"><Plus className="h-2.5 w-2.5" /></button>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[11px] font-black text-gray-900 tracking-tight">${(item.producto.precio * item.cantidad).toLocaleString()}</span>
                                                                </div>
                                                                <button onClick={() => eliminarDelCarrito(item.producto.id)} className="text-red-500 hover:text-red-700 transition-colors p-1.5 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100/50 mt-0.5">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>

                                        <div className="p-3 bg-white border-t space-y-2 mt-auto shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                                            <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase leading-none mb-1">Total a Pagar</span>
                                                    <span className="text-xl font-black leading-none tracking-tight text-black">${calcularSubtotal().toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="vigencia" className="mt-0">
                            <div className="max-w-2xl mx-auto space-y-4 py-4">
                                <div className="bg-gray-100 py-7 px-6 rounded-xl border border-gray-200">
                                    <p className="text-lg font-black text-black uppercase tracking-tight leading-none mb-1">Garantía</p>
                                    <p className="text-xs text-gray-500">Defina el plazo máximo para devoluciones de este pedido.</p>
                                </div>

                                <Card className="p-6 border rounded-2xl bg-white shadow-md text-center space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-gray-800 uppercase">Tiempo de Garantía</Label>
                                        <div className="flex justify-center flex-wrap gap-2">
                                            {[1, 2, 3, 4].map((mes) => (
                                                <Button
                                                    key={mes}
                                                    variant={vigenciaDevolucion === mes ? "default" : "outline"}
                                                    className={cn(
                                                        "h-12 w-20 text-sm font-black rounded-xl transition-all",
                                                        vigenciaDevolucion === mes ? "bg-gray-800 text-yellow-400 shadow-md scale-105" : "hover:border-yellow-400"
                                                    )}
                                                    onClick={() => setVigenciaDevolucion(mes)}
                                                >
                                                    {mes} {mes === 1 ? 'Mes' : 'Meses'}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-dashed text-center">
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            Límite para realizar devoluciones sobre este pedido.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>


                        <TabsContent value="entrega" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-gray-500 font-bold">Departamento</Label>
                                                <Popover open={isDeptPopoverOpen} onOpenChange={setIsDeptPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-between h-9 text-xs font-bold bg-white rounded-lg">
                                                            <span className="truncate">{selectedDepartment || "Seleccione"}</span>
                                                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[200px] p-0 rounded-xl shadow-xl">
                                                        <Command>
                                                            <CommandInput placeholder="Buscar..." className="h-9 text-xs" />
                                                            <CommandList>
                                                                <CommandEmpty className="py-4 text-center text-xs">No hay datos.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {departments.map((dept) => (
                                                                        <CommandItem key={dept.id} value={dept.name} onSelect={() => { setSelectedDepartment(dept.name); setDepartamentoEntrega(dept.name); setIsDeptPopoverOpen(false); }} className="text-xs">
                                                                            <Check className={cn("mr-2 h-3 w-3 text-yellow-600", selectedDepartment === dept.name ? "opacity-100" : "opacity-0")} />
                                                                            {dept.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-gray-500 font-bold">Ciudad</Label>
                                                <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" disabled={!selectedDepartment} className="w-full justify-between h-9 text-xs font-bold bg-white rounded-lg">
                                                            <span className="truncate">{ciudadEntrega || "Seleccione"}</span>
                                                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[200px] p-0 rounded-xl shadow-xl">
                                                        <Command>
                                                            <CommandInput placeholder="Buscar..." className="h-9 text-xs" />
                                                            <CommandList>
                                                                <CommandEmpty className="py-4 text-center text-xs">No hay datos.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {cities.map((city) => (
                                                                        <CommandItem key={city.id} value={city.name} onSelect={() => { setCiudadEntrega(city.name); setIsCityPopoverOpen(false); }} className="text-xs">
                                                                            <Check className={cn("mr-2 h-3 w-3 text-yellow-600", ciudadEntrega === city.name ? "opacity-100" : "opacity-0")} />
                                                                            {city.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Barrio</Label>
                                            <Input className="h-9 text-sm px-3 rounded-lg" placeholder="Ej: Centro..." value={barrio} onChange={(e) => setBarrio(e.target.value)} />
                                        </div>

                                        <div className="bg-gray-100/50 p-5 rounded-2xl border border-gray-200 space-y-4">
                                            <div className="grid grid-cols-4 gap-2 items-end">
                                                <div className="col-span-2 space-y-1">
                                                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Vía</Label>
                                                    <Select value={addrParts.tipoVia} onValueChange={(v: string) => setAddrParts({ ...addrParts, tipoVia: v })}>
                                                        <SelectTrigger className="h-9 text-xs font-bold bg-white border-gray-200 text-gray-800 rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>{tiposVia.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Principal</Label>
                                                    <Input className="h-9 text-xs font-bold bg-white border-gray-200 text-gray-800 text-center rounded-lg" value={addrParts.viaPrincipal} onChange={(e) => setAddrParts({ ...addrParts, viaPrincipal: e.target.value })} />
                                                </div>
                                                <div className="text-center font-bold text-gray-400 pb-1.5 text-lg">#</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Secundaria</Label>
                                                    <Input className="h-9 text-xs font-bold bg-white border-gray-200 text-gray-800 rounded-lg" value={addrParts.viaSecundaria} onChange={(e) => setAddrParts({ ...addrParts, viaSecundaria: e.target.value })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Placa</Label>
                                                    <Input className="h-9 text-xs font-bold bg-white border-gray-200 text-gray-800 rounded-lg" value={addrParts.placa} onChange={(e) => setAddrParts({ ...addrParts, placa: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                <p className="text-sm font-black text-yellow-600 truncate">{direccionEntrega || "..."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-5">
                                        <div className="mb-1">
                                            <h3 className="text-lg font-black text-black uppercase tracking-tight">Pago</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-gray-500 font-bold">Método</Label>
                                                <Select value={metodoPago} onValueChange={setMetodoPago}>
                                                    <SelectTrigger className="h-10 text-xs font-bold rounded-xl border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="Efectivo" className="text-xs font-bold">Efectivo</SelectItem>
                                                        <SelectItem value="Transferencia" className="text-xs font-bold">Transferencia</SelectItem>
                                                        <SelectItem value="Abonos" className="text-xs font-bold">Abonos</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {metodoPago === "Abonos" && (
                                                <div className="space-y-1 animate-in zoom-in-95 duration-200">
                                                    <Label className="text-[10px] uppercase text-indigo-500 font-bold">Plazo (Meses)</Label>
                                                    <Select value={plazoAbonos.toString()} onValueChange={(v: string) => setPlazoAbonos(parseInt(v))}>
                                                        <SelectTrigger className="h-10 text-xs font-bold rounded-xl border-indigo-200 bg-indigo-50/30">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="1" className="text-xs font-bold">1 Mes</SelectItem>
                                                            <SelectItem value="2" className="text-xs font-bold">2 Meses</SelectItem>
                                                            <SelectItem value="3" className="text-xs font-bold">3 Meses</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-gray-500 font-bold">Envío ($)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        value={costoEnvio === 0 ? "" : formatCOP(costoEnvio)}
                                                        onChange={handleCostoEnvioChange}
                                                        placeholder="$ 0"
                                                        className="h-10 pl-4 text-sm font-bold rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-4">
                                            <Label className="text-[10px] uppercase text-gray-500 font-bold">Notas</Label>
                                            <Input placeholder="Observaciones..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="h-10 text-xs px-4 rounded-xl bg-gray-50 border-none shadow-inner" />
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                                            <div className="flex justify-between items-center opacity-60">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Subtotal</span>
                                                <span className="text-sm font-bold text-gray-700">${calcularSubtotal().toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center opacity-60">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Envío</span>
                                                <span className="text-sm font-bold text-gray-700">+ ${Number(costoEnvio).toLocaleString()}</span>
                                            </div>
                                            <Separator className="bg-gray-200 my-2" />
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-[9px] font-black uppercase text-gray-400">Total Final</span>
                                                    <p className="text-3xl font-black leading-none text-yellow-600 tracking-tighter">${calcularTotal().toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="h-9 px-4 font-bold text-xs text-gray-500 hover:text-red-600 rounded-lg" onClick={onBack} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    {activeTab !== "cliente" && (
                        <Button
                            variant="outline"
                            className="h-9 px-4 font-bold rounded-lg text-xs"
                            onClick={() => {
                                if (activeTab === "entrega") setActiveTab("vigencia");
                                else if (activeTab === "vigencia") setActiveTab("productos");
                                else if (activeTab === "productos") setActiveTab("cliente");
                            }}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {activeTab === "cliente" && (
                        <Button
                            onClick={() => setActiveTab("productos")}
                            disabled={!clienteEncontrado}
                            className="h-9 px-6 bg-gray-800 hover:bg-gray-900 text-white shadow-md rounded-lg font-bold text-xs"
                        >
                            Siguiente: Productos <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    {activeTab === "productos" && (
                        <Button
                            onClick={() => setActiveTab("vigencia")}
                            disabled={carrito.length === 0}
                            className="h-9 px-6 bg-gray-800 hover:bg-gray-900 text-white shadow-md rounded-lg font-bold text-xs"
                        >
                            Siguiente: Devolución <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    {activeTab === "vigencia" && (
                        <Button
                            onClick={() => setActiveTab("entrega")}
                            className="h-9 px-6 bg-gray-800 hover:bg-gray-900 text-white shadow-md rounded-lg font-bold text-xs"
                        >
                            Siguiente: Pago <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                    {activeTab === "entrega" && (
                        <Button
                            onClick={handleGuardarPedido}
                            disabled={guardando || !direccionEntrega || !ciudadEntrega}
                            className="h-9 px-8 bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-md rounded-lg font-black text-xs"
                        >
                            {guardando ? "..." : "Finalizar Pedido"}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

const Receipt = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2Z" />
        <path d="M16 8h-9" />
        <path d="M16 12h-9" />
        <path d="M16 16h-9" />
    </svg>
);
