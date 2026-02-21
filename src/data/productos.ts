// Datos de productos para inventario
export interface ProductoInventario {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  codigo: string;
  descripcion?: string;
}

export const productosInventario: ProductoInventario[] = [
  {
    id: "1",
    codigo: "VD-001",
    nombre: "Vape Desechable Snoopy Smoke 15000 puffs",
    categoria: "Desechables",
    precio: 45000,
    stock: 25,
    descripcion: "Vape desechable con 15000 puffs, sabor fresa congelada"
  },
  {
    id: "2",
    codigo: "LQ-001",
    nombre: "Líquido Premium Frutal 60ml",
    categoria: "Líquidos",
    precio: 55000,
    stock: 15,
    descripcion: "Líquido premium sabor mango tropical 60ml"
  },
  {
    id: "3",
    codigo: "POD-001",
    nombre: "Pod System Premium Kit",
    categoria: "Pods",
    precio: 120000,
    stock: 8,
    descripcion: "Kit completo pod system premium"
  },
  {
    id: "4",
    codigo: "ACC-001",
    nombre: "Resistencias Pod (Pack x5)",
    categoria: "Accesorios",
    precio: 35000,
    stock: 30,
    descripción: "Pack de 5 resistencias para pod system"
  },
  {
    id: "5",
    codigo: "MOD-001",
    nombre: "Mod Avanzado 100W",
    categoria: "Mods",
    precio: 250000,
    stock: 5,
    descripcion: "Mod avanzado con potencia de 100W"
  },
  {
    id: "6",
    codigo: "ACC-002",
    nombre: "Tanque Sub-Ohm",
    categoria: "Accesorios",
    precio: 80000,
    stock: 12,
    descripcion: "Tanque sub-ohm de alta calidad"
  },
  {
    id: "7",
    codigo: "VD-002",
    nombre: "Vape Desechable Crystal Pro 6000",
    categoria: "Desechables",
    precio: 38000,
    stock: 40,
    descripcion: "Vape desechable Crystal Pro con 6000 puffs"
  },
  {
    id: "8",
    codigo: "LQ-002",
    nombre: "Líquido Menthol Ice 30ml",
    categoria: "Líquidos",
    precio: 42000,
    stock: 22,
    descripcion: "Líquido con sabor mentol helado 30ml"
  },
  {
    id: "9",
    codigo: "POD-002",
    nombre: "Cartuchos Rellenables (Pack x3)",
    categoria: "Pods",
    precio: 28000,
    stock: 18,
    descripcion: "Pack de 3 cartuchos rellenables"
  },
  {
    id: "10",
    codigo: "ACC-003",
    nombre: "Cargador USB-C Universal",
    categoria: "Accesorios",
    precio: 15000,
    stock: 50,
    descripcion: "Cargador universal USB-C para vapes"
  }
];
