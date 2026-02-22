import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { TablePagination } from './ui/TablePagination';

// Importar los nuevos diálogos
import { CreateProductoDialog } from "./productos/CreateProductoDialog";
import { DetailProductoDialog } from "./productos/DetailProductoDialog";
import { EditProductoDialog } from "./productos/EditProductoDialog";
import { DeleteProductoDialog } from "./productos/DeleteProductoDialog";

// Interfaces
interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  precio: number;
  stock: number;
  estado: "activo" | "inactivo";
  imagen?: string;
  marca?: string;
  modelo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
}

// Datos simulados
const categoriasDisponibles: Categoria[] = [
  {
    id: 1,
    nombre: "Vapes Desechables",
    descripcion: "Vapeadores de un solo uso",
    activa: true,
  },
  {
    id: 2,
    nombre: "Vapes Recargables",
    descripcion: "Vapeadores reutilizables",
    activa: true,
  },
  {
    id: 3,
    nombre: "E-liquids",
    descripcion: "Líquidos para vapear",
    activa: true,
  },
  {
    id: 4,
    nombre: "Accesorios",
    descripcion: "Accesorios para vaping",
    activa: true,
  },
  {
    id: 5,
    nombre: "Mods",
    descripcion: "Modificaciones avanzadas",
    activa: true,
  },
  {
    id: 6,
    nombre: "Coils",
    descripcion: "Resistencias y bobinas",
    activa: true,
  },
];

