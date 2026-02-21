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
import { uploadImage, updateCategoria } from '../../services/api';
import { ImageSelector } from '../shared/ImageSelector';
import { toast } from "sonner";

interface EditCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoriaFormData;
  setFormData: (data: CategoriaFormData) => void;
  onSuccess: () => void;
  categoriaId?: number;
  categorias: Categoria[];
}

export const EditCategoriaDialog: React.FC<EditCategoriaDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSuccess,
  categoriaId,
  categorias
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!categoriaId || !formData.nombreCategoria.trim()) return;

    // Validation: Check for duplicate name (excluding current category)
    const normalizedName = formData.nombreCategoria.trim().toLowerCase();
    const isDuplicate = categorias.some(
      c => c.id !== categoriaId && c.nombreCategoria.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      toast.error("Ya existe otra categoría con este nombre.");
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

      await updateCategoria(categoriaId, {
        nombreCategoria: formData.nombreCategoria,
        descripcion: formData.descripcion,
        estado: formData.estado,
        idImagen: idImagen
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error al actualizar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Modifica los datos de la categoría.
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
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
