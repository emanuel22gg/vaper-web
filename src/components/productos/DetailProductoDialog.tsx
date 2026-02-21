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

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  precio: number;
  stock: number;
  estado: 'activo' | 'inactivo' | 'agotado' | 'descontinuado';
  imagen?: string;
  marca?: string;
  modelo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
}

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
              {producto.imagen ? (
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
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
                  <h3 className="font-semibold">{producto.nombre}</h3>
                  <Badge variant={getEstadoBadgeVariant(producto.estado)}>
                    {producto.estado}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {producto.codigo}
                  </span>
                  {producto.marca && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {producto.marca} {producto.modelo}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
              </div>
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
                <p className="text-xs text-muted-foreground mb-1">Precio de venta</p>
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
              <p className="font-medium text-sm">{producto.categoria.nombre}</p>
              <p className="text-xs text-muted-foreground">{producto.categoria.descripcion}</p>
            </div>
          </div>

          <Separator />

          {/* Información del sistema */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Información del Sistema
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Creado por</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {producto.creadoPor}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Fecha de creación</p>
                <p className="text-sm font-medium">{formatDate(producto.fechaCreacion)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-0.5">Última actualización</p>
                <p className="text-sm font-medium">{formatDate(producto.fechaActualizacion)}</p>
              </div>
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
