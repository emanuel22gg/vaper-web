import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { GestionUsuarios } from "@/features/admin/components/GestionUsuarios";
import { GestionRoles } from "@/features/admin/components/GestionRoles";
import { UserProfile } from "@/features/admin/components/UserProfile";
import { Proveedores } from "@/features/products/components/Proveedores";
import { Compras } from "@/features/sales/components/Compras";
import { Clientes } from "@/features/clients/components/Clientes";
import { Pedidos } from "@/features/sales/components/Pedidos";
import { Ventas } from "@/features/sales/components/Ventas";
import { Productos } from "@/features/products/components/Productos";
import { Categorias } from "@/features/products/components/Categorias";
import { Cotizaciones } from "@/features/sales/components/CotizacionesMejoradas";
import { Devoluciones } from "@/features/sales/components/Devoluciones";
import { Cartera } from "@/features/sales/components/Cartera";
import { AbonosIndividuales } from "@/features/sales/components/AbonosIndividuales";
import { getVentaPedidos, getCompras, getProductos, getCategorias, getDetalleVentaPedidos } from "@/shared/services/api";
import { VentaPedidoDto, CompraDto, Producto, Categoria } from "@/shared/types";

import { TiendaCliente } from "@/features/public/components/TiendaCliente";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Crown,
  Briefcase,
  UserCircle,
  Calendar,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

// --- DATOS REALES PROCESADOS DESDE LA API ---


const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
];

