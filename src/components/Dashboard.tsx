import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { GestionUsuarios } from "./GestionUsuarios";
import { GestionRoles } from "./GestionRoles";
import { UserProfile } from "./UserProfile";
import { Proveedores } from "./Proveedores";
import { Compras } from "./Compras";
import { Clientes } from "./Clientes";
import { Pedidos } from "./Pedidos";
import { Ventas } from "./Ventas";
import { Productos } from "./Productos";
import { Categorias } from "./Categorias";
import { Cotizaciones } from "./CotizacionesMejoradas";
import { Devoluciones } from "./Devoluciones";

import { TiendaCliente } from "./TiendaCliente";
import { AdminPanel } from "./AdminPanel";
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
} from "lucide-react";

// Datos simulados para las gráficas (mantener los mismos datos)
const ventasData = [
  { mes: "Ene", ventas: 4200000, meta: 4000000 },
  { mes: "Feb", ventas: 3800000, meta: 4000000 },
  { mes: "Mar", ventas: 5100000, meta: 4500000 },
  { mes: "Abr", ventas: 4700000, meta: 4500000 },
  { mes: "May", ventas: 5300000, meta: 5000000 },
  { mes: "Jun", ventas: 6200000, meta: 5500000 },
];

// Datos de ventas por día (últimas 2 semanas)
const ventasDiariaData = [
  { dia: "Lun 1", ventas: 285000, fecha: "2024-08-01" },
  { dia: "Mar 2", ventas: 320000, fecha: "2024-08-02" },
  { dia: "Mié 3", ventas: 298000, fecha: "2024-08-03" },
  { dia: "Jue 4", ventas: 410000, fecha: "2024-08-04" },
  { dia: "Vie 5", ventas: 520000, fecha: "2024-08-05" },
  { dia: "Sáb 6", ventas: 680000, fecha: "2024-08-06" },
  { dia: "Dom 7", ventas: 590000, fecha: "2024-08-07" },
  { dia: "Lun 8", ventas: 295000, fecha: "2024-08-08" },
  { dia: "Mar 9", ventas: 335000, fecha: "2024-08-09" },
  { dia: "Mié 10", ventas: 312000, fecha: "2024-08-10" },
  { dia: "Jue 11", ventas: 425000, fecha: "2024-08-11" },
  { dia: "Vie 12", ventas: 545000, fecha: "2024-08-12" },
  { dia: "Sáb 13", ventas: 715000, fecha: "2024-08-13" },
  { dia: "Dom 14", ventas: 620000, fecha: "2024-08-14" },
];

// Datos ampliados para mostrar más fechas cuando se filtra
const ventasDiariaCompleta = [
  { dia: "Lun 15", ventas: 310000, fecha: "2024-08-15" },
  { dia: "Mar 16", ventas: 380000, fecha: "2024-08-16" },
  { dia: "Mié 17", ventas: 420000, fecha: "2024-08-17" },
  { dia: "Jue 18", ventas: 465000, fecha: "2024-08-18" },
  { dia: "Vie 19", ventas: 580000, fecha: "2024-08-19" },
  { dia: "Sáb 20", ventas: 750000, fecha: "2024-08-20" },
  { dia: "Dom 21", ventas: 650000, fecha: "2024-08-21" },
  { dia: "Lun 22", ventas: 330000, fecha: "2024-08-22" },
  { dia: "Mar 23", ventas: 395000, fecha: "2024-08-23" },
  { dia: "Mié 24", ventas: 445000, fecha: "2024-08-24" },
  { dia: "Jue 25", ventas: 520000, fecha: "2024-08-25" },
  { dia: "Vie 26", ventas: 615000, fecha: "2024-08-26" },
  { dia: "Sáb 27", ventas: 780000, fecha: "2024-08-27" },
  { dia: "Dom 28", ventas: 680000, fecha: "2024-08-28" },
  ...ventasDiariaData,
];

const comprasData = [
  { mes: "Ene", compras: 2800000, presupuesto: 3000000 },
  { mes: "Feb", compras: 2500000, presupuesto: 3000000 },
  { mes: "Mar", compras: 3200000, presupuesto: 3500000 },
  { mes: "Abr", compras: 2900000, presupuesto: 3500000 },
  { mes: "May", compras: 3400000, presupuesto: 3800000 },
  { mes: "Jun", compras: 3800000, presupuesto: 4000000 },
];

