import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Package, Calendar, User, DollarSign, Hash, Scale, Ruler, Tag, Building2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getImage } from '../../services/api';

import { Categoria, Producto } from '../../types';

interface DetailProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
}

export const DetailProductoDialog: React.FC<DetailProductoDialogProps> = ({
  isOpen,
  onClose,
  producto
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (producto?.idImagen) {
      getImage(producto.idImagen)
        .then(data => setImageUrl(data.urlimagen))
        .catch(err => {
          console.error("Error al cargar imagen del producto", err);
          setImageUrl(null);
        });
    } else {
      setImageUrl(producto?.imagen || null);
    }
  }, [producto]);

  if (!producto) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadgeVariant = (estado: boolean) => {
    return estado ? 'default' : 'secondary';
  };

  const getStockBadgeVariant = () => {
    if (producto.stock === 0) return 'destructive';
    if (producto.stock <= 10) return 'secondary'; // Umbral fijo de stock bajo
    return 'default';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Producto
          </DialogTitle>
          <DialogDescription>
            Información completa del producto seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información principal */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              {imageUrl ? (
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={producto.nombreProducto}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{producto.nombreProducto}</h3>
                  <Badge variant={getEstadoBadgeVariant(producto.estado)}>
                    {producto.estado ? "Activo" : "Inactivo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto bg-gray-100 px-2 py-1 rounded">ID: {producto.id}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección de Descripción Prominente */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Descripción del Producto
            </h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-gray-700 leading-relaxed">
                {producto.descripcion || "Sin descripción disponible."}
              </p>
            </div>
          </div>

          <Separator />

          {/* Grid de dos columnas para información compacta */}
          <div className="grid grid-cols-2 gap-4">
            {/* Información de inventario */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Inventario
              </h4>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stock</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getStockBadgeVariant()}>
                    {producto.stock} unidades
                  </Badge>
                  {producto.stock <= 10 && producto.stock > 0 && (
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Información de precios */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Precio
              </h4>
              <div>
                
                <p className="font-semibold">${producto.precio.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información de categoría */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Categoría
            </h4>
            <div>
              <p className="font-medium text-sm">{producto.categoria?.nombreCategoria || 'Sin categoría'}</p>
              <p className="text-xs text-muted-foreground">{producto.categoria?.descripcion || ''}</p>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
