import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Categoria } from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { getImage } from '@/shared/services/api';

interface DetailCategoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
}

export const DetailCategoriaDialog: React.FC<DetailCategoriaDialogProps> = ({
  open,
  onOpenChange,
  categoria,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (categoria?.idImagen) {
      getImage(categoria.idImagen)
        .then(data => setImageUrl(data.urlimagen))
        .catch(err => console.error(err));
    } else {
      setImageUrl(null);
    }
  }, [categoria]);

  if (!categoria) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de Categoría</DialogTitle>
          <DialogDescription>
            Información detallada de la categoría # {categoria.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={categoria.nombreCategoria} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Sin Imagen</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Nombre</h3>
              <p className="text-lg font-medium">{categoria.nombreCategoria}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Descripción</h3>
              <p className="text-base">{categoria.descripcion || "Sin descripción"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500">Estado</h3>
              <Badge variant={categoria.estado ? 'default' : 'secondary'}>
                {categoria.estado ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