const productosIniciales: Producto[] = [
  {
    id: 1,
    codigo: "VD001",
    nombre: "Vape Desechable Cherry 2000 puffs",
    descripcion:
      "Vapeador desechable sabor cereza con 2000 inhalaciones aproximadas",
    categoria: categoriasDisponibles[0],
    precio: 25000,
    stock: 150,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&h=200&fit=crop",
    marca: "VapeTech",
    modelo: "Cherry2K",
    fechaCreacion: "2024-01-10T10:00:00",
    fechaActualizacion: "2024-01-15T14:30:00",
    creadoPor: "María González",
  },
  {
    id: 2,
    codigo: "PR001",
    nombre: "Pod System Premium 80W",
    descripcion:
      "Sistema de pod recargable con batería de larga duración",
    categoria: categoriasDisponibles[1],
    precio: 80000,
    stock: 45,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=200&h=200&fit=crop",
    marca: "Premium",
    modelo: "Pod80W",
    fechaCreacion: "2024-01-08T09:15:00",
    fechaActualizacion: "2024-01-08T09:15:00",
    creadoPor: "Laura Herrera",
  },
  {
    id: 3,
    codigo: "EL001",
    nombre: "E-liquid Frutal Mix 30ml",
    descripcion:
      "Líquido para vapear con mezcla de sabores frutales",
    categoria: categoriasDisponibles[2],
    precio: 35000,
    stock: 8,
    estado: "inactivo",
    imagen:
      "https://images.unsplash.com/photo-1544966503-7cc4ac882d2d?w=200&h=200&fit=crop",
    marca: "CloudNine",
    modelo: "FrutalMix30",
    fechaCreacion: "2024-01-05T14:20:00",
    fechaActualizacion: "2024-01-16T16:45:00",
    creadoPor: "Ana Morales",
  },
  {
    id: 4,
    codigo: "AC001",
    nombre: "Cargador USB-C Universal",
    descripcion:
      "Cargador universal para dispositivos con puerto USB-C",
    categoria: categoriasDisponibles[3],
    precio: 15000,
    stock: 75,
    estado: "activo",
    marca: "Elite",
    modelo: "USBC-UNI",
    fechaCreacion: "2024-01-12T11:30:00",
    fechaActualizacion: "2024-01-12T11:30:00",
    creadoPor: "Pedro Sánchez",
  },
  {
    id: 5,
    codigo: "VD003",
    nombre: "Vape Desechable Banana 2500 puffs",
    descripcion:
      "Vapeador desechable sabor banana con 2500 inhalaciones",
    categoria: categoriasDisponibles[0],
    precio: 28000,
    stock: 85,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&h=200&fit=crop",
    marca: "VapeTech",
    modelo: "Banana2K5",
    fechaCreacion: "2024-01-18T14:15:00",
    fechaActualizacion: "2024-01-18T14:15:00",
    creadoPor: "Ricardo Moreno",
  },
  {
    id: 6,
    codigo: "MD001",
    nombre: "Box Mod Pro 200W",
    descripcion:
      "Mod avanzado de doble batería con pantalla OLED",
    categoria: categoriasDisponibles[4],
    precio: 150000,
    stock: 12,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=200&h=200&fit=crop",
    marca: "ProVape",
    modelo: "BoxPro200",
    fechaCreacion: "2024-01-16T09:45:00",
    fechaActualizacion: "2024-01-20T16:20:00",
    creadoPor: "Alejandro Ruiz",
  },
  {
    id: 7,
    codigo: "CL001",
    nombre: "Coil de Malla 0.2ohm - Pack 5",
    descripcion:
      "Resistencias de malla para sabor intenso - paquete de 5 unidades",
    categoria: categoriasDisponibles[5],
    precio: 45000,
    stock: 35,
    estado: "activo",
    marca: "MeshTech",
    modelo: "Mesh02-5P",
    fechaCreacion: "2024-01-14T11:20:00",
    fechaActualizacion: "2024-01-14T11:20:00",
    creadoPor: "Carmen López",
  },
  {
    id: 8,
    codigo: "EL002",
    nombre: "E-liquid Tobacco Premium 60ml",
    descripcion:
      "Líquido premium sabor tabaco tradicional - 60ml",
    categoria: categoriasDisponibles[2],
    precio: 55000,
    stock: 0,
    estado: "inactivo",
    imagen:
      "https://images.unsplash.com/photo-1544966503-7cc4ac882d2d?w=200&h=200&fit=crop",
    marca: "PremiumJuice",
    modelo: "Tobacco60",
    fechaCreacion: "2024-01-13T16:40:00",
    fechaActualizacion: "2024-01-21T12:10:00",
    creadoPor: "Miguel Castro",
  },
  {
    id: 9,
    codigo: "PR002",
    nombre: "Pod System Starter 40W",
    descripcion:
      "Sistema de pod ideal para principiantes con batería integrada",
    categoria: categoriasDisponibles[1],
    precio: 55000,
    stock: 68,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=200&h=200&fit=crop",
    marca: "StarterVape",
    modelo: "Pod40W",
    fechaCreacion: "2024-01-11T13:25:00",
    fechaActualizacion: "2024-01-19T15:45:00",
    creadoPor: "Isabella Torres",
  },
  {
    id: 10,
    codigo: "AC002",
    nombre: "Batería Externa 18650 3000mAh",
    descripcion:
      "Batería recargable de litio para mods - alta descarga",
    categoria: categoriasDisponibles[3],
    precio: 32000,
    stock: 42,
    estado: "activo",
    marca: "PowerCell",
    modelo: "18650-3K",
    fechaCreacion: "2024-01-09T10:50:00",
    fechaActualizacion: "2024-01-15T09:30:00",
    creadoPor: "Fernando Vega",
  },
  {
    id: 11,
    codigo: "VD004",
    nombre: "Vape Desechable Strawberry Ice 3000 puffs",
    descripcion:
      "Vapeador desechable sabor fresa con hielo - 3000 inhalaciones",
    categoria: categoriasDisponibles[0],
    precio: 32000,
    stock: 15,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&h=200&fit=crop",
    marca: "IceFresh",
    modelo: "StrawIce3K",
    fechaCreacion: "2024-01-07T15:35:00",
    fechaActualizacion: "2024-01-22T11:20:00",
    creadoPor: "Valentina Cruz",
  },
  {
    id: 12,
    codigo: "EL003",
    nombre: "E-liquid Menthol Fresh 50ml",
    descripcion: "Líquido mentolado refrescante - 50ml",
    categoria: categoriasDisponibles[2],
    precio: 42000,
    stock: 28,
    estado: "activo",
    imagen:
      "https://images.unsplash.com/photo-1544966503-7cc4ac882d2d?w=200&h=200&fit=crop",
    marca: "FreshMint",
    modelo: "Menthol50",
    fechaCreacion: "2024-01-06T12:15:00",
    fechaActualizacion: "2024-01-06T12:15:00",
    creadoPor: "Gabriel Ramos",
  },
  {
    id: 13,
    codigo: "AC003",
    nombre: "Tank Atomizador Sub-ohm 5ml",
    descripcion:
      "Atomizador para mods con capacidad de 5ml y flujo de aire ajustable",
    categoria: categoriasDisponibles[3],
    precio: 75000,
    stock: 23,
    estado: "activo",
    marca: "SubTank",
    modelo: "Pro5ml",
    fechaCreacion: "2024-01-04T14:50:00",
    fechaActualizacion: "2024-01-20T13:25:00",
    creadoPor: "Natalia Herrera",
  },
  {
    id: 14,
    codigo: "MD002",
    nombre: "Mod Mecánico Tube Copper",
    descripcion:
      "Mod mecánico de cobre para usuarios avanzados - sin protecciones",
    categoria: categoriasDisponibles[4],
    precio: 95000,
    stock: 8,
    estado: "inactivo",
    marca: "MechCopper",
    modelo: "TubeCopper",
    fechaCreacion: "2024-01-03T11:30:00",
    fechaActualizacion: "2024-01-21T10:15:00",
    creadoPor: "Sebastián Mendoza",
  },
];

// Función para cargar productos desde localStorage
const loadProductosFromStorage = (): Producto[] => {
  if (typeof window === 'undefined') return productosIniciales;
  const stored = localStorage.getItem('productos');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing productos from localStorage:', e);
      return productosIniciales;
    }
  }
  return productosIniciales;
};

