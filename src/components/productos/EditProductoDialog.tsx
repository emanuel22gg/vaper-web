import React, { useState, useEffect } from 'react';
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
import { Upload } from 'lucide-react';
import { toast } from "sonner";

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

interface EditProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
  onProductoUpdated: (producto: Producto) => void;
  categorias: Categoria[];
}

export const EditProductoDialog: React.FC<EditProductoDialogProps> = ({
  isOpen,
  onClose,
  producto,
  onProductoUpdated,
  categorias
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    precio: '',
    stock: '',
    estado: 'activo' as const,
    imagen: '',
    puffs: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Cargar datos del producto cuando se abre el diálogo
  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoriaId: producto.categoria.id.toString(),
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        estado: producto.estado,
        imagen: producto.imagen || '',
        puffs: producto.puffs?.toString() || ''
      });
      setImagePreview(producto.imagen || '');
      setImageFile(null);
    }
  }, [producto, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño máximo de 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      
      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("El stock no puede ser negativo");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !producto) {
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

      // Determinar el estado basado en el stock
      let estado = formData.estado;
      if (parseInt(formData.stock) === 0) {
        estado = 'agotado';
      }

      const productoActualizado: Producto = {
        ...producto,
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        categoria,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        estado,
        imagen: imagePreview || formData.imagen.trim() || undefined,
        puffs: formData.puffs ? parseInt(formData.puffs) : undefined,
        fechaActualizacion: new Date().toISOString(),
      };

      onProductoUpdated(productoActualizado);
      
      toast.success("Producto actualizado exitosamente", {
        description: `Los cambios en "${productoActualizado.nombre}" han sido guardados.`
      });

      onClose();
    } catch (error) {
      toast.error("Error al actualizar el producto", {
        description: "Por favor, inténtelo nuevamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!producto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifique los datos del producto "{producto.nombre}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del Producto */}
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

          {/* Categoría */}
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

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio de Venta ($) *</Label>
              <Input
                id="precio"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                placeholder="25000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="100"
                required
              />
            </div>
          </div>

          {/* Puffs (Opcional) */}
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

          {/* Imagen del Producto */}
          <div className="space-y-2">
            <Label htmlFor="imagen">Imagen del Producto</Label>
            <div className="space-y-2">
              <input
                type="file"
                id="imagen-file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('imagen-file')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Imagen
              </Button>
              {imagePreview && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Tamaño máximo: 5MB</p>
            </div>
          </div>

          {/* Descripción */}
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-yellow-400 hover:bg-yellow-500 text-black border-none">
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
