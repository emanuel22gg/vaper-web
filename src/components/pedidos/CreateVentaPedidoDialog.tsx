import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
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
    MapPin
} from "lucide-react";
import { getUsuarioByDocumento, getProductos, createVentaPedido, getDepartments, getCitiesByDepartment } from "../../services/api";
import { UsuarioDto, Producto, VentaPedidoDto, DepartmentColombian, CityColombian } from "../../types";
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

interface CreateVentaPedidoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateVentaPedidoDialog: React.FC<CreateVentaPedidoDialogProps> = ({
    open,
    onOpenChange,
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
    const [guardando, setGuardando] = useState(false);

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

    const tiposVia = ['Calle', 'Carrera', 'Transversal', 'Diagonal', 'Circular', 'Avenida', 'Pasaje'];

    useEffect(() => {
        if (open) {
            loadProductos();
            fetchDepartments();
        } else {
            resetForm();
        }
    }, [open]);

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

    const resetForm = () => {
        setDocumentoSearch("");
        setClienteEncontrado(null);
        setCarrito([]);
        setMetodoPago("Efectivo");
        setDireccionEntrega("");
        setCiudadEntrega("");
        setDepartamentoEntrega("");
        setBarrio("");
        setSelectedDepartment("");
        setAddrParts({ tipoVia: '', viaPrincipal: '', viaSecundaria: '', placa: '' });
        setCostoEnvio(0);
        setActiveTab("cliente");
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
                // Intentar pre-seleccionar departamento si la ciudad está en la base de datos
                // Nota: La API no nos da el departamento directamente desde el UsuarioDto,
                // así que el usuario deberá seleccionarlo si desea cambiar la ciudad.
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
            const mappedDetails = carrito.map((item) => ({
                productoId: item.producto.id,
                idProducto: item.producto.id, // Alternativa
                cantidad: item.cantidad,
                precioUnitario: item.producto.precio,
                subtotal: item.producto.precio * item.cantidad
            }));

            const nuevoPedido: VentaPedidoDto = {
                usuarioId: clienteEncontrado.id,
                estadoId: 1, // Pendiente
                metodoPago: metodoPago,
                direccionEntrega: direccionEntrega,
                ciudadEntrega: ciudadEntrega,
                departamentoEntrega: departamentoEntrega,
                barrio: barrio,
                subtotal: calcularSubtotal(),
                envio: Number(costoEnvio),
                total: calcularTotal(),
                // Enviamos bajo todos los nombres posibles para asegurar captura por el backend
                detalleVentaPedidos: mappedDetails,
                DetalleVentaPedidos: mappedDetails,
                detallePedidos: mappedDetails,
                DetallePedidos: mappedDetails
            };

            console.log("GUARDANDO PEDIDO (Payload):", JSON.stringify(nuevoPedido, null, 2));
            const response = await createVentaPedido(nuevoPedido);
            console.log("RESPUESTA SERVIDOR:", response);
            toast.success("Pedido creado exitosamente");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating order:", error);
            toast.error("Error al guardar el pedido");
        } finally {
            setGuardando(false);
        }
    };

    const productosFiltrados = productosDisponibles.filter(p =>
        p.nombreProducto.toLowerCase().includes(searchProducto.toLowerCase()) && p.estado
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Crear Nuevo Pedido
                    </DialogTitle>
                    <DialogDescription>
                        Siga los pasos para registrar un nuevo pedido.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 border-b">
                            <TabsList className="grid w-full grid-cols-3 mb-2 bg-transparent">
                                <TabsTrigger value="cliente" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none shadow-none bg-transparent">
                                    1. Cliente
                                </TabsTrigger>
                                <TabsTrigger value="productos" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none shadow-none bg-transparent">
                                    2. Productos
                                </TabsTrigger>
                                <TabsTrigger value="entrega" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none shadow-none bg-transparent">
                                    3. Entrega & Pago
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Contenido Pestaña 1: Cliente */}
                            <TabsContent value="cliente" className="space-y-6 mt-0 focus-visible:outline-none">
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                        <User className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900">Buscar Cliente</p>
                                            <p className="text-xs text-blue-700">Ingrese el número de cédula del cliente para cargar sus datos automáticamente.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="documento" className="text-sm font-bold text-gray-600 ml-1">Número de Cédula / Documento</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="documento"
                                                    placeholder="Ingrese la cédula para buscar..."
                                                    value={documentoSearch}
                                                    onChange={(e) => setDocumentoSearch(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleBuscarCliente()}
                                                    className="pl-10 h-11 text-base shadow-sm border-gray-200 focus:border-blue-400"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleBuscarCliente} disabled={buscandoCliente} className="h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-md">
                                            {buscandoCliente ? "Buscando..." : "Localizar Cliente"}
                                        </Button>
                                    </div>

                                    {clienteEncontrado ? (
                                        <div className="p-4 border-2 border-green-100 bg-green-50/50 rounded-xl animate-in zoom-in-95 duration-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <span className="font-bold text-green-900">Cliente Identificado</span>
                                            </div>
                                            <div className="space-y-3 mt-4 text-sm bg-white p-4 rounded-lg border">
                                                <div className="flex justify-between border-b pb-1">
                                                    <span className="text-muted-foreground font-medium">Nombres:</span>
                                                    <span className="font-bold text-gray-900">{clienteEncontrado.nombres} {clienteEncontrado.apellidos}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-1">
                                                    <span className="text-muted-foreground font-medium">Correo:</span>
                                                    <span className="font-bold text-gray-900">{clienteEncontrado.correo}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-1">
                                                    <span className="text-muted-foreground font-medium">Teléfono:</span>
                                                    <span className="font-bold text-gray-900">{clienteEncontrado.telefono}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground font-medium">Dirección Base:</span>
                                                    <span className="font-bold text-gray-900">{clienteEncontrado.direccion || "No registrada"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-sm italic">
                                            No se ha seleccionado un cliente aún.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="productos" className="space-y-6 mt-0 focus-visible:outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-700 ml-1 flex items-center gap-2">
                                                <Search className="h-3 w-3 text-blue-500" /> Catálogo
                                            </Label>
                                            <Input
                                                placeholder="Buscar..."
                                                className="h-9 text-sm px-3 shadow-sm border-gray-200"
                                                value={searchProducto}
                                                onChange={(e) => setSearchProducto(e.target.value)}
                                            />
                                        </div>
                                        <ScrollArea className="h-[350px] border rounded-xl bg-gray-50/30 p-2">
                                            {loadingProductos ? (
                                                <div className="h-full flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
                                                    <Package className="h-10 w-10 mb-2 opacity-20" />
                                                    <p>Cargando productos...</p>
                                                </div>
                                            ) : searchProducto.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60 p-12 text-center">
                                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                                        <Search className="h-8 w-8 text-blue-400" />
                                                    </div>
                                                    <p className="font-bold text-gray-800">Escriba para buscar</p>
                                                    <p className="text-xs max-w-[200px]">Ingrese el nombre o categoría del producto que desea añadir.</p>
                                                </div>
                                            ) : productosFiltrados.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60 p-12 text-center">
                                                    <Search className="h-10 w-10 mb-2 opacity-20" />
                                                    <p className="font-bold text-gray-800">Sin coincidencias</p>
                                                    <p className="text-xs">No encontramos "{searchProducto}" en el catálogo.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {productosFiltrados.map((p) => (
                                                        <div
                                                            key={p.id}
                                                            className="flex items-center justify-between p-4 bg-white border border-transparent rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                                                            onClick={() => agregarAlCarrito(p)}
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.nombreProducto}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-sm text-blue-600 font-extrabold">${p.precio.toLocaleString()}</span>
                                                                    <Badge variant="outline" className="text-[9px] font-bold py-0 leading-tight border-blue-100 text-blue-500">STOCK: {p.stock}</Badge>
                                                                </div>
                                                            </div>
                                                            <div className="bg-blue-50 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                <Plus className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>

                                    {/* Carrito */}
                                    <div className="space-y-4 flex flex-col h-full">
                                        <div className="flex items-center gap-2 px-1">
                                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                                            <h4 className="font-bold text-sm text-gray-700">Resumen del Carrito</h4>
                                        </div>
                                        <ScrollArea className="flex-1 h-[250px] border rounded-lg p-2 bg-white">
                                            {carrito.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2 p-8">
                                                    <Package className="h-8 w-8" />
                                                    <p className="text-xs text-center">El carrito está vacío. Seleccione productos del catálogo.</p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableBody>
                                                        {carrito.map((item) => (
                                                            <TableRow key={item.producto.id} className="text-xs">
                                                                <TableCell className="p-2 font-medium">{item.producto.nombreProducto}</TableCell>
                                                                <TableCell className="p-2">
                                                                    <div className="flex items-center gap-1 border rounded-md px-1 w-fit bg-gray-50">
                                                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => actualizarCantidad(item.producto.id, -1)}><Minus className="h-3 w-3" /></Button>
                                                                        <span className="min-w-[12px] text-center">{item.cantidad}</span>
                                                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => actualizarCantidad(item.producto.id, 1)}><Plus className="h-3 w-3" /></Button>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="p-2 text-right">
                                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => eliminarDelCarrito(item.producto.id)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </ScrollArea>
                                        <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-500">SUBTOTAL</span>
                                            <span className="text-lg font-bold text-gray-900">${calcularSubtotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Contenido Pestaña 3: Entrega */}
                            <TabsContent value="entrega" className="space-y-6 mt-0 focus-visible:outline-none">
                                <div className="space-y-6 max-w-[500px] mx-auto">
                                    <div className="space-y-5">
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <MapPin className="h-4 w-4 text-blue-600" /> Dirección de Entrega
                                            </Label>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Departamento *</Label>
                                                    <Popover open={isDeptPopoverOpen} onOpenChange={setIsDeptPopoverOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className="w-full justify-between text-xs h-9"
                                                            >
                                                                {selectedDepartment || "Seleccionar"}
                                                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar..." className="h-8 text-xs" />
                                                                <CommandList>
                                                                    <CommandEmpty className="text-xs p-2">No encontrado.</CommandEmpty>
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
                                                                                className="text-xs"
                                                                            >
                                                                                <Check className={cn("mr-2 h-3 w-3", selectedDepartment === dept.name ? "opacity-100" : "opacity-0")} />
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
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Ciudad *</Label>
                                                    <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
                                                        {/* ... Popover content stays same ... */}
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                disabled={!selectedDepartment}
                                                                className="w-full justify-between text-xs h-9"
                                                            >
                                                                {ciudadEntrega || "Seleccionar"}
                                                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar..." className="h-8 text-xs" />
                                                                <CommandList>
                                                                    <CommandEmpty className="text-xs p-2">No encontrada.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {cities.map((city) => (
                                                                            <CommandItem
                                                                                key={city.id}
                                                                                value={city.name}
                                                                                onSelect={() => {
                                                                                    setCiudadEntrega(city.name);
                                                                                    setIsCityPopoverOpen(false);
                                                                                }}
                                                                                className="text-xs"
                                                                            >
                                                                                <Check className={cn("mr-2 h-3 w-3", ciudadEntrega === city.name ? "opacity-100" : "opacity-0")} />
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
                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Barrio</Label>
                                                <Input
                                                    className="h-9 text-xs"
                                                    placeholder="Ej: El Poblado"
                                                    value={barrio}
                                                    onChange={(e) => setBarrio(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2 p-3 border rounded-lg bg-gray-50/50">
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div className="col-span-2 space-y-1">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Vía</Label>
                                                        <Select value={addrParts.tipoVia} onValueChange={(v: string) => setAddrParts({ ...addrParts, tipoVia: v })}>
                                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                            <SelectContent>{tiposVia.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">N° Principal</Label>
                                                        <Input className="h-8 text-xs font-medium" value={addrParts.viaPrincipal} onChange={(e) => setAddrParts({ ...addrParts, viaPrincipal: e.target.value })} />
                                                    </div>
                                                    <div className="flex items-end justify-center pb-2 text-gray-400 font-bold">#</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Secundaria</Label>
                                                        <Input className="h-8 text-xs font-medium" value={addrParts.viaSecundaria} onChange={(e) => setAddrParts({ ...addrParts, viaSecundaria: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Placa / Apto</Label>
                                                        <Input className="h-8 text-xs font-medium" value={addrParts.placa} onChange={(e) => setAddrParts({ ...addrParts, placa: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t mt-1">
                                                    <p className="text-[10px] font-bold text-blue-600 truncate">Dirección: {direccionEntrega || "..."}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3 text-green-600" /> Pago
                                                </Label>
                                                <Select value={metodoPago} onValueChange={setMetodoPago}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Efectivo" className="text-xs">Efectivo</SelectItem>
                                                        <SelectItem value="Transferencia" className="text-xs">Transferencia</SelectItem>
                                                        <SelectItem value="Abonos" className="text-xs">Abonos</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                                                    <Truck className="h-3 w-3 text-orange-600" /> Envío
                                                </Label>
                                                <Input type="number" value={costoEnvio} onChange={(e) => setCostoEnvio(Number(e.target.value))} className="h-8 text-xs font-bold" />
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Subtotal</span>
                                                <span className="text-sm font-bold text-gray-700">${calcularSubtotal().toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Envío</span>
                                                <span className="text-sm font-bold text-orange-600">+ ${Number(costoEnvio).toLocaleString()}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-900 font-black uppercase tracking-tighter">TOTAL A PAGAR</span>
                                                <span className="text-xl font-black text-blue-600">${calcularTotal().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="p-6 border-t bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {activeTab !== "cliente" && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    if (activeTab === "entrega") setActiveTab("productos");
                                    else if (activeTab === "productos") setActiveTab("cliente");
                                }}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
                            Cancelar
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === "cliente" && (
                            <Button
                                onClick={() => setActiveTab("productos")}
                                disabled={!clienteEncontrado}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                        {activeTab === "productos" && (
                            <Button
                                onClick={() => setActiveTab("entrega")}
                                disabled={carrito.length === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                        {activeTab === "entrega" && (
                            <Button
                                onClick={handleGuardarPedido}
                                disabled={guardando || !direccionEntrega}
                                className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-sm"
                            >
                                {guardando ? "Guardando..." : "Confirmar Pedido"}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
