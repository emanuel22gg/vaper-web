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
import { ImageSelector } from '../shared/ImageSelector';

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
    puffs: '',
    idImagen: undefined as number | undefined,
    imageFile: undefined as File | undefined,
    previewUrl: undefined as string | undefined
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        imagen: formData.previewUrl || formData.imagen.trim() || undefined,
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
      puffs: '',
      idImagen: undefined,
      imageFile: undefined,
      previewUrl: undefined
    });
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
            <ImageSelector
              selectedImageId={formData.idImagen}
              previewUrl={formData.previewUrl}
              onImageSelect={(id, url) => setFormData({
                ...formData,
                idImagen: id,
                previewUrl: url,
                imageFile: undefined,
                imagen: url
              })}
              onFileSelect={(file) => {
                // Validar que solo se permitan imágenes PNG o JPG
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                if (!allowedTypes.includes(file.type)) {
                  toast.error("Solo se permiten archivos con formato PNG o JPG");
                  return;
                }
                
                // Validar tamaño (5MB)
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("La imagen no debe superar 5MB");
                  return;
                }
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  setFormData({
                    ...formData,
                    imageFile: file,
                    previewUrl: reader.result as string,
                    idImagen: undefined,
                    imagen: reader.result as string
                  });
                };
                reader.readAsDataURL(file);
              }}
              onClear={() => setFormData({
                ...formData,
                imageFile: undefined,
                previewUrl: undefined,
                idImagen: undefined,
                imagen: ''
              })}
            />
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
