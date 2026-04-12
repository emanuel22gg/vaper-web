import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import { toast } from "sonner";
import {
  getProductos,
  getCategorias,
  updateProducto,
  deleteProducto,
  createProducto
} from '@/shared/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
import { TablePagination } from '@/shared/ui/TablePagination';

// Importar los nuevos diálogos
import { CreateProductoDialog } from "./productos/CreateProductoDialog";
import { DetailProductoDialog } from "./productos/DetailProductoDialog";
import { EditProductoDialog } from "./productos/EditProductoDialog";
import { DeleteProductoDialog } from "./productos/DeleteProductoDialog";

// Interfaces
import { Producto, Categoria, ProductoDto } from '@/shared/types';
import { getImage } from '@/shared/services/api';

// Componente para cargar imagen de producto asincrónicamente
const ProductoImage = ({ idImagen, fallbackImage }: { idImagen?: number, fallbackImage?: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (idImagen) {
      getImage(idImagen)
        .then(data => setUrl(data.urlimagen))
        .catch(err => console.error("Error loading product image", err));
    } else {
      setUrl(fallbackImage || null);
    }
  }, [idImagen, fallbackImage]);

  if (!url) {
    return (
      <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
        <Package className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
      <img
        src={url}
        alt="Producto"
        className="h-full w-full object-cover"
      />
    </div>
  );
};


export const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productosFiltrados, setProductosFiltrados] = useState<
    Producto[]
  >([]);
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

  // Cargar datos desde la API al iniciar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dataProductos, dataCategorias] = await Promise.all([
          getProductos(),
          getCategorias()
        ]);

        // Vincular categorías a los productos
        const linkedProductos = dataProductos.map(p => ({
          ...p,
          categoria: dataCategorias.find(c => c.id === p.categoriaId)
        })).sort((a, b) => (b.id || 0) - (a.id || 0));

        setProductos(linkedProductos);
        setCategorias(dataCategorias);
      } catch (error) {
        toast.error("Error al cargar datos de la API");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Funciones de filtrado
  const filtrarProductos = () => {
    let productosFiltrados = [...productos];

    // Filtro por búsqueda
    if (searchTerm) {
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          (producto.nombreProducto?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (producto.descripcion?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ) ||
          (producto.categoria?.nombreCategoria?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== "todas") {
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          producto.categoriaId === parseInt(filtroCategoria) || producto.categoria?.id === parseInt(filtroCategoria),
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

  // Funciones de callback para los diálogos
  const handleProductoCreated = async (data: ProductoDto) => {
    try {
      const result = await createProducto(data);
      // Vincular categoría localmente para que aparezca en el detalle
      const categoriaCompleta = categorias.find(c => c.id === result.categoriaId);
      const productoConCategoria = { ...result, categoria: categoriaCompleta };

      setProductos((prev) => [...prev, productoConCategoria]);

      toast.success("Producto creado", {
        description: `El producto "${result.nombreProducto}" ha sido creado exitosamente.`,
      });
    } catch (error) {
      toast.error("Error al crear producto en la API");
    }
  };

  const handleProductoUpdated = async (data: ProductoDto) => {
    if (!selectedProducto) return;
    try {
      const result = await updateProducto(selectedProducto.id, data);
      // Vincular categoría localmente
      const categoriaCompleta = categorias.find(c => c.id === result.categoriaId);
      const productoConCategoria = { ...result, categoria: categoriaCompleta };

      setProductos(
        (prev) => prev.map((p) => (p.id === result.id ? productoConCategoria : p)),
      );

      toast.success("Producto actualizado", {
        description: `El producto "${result.nombreProducto}" ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      toast.error("Error al actualizar producto en la API");
      throw error;
    }
  };

  const handleProductoDeleted = async (id: number) => {
    try {
      await deleteProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado", {
        description: `El producto ha sido eliminado exitosamente.`,
      });
    } catch (error) {
      toast.error("Error al eliminar producto en la API");
    }
  };

  // Función para cambiar el estado de un producto con click
  const handleToggleEstado = async (producto: Producto) => {
    const nuevoEstado = !producto.estado;
    const data: ProductoDto = {
      nombreProducto: producto.nombreProducto,
      precio: producto.precio,
      stock: producto.stock,
      categoriaId: producto.categoriaId || producto.categoria?.id || 0,
      descripcion: producto.descripcion,
      idImagen: producto.idImagen,
      estado: nuevoEstado
    };

    try {
      const result = await updateProducto(producto.id, data);
      setProductos(
        (prev) => prev.map((p) => (p.id === result.id ? result : p)),
      );
      toast.success("Estado actualizado", {
        description: `El producto "${producto.nombreProducto}" ahora está ${nuevoEstado ? "activo" : "inactivo"}.`,
      });
    } catch (error) {
      toast.error("Error al cambiar estado en la API");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Diálogos */}
      <CreateProductoDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onProductoCreated={handleProductoCreated}
        categorias={categorias}
        productos={productos}
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
        onProductoUpdated={handleProductoUpdated}
        categorias={categorias}
        productos={productos}
      />

      <DeleteProductoDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        producto={selectedProducto}
        onProductoDeleted={handleProductoDeleted}
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
                  {categorias.map((categoria) => (
                    <SelectItem
                      key={categoria.id}
                      value={categoria.id.toString()}
                    >
                      {categoria.nombreCategoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla de productos */}
          {currentProducts.length === 0 && !isLoading ? (
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
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Cargando productos...
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProducts.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <ProductoImage idImagen={producto.idImagen} fallbackImage={producto.imagen} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-black">
                            {producto.nombreProducto}
                          </div>
                        </TableCell>
                        <TableCell>
                          {producto.categoria?.nombreCategoria || 'Sin categoría'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              producto.stock === 0
                                ? "bg-red-50 text-red-700 border-red-100"
                                : producto.stock <= 10
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                  : "bg-blue-50 text-blue-700 border-blue-100"
                            }
                          >
                            {producto.stock} uds
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${producto.precio.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                producto.estado
                                  ? "bg-black text-white border-black"
                                  : "bg-gray-200 text-gray-700 border-gray-200"
                              }
                            >
                              {producto.estado ? "Activo" : "Inactivo"}
                            </Badge>
                            <Switch
                              checked={producto.estado}
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
                    ))
                  )}
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