interface DashboardProps {
  onAdminNavigate?: (view: string) => void;
  activeAdminView?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAdminNavigate,
  activeAdminView,
}) => {
  const { user } = useAuth();
  // Generar opciones de meses dinámicamente (últimos 12 meses)
  const getMesesOpciones = () => {
    const opciones = [];
    const fechaActual = new Date();
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    for (let i = 0; i < 12; i++) {
      const d = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const mesNum = (d.getMonth() + 1).toString().padStart(2, '0');
      const anio = d.getFullYear();
      opciones.push({
        valor: `${anio}-${mesNum}`,
        etiqueta: `${meses[d.getMonth()]} ${anio}`
      });
    }
    return opciones;
  };

  const mesesOpciones = getMesesOpciones();
  const mesActualStr = mesesOpciones[0].valor;

  const [activeView, setActiveView] = useState("dashboard");
  const [anioVentasFiltro, setAnioVentasFiltro] = useState(new Date().getFullYear().toString());
  const [mesComprasFiltro, setMesComprasFiltro] = useState(mesActualStr);
  const [mesVentasFiltro, setMesVentasFiltro] = useState(mesActualStr);
  const [dashboardPage, setDashboardPage] = useState(1); // Estado para paginación del dashboard

  // Estados para datos reales
  const [realPedidos, setRealPedidos] = useState<VentaPedidoDto[]>([]);
  const [realCompras, setRealCompras] = useState<CompraDto[]>([]);
  const [realProductos, setRealProductos] = useState<Producto[]>([]);
  const [realCategorias, setRealCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [pedidosData, comprasData, productosData, categoriasData, detallesData] = await Promise.all([
          getVentaPedidos(),
          getCompras(),
          getProductos(),
          getCategorias(),
          getDetalleVentaPedidos()
        ]);

        // Unir detalles con pedidos
        const pedidosConDetalles = pedidosData.map(pedido => ({
          ...pedido,
          detalleVenta_Pedido: detallesData.filter((d: any) => d.ventaPedidoId === pedido.id)
        }));

        setRealPedidos(pedidosConDetalles);
        setRealCompras(comprasData);
        setRealProductos(productosData);
        setRealCategorias(categoriasData);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Auto-ajustar el mes inicial basado en los datos disponibles
  useEffect(() => {
    if (!loading && realPedidos.length > 0) {
      // Si el mes actual no tiene ventas, buscamos el mes más reciente con datos
      const tieneDatosMesActual = realPedidos.some(p => {
        if (!p.fechaCreacion) return false;
        const d = new Date(p.fechaCreacion);
        const mesVal = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        return mesVal === mesVentasFiltro;
      });

      if (!tieneDatosMesActual) {
        // Encontrar el mes más reciente en los pedidos
        const mesesConDatos = realPedidos
          .filter(p => p.fechaCreacion)
          .map(p => {
            const d = new Date(p.fechaCreacion!);
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          })
          .sort((a, b) => b.localeCompare(a));

        if (mesesConDatos.length > 0) {
          const mejorMes = mesesConDatos[0];
          setMesVentasFiltro(mejorMes);
          setMesComprasFiltro(mejorMes);
        }
      }
    }
  }, [loading, realPedidos.length]);

  // Estados para manejar navegación a detalles
  const [detailView, setDetailView] = useState<{
    type: string;
    id: string;
  } | null>(null);

  // Estado para sub-vistas (ej. cobrar desde cartera)
  const [subViewPedido, setSubViewPedido] = useState<VentaPedidoDto | null>(null);

  // Establecer la vista inicial basada en permisos o usar el prop activeAdminView
  useEffect(() => {
    if (activeAdminView) {
      setActiveView(activeAdminView);
    } else if (hasPermission("Ver Dashboard")) {
      setActiveView("dashboard");
    } else if (user?.role.name === "Cliente") {
      setActiveView("tienda");
    } else if (hasPermission("Gestionar Usuarios")) {
      setActiveView("usuarios");
    } else if (hasPermission("Gestionar Pedidos")) {
      setActiveView("pedidos");
    } else if (hasPermission("Gestionar Ventas")) {
      setActiveView("ventas");
    } else if (hasPermission("Gestionar Productos")) {
      setActiveView("productos");
    } else if (hasPermission("Gestionar Compras")) {
      setActiveView("compras");
    } else {
      setActiveView("profile");
    }
  }, [activeAdminView, user]);

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role.name) {
      case "Super Administrador":
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case "Administrador":
        return <Shield className="h-5 w-5 text-amber-400" />;
      case "Empleado":
        return <Briefcase className="h-5 w-5 text-blue-400" />;
      default:
        return (
          <UserCircle className="h-5 w-5 text-green-400" />
        );
    }
  };

  const getRoleColor = () => {
    switch (user.role.name) {
      case "Super Administrador":
        return "bg-yellow-600";
      case "Administrador":
        return "bg-amber-500";
      case "Empleado":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const hasPermission = (permissionName: string) => {
    if (
      user.role.name === "Super Administrador" ||
      user.role.name === "Administrador" ||
      user.role.name === "Admin"
    ) return true;
    return user.role.permissions.some(
      (p) => p.name === permissionName,
    );
  };

  const isClient = user.role.name === "Cliente" && !hasPermission("Ver Dashboard");

  const getViewTitle = () => {
    if (detailView) {
      switch (detailView.type) {
        case "nota-credito":
          return `Detalle Nota de Crédito NC-${detailView.id.padStart(3, "0")}`;
        default:
          return "Detalle";
      }
    }

    switch (activeView) {
      case "dashboard":
        return "Dashboard Principal";
      case "usuarios":
        return "Gestión de Usuarios";
      case "roles":
        return "Roles y Permisos";
      case "proveedores":
        return "Gestión de Proveedores";
      case "categorias":
        return "Gestión de Categorías";
      case "productos":
        return "Gestión de Productos";
      case "compras":
        return "Gestión de Compras";
      case "clientes":
        return "Gestión de Clientes";
      case "cotizaciones":
        return "Gestión de Cotizaciones";
      case "pedidos":
        return "Gestión de Pedidos";
      case "ventas":
        return "Gestión de Ventas";
      case "devoluciones":
        return "Gestión de Devoluciones";

      case "tienda":
        return "Tienda Online";
      case "profile":
        return "Mi Perfil";
      case "cartera":
        return subViewPedido ? `Abonos del Pedido #${subViewPedido.id}` : "Cartera de Clientes";
      default:
        return "Dashboard";
    }
  };

  // --- FUNCIONES DE PROCESAMIENTO DE DATOS REALES ---

  const MESES_NOMBRES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  const getAniosDisponibles = () => {
    const anios = new Set<string>();
    realPedidos.forEach(pedido => {
      if (pedido.fechaCreacion && (pedido.estadoId === 1 || pedido.estadoId === 5)) {
        anios.add(new Date(pedido.fechaCreacion).getFullYear().toString());
      }
    });
    // Siempre incluir el año actual
    anios.add(new Date().getFullYear().toString());
    return Array.from(anios).sort((a, b) => Number(b) - Number(a));
  };

  const getVentasFiltradas = () => {
    // Inicializar los 12 meses en 0
    const ventasPorMes: { [key: number]: number } = {};
    for (let i = 0; i < 12; i++) ventasPorMes[i] = 0;

    realPedidos.forEach(pedido => {
      if (pedido.fechaCreacion && (pedido.estadoId === 1 || pedido.estadoId === 5)) {
        const d = new Date(pedido.fechaCreacion);
        if (d.getFullYear().toString() === anioVentasFiltro) {
          ventasPorMes[d.getMonth()] += pedido.total;
        }
      }
    });

    return MESES_NOMBRES.map((mes, i) => ({
      mes,
      ventas: ventasPorMes[i]
    }));
  };

  const getStockCategoriasReal = () => {
    const stockMap: { [key: number]: { stock: number, valor: number, count: number } } = {};

    realProductos.forEach(p => {
      const catId = p.categoriaId;
      if (!stockMap[catId]) {
        stockMap[catId] = { stock: 0, valor: 0, count: 0 };
      }
      stockMap[catId].stock += p.stock;
      stockMap[catId].valor += p.stock * p.precio;
      stockMap[catId].count += 1;
    });

    return realCategorias.map((cat, index) => ({
      categoria: cat.nombreCategoria,
      stock: stockMap[cat.id]?.stock || 0,
      valor: COLORS[index % COLORS.length],
      totalProductos: stockMap[cat.id]?.count || 0,
      valorInventario: stockMap[cat.id]?.valor || 0
    })).filter(c => c.stock > 0);
  };

  const getProductosVendidosFiltrados = () => {
    const productSales: { [key: number]: { nombre: string, ventas: number, ingresos: number, categoria: string } } = {};
    const [yearFiltro, monthFiltro] = mesVentasFiltro.split("-");

    realPedidos.forEach(pedido => {
      if (pedido.fechaCreacion && (pedido.estadoId === 1 || pedido.estadoId === 5)) {
        const d = new Date(pedido.fechaCreacion);
        const pedidoYear = d.getFullYear().toString();
        const pedidoMonth = (d.getMonth() + 1).toString().padStart(2, '0');

        if (pedidoYear === yearFiltro && pedidoMonth === monthFiltro) {
          pedido.detalleVenta_Pedido?.forEach(detalle => {
            const prodId = detalle.productoId;
            if (!productSales[prodId]) {
              const pInfo = realProductos.find(p => p.id === prodId);
              productSales[prodId] = {
                nombre: pInfo?.nombreProducto || `Producto ${prodId}`,
                ventas: 0,
                ingresos: 0,
                categoria: realCategorias.find(c => c.id === pInfo?.categoriaId)?.nombreCategoria || "Sin categoría"
              };
            }
            productSales[prodId].ventas += detalle.cantidad;
            productSales[prodId].ingresos += detalle.subtotal;
          });
        }
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 5);
  };

  const getComprasFiltradas = () => {
    const productPurchases: { [key: number]: { nombre: string, cantidad: number, costo: number, categoria: string, proveedor: string } } = {};
    const [yearFiltro, monthFiltro] = mesComprasFiltro.split("-");

    realCompras.forEach(compra => {
      if (compra.fechaCompra && compra.estado === 1) {
        const d = new Date(compra.fechaCompra);
        const compraYear = d.getFullYear().toString();
        const compraMonth = (d.getMonth() + 1).toString().padStart(2, '0');

        if (compraYear === yearFiltro && compraMonth === monthFiltro) {
          compra.detalleCompras?.forEach(detalle => {
            const prodId = detalle.productoId;
            if (!productPurchases[prodId]) {
              const pInfo = realProductos.find(p => p.id === prodId);
              productPurchases[prodId] = {
                nombre: pInfo?.nombreProducto || `Producto ${prodId}`,
                cantidad: 0,
                costo: 0,
                categoria: realCategorias.find(c => c.id === pInfo?.categoriaId)?.nombreCategoria || "Sin categoría",
                proveedor: "Proveedor"
              };
            }
            productPurchases[prodId].cantidad += detalle.cantidad;
            productPurchases[prodId].costo += detalle.subtotal;
          });
        }
      }
    });

    return Object.values(productPurchases)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  const getNombreMes = (fechaMes: string) => {
    const meses = {
      "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
      "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
      "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
    };
    const [year, month] = fechaMes.split("-");
    const mesNombre = meses[month as keyof typeof meses];
    return `${mesNombre || month} ${year}`;
  };

  // --- CÁLCULOS PARA LA UI ---
  const ventasParaGrafica = getVentasFiltradas();
  const aniosDisponibles = getAniosDisponibles();
  const stockCategoriasData = getStockCategoriasReal();
  const ventasProductosParaGrafica = getProductosVendidosFiltrados();
  const comprasParaGrafica = getComprasFiltradas();

  const totalVentasAnio = ventasParaGrafica.reduce((sum, item) => sum + item.ventas, 0);

  const mejorMes =
    ventasParaGrafica.some(v => v.ventas > 0)
      ? ventasParaGrafica.reduce((prev, current) =>
        prev.ventas > current.ventas ? prev : current,
      )
      : null;

  const totalCompras = realCompras.reduce((sum, item) => item.estado === 1 ? sum + item.total : sum, 0);
  const productosComprados = realCompras.reduce((sum, item) => item.estado === 1 ? sum + (item.detalleCompras?.reduce((s, d) => s + d.cantidad, 0) || 0) : sum, 0);

  const totalVentas = realPedidos.reduce((sum, item) => (item.estadoId === 1 || item.estadoId === 5) ? sum + item.total : sum, 0);
  const productosVendidosTotal = realPedidos.reduce((sum, item) => (item.estadoId === 1 || item.estadoId === 5) ? sum + (item.detalleVenta_Pedido?.reduce((s, d) => s + d.cantidad, 0) || 0) : sum, 0);

  // Función para manejar navegación interna y notificar al padre
  const handleViewChange = (view: string) => {
    setActiveView(view);
    setDetailView(null); // Limpiar vista de detalle cuando cambia la vista principal
    setSubViewPedido(null); // Limpiar sub-vistas
    if (onAdminNavigate) {
      onAdminNavigate(view);
    }
  };



  // Función para volver a la lista
  const handleBackToList = () => {
    setDetailView(null);
  };

  // Componente para mostrar "En desarrollo"
  const ComingSoon = ({ module }: { module: string }) => (
    <Card className="text-center py-16">
      <CardContent>
        <div className="text-6xl mb-4">🚧</div>
        <CardTitle className="mb-2">
          Módulo en Desarrollo
        </CardTitle>
        <CardDescription>
          El módulo de {module} estará disponible próximamente.
        </CardDescription>
      </CardContent>
    </Card>
  );

  // Si es cliente, mostrar interfaz simplificada
  if (isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main Content para Cliente */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getRoleIcon()}
                    <span>¡Hola, {user.firstName}!</span>
                  </CardTitle>
                  <CardDescription>
                    Descubre nuestros productos premium
                  </CardDescription>
                </div>
                <Badge className={getRoleColor()}>
                  {user.role.name}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Contenido basado en la vista activa */}
          {activeView === "tienda" && <TiendaCliente />}
          {activeView === "profile" && <UserProfile />}
        </main>
      </div>
    );
  }

  // Renderizar contenido basado en la vista activa
  const renderContent = () => {
    // Si hay una vista de detalle activa, mostrarla
    if (detailView) {
      switch (detailView.type) {

        default:
          return <div>Vista no encontrada</div>;
      }
    }

    // Renderizar vista principal
    switch (activeView) {
      case "usuarios":
        return hasPermission("Gestionar Usuarios") ? (
          <GestionUsuarios />
        ) : (
          <div>Sin permisos</div>
        );
      case "roles":
        return hasPermission("Gestionar Roles") ? (
          <GestionRoles />
        ) : (
          <div>Sin permisos</div>
        );
      case "proveedores":
        return hasPermission("Gestionar Proveedores") ||
          hasPermission("Ver Proveedores") ? (
          <Proveedores />
        ) : (
          <div>Sin permisos</div>
        );
      case "categorias":
        return hasPermission("Gestionar Categorías") ? (
          <Categorias />
        ) : (
          <div>Sin permisos</div>
        );
      case "productos":
        return hasPermission("Gestionar Productos") ? (
          <Productos />
        ) : (
          <div>Sin permisos</div>
        );
      case "compras":
        return hasPermission("Gestionar Compras") ? (
          <Compras />
        ) : (
          <div>Sin permisos</div>
        );
      case "clientes":
        return hasPermission("Gestionar Clientes") ? (
          <Clientes />
        ) : (
          <div>Sin permisos</div>
        );
      case "cotizaciones":
        return hasPermission("Gestionar Cotizaciones") ? (
          <Cotizaciones />
        ) : (
          <div>Sin permisos</div>
        );
      case "pedidos":
        return hasPermission("Gestionar Pedidos") ? (
          <Pedidos />
        ) : (
          <div>Sin permisos</div>
        );
      case "ventas":
        return hasPermission("Gestionar Ventas") ? (
          <Ventas />
        ) : (
          <div>Sin permisos</div>
        );
      case "devoluciones":
        return hasPermission("Gestionar Devoluciones") ? (
          <Devoluciones />
        ) : (
          <div>Sin permisos</div>
        );
      case "cartera":
        return hasPermission("Gestionar Pedidos") ? (
          subViewPedido ? (
            <AbonosIndividuales
              pedido={subViewPedido}
              onBack={() => setSubViewPedido(null)}
            />
          ) : (
            <Cartera onVerAbonos={(p) => setSubViewPedido(p)} />
          )
        ) : (
          <div>Sin permisos</div>
        );

      case "profile":
        return <UserProfile />;
      case "dashboard":
        // Renderizar contenido según la página activa
        const renderDashboardPage = () => {
          switch (dashboardPage) {
            case 1:
              return (
                <>
                  {/* Página 1: Ventas Mensuales */}
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-bold mb-4">Análisis de Ventas por Mes</h2>

                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <div className="bg-blue-500 p-2 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                Ventas Mensuales
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Resumen de ventas por mes — Año {anioVentasFiltro}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Select
                              value={anioVentasFiltro}
                              onValueChange={setAnioVentasFiltro}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs border-blue-200 focus:border-blue-400">
                                <SelectValue placeholder="Año" />
                              </SelectTrigger>
                              <SelectContent>
                                {aniosDisponibles.map(anio => (
                                  <SelectItem key={anio} value={anio}>{anio}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {totalVentasAnio === 0 ? (
                          <div className="flex items-center justify-center h-48 text-muted-foreground">
                            <div className="text-center">
                              <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
                                <CalendarDays className="h-10 w-10 text-blue-500" />
                              </div>
                              <p className="text-sm">
                                No hay ventas registradas para el año {anioVentasFiltro}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart data={ventasParaGrafica} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                  <linearGradient id="colorVentasMes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                  dataKey="mes"
                                  tick={{ fontSize: 10 }}
                                  stroke="#6b7280"
                                />
                                <YAxis
                                  tick={{ fontSize: 9 }}
                                  tickFormatter={(value) =>
                                    value >= 1000000
                                      ? `$${(value / 1000000).toFixed(1)}M`
                                      : `$${(value / 1000).toFixed(0)}K`
                                  }
                                  stroke="#6b7280"
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `$${Number(value).toLocaleString('es-CO')}`,
                                    "Ventas",
                                  ]}
                                  labelFormatter={(label) => `Mes: ${label}`}
                                  cursor={{ fill: "rgba(59,130,246,0.08)" }}
                                />
                                <Bar
                                  dataKey="ventas"
                                  fill="url(#colorVentasMes)"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-3 pt-3 border-t flex justify-between">
                              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                <span className="text-xs text-blue-600">Total {anioVentasFiltro}: </span>
                                <span className="text-xs font-semibold text-blue-700">
                                  ${totalVentasAnio.toLocaleString('es-CO')}
                                </span>
                              </div>
                              {mejorMes && mejorMes.ventas > 0 && (
                                <div className="bg-green-50 px-3 py-2 rounded-lg">
                                  <span className="text-xs text-green-600">Mejor mes: </span>
                                  <span className="text-xs font-semibold text-green-700">
                                    {mejorMes.mes}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              );

            case 2:
              return (
                <>
                  {/* Página 2: Stock por Categoría */}
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-bold mb-4">Inventario y Stock por Categoría</h2>

                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                        <div className="flex items-center space-x-2">
                          <div className="bg-purple-500 p-2 rounded-lg">
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              Stock por Categoría
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Distribución del inventario
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Gráfica de pie */}
                          <div className="flex items-center justify-center">
                            <ResponsiveContainer
                              width="100%"
                              height={280}
                            >
                              <PieChart>
                                <Pie
                                  data={stockCategoriasData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ categoria, percent }) =>
                                    `${categoria}: ${(percent * 100).toFixed(0)}%`
                                  }
                                  outerRadius={90}
                                  fill="#8884d8"
                                  dataKey="stock"
                                >
                                  {stockCategoriasData.map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={
                                          COLORS[index % COLORS.length]
                                        }
                                      />
                                    ),
                                  )}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => [
                                    `${value} unidades`,
                                    "Stock",
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Tabla compacta de stock */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium mb-3">Detalle por Categoría</h4>
                            {stockCategoriasData.map(
                              (categoria, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors border"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          categoria.valor,
                                      }}
                                    ></div>
                                    <span className="text-xs font-medium">
                                      {categoria.categoria}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-semibold">
                                      {categoria.stock} un.
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      $
                                      {(
                                        categoria.valorInventario /
                                        1000000
                                      ).toFixed(1)}
                                      M
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              );

            case 3:
              return (
                <>
                  {/* Página 3: Productos Más Vendidos y Comprados */}
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-bold mb-4">Análisis de Productos</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Productos Más Vendidos con Filtro Mensual */}
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex items-center space-x-2">
                              <div className="bg-emerald-500 p-2 rounded-lg">
                                <ShoppingCart className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  Productos Más Vendidos
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Top 5 - {getNombreMes(mesVentasFiltro)}
                                </CardDescription>
                              </div>
                            </div>
                            <Select
                              value={mesVentasFiltro}
                              onValueChange={setMesVentasFiltro}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs border-emerald-200 focus:border-emerald-400">
                                <SelectValue placeholder="Mes" />
                              </SelectTrigger>
                              <SelectContent>
                                {mesesOpciones.map((opcion) => (
                                  <SelectItem key={opcion.valor} value={opcion.valor}>
                                    {opcion.etiqueta}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {ventasProductosParaGrafica.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground">
                              <div className="text-center">
                                <div className="bg-emerald-100 p-4 rounded-full inline-block mb-3">
                                  <Calendar className="h-10 w-10 text-emerald-500" />
                                </div>
                                <p className="text-sm">
                                  No hay datos para el mes seleccionado
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {ventasProductosParaGrafica.map(
                                (producto, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-emerald-300 bg-gradient-to-r from-white to-emerald-50/30"
                                  >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                      <div className="bg-emerald-100 text-emerald-700 rounded-lg px-2 py-1 text-xs font-bold">
                                        #{index + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium truncate">
                                          {producto.nombre}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          {producto.categoria}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right ml-3">
                                      <p className="text-xs font-semibold text-emerald-600">
                                        {producto.ventas} un.
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        $
                                        {(
                                          producto.ingresos / 1000000
                                        ).toFixed(1)}
                                        M
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Productos Más Comprados con Filtro Mensual */}
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex items-center space-x-2">
                              <div className="bg-orange-500 p-2 rounded-lg">
                                <BarChart3 className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  Productos Más Comprados
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Top 5 -{" "}
                                  {getNombreMes(mesComprasFiltro)}
                                </CardDescription>
                              </div>
                            </div>
                            <Select
                              value={mesComprasFiltro}
                              onValueChange={setMesComprasFiltro}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs border-orange-200 focus:border-orange-400">
                                <SelectValue placeholder="Mes" />
                              </SelectTrigger>
                              <SelectContent>
                                {mesesOpciones.map((opcion) => (
                                  <SelectItem key={opcion.valor} value={opcion.valor}>
                                    {opcion.etiqueta}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {comprasParaGrafica.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground">
                              <div className="text-center">
                                <div className="bg-orange-100 p-4 rounded-full inline-block mb-3">
                                  <Calendar className="h-10 w-10 text-orange-500" />
                                </div>
                                <p className="text-sm">
                                  No hay datos para el mes seleccionado
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ResponsiveContainer
                                width="100%"
                                height={200}
                              >
                                <BarChart
                                  data={comprasParaGrafica}
                                  margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 40,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id="colorCompras"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="#f97316"
                                        stopOpacity={0.8}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="#fb923c"
                                        stopOpacity={0.6}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                  />
                                  <XAxis
                                    dataKey="nombre"
                                    tick={{ fontSize: 9 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                    stroke="#6b7280"
                                  />
                                  <YAxis
                                    tick={{ fontSize: 9 }}
                                    tickFormatter={(value) =>
                                      `${value.toLocaleString()}`
                                    }
                                    stroke="#6b7280"
                                  />
                                  <Tooltip
                                    formatter={(value, name) => {
                                      if (name === "cantidad") {
                                        return [
                                          `${Number(value).toLocaleString()} unidades`,
                                          "Cantidad",
                                        ];
                                      }
                                      return [value, name];
                                    }}
                                    labelFormatter={(label) => label}
                                    content={({
                                      active,
                                      payload,
                                      label,
                                    }) => {
                                      if (
                                        active &&
                                        payload &&
                                        payload.length
                                      ) {
                                        const data = payload[0].payload;
                                        return (
                                          <div className="bg-white p-3 border rounded-lg shadow-xl">
                                            <p className="text-xs font-medium">
                                              {label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {data.categoria} -{" "}
                                              {data.proveedor}
                                            </p>
                                            <p className="text-xs font-semibold text-orange-600 mt-1">
                                              Cantidad:{" "}
                                              {data.cantidad.toLocaleString()}{" "}
                                              un.
                                            </p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar
                                    dataKey="cantidad"
                                    fill="url(#colorCompras)"
                                    radius={[8, 8, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                              <div className="mt-3 pt-3 border-t">
                                <div className="bg-orange-50 px-3 py-2 rounded-lg inline-block">
                                  <span className="text-xs text-orange-600">
                                    Total comprado:{" "}
                                  </span>
                                  <span className="text-xs font-semibold text-orange-700">
                                    {productosComprados.toLocaleString()}{" "}
                                    unidades
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              );

            default:
              return (
                <div className="bg-white rounded-lg border p-6">
                  <p className="text-muted-foreground">Página no encontrada</p>
                </div>
              );
          }
        };

        return (
          <div className="space-y-6">
            {/* Título y controles de paginación */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Dashboard Analítico</h1>
                  <p className="text-muted-foreground text-sm">
                    Vista {dashboardPage} de 3 - Análisis y métricas del negocio
                  </p>
                </div>

                {/* Navegación entre páginas */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDashboardPage(Math.max(1, dashboardPage - 1))}
                    disabled={dashboardPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((page) => (
                      <Button
                        key={page}
                        variant={dashboardPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDashboardPage(page)}
                        className={dashboardPage === page ? "bg-[rgb(21,93,252)] hover:bg-blue-700" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDashboardPage(Math.min(3, dashboardPage + 1))}
                    disabled={dashboardPage === 3}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Renderizar contenido paginado */}
            {renderDashboardPage()}
          </div>
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenido principal basado en la vista activa */}
        {loading && activeView === "dashboard" ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Cargando datos reales...</p>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};
