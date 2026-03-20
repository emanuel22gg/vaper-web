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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una nueva categoría.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="w-full">
            <Label htmlFor="nombreCategoria">Nombre de Categoría *</Label>
            <div className="h-2"></div>
            <Input
              id="nombreCategoria"
              value={formData.nombreCategoria}
              onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
              placeholder="Nombre"
              className="w-full"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="descripcion">Descripción</Label>
            <div className="h-2"></div>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción"
              rows={3}
              className="w-full resize-none"
            />
          </div>


          <div className="w-full">
            <ImageSelector
              selectedImageId={formData.idImagen}
              previewUrl={formData.previewUrl}
              onImageSelect={(id, url) => setFormData({
                ...formData,
                idImagen: id,
                previewUrl: url,
                imageFile: undefined // Clear file if selecting from gallery
              })}
              onFileSelect={(file) => {
                // Validar que solo se permitan imágenes PNG o JPG
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
                    idImagen: undefined // Clear ID if uploading new
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
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.nombreCategoria.trim()} className="w-full sm:w-auto">
            {isSubmitting ? "Guardando..." : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
