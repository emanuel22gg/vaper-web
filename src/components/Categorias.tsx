import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { TablePagination } from './ui/TablePagination';

import { Categoria, CategoriaFormData } from '../types';
import { filtrarCategorias } from '../utils/categorias';
import { getCategorias, deleteCategoria, updateCategoria, getImage } from '../services/api';

import { CreateCategoriaDialog } from './categorias/CreateCategoriaDialog';
import { EditCategoriaDialog } from './categorias/EditCategoriaDialog';
import { DeleteCategoriaDialog } from './categorias/DeleteCategoriaDialog';
import { DetailCategoriaDialog } from './categorias/DetailCategoriaDialog';

// Componente para cargar imagen
const CategoriaImage = ({ idImagen }: { idImagen?: number }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (idImagen) {
      getImage(idImagen)
        .then(data => setUrl(data.urlimagen))
        .catch(err => console.error("Error loading image", err));
    } else {
      setUrl(null);
    }
  }, [idImagen]);

  if (!url) {
    return (
      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
        <span className="text-xs">No img</span>
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
      <img
        src={url}
        alt="Categoria"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de diálogos
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<CategoriaFormData>({
    nombreCategoria: '',
    descripcion: '',
    estado: true
  });

  // Cargar categorías
  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Filtrado
  useEffect(() => {
    const filtered = filtrarCategorias(categorias, busqueda, filtroEstado);
    setCategoriasFiltradas(filtered);
    setCurrentPage(1); // Reset page on filter change
  }, [categorias, busqueda, filtroEstado]);

  // Funciones CRUD
  const handleCreateSuccess = () => {
    fetchCategorias();
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success("Categoría creada exitosamente");
  };

  const handleEditSuccess = () => {
    fetchCategorias();
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedCategoria(null);
    toast.success("Categoría actualizada exitosamente");
  };

  const handleDeleteCategoria = async () => {
    if (categoriaToDelete) {
      try {
        await deleteCategoria(categoriaToDelete.id);
        fetchCategorias();
        setIsDeleteDialogOpen(false);
        toast.success("Categoría eliminada exitosamente");
        setCategoriaToDelete(null);
      } catch (error: any) {
        console.error("Error deleting category:", error);

        // Handling generic 500 error or specific message
        if (error.response?.status === 500) {
          toast.error("No se puede eliminar la categoría. Tiene productos asociados.");
        } else {
          const errorMessage = error.response?.data?.message || error.message || "Error al eliminar la categoría";
          toast.error(`Error: ${errorMessage}`);
        }
      }
    }
  };

  const toggleEstadoCategoria = async (categoria: Categoria) => {
    try {
      const nuevoEstado = !categoria.estado;
      await updateCategoria(categoria.id, {
        ...categoria,
        estado: nuevoEstado
      });

      // Update local state optimizingly or fetch again
      setCategorias(categorias.map(c =>
        c.id === categoria.id ? { ...c, estado: nuevoEstado } : c
      ));

      toast.success(`Categoría ${nuevoEstado ? 'activada' : 'desactivada'}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al cambiar estado");
    }
  };

  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      nombreCategoria: '',
      descripcion: '',
      estado: true,
      imageFile: undefined,
      idImagen: undefined,
      previewUrl: undefined
    });
  };

  const openEditDialog = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setFormData({
      nombreCategoria: categoria.nombreCategoria,
      descripcion: categoria.descripcion,
      estado: categoria.estado,
      idImagen: categoria.idImagen,
      // Note: We don't have the file object, we might load preview url if needed
    });
    setIsEditDialogOpen(true);
  };

  // Paginación
  const totalPages = Math.ceil(categoriasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategorias = categoriasFiltradas.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Categorías</CardTitle>
              <CardDescription>
                Administra la clasificación y organización de productos
              </CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }} className="bg-[rgb(21,93,252)] hover:bg-blue-700 w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar categorías..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="activas">Activas</SelectItem>
                <SelectItem value="inactivas">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : currentCategorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                      No se encontraron categorías
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCategorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell>{categoria.id}</TableCell>
                      <TableCell>
                        <CategoriaImage idImagen={categoria.idImagen} />
                      </TableCell>
                      <TableCell className="font-medium">{categoria.nombreCategoria}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={categoria.descripcion}>
                          {categoria.descripcion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={categoria.estado ? 'default' : 'secondary'} className={categoria.estado ? "bg-black text-white hover:bg-black" : "bg-gray-200 text-gray-700 hover:bg-gray-200"}>
                            {categoria.estado ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <Switch
                            checked={categoria.estado}
                            onCheckedChange={() => toggleEstadoCategoria(categoria)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setIsDetailDialogOpen(true);
                            }}
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(categoria)}
                            title="Editar categoría"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCategoriaToDelete(categoria);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Eliminar categoría"
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
          </div>

          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={categoriasFiltradas.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="categorías"
            />
          )}
        </CardContent>
      </Card>

      <CreateCategoriaDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSuccess={handleCreateSuccess}
        categorias={categorias}
      />

      <EditCategoriaDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSuccess={handleEditSuccess}
        categoriaId={selectedCategoria?.id}
        categorias={categorias}
      />

      <DetailCategoriaDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        categoria={selectedCategoria}
      />

      <DeleteCategoriaDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        categoria={categoriaToDelete}
        onConfirm={handleDeleteCategoria}
      />
    </div >
  );
};
