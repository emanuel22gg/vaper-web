import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Categoria, CategoriaFormData } from '../../types';
import { uploadImage, createCategoria } from '../../services/api';
import { ImageSelector } from '../shared/ImageSelector';
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una nueva categoría.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nombreCategoria">Nombre de Categoría *</Label>
            <Input
              id="nombreCategoria"
              value={formData.nombreCategoria}
              onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
              placeholder="Nombre"
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción"
              rows={3}
            />
          </div>


          <div>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.nombreCategoria.trim()}>
            {isSubmitting ? "Guardando..." : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