export const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>(
    () => loadProductosFromStorage(),
  );
  const [productosFiltrados, setProductosFiltrados] = useState<
    Producto[]
  >(() => loadProductosFromStorage());
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] =
    useState<string>("todas");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Fijo a 6 elementos por página

  // Estados de los diálogos
  const [showCreateDialog, setShowCreateDialog] =
    useState(false);
  const [showDetailDialog, setShowDetailDialog] =
    useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);
  const [selectedProducto, setSelectedProducto] =
    useState<Producto | null>(null);

  // Efectos
  useEffect(() => {
    filtrarProductos();
  }, [
    productos,
    searchTerm,
    filtroCategoria,
  ]);

// Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroCategoria]);

  // Guardar productos en localStorage cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productos', JSON.stringify(productos));
    }
  }, [productos]);

  // Funciones de filtrado
  const filtrarProductos = () => {
    let productosFiltrados = [...productos];

    // Filtro por búsqueda
    if (searchTerm) {
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          producto.nombre
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          producto.codigo
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          producto.descripcion
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          producto.marca
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          producto.modelo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== "todas") {
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          producto.categoria.id === parseInt(filtroCategoria),
      );
    }

    setProductosFiltrados(productosFiltrados);
  };

  // Cálculos de paginación
  const totalPages = Math.ceil(
    productosFiltrados.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = productosFiltrados.slice(
    startIndex,
    endIndex,
  );

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Funciones para manejar acciones de productos
  const handleAgregarProducto = () => {
    setShowCreateDialog(true);
  };

  const handleVerProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowDetailDialog(true);
  };

  const handleEditarProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowEditDialog(true);
  };

  const handleEliminarProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowDeleteDialog(true);
  };

  // Función para obtener el siguiente ID disponible
  const getNextProductId = () => {
    const maxId = Math.max(...productos.map((p) => p.id), 0);
    return maxId + 1;
  };

  // Funciones de callback para los diálogos
  const onProductoCreated = (nuevoProducto: Producto) => {
    setProductos((prev) => [...prev, nuevoProducto]);
  };

  const onProductoUpdated = (productoActualizado: Producto) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoActualizado.id
          ? productoActualizado
          : p,
      ),
    );
  };

  const onProductoDeleted = (productoId: number) => {
    setProductos((prev) =>
      prev.filter((p) => p.id !== productoId),
    );
  };

  // Función para cambiar el estado de un producto con click
  const handleToggleEstado = (producto: Producto) => {
    const nuevoEstado = producto.estado === "activo" ? "inactivo" : "activo";

    const productoActualizado: Producto = {
      ...producto,
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString(),
    };

    onProductoUpdated(productoActualizado);

    toast.success("Estado actualizado", {
      description: `El producto "${producto.nombre}" ahora está ${nuevoEstado}.`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Diálogos */}
      <CreateProductoDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onProductoCreated={onProductoCreated}
        categorias={categoriasDisponibles}
        nextProductId={getNextProductId()}
      />

      <DetailProductoDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        producto={selectedProducto}
      />

      <EditProductoDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        producto={selectedProducto}
        onProductoUpdated={onProductoUpdated}
        categorias={categoriasDisponibles}
      />

      <DeleteProductoDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        producto={selectedProducto}
        onProductoDeleted={onProductoDeleted}
      />

      {/* Card principal con todo integrado */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>
                Administra tu inventario de productos de vaping
              </CardDescription>
            </div>
            <Button
              onClick={handleAgregarProducto}
              className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select
                value={filtroCategoria}
                onValueChange={setFiltroCategoria}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">
                    Todas las categorías
                  </SelectItem>
                  {categoriasDisponibles.map((categoria) => (
                    <SelectItem
                      key={categoria.id}
                      value={categoria.id.toString()}
                    >
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla de productos */}
          {currentProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground mb-4">
                No hay productos que coincidan con los filtros
                aplicados
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFiltroCategoria("todas");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {producto.imagen ? (
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {producto.nombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        {producto.categoria.nombre}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{producto.stock} unidades</span>
                          {producto.stock === 0 && (
                            <Badge variant="destructive" className="text-xs">Sin stock</Badge>
                          )}
                          {producto.stock > 0 && producto.stock <= 10 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ${producto.precio.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={
                              producto.estado === "activo"
                                ? "bg-black text-white border-black"
                                : "bg-gray-200 text-gray-700 border-gray-200"
                            }
                          >
                            {producto.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                          <Switch
                            checked={producto.estado === "activo"}
                            onCheckedChange={() =>
                              handleToggleEstado(producto)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleVerProducto(producto)
                            }
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEditarProducto(producto)
                            }
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEliminarProducto(producto)
                            }
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={productosFiltrados.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemName="productos"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
