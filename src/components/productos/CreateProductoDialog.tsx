import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from "sonner";
import { Upload, X } from 'lucide-react';

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
  estado: 'activo' | 'inactivo' | 'agotado' | 'descontinuado';
  imagen?: string;
  puffs?: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
}

interface CreateProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoCreated: (producto: Producto) => void;
  categorias: Categoria[];
  nextProductId: number;
}

export const CreateProductoDialog: React.FC<CreateProductoDialogProps> = ({
  isOpen,
  onClose,
  onProductoCreated,
  categorias,
  nextProductId
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    stock: '',
    estado: 'activo' as const,
    imagen: '',
    puffs: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("La imagen no debe superar 5MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        handleInputChange('imagen', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    handleInputChange('imagen', '');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return false;
    }
    if (!formData.descripcion.trim()) {
      toast.error("La descripción del producto es obligatoria");
      return false;
    }
    if (!formData.categoriaId) {
      toast.error("Debe seleccionar una categoría");
      return false;
    }
    if (formData.stock && parseInt(formData.stock) < 0) {
      toast.error("El stock no puede ser negativo");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const categoria = categorias.find(c => c.id === parseInt(formData.categoriaId));

      if (!categoria) {
        toast.error("Error al procesar categoría");
        return;
      }

      // Generar código automáticamente basado en categoría
      const codigoCategoria = categoria.nombre.substring(0, 2).toUpperCase();
      const codigoNumerico = String(nextProductId).padStart(3, '0');
      const codigo = `${codigoCategoria}${codigoNumerico}`;

      const nuevoProducto: Producto = {
        id: nextProductId,
        codigo: codigo,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        categoria,
        precio: 0, // Precio no se ingresa en este formulario
        stock: formData.stock ? parseInt(formData.stock) : 0,
        estado: formData.estado,
        imagen: formData.imagen.trim() || undefined,
        puffs: formData.puffs ? parseInt(formData.puffs) : undefined,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: 'Usuario Actual' // En una app real, vendría del contexto de auth
      };

      onProductoCreated(nuevoProducto);
      
      toast.success("Producto creado exitosamente", {
        description: `El producto "${nuevoProducto.nombre}" ha sido agregado al inventario.`
      });

      handleClose();
    } catch (error) {
      toast.error("Error al crear el producto", {
        description: "Por favor, inténtelo nuevamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      categoriaId: '',
      stock: '',
      estado: 'activo',
      imagen: '',
      puffs: ''
    });
    setImageFile(null);
    setImagePreview('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Complete los datos del nuevo producto para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Vape Desechable Cherry"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select 
              value={formData.categoriaId} 
              onValueChange={(value) => handleInputChange('categoriaId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.filter(c => c.activa).map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock (Opcional)</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Si no se ingresa, el stock será 0</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="puffs">Puffs (Opcional)</Label>
              <Input
                id="puffs"
                type="number"
                min="0"
                value={formData.puffs}
                onChange={(e) => handleInputChange('puffs', e.target.value)}
                placeholder="Ej: 2000"
              />
              <p className="text-xs text-muted-foreground">Solo para vapeadores</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagen del Producto</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Subir Imagen
              </Button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Tamaño máximo: 5MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe las características del producto..."
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
