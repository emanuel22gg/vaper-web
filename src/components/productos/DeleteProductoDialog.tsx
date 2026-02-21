import React, { useState } from 'react';
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
import { AlertTriangle, Package, DollarSign } from 'lucide-react';
import { toast } from "sonner";

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  proveedor: Proveedor;
  precio: number;
  precioCosto: number;
  stock: number;
  stockMinimo: number;
  estado: 'activo' | 'inactivo' | 'agotado' | 'descontinuado';
  imagen?: string;
  peso?: number;
  dimensiones?: string;
  marca?: string;
  modelo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
}

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
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onProductoDeleted(producto.id);
      
      toast.success("Producto eliminado exitosamente", {
        description: `"${producto.nombre}" ha sido eliminado del inventario.`
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

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'default';
      case 'inactivo':
        return 'secondary';
      case 'agotado':
        return 'destructive';
      case 'descontinuado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const valorInventario = producto.stock * producto.precioCosto;

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
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">{producto.nombre}</h4>
                <p className="text-sm text-muted-foreground">
                  {producto.codigo} • {producto.marca} {producto.modelo}
                </p>
                <Badge variant={getEstadoBadgeVariant(producto.estado)} className="text-xs">
                  {producto.estado}
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

            {valorInventario > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Valor del inventario</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  El valor del inventario actual es de ${valorInventario.toLocaleString()}. 
                  Esta información se perderá permanentemente.
                </p>
              </div>
            )}
          </div>

          {/* Confirmación */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              ¿Está seguro de que desea eliminar <strong>"{producto.nombre}"</strong>? 
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
