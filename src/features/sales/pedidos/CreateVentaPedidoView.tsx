import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
    Search,
    Store,
    Plus,
    Minus,
    Trash2,
    User,
    ShoppingCart,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    Info,
    Loader2
} from "lucide-react";
import { getUsuarioByDocumento, getProductos, createVentaPedido, getDepartments, getCitiesByDepartment, createDetalleVentaPedido, getEstados, updateVentaPedido, updateProducto, createAbono } from "@/shared/services/api";
import { UsuarioDto, Producto, VentaPedidoDto, DepartmentColombian, CityColombian, DetalleVentaPedidoDto } from "@/shared/types";
import { toast } from "sonner";
import { cn } from "@/shared/ui/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Badge } from "@/shared/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/shared/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface CreateVentaPedidoViewProps {
    onBack: () => void;
    onSuccess: () => void;
    /** En modo modal: sin Card ni cabecera (el Dialog aporta título) */
    embedInDialog?: boolean;
}

export const CreateVentaPedidoView: React.FC<CreateVentaPedidoViewProps> = ({
    onBack,
    onSuccess,
    embedInDialog = false,
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
    const [tipoEntrega, setTipoEntrega] = useState<'domicilio' | 'tienda'>('domicilio');
    const [metodoPago, setMetodoPago] = useState("Efectivo");
    const [direccionEntrega, setDireccionEntrega] = useState("");
    const [ciudadEntrega, setCiudadEntrega] = useState("");
    const [departamentoEntrega, setDepartamentoEntrega] = useState("");
    const [barrio, setBarrio] = useState("");
    const [costoEnvio, setCostoEnvio] = useState(0);
    const [observaciones, setObservaciones] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [plazoAbonos, setPlazoAbonos] = useState<number>(1);
    const [abonoInicial, setAbonoInicial] = useState<number>(0);

    // Estados para Geografía (API Colombia)
    const [departments, setDepartments] = useState<DepartmentColombian[]>([]);
    const [cities, setCities] = useState<CityColombian[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [isDeptPopoverOpen, setIsDeptPopoverOpen] = useState(false);
    const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);

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

        if (numericValue <= 100000) {
            setCostoEnvio(numericValue);
        }
    };

    const handleAbonoInicialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        const numericValue = rawValue === "" ? 0 : parseInt(rawValue, 10);
        setAbonoInicial(numericValue);
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

    const isMayorista = clienteEncontrado?.tipoCliente === 'Mayorista';
    const getPrecioActual = (producto: Producto) => {
        return isMayorista && producto.precioMayorista && producto.precioMayorista > 0 ? producto.precioMayorista : producto.precio;
    };

    const agregarAlCarrito = (producto: Producto) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.producto.id === producto.id);
            if (existe) {
                if (existe.cantidad >= producto.stock) {
                    toast.error(`Stock insuficiente. Solo hay ${producto.stock} unidades de ${producto.nombreProducto}.`);
                    return prev;
                }
                toast.success(`Se sumó otra unidad de ${producto.nombreProducto}`);
                return prev.map((item) =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            
            if (producto.stock < 1) {
                toast.error("Producto agotado.");
                return prev;
            }
            
            toast.success(`${producto.nombreProducto} agregado al pedido`);
            return [...prev, { producto, cantidad: 1 }];
        });
    };

    const actualizarCantidad = (id: number, delta: number) => {
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.producto.id === id) {
                    const nuevaCantidad = item.cantidad + delta;
                    if (nuevaCantidad > item.producto.stock) {
                        toast.error(`Stock insuficiente. El límite es ${item.producto.stock}.`);
                        return item;
                    }
                    return { ...item, cantidad: Math.max(1, nuevaCantidad) };
                }
                return item;
            })
        );
    };

    const setCantidadExacta = (id: number, rawValue: string) => {
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.producto.id === id) {
                    if (rawValue === '') {
                        // Permite dejar la caja vacía temporalmente mientras escribe
                        return { ...item, cantidad: '' as any };
                    }
                    
                    const val = parseInt(rawValue, 10);
                    if (isNaN(val)) return item;
                    
                    if (val > item.producto.stock) {
                        toast.error(`Stock insuficiente. El límite es ${item.producto.stock}.`);
                        return { ...item, cantidad: item.producto.stock };
                    }
                    return { ...item, cantidad: val };
                }
                return item;
            })
        );
    };

    const eliminarDelCarrito = (id: number) => {
        setCarrito((prev) => prev.filter((item) => item.producto.id !== id));
    };

    const calcularSubtotal = () => {
        return carrito.reduce((sum, item) => sum + getPrecioActual(item.producto) * item.cantidad, 0);
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

            // Determinar estado basado en el método de pago (Siempre iniciarán en Pendiente: 2)
            const estadoFinal = 2;

            const pedidoData: VentaPedidoDto = {
                usuarioId: clienteEncontrado.id,
                estadoId: estadoFinal,
                metodoPago: metodoPago === "Abonos" ? "Otro" : metodoPago,
                direccionEntrega: tipoEntrega === 'tienda' ? "Recogida en tienda" : direccionEntrega,
                ciudadEntrega: tipoEntrega === 'tienda' ? "N/A" : ciudadEntrega,
                departamentoEntrega: tipoEntrega === 'tienda' ? "N/A" : departamentoEntrega,
                //barrio,
                observaciones,
                plazoAbonos: metodoPago === "Abonos" ? Number(plazoAbonos) : null,
                subtotal: calcularSubtotal(),
                envio: Number(costoEnvio),
                total: calcularTotal(),
                vigenciaDevolucion: vigenciaDevolucion,
                tipoVenta: "Pedido",
                detalleVenta_Pedido: carrito.map(item => {
                    const precioActual = getPrecioActual(item.producto);
                    return {
                        productoId: item.producto.id,
                        cantidad: item.cantidad,
                        precioUnitario: precioActual,
                        subtotal: precioActual * item.cantidad
                    };
                })
            };

            const response = await createVentaPedido(pedidoData);
            const createdOrderId = response.id || response.Id || (response.data && response.data.id);

            if (!createdOrderId) {
                throw new Error("No se pudo obtener el ID del pedido creado");
            }

            // Save order details (products) individually since the backend doesn't process them in the main request
            for (const item of carrito) {
                const precioActual = getPrecioActual(item.producto);
                const detalleData = {
                    ventaPedidoId: createdOrderId,
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: precioActual,
                    subtotal: precioActual * item.cantidad
                };
                await createDetalleVentaPedido(detalleData);

                // Actualizar stock del producto (restar cantidad vendida/apartada)
                try {
                    await updateProducto(item.producto.id, {
                        ...item.producto,
                        stock: Math.max(0, item.producto.stock - item.cantidad),
                    });
                } catch (e) {
                    console.error("Error al actualizar el stock del producto:", e);
                }
            }

            if (metodoPago === "Abonos" && abonoInicial > 0) {
                try {
                    const montoRealAbono = Math.min(abonoInicial, calcularTotal());
                    await createAbono({
                        id: 0,
                        ventaPedidoId: createdOrderId,
                        monto: montoRealAbono,
                        metodoPago: "Efectivo",
                        estado: true,
                        saldoRestante: calcularTotal() - montoRealAbono,
                        fecha: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Error registrando abono inicial:", e);
                    toast.error("El pedido se creó pero hubo un error al registrar el abono inicial");
                }
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

    /** En modal: alturas intermedias (equilibrio entre espacio y diálogo manejable) */
    const catPanelH = embedInDialog ? "h-[240px]" : "h-[280px]";
    const catScrollH = embedInDialog ? "h-[250px]" : "h-[320px]";
    const cartScrollH = embedInDialog ? "h-[240px] lg:h-[260px]" : "h-[280px] lg:h-[320px]";
    const cartEmptyH = embedInDialog ? "min-h-[220px]" : "min-h-[260px]";

    const tabsBlock = (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className={cn("grid w-full grid-cols-2 sm:grid-cols-4", embedInDialog ? "mb-4" : "mb-6")}>
                        <TabsTrigger value="cliente">Cliente</TabsTrigger>
                        <TabsTrigger value="productos">Productos</TabsTrigger>
                        <TabsTrigger value="vigencia">Garantía</TabsTrigger>
                        <TabsTrigger value="entrega">Entrega y pago</TabsTrigger>
                    </TabsList>

                    <div>
                        {/* Contenido Pestaña 1: Cliente */}
                        <TabsContent value="cliente" className="space-y-4 mt-0">
                            <div className="space-y-4 max-w-2xl">
                                <p className="text-sm text-muted-foreground">
                                    Ingrese el documento del cliente para cargar sus datos.
                                </p>

                                <div className="space-y-2">
                                    <Label htmlFor="documento" className="font-medium">Documento</Label>
                                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                                        <div className="relative flex-1 w-full">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="documento"
                                                placeholder="Ej: 123456789"
                                                value={documentoSearch}
                                                onChange={(e) => setDocumentoSearch(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleBuscarCliente()}
                                                className="pl-9 w-full"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleBuscarCliente}
                                            disabled={buscandoCliente}
                                            className="bg-[rgb(21,93,252)] hover:bg-blue-700 shrink-0 w-full sm:w-auto"
                                        >
                                            {buscandoCliente ? "Buscando…" : "Localizar cliente"}
                                        </Button>
                                    </div>
                                </div>

                                {clienteEncontrado ? (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="text-sm font-medium text-emerald-900">Cliente identificado</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-background rounded-md border p-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Nombre</p>
                                                <p className="font-medium capitalize">
                                                    {clienteEncontrado.nombres} {clienteEncontrado.apellidos}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Documento</p>
                                                <p className="font-medium">{clienteEncontrado.tipoDocumento} {clienteEncontrado.numeroDocumento}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Correo</p>
                                                <p className="font-medium">{clienteEncontrado.correo}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Teléfono</p>
                                                <p className="font-medium">{clienteEncontrado.telefono}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Dirección</p>
                                                <p className="font-medium">{clienteEncontrado.direccion || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Barrio</p>
                                                <p className="font-medium">{clienteEncontrado.barrio || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Ciudad</p>
                                                <p className="font-medium">{clienteEncontrado.ciudad || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Departamento</p>
                                                <p className="font-medium">{clienteEncontrado.departamento || "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="min-h-[8rem] rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground bg-muted/30 px-4 text-center">
                                        Busque un cliente para continuar.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="productos" className="mt-0 space-y-4">
                            <div
                                className={cn(
                                    "flex flex-col",
                                    embedInDialog ? "gap-4 lg:flex-row lg:gap-5" : "lg:flex-row gap-6"
                                )}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="border rounded-lg h-full flex flex-col overflow-hidden bg-card">
                                        <div className={cn("border-b bg-muted/40", embedInDialog ? "px-3 py-2" : "px-4 py-3")}>
                                            <h3 className="text-sm font-medium">Catálogo</h3>
                                            <p className="text-xs text-muted-foreground">Escriba al menos 2 caracteres para buscar.</p>
                                        </div>

                                        <div className={cn("border-b", embedInDialog ? "p-2" : "p-3")}>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Nombre del producto…"
                                                    className="pl-9"
                                                    value={searchProducto}
                                                    onChange={(e) => setSearchProducto(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className={cn("flex-1 bg-muted/20", embedInDialog ? "min-h-0" : "min-h-[280px]")}>
                                            {searchProducto.length < 2 ? (
                                                <div className={cn("flex items-center justify-center text-center px-4 text-sm text-muted-foreground", catPanelH)}>
                                                    Escriba para ver productos disponibles.
                                                </div>
                                            ) : loadingProductos ? (
                                                <div className={cn("flex items-center justify-center text-sm text-muted-foreground", catPanelH)}>
                                                    Cargando…
                                                </div>
                                            ) : productosFiltrados.length === 0 ? (
                                                <div className={cn("flex items-center justify-center text-sm text-muted-foreground", catPanelH)}>
                                                    No hay resultados.
                                                </div>
                                            ) : (
                                                <ScrollArea className={catScrollH}>
                                                    <div className="divide-y bg-background">
                                                        {productosFiltrados.map((p) => (
                                                            <button
                                                                type="button"
                                                                key={p.id}
                                                                className={cn("flex w-full items-center justify-between gap-2 text-left hover:bg-muted/60 transition-colors", embedInDialog ? "p-2.5" : "p-3")}
                                                                onClick={() => agregarAlCarrito(p)}
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium truncate">{p.nombreProducto}</p>
                                                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                                        <span>${getPrecioActual(p).toLocaleString()}</span>
                                                                        <Badge variant="outline" className={cn(
                                                                            "text-xs font-normal",
                                                                            p.stock <= 5 ? "border-amber-200 bg-amber-50 text-amber-800" : ""
                                                                        )}>
                                                                            Stock: {p.stock}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <Plus className="h-4 w-4 shrink-0 text-[rgb(21,93,252)]" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="h-full flex flex-col border rounded-lg overflow-hidden bg-card">
                                        <div className={cn("border-b bg-muted/40 flex items-center justify-between gap-2", embedInDialog ? "px-3 py-2" : "px-4 py-3")}>
                                            <h3 className="text-sm font-medium">Su pedido</h3>
                                            <Badge variant="secondary" className="font-normal">{carrito.length}</Badge>
                                        </div>

                                        <ScrollArea className={cartScrollH}>
                                            {carrito.length === 0 ? (
                                                <div className={cn("flex flex-col items-center justify-center text-muted-foreground gap-2", cartEmptyH)}>
                                                    <ShoppingCart className="h-8 w-8 opacity-50" />
                                                    <p className="text-sm">El carrito está vacío</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {carrito.map((item) => (
                                                        <div key={item.producto.id} className={cn("hover:bg-muted/30", embedInDialog ? "p-2" : "p-3")}>
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{item.producto.nombreProducto}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <div className="flex items-center rounded-md border border-input p-0.5">
                                                                            <button type="button" onClick={() => actualizarCantidad(item.producto.id, -1)} className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-sm text-muted-foreground"><Minus className="h-3.5 w-3.5" /></button>
                                                                            <Input
                                                                                className="w-11 h-7 text-center text-sm border-0 shadow-none p-0 focus-visible:ring-0 [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                                                                                type="number"
                                                                                min="1"
                                                                                max={item.producto.stock}
                                                                                value={item.cantidad || ''}
                                                                                onChange={(e) => setCantidadExacta(item.producto.id, e.target.value)}
                                                                                onBlur={(e) => {
                                                                                    if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                                                                                        setCantidadExacta(item.producto.id, "1");
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <button type="button" onClick={() => actualizarCantidad(item.producto.id, 1)} className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-sm text-muted-foreground"><Plus className="h-3.5 w-3.5" /></button>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm font-medium mt-2">${(getPrecioActual(item.producto) * (Number(item.cantidad) || 0)).toLocaleString()}</p>
                                                                </div>
                                                                <button type="button" onClick={() => eliminarDelCarrito(item.producto.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-md shrink-0" aria-label="Quitar">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>

                                        <div className={cn("border-t bg-muted/20", embedInDialog ? "p-2" : "p-3")}>
                                            <div className={cn("rounded-lg border bg-background flex justify-between items-center", embedInDialog ? "p-2" : "p-3")}>
                                                <span className="text-sm text-muted-foreground">Subtotal</span>
                                                <span className={cn("font-semibold tabular-nums", embedInDialog ? "text-base" : "text-lg")}>${calcularSubtotal().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="vigencia" className="mt-0 space-y-4">
                            <div className="max-w-2xl space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium">Garantía / devoluciones</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Información sobre el plazo máximo para devoluciones de este pedido.
                                    </p>
                                </div>

                                <div className={cn("rounded-lg border space-y-4 bg-blue-50/50 border-blue-100", embedInDialog ? "p-4" : "p-6")}>
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900">Plazo de garantía</h4>
                                            <p className="text-sm text-blue-800 mt-1">
                                                Hay plazo de <strong>un mes (30 días)</strong> para hacer la devolución de los productos de este pedido.
                                            </p>
                                            <p className="text-xs text-blue-600/80 mt-2">
                                                Esta política aplica de manera global para todos los artículos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>


                        <TabsContent value="entrega" className={cn("mt-0", embedInDialog ? "space-y-4" : "space-y-6")}>
                            <div
                                className={cn(
                                    "grid gap-4",
                                    embedInDialog ? "grid-cols-1 lg:grid-cols-2 lg:gap-5" : "grid-cols-1 lg:grid-cols-2 gap-6"
                                )}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-muted/10 p-4 rounded-lg border border-blue-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800">Tipo de entrega</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Seleccione si el cliente retira o se envía.</p>
                                        </div>
                                        <div className="w-[200px]">
                                            <Select value={tipoEntrega} onValueChange={(v: 'domicilio'|'tienda') => {
                                                setTipoEntrega(v);
                                                if (v === 'tienda') setCostoEnvio(0);
                                            }}>
                                                <SelectTrigger className="font-medium bg-white text-blue-600 border-blue-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="domicilio">Envío a domicilio</SelectItem>
                                                    <SelectItem value="tienda">Recogida en tienda</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {tipoEntrega === 'domicilio' ? (
                                      <>
                                        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20">
                                        <div className="space-y-2">
                                            <Label>Departamento</Label>
                                            <Popover open={isDeptPopoverOpen} onOpenChange={setIsDeptPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                                        <span className="truncate">{selectedDepartment || "Seleccionar"}</span>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar departamento..." />
                                                        <CommandList>
                                                            <CommandEmpty>Sin resultados.</CommandEmpty>
                                                            <CommandGroup>
                                                                {departments.map((dept) => (
                                                                    <CommandItem
                                                                        key={dept.id}
                                                                        value={dept.name}
                                                                        onSelect={() => {
                                                                            setSelectedDepartment(dept.name);
                                                                            setDepartamentoEntrega(dept.name);
                                                                            setIsDeptPopoverOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", selectedDepartment === dept.name ? "opacity-100" : "opacity-0")} />
                                                                        {dept.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Ciudad</Label>
                                            <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" disabled={!selectedDepartment} role="combobox" className="w-full justify-between font-normal">
                                                        <span className="truncate">{ciudadEntrega || "Seleccionar"}</span>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar ciudad..." />
                                                        <CommandList>
                                                            <CommandEmpty>Sin resultados.</CommandEmpty>
                                                            <CommandGroup>
                                                                {cities.map((city) => (
                                                                    <CommandItem
                                                                        key={city.id}
                                                                        value={city.name}
                                                                        onSelect={() => {
                                                                            setCiudadEntrega(city.name);
                                                                            setIsCityPopoverOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", ciudadEntrega === city.name ? "opacity-100" : "opacity-0")} />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="barrio-pedido">Barrio</Label>
                                        <Input id="barrio-pedido" placeholder="Ej: Centro" value={barrio} onChange={(e) => setBarrio(e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="direccion-pedido">Dirección de entrega</Label>
                                        <Input id="direccion-pedido" placeholder="Ej: Cra 51A #97-83" value={direccionEntrega} onChange={(e) => setDireccionEntrega(e.target.value)} />
                                    </div>
                                    </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 bg-blue-50/50 border border-blue-100 rounded-lg min-h-[290px]">
                                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Store className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-800 mb-2">Recogida en tienda física</h3>
                                            <p className="text-sm text-muted-foreground max-w-[250px] text-center">
                                                No es necesario ingresar dirección. El cliente debe pasar por el local a retirar su pedido presencialmente.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 rounded-lg border p-4 bg-card">
                                    <h3 className="text-sm font-medium">Pago y totales</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Método de pago</Label>
                                            <Select value={metodoPago} onValueChange={setMetodoPago}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {tipoEntrega === 'domicilio' ? (
                                                        <SelectItem value="Efectivo">Contraentrega (Efectivo)</SelectItem>
                                                    ) : (
                                                        <SelectItem value="Efectivo">Pago en tienda (Efectivo)</SelectItem>
                                                    )}
                                                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                    <SelectItem value="Abonos">Abonos</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Costo de envío</Label>
                                            <Input
                                                type="text"
                                                value={costoEnvio === 0 ? "" : formatCOP(costoEnvio)}
                                                onChange={handleCostoEnvioChange}
                                                placeholder="$ 0"
                                                disabled={tipoEntrega === 'tienda'}
                                            />
                                        </div>
                                        {metodoPago === "Abonos" && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Plazo (meses)</Label>
                                                    <Select value={plazoAbonos.toString()} onValueChange={(v: string) => setPlazoAbonos(parseInt(v))}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">1 mes</SelectItem>
                                                            <SelectItem value="2">2 meses</SelectItem>
                                                            <SelectItem value="3">3 meses</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Abono inicial</Label>
                                                    <Input
                                                        type="text"
                                                        value={abonoInicial === 0 ? "" : formatCOP(abonoInicial)}
                                                        onChange={handleAbonoInicialChange}
                                                        placeholder="$ 0"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="obs-pedido">Observaciones</Label>
                                        <Input id="obs-pedido" placeholder="Notas del pedido…" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                                    </div>

                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">${calcularSubtotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Envío</span>
                                            <span className="font-medium">+ ${Number(costoEnvio).toLocaleString()}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-baseline gap-2 pt-1">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="text-xl font-semibold tabular-nums">${calcularTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
    );

    const footerBlock = (
            <div
                className={cn(
                    "border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                    embedInDialog ? "mt-5 pt-4" : "p-4 sm:p-6"
                )}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={onBack} disabled={guardando}>
                        Cancelar
                    </Button>
                    {activeTab !== "cliente" && (
                        <Button
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => {
                                if (activeTab === "entrega") setActiveTab("vigencia");
                                else if (activeTab === "vigencia") setActiveTab("productos");
                                else if (activeTab === "productos") setActiveTab("cliente");
                            }}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                    {activeTab === "cliente" && (
                        <Button
                            onClick={() => setActiveTab("productos")}
                            disabled={!clienteEncontrado}
                            className="bg-black hover:bg-gray-800 text-white border-none"
                        >
                            Siguiente: productos
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                    {activeTab === "productos" && (
                        <Button
                            onClick={() => setActiveTab("vigencia")}
                            disabled={carrito.length === 0}
                            className="bg-black hover:bg-gray-800 text-white border-none"
                        >
                            Siguiente: garantía
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                    {activeTab === "vigencia" && (
                        <Button
                            onClick={() => setActiveTab("entrega")}
                            className="bg-black hover:bg-gray-800 text-white border-none"
                        >
                            Siguiente: entrega y pago
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                    {activeTab === "entrega" && (
                        <Button
                            onClick={handleGuardarPedido}
                            disabled={guardando || (tipoEntrega === 'domicilio' && (!direccionEntrega || !ciudadEntrega))}
                            className="bg-black hover:bg-gray-800 text-white border-none disabled:opacity-70"
                        >
                            {guardando ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</>
                            ) : (
                                'Finalizar pedido'
                            )}
                        </Button>
                    )}
                </div>
            </div>
    );

    if (embedInDialog) {
        return (
            <div className="w-full" translate="no">
                {tabsBlock}
                {footerBlock}
            </div>
        );
    }

    return (
        <Card className="w-full border shadow-md" translate="no">
            <CardHeader className="space-y-1 pb-4 border-b">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 mt-0.5" aria-label="Volver">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold leading-tight">
                            Crear nuevo pedido
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Complete cada paso para registrar el pedido en el sistema.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {tabsBlock}
            </CardContent>

            {footerBlock}
        </Card>
    );
};