// Datos de ganancias comparativas con mes anterior
const gananciasComparativasData = [
  {
    mes: "Ene",
    gananciaMesActual: 1400000,
    gananciaMesAnterior: 1200000,
    gastos: 2800000,
    diferencia: 200000,
    porcentajeCrecimiento: 16.7,
  },
  {
    mes: "Feb",
    gananciaMesActual: 1300000,
    gananciaMesAnterior: 1400000,
    gastos: 2500000,
    diferencia: -100000,
    porcentajeCrecimiento: -7.1,
  },
  {
    mes: "Mar",
    gananciaMesActual: 1900000,
    gananciaMesAnterior: 1300000,
    gastos: 3200000,
    diferencia: 600000,
    porcentajeCrecimiento: 46.2,
  },
  {
    mes: "Abr",
    gananciaMesActual: 1800000,
    gananciaMesAnterior: 1900000,
    gastos: 2900000,
    diferencia: -100000,
    porcentajeCrecimiento: -5.3,
  },
  {
    mes: "May",
    gananciaMesActual: 1900000,
    gananciaMesAnterior: 1800000,
    gastos: 3400000,
    diferencia: 100000,
    porcentajeCrecimiento: 5.6,
  },
  {
    mes: "Jun",
    gananciaMesActual: 2400000,
    gananciaMesAnterior: 1900000,
    gastos: 3800000,
    diferencia: 500000,
    porcentajeCrecimiento: 26.3,
  },
];

const gananciasData = [
  { mes: "Ene", ganancia: 1400000, gastos: 2800000 },
  { mes: "Feb", ganancia: 1300000, gastos: 2500000 },
  { mes: "Mar", ganancia: 1900000, gastos: 3200000 },
  { mes: "Abr", ganancia: 1800000, gastos: 2900000 },
  { mes: "May", ganancia: 1900000, gastos: 3400000 },
  { mes: "Jun", ganancia: 2400000, gastos: 3800000 },
];

const productosVendidosData = [
  {
    nombre: "Vape Desechable 2000 puffs",
    ventas: 850,
    ingresos: 21250000,
    categoria: "Desechables",
    precio: 25000,
  },
  {
    nombre: "Líquido Frutal 30ml",
    ventas: 620,
    ingresos: 21700000,
    categoria: "Líquidos",
    precio: 35000,
  },
  {
    nombre: "Pod System Premium",
    ventas: 340,
    ingresos: 27200000,
    categoria: "Pods",
    precio: 80000,
  },
  {
    nombre: "Mod Premium 80W",
    ventas: 180,
    ingresos: 27000000,
    categoria: "Mods",
    precio: 150000,
  },
  {
    nombre: "Líquido Premium 60ml",
    ventas: 290,
    ingresos: 15950000,
    categoria: "Líquidos",
    precio: 55000,
  },
];

