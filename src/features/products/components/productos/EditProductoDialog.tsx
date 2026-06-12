import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { ImageSelector } from '@/shared/components/ImageSelector';
import { uploadImage } from '@/shared/services/api';
import { toast } from "sonner";

import { Categoria, Producto, ProductoDto } from '@/shared/types';

interface EditProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
  onProductoUpdated: (producto: ProductoDto) => void;
  categorias: Categoria[];
  productos: Producto[];
}

export const EditProductoDialog: React.FC<EditProductoDialogProps> = ({
  isOpen,
  onClose,
  producto,
  onProductoUpdated,
  categorias,
  productos
}) => {
  const [formData, setFormData] = useState({
    nombreProducto: '',
    descripcion: '',
    categoriaId: '',
    precio: '',
    precioMayorista: '',
    stock: '',
    estado: true,
    imagen: '',
    idImagen: undefined as number | undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImageId, setSelectedImageId] = useState<number | undefined>(undefined);

  // Cargar datos del producto cuando se abre el diálogo
  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombreProducto: producto.nombreProducto,
        descripcion: producto.descripcion,
        categoriaId: (producto.categoriaId || producto.categoria?.id || 0).toString(),
        precio: producto.precio.toString(),
        precioMayorista: producto.precioMayorista?.toString() || '',
        stock: producto.stock.toString(),
        estado: producto.estado,
        imagen: producto.imagen || '',
        idImagen: producto.idImagen
      });
      setImagePreview(producto.imagen || '');
      setImageFile(null);
      setSelectedImageId(producto.idImagen);
    }
  }, [producto, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageFileSelect = (file: File) => {
    // Validar tipo de archivo (solo PNG y JPG)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Solo se permiten archivos PNG o JPG");
      return;
    }

    // Validar tamaño máximo de 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    setImageFile(file);
    setSelectedImageId(undefined);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageGallerySelect = (id: number, url: string) => {
    setSelectedImageId(id);
    setImagePreview(url);
    setImageFile(null);
  };

  const handleImageClear = () => {
    setImageFile(null);
    setImagePreview('');
    setSelectedImageId(undefined);
  };

  const validateForm = () => {
    if (!formData.nombreProducto.trim()) {
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
      toast.error("El precio del producto debe ser mayor a 0");
      return false;
    }
    // Validar stock solo si está ingresado y no es vacío
    if (formData.stock && parseInt(formData.stock) < 0) {
      toast.error("El stock no puede ser negativo");
      return false;
    }

    // Validación de nombre único (excluyendo el actual)
    const nombreDuplicado = productos.some(
      p => p.id !== producto?.id && p.nombreProducto.toLowerCase().trim() === formData.nombreProducto.toLowerCase().trim()
    );
    if (nombreDuplicado) {
      toast.error("Ya existe otro producto con este nombre");
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
    const loadingToast = toast.loading("Actualizando producto...");

    try {
      let finalIdImagen = selectedImageId;

      // 1. Si hay un nuevo archivo, subirlo primero
      if (imageFile) {
        toast.loading("Subiendo nueva imagen...", { id: loadingToast });
        try {
          const uploadedImage = await uploadImage(imageFile);
          finalIdImagen = uploadedImage.idImagen;
        } catch (uploadError) {
          console.error("Error al subir imagen:", uploadError);
          toast.error("Error al subir la imagen, se actualizará el producto con la imagen previa.", { id: loadingToast });
        }
      }

      const categoria = categorias.find(c => c.id === parseInt(formData.categoriaId));

      if (!categoria) {
        toast.error("Error al procesar categoría");
        return;
      }


      const data: ProductoDto = {
        nombreProducto: formData.nombreProducto.trim(),
        descripcion: formData.descripcion.trim(),
        categoriaId: categoria.id,
        precio: formData.precio ? parseFloat(formData.precio) : 0,
        precioMayorista: formData.precioMayorista ? parseFloat(formData.precioMayorista) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        estado: formData.estado,
        idImagen: finalIdImagen
      };

      await onProductoUpdated(data);

      toast.success("Producto actualizado exitosamente", {
        id: loadingToast,
        description: `Los cambios en "${data.nombreProducto}" han sido guardados.`
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
            Modifique los datos del producto "{producto.nombreProducto}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del Producto */}
          <div className="space-y-2">
            <Label htmlFor="nombreProducto">Nombre del Producto *</Label>
            <Input
              id="nombreProducto"
              value={formData.nombreProducto}
              onChange={(e) => handleInputChange('nombreProducto', e.target.value)}
              placeholder="Ej: Vape Desechable Cherry"
              required
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={formData.categoriaId}
              onValueChange={(value: string) => handleInputChange('categoriaId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.filter(c => c.estado).map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nombreCategoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio de Venta *</Label>
              <Input
                id="precio"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                placeholder="25000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioMayorista">Precio Mayorista (Opcional)</Label>
              <Input
                id="precioMayorista"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.precioMayorista}
                onChange={(e) => handleInputChange('precioMayorista', e.target.value)}
                placeholder="20000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock (Opcional)</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="100"
              />
            </div>
          </div>


          {/* Imagen del Producto */}
          <ImageSelector
            selectedImageId={selectedImageId}
            previewUrl={imagePreview}
            onImageSelect={handleImageGallerySelect}
            onFileSelect={handleImageFileSelect}
            onClear={handleImageClear}
          />

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
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white border-none">
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
