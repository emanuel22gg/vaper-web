import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { AlertTriangle, Package, DollarSign } from 'lucide-react';
import { toast } from "sonner";
import { deleteProducto } from '@/shared/services/api';
import { Categoria, Producto } from '@/shared/types';

interface DeleteProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
  onProductoDeleted: (productoId: number) => void;
}

export const DeleteProductoDialog: React.FC<DeleteProductoDialogProps> = ({
  isOpen,
  onClose,
  producto,
  onProductoDeleted
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!producto) return;

    setIsLoading(true);

    try {
      await deleteProducto(producto.id);

      onProductoDeleted(producto.id);

      toast.success("Producto eliminado exitosamente", {
        description: `"${producto.nombreProducto}" ha sido eliminado del inventario.`
      });

      onClose();
    } catch (error) {
      toast.error("Error al eliminar el producto", {
        description: "Por favor, inténtelo nuevamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!producto) return null;

  const getEstadoBadgeVariant = (estado: boolean) => {
    return estado ? 'default' : 'secondary';
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Producto
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del producto */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              {producto.imagen ? (
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={producto.imagen}
                    alt={producto.nombreProducto}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <h4 className="font-medium">{producto.nombreProducto}</h4>
                <Badge variant={getEstadoBadgeVariant(producto.estado)} className="text-xs">
                  {producto.estado ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Advertencias */}
          <div className="space-y-3">
            {producto.stock > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Stock disponible</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Este producto tiene {producto.stock} unidades en stock. Al eliminarlo,
                  perderás el registro de este inventario.
                </p>
              </div>
            )}

          </div>

          {/* Confirmación */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              ¿Está seguro de que desea eliminar <strong>"{producto.nombreProducto}"</strong>?
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