// Datos de productos más vendidos por mes
const productosVendidosPorMes = {
  "2024-01": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 680,
      ingresos: 17000000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 520,
      ingresos: 18200000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 280,
      ingresos: 22400000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 240,
      ingresos: 13200000,
      categoria: "Líquidos",
      precio: 55000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 150,
      ingresos: 22500000,
      categoria: "Mods",
      precio: 150000,
    },
  ],
  "2024-02": [
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 590,
      ingresos: 20650000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 720,
      ingresos: 18000000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 310,
      ingresos: 24800000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 260,
      ingresos: 14300000,
      categoria: "Líquidos",
      precio: 55000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 165,
      ingresos: 24750000,
      categoria: "Mods",
      precio: 150000,
    },
  ],
  "2024-03": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 780,
      ingresos: 19500000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 610,
      ingresos: 21350000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 330,
      ingresos: 26400000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 175,
      ingresos: 26250000,
      categoria: "Mods",
      precio: 150000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 275,
      ingresos: 15125000,
      categoria: "Líquidos",
      precio: 55000,
    },
  ],
  "2024-04": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 810,
      ingresos: 20250000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 600,
      ingresos: 21000000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 325,
      ingresos: 26000000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 285,
      ingresos: 15675000,
      categoria: "Líquidos",
      precio: 55000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 170,
      ingresos: 25500000,
      categoria: "Mods",
      precio: 150000,
    },
  ],
  "2024-05": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 830,
      ingresos: 20750000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 615,
      ingresos: 21525000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 338,
      ingresos: 27040000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 288,
      ingresos: 15840000,
      categoria: "Líquidos",
      precio: 55000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 178,
      ingresos: 26700000,
      categoria: "Mods",
      precio: 150000,
    },
  ],
  "2024-06": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 845,
      ingresos: 21125000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 618,
      ingresos: 21630000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 339,
      ingresos: 27120000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 289,
      ingresos: 15895000,
      categoria: "Líquidos",
      precio: 55000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 179,
      ingresos: 26850000,
      categoria: "Mods",
      precio: 150000,
    },
  ],
  "2024-07": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 848,
      ingresos: 21200000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 619,
      ingresos: 21665000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 340,
      ingresos: 27200000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 290,
      ingresos: 15950000,
      categoria: "Líquidos",
      precio: 55000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 180,
      ingresos: 27000000,
      categoria: "Mods",
      precio: 150000,
    },
  ],
  "2024-08": [
    {
      nombre: "Vape Desechable 2000 puffs",
      ventas: 850,
      ingresos: 21250000,
      categoria: "Desechables",
      precio: 25000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      ventas: 620,
      ingresos: 21700000,
      categoria: "Líquidos",
      precio: 35000,
    },
    {
      nombre: "Pod System Premium",
      ventas: 340,
      ingresos: 27200000,
      categoria: "Pods",
      precio: 80000,
    },
    {
      nombre: "Mod Premium 80W",
      ventas: 180,
      ingresos: 27000000,
      categoria: "Mods",
      precio: 150000,
    },
    {
      nombre: "Líquido Premium 60ml",
      ventas: 290,
      ingresos: 15950000,
      categoria: "Líquidos",
      precio: 55000,
    },
  ],
};

const stockCategoriasData = [
  {
    categoria: "Desechables",
    stock: 450,
    valor: "#8884d8",
    totalProductos: 25,
    valorInventario: 11250000,
  },
  {
    categoria: "Líquidos",
    stock: 320,
    valor: "#82ca9d",
    totalProductos: 18,
    valorInventario: 14400000,
  },
  {
    categoria: "Pods",
    stock: 180,
    valor: "#ffc658",
    totalProductos: 12,
    valorInventario: 14400000,
  },
  {
    categoria: "Mods",
    stock: 95,
    valor: "#ff7300",
    totalProductos: 8,
    valorInventario: 14250000,
  },
  {
    categoria: "Accesorios",
    stock: 275,
    valor: "#0088fe",
    totalProductos: 15,
    valorInventario: 5500000,
  },
];

