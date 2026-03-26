import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Categoria, CategoriaFormData } from '@/shared/types';
import { uploadImage, createCategoria } from '@/shared/services/api';
import { ImageSelector } from '@/shared/components/ImageSelector';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Hash, FileText, ImageIcon, Loader2 } from 'lucide-react';

interface CreateCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoriaFormData;
  setFormData: (data: CategoriaFormData) => void;
  onSuccess: () => void;
  categorias: Categoria[];
}

export const CreateCategoriaDialog: React.FC<CreateCategoriaDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSuccess,
  categorias
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.nombreCategoria.trim()) return;

    // Validation: Check for duplicate name
    const normalizedName = formData.nombreCategoria.trim().toLowerCase();
    const isDuplicate = categorias.some(
      c => c.nombreCategoria.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      toast.error("Ya existe una categoría con este nombre.");
      return;
    }

    setIsSubmitting(true);

    setIsSubmitting(true);
    try {
      let idImagen = formData.idImagen;

      if (formData.imageFile) {
        const imageResponse = await uploadImage(formData.imageFile);
        idImagen = imageResponse.idImagen;
      }

      await createCategoria({
        nombreCategoria: formData.nombreCategoria,
        descripcion: formData.descripcion,
        estado: formData.estado,
        idImagen: idImagen
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error al crear la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageFile: file,
          previewUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
        <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Nueva Categoría</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Complete los datos para registrar una nueva categoría.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-10">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
              <TabsTrigger 
                value="basic" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <Hash className="h-4 w-4" /> Información Básica
              </TabsTrigger>
              <TabsTrigger 
                value="visuals" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <ImageIcon className="h-4 w-4" /> Elementos Visuales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-8 animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombreCategoria">Nombre de Categoría *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="nombreCategoria"
                      value={formData.nombreCategoria}
                      onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
                      placeholder="Ej: Accesorios Vapers"
                      className="pl-9 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <div className="relative">
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Breve descripción de los productos que incluye esta categoría..."
                      rows={4}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visuals" className="space-y-8 animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" /> Imagen de la Categoría
                  </Label>
                  <ImageSelector
                    selectedImageId={formData.idImagen}
                    previewUrl={formData.previewUrl}
                    onImageSelect={(id, url) => setFormData({
                      ...formData,
                      idImagen: id,
                      previewUrl: url,
                      imageFile: undefined
                    })}
                    onFileSelect={(file) => {
                      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                      if (!allowedTypes.includes(file.type)) {
                        toast.error("Solo se permiten archivos con formato PNG o JPG");
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({
                          ...formData,
                          imageFile: file,
                          previewUrl: reader.result as string,
                          idImagen: undefined
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    onClear={() => setFormData({
                      ...formData,
                      imageFile: undefined,
                      previewUrl: undefined,
                      idImagen: undefined
                    })}
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Esta imagen se mostrará en el catálogo para representar la categoría.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0 mt-8">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto sm:mr-3 h-10 px-6 font-medium text-gray-600 hover:bg-gray-50 border-gray-200">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.nombreCategoria.trim()} 
              className="w-full sm:w-auto h-10 px-6 bg-black hover:bg-gray-800 text-white font-medium border-none transition-all"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? "Guardando..." : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
