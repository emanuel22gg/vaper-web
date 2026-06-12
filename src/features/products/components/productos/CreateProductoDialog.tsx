import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Package, Hash, DollarSign, ImageIcon, FileText, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { ImageSelector } from '@/shared/components/ImageSelector';
import { uploadImage } from '@/shared/services/api';

import { Categoria, Producto, ProductoDto } from '@/shared/types';

interface CreateProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoCreated: (producto: ProductoDto) => Promise<void>;
  categorias: Categoria[];
  productos: Producto[];
}

export const CreateProductoDialog: React.FC<CreateProductoDialogProps> = ({
  isOpen,
  onClose,
  onProductoCreated,
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
    if (!formData.nombreProducto.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return false;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      toast.error("El precio del producto debe ser mayor a 0");
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

    // Validación de nombre único
    const nombreDuplicado = productos.some(
      p => p.nombreProducto.toLowerCase().trim() === formData.nombreProducto.toLowerCase().trim()
    );
    if (nombreDuplicado) {
      toast.error("Ya existe un producto con este nombre");
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
    const loadingToast = toast.loading("Creando producto...");

    try {
      let finalIdImagen = formData.idImagen;

      // 1. Si hay un archivo, subirlo primero
      if (formData.imageFile) {
        toast.loading("Subiendo imagen...", { id: loadingToast });
        try {
          const uploadedImage = await uploadImage(formData.imageFile);
          finalIdImagen = uploadedImage.idImagen;
        } catch (uploadError) {
          console.error("Error al subir imagen:", uploadError);
          toast.error("Error al subir la imagen, se creará el producto sin ella.", { id: loadingToast });
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
        precio: formData.precio ? parseFloat(formData.precio) : 0,
        precioMayorista: formData.precioMayorista ? parseFloat(formData.precioMayorista) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        categoriaId: parseInt(formData.categoriaId),
        estado: formData.estado,
        idImagen: finalIdImagen
      };

      await onProductoCreated(data);

      toast.success("Producto creado exitosamente", {
        id: loadingToast,
        description: `El producto "${data.nombreProducto}" ha sido agregado al inventario.`
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
      nombreProducto: '',
      descripcion: '',
      categoriaId: '',
      precio: '',
      precioMayorista: '',
      stock: '',
      estado: true,
      imagen: '',
      idImagen: undefined,
      imageFile: undefined,
      previewUrl: undefined
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Complete los datos del nuevo producto para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package className="h-4 w-4" /> Básico
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Detalles e Imagen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombreProducto">Nombre del Producto *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombreProducto"
                    value={formData.nombreProducto}
                    onChange={(e) => handleInputChange('nombreProducto', e.target.value)}
                    placeholder="Ej: Vape Desechable Cherry"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="precio"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => handleInputChange('precio', e.target.value)}
                      placeholder="25000"
                      className={`pl-9 ${formData.precio !== '' && parseFloat(formData.precio) <= 0 ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      required
                    />
                  </div>
                  {formData.precio !== '' && parseFloat(formData.precio) <= 0 && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <span className="inline-block w-3 h-3">⚠</span> El precio no puede ser $0.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precioMayorista">Precio Mayorista</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="precioMayorista"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.precioMayorista}
                      onChange={(e) => handleInputChange('precioMayorista', e.target.value)}
                      placeholder="20000"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Opcional</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock (Opcional)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      placeholder="0"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Si no se ingresa, el stock será 0</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" /> Imagen del Producto
                </Label>
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
                    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                    if (!allowedTypes.includes(file.type)) {
                      toast.error("Solo se permiten archivos con formato PNG o JPG");
                      return;
                    }

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
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-black hover:bg-gray-800 text-white border-none"
              disabled={isLoading || !formData.nombreProducto || !formData.categoriaId || !formData.precio || parseFloat(formData.precio) <= 0 || !formData.descripcion}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isLoading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