// Datos de productos más comprados por mes
const productosCompradosPorMes = {
  "2024-01": [
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 450,
      costo: 16875000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 320,
      costo: 4800000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Pod System Premium",
      cantidad: 180,
      costo: 10800000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Bobina de repuesto",
      cantidad: 270,
      costo: 2700000,
      proveedor: "Parts Inc.",
      categoria: "Accesorios",
      costoPorUnidad: 10000,
    },
    {
      nombre: "Mod Premium 80W",
      cantidad: 95,
      costo: 11400000,
      proveedor: "ModTech",
      categoria: "Mods",
      costoPorUnidad: 120000,
    },
  ],
  "2024-02": [
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 380,
      costo: 5700000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 420,
      costo: 15750000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Pod System Premium",
      cantidad: 200,
      costo: 12000000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Cargador USB-C",
      cantidad: 150,
      costo: 2250000,
      proveedor: "Accessories Co.",
      categoria: "Accesorios",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      cantidad: 310,
      costo: 7750000,
      proveedor: "FlavorTech",
      categoria: "Líquidos",
      costoPorUnidad: 25000,
    },
  ],
  "2024-03": [
    {
      nombre: "Pod System Premium",
      cantidad: 250,
      costo: 15000000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 390,
      costo: 14625000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 340,
      costo: 5100000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Mod Premium 80W",
      cantidad: 120,
      costo: 14400000,
      proveedor: "ModTech",
      categoria: "Mods",
      costoPorUnidad: 120000,
    },
    {
      nombre: "Estuche de transporte",
      cantidad: 85,
      costo: 1275000,
      proveedor: "Cases Plus",
      categoria: "Accesorios",
      costoPorUnidad: 15000,
    },
  ],
  "2024-04": [
    {
      nombre: "Líquido Frutal 30ml",
      cantidad: 480,
      costo: 12000000,
      proveedor: "FlavorTech",
      categoria: "Líquidos",
      costoPorUnidad: 25000,
    },
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 360,
      costo: 5400000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Pod System Premium",
      cantidad: 220,
      costo: 13200000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Bobina de repuesto",
      cantidad: 290,
      costo: 2900000,
      proveedor: "Parts Inc.",
      categoria: "Accesorios",
      costoPorUnidad: 10000,
    },
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 350,
      costo: 13125000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
  ],
  "2024-05": [
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 420,
      costo: 6300000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 380,
      costo: 14250000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Mod Premium 80W",
      cantidad: 140,
      costo: 16800000,
      proveedor: "ModTech",
      categoria: "Mods",
      costoPorUnidad: 120000,
    },
    {
      nombre: "Pod System Premium",
      cantidad: 190,
      costo: 11400000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Kit de limpieza",
      cantidad: 200,
      costo: 2000000,
      proveedor: "CleanTech",
      categoria: "Accesorios",
      costoPorUnidad: 10000,
    },
  ],
  "2024-06": [
    {
      nombre: "Pod System Premium",
      cantidad: 280,
      costo: 16800000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      cantidad: 520,
      costo: 13000000,
      proveedor: "FlavorTech",
      categoria: "Líquidos",
      costoPorUnidad: 25000,
    },
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 450,
      costo: 6750000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 400,
      costo: 15000000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Cargador inalámbrico",
      cantidad: 180,
      costo: 5400000,
      proveedor: "WirelessTech",
      categoria: "Accesorios",
      costoPorUnidad: 30000,
    },
  ],
  "2024-07": [
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 440,
      costo: 16500000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 480,
      costo: 7200000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Mod Premium 80W",
      cantidad: 160,
      costo: 19200000,
      proveedor: "ModTech",
      categoria: "Mods",
      costoPorUnidad: 120000,
    },
    {
      nombre: "Pod System Premium",
      cantidad: 240,
      costo: 14400000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Líquido Frutal 30ml",
      cantidad: 350,
      costo: 8750000,
      proveedor: "FlavorTech",
      categoria: "Líquidos",
      costoPorUnidad: 25000,
    },
  ],
  "2024-08": [
    {
      nombre: "Vape Desechable 2000 puffs",
      cantidad: 500,
      costo: 7500000,
      proveedor: "DisposableMax",
      categoria: "Desechables",
      costoPorUnidad: 15000,
    },
    {
      nombre: "Pod System Premium",
      cantidad: 300,
      costo: 18000000,
      proveedor: "TechVape",
      categoria: "Pods",
      costoPorUnidad: 60000,
    },
    {
      nombre: "Líquido Premium 60ml",
      cantidad: 460,
      costo: 17250000,
      proveedor: "VapeCorp",
      categoria: "Líquidos",
      costoPorUnidad: 37500,
    },
    {
      nombre: "Líquido Frutal 30ml",
      cantidad: 390,
      costo: 9750000,
      proveedor: "FlavorTech",
      categoria: "Líquidos",
      costoPorUnidad: 25000,
    },
    {
      nombre: "Estuche premium",
      cantidad: 120,
      costo: 3600000,
      proveedor: "Luxury Cases",
      categoria: "Accesorios",
      costoPorUnidad: 30000,
    },
  ],
};

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
  const [activeView, setActiveView] = useState("dashboard");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [periodoVentas, setPeriodoVentas] = useState(
    "ultimas2semanas",
  );
  const [mesComprasFiltro, setMesComprasFiltro] =
    useState("2024-08"); // Mes actual por defecto
  const [mesVentasFiltro, setMesVentasFiltro] =
    useState("2024-08"); // Mes actual por defecto para ventas
  const [dashboardPage, setDashboardPage] = useState(1); // Estado para paginación del dashboard

  // Estados para manejar navegación a detalles
  const [detailView, setDetailView] = useState<{
    type: string;
    id: string;
  } | null>(null);

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
      case "Administrador":
        return <Crown className="h-5 w-5 text-yellow-400" />;
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
      case "Administrador":
        return "bg-yellow-500";
      case "Empleado":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const hasPermission = (permissionName: string) => {
    if (user.role.name === "Administrador" || user.role.name === "Admin") return true;
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
      default:
        return "Dashboard";
    }
  };

  // Función para obtener datos de ventas filtrados por fecha
  const getVentasFiltradas = () => {
    const todasLasVentas = [...ventasDiariaCompleta].sort(
      (a, b) =>
        new Date(a.fecha).getTime() -
        new Date(b.fecha).getTime(),
    );

    if (fechaFiltro) {
      const fechaBuscada = new Date(fechaFiltro);
      const fechaStr = fechaBuscada.toISOString().split("T")[0];
      return todasLasVentas.filter(
        (venta) => venta.fecha === fechaStr,
      );
    } else if (periodoVentas === "ultimas2semanas") {
      return ventasDiariaData;
    } else {
      return todasLasVentas.slice(-7); // Última semana por defecto
    }
  };

  // Calcular estadísticas dinámicas
  const ventasParaGrafica = getVentasFiltradas();
  const promedioVentas =
    ventasParaGrafica.length > 0
      ? ventasParaGrafica.reduce(
        (sum, item) => sum + item.ventas,
        0,
      ) / ventasParaGrafica.length
      : 0;
  const mejorDia =
    ventasParaGrafica.length > 0
      ? ventasParaGrafica.reduce((prev, current) =>
        prev.ventas > current.ventas ? prev : current,
      )
      : null;

  // Función para obtener datos de compras filtrados por mes
  const getComprasFiltradas = () => {
    return (
      productosCompradosPorMes[
      mesComprasFiltro as keyof typeof productosCompradosPorMes
      ] || []
    );
  };

  // Función para obtener datos de productos vendidos filtrados por mes
  const getProductosVendidosFiltrados = () => {
    return (
      productosVendidosPorMes[
      mesVentasFiltro as keyof typeof productosVendidosPorMes
      ] || []
    );
  };

  // Función para obtener el nombre del mes en español
  const getNombreMes = (fechaMes: string) => {
    const meses = {
      "01": "Enero",
      "02": "Febrero",
      "03": "Marzo",
      "04": "Abril",
      "05": "Mayo",
      "06": "Junio",
      "07": "Julio",
      "08": "Agosto",
      "09": "Septiembre",
      "10": "Octubre",
      "11": "Noviembre",
      "12": "Diciembre",
    };
    const [year, month] = fechaMes.split("-");
    return `${meses[month as keyof typeof meses]} ${year}`;
  };

  // Calcular estadísticas de compras
  const comprasParaGrafica = getComprasFiltradas();
  const totalCompras = comprasParaGrafica.reduce(
    (sum, item) => sum + item.costo,
    0,
  );
  const productosComprados = comprasParaGrafica.reduce(
    (sum, item) => sum + item.cantidad,
    0,
  );

  // Calcular estadísticas de ventas filtradas
  const ventasProductosParaGrafica = getProductosVendidosFiltrados();
  const totalVentas = ventasProductosParaGrafica.reduce(
    (sum, item) => sum + item.ingresos,
    0,
  );
  const productosVendidosTotal = ventasProductosParaGrafica.reduce(
    (sum, item) => sum + item.ventas,
    0,
  );

  // Función para manejar navegación interna y notificar al padre
  const handleViewChange = (view: string) => {
    setActiveView(view);
    setDetailView(null); // Limpiar vista de detalle cuando cambia la vista principal
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

      case "profile":
        return <UserProfile />;
      case "dashboard":
        // Renderizar contenido según la página activa
        const renderDashboardPage = () => {
          switch (dashboardPage) {
            case 1:
              return (
                <>
                  {/* Página 1: Ventas Diarias */}
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-bold mb-4">Análisis de Ventas Diarias</h2>

                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <div className="bg-blue-500 p-2 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                Ventas Diarias
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {fechaFiltro
                                  ? `Ventas del día ${fechaFiltro}`
                                  : "Últimas 2 semanas"}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Input
                              id="fecha-filtro"
                              type="date"
                              value={fechaFiltro}
                              onChange={(e) =>
                                setFechaFiltro(e.target.value)
                              }
                              className="w-32 h-8 text-xs border-blue-200 focus:border-blue-400"
                            />
                            {fechaFiltro && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFechaFiltro("")}
                                className="text-xs h-8 border-blue-200 hover:bg-blue-50"
                              >
                                Limpiar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {ventasParaGrafica.length === 0 ? (
                          <div className="flex items-center justify-center h-48 text-muted-foreground">
                            <div className="text-center">
                              <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
                                <CalendarDays className="h-10 w-10 text-blue-500" />
                              </div>
                              <p className="text-sm">
                                No hay datos para la fecha
                                seleccionada
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ResponsiveContainer
                              width="100%"
                              height={200}
                            >
                              <LineChart data={ventasParaGrafica}>
                                <defs>
                                  <linearGradient
                                    id="colorVentas"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#3b82f6"
                                      stopOpacity={0.3}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#3b82f6"
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e5e7eb"
                                />
                                <XAxis
                                  dataKey="dia"
                                  tick={{ fontSize: 9 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={50}
                                  stroke="#6b7280"
                                />
                                <YAxis
                                  tick={{ fontSize: 9 }}
                                  tickFormatter={(value) =>
                                    `$${(value / 1000).toFixed(0)}K`
                                  }
                                  stroke="#6b7280"
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `$${Number(value).toLocaleString()}`,
                                    "Ventas",
                                  ]}
                                  labelFormatter={(label) => label}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="ventas"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  dot={{
                                    fill: "#3b82f6",
                                    strokeWidth: 2,
                                    r: 3,
                                  }}
                                  activeDot={{
                                    r: 5,
                                    stroke: "#3b82f6",
                                    strokeWidth: 2,
                                  }}
                                  fill="url(#colorVentas)"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-3 pt-3 border-t flex justify-between">
                              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                <span className="text-xs text-blue-600">
                                  Promedio:{" "}
                                </span>
                                <span className="text-xs font-semibold text-blue-700">
                                  ${promedioVentas.toLocaleString()}
                                </span>
                              </div>
                              {mejorDia && (
                                <div className="bg-green-50 px-3 py-2 rounded-lg">
                                  <span className="text-xs text-green-600">
                                    Mejor día:{" "}
                                  </span>
                                  <span className="text-xs font-semibold text-green-700">
                                    {mejorDia.dia}
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
                                <SelectItem value="2024-01">
                                  Enero 2024
                                </SelectItem>
                                <SelectItem value="2024-02">
                                  Febrero 2024
                                </SelectItem>
                                <SelectItem value="2024-03">
                                  Marzo 2024
                                </SelectItem>
                                <SelectItem value="2024-04">
                                  Abril 2024
                                </SelectItem>
                                <SelectItem value="2024-05">
                                  Mayo 2024
                                </SelectItem>
                                <SelectItem value="2024-06">
                                  Junio 2024
                                </SelectItem>
                                <SelectItem value="2024-07">
                                  Julio 2024
                                </SelectItem>
                                <SelectItem value="2024-08">
                                  Agosto 2024
                                </SelectItem>
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
                                <SelectItem value="2024-01">
                                  Enero 2024
                                </SelectItem>
                                <SelectItem value="2024-02">
                                  Febrero 2024
                                </SelectItem>
                                <SelectItem value="2024-03">
                                  Marzo 2024
                                </SelectItem>
                                <SelectItem value="2024-04">
                                  Abril 2024
                                </SelectItem>
                                <SelectItem value="2024-05">
                                  Mayo 2024
                                </SelectItem>
                                <SelectItem value="2024-06">
                                  Junio 2024
                                </SelectItem>
                                <SelectItem value="2024-07">
                                  Julio 2024
                                </SelectItem>
                                <SelectItem value="2024-08">
                                  Agosto 2024
                                </SelectItem>
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
      case "usuarios":
        return <AdminPanel />;
      case "proveedores":
        return <Proveedores />;
      case "compras":
        return <Compras />;
      case "clientes":
        return <Clientes />;
      case "pedidos":
        return <Pedidos />;
      case "ventas":
        return <Ventas />;
      case "productos":
        return <Productos />;
      case "categorias":
        return <Categorias />;
      case "cotizaciones":
        return <Cotizaciones />;
      case "devoluciones":
        return <Devoluciones />;

      case "profile":
        return <UserProfile />;
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenido principal basado en la vista activa */}
        {renderContent()}
      </main>
    </div>
  );
};
