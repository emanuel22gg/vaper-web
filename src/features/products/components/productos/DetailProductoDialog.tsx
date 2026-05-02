import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Separator } from '@/shared/ui/separator';
import { Package, Calendar, User, DollarSign, Hash, Scale, Ruler, Tag, Building2, AlertTriangle, Info, PackageCheck, Archive } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getImage } from '@/shared/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/ui/utils";

import { Categoria, Producto } from '@/shared/types';

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
    if (!producto) {
      setImageUrl(null);
      return;
    }

    if (producto.idImagen) {
      getImage(producto.idImagen)
        .then(data => {
          if (data && data.urlimagen) {
            setImageUrl(data.urlimagen);
          } else {
            setImageUrl(producto.imagen || null);
          }
        })
        .catch(err => {
          console.error("Error al cargar imagen del producto", err);
          setImageUrl(producto.imagen || null);
        });
    } else {
      setImageUrl(producto.imagen || null);
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
        <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles del Producto</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Información del catálogo y control de inventario.
              </DialogDescription>
            </div>
            <Badge 
              variant="outline"
              className={cn(
                "px-3 py-1 rounded-full text-[12px] font-bold border-none text-white",
                producto.estado ? "bg-emerald-500" : "bg-gray-400"
              )}
            >
              {producto.estado ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-10">
          {/* Cabecera del Producto */}
          <div className="flex items-center gap-6">
            {imageUrl ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div title="Ver imagen ampliada" className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-blue-500 transition-all">
                    <img
                      src={imageUrl}
                      alt={producto.nombreProducto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent hideClose={true} className="sm:max-w-2xl bg-transparent border-none shadow-none flex justify-center p-0">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Imagen de {producto.nombreProducto}</DialogTitle>
                    <DialogDescription>Vista ampliada</DialogDescription>
                  </DialogHeader>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md p-2">
                    <img
                      src={imageUrl}
                      alt={producto.nombreProducto}
                      className="max-w-full max-h-[80vh] object-contain rounded-xl"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {producto.nombreProducto}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none hover:bg-gray-200">
                  ID: {producto.id}
                </Badge>
                {producto.categoria?.nombreCategoria && (
                  <Badge variant="outline" className="border-gray-200 text-gray-600 bg-white shadow-sm flex items-center gap-1.5 px-2.5">
                    <Building2 className="h-3 w-3 text-blue-500" />
                    {producto.categoria.nombreCategoria}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 mb-8">
              <TabsTrigger 
                value="info" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <Info className="h-4 w-4" /> Información General
              </TabsTrigger>
              <TabsTrigger 
                value="inventario" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <PackageCheck className="h-4 w-4" /> Inventario y Precio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Descripción del Producto</h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {producto.descripcion || "Sin descripción disponible."}
                  </p>
                </div>
              </div>

              {producto.categoria && (
                <>
                  <Separator className="bg-gray-100" />
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detalles de Categoría</h4>
                    <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100/50">
                      <p className="font-semibold text-blue-900 text-sm">{producto.categoria.nombreCategoria}</p>
                      {producto.categoria.descripcion && (
                        <p className="text-sm text-blue-700/80 mt-1">{producto.categoria.descripcion}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="inventario" className="space-y-8 animate-in fade-in-50 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Archive className="h-3.5 w-3.5" /> Estado de Almacén
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                        producto.stock === 0 ? "bg-red-50" :
                        producto.stock <= 10 ? "bg-amber-50" : "bg-emerald-50"
                      )}>
                        {producto.stock === 0 ? <AlertTriangle className="h-6 w-6 text-red-500" /> :
                         producto.stock <= 10 ? <AlertTriangle className="h-6 w-6 text-amber-500" /> :
                         <PackageCheck className="h-6 w-6 text-emerald-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">Stock Actual</p>
                        <p className="text-2xl font-black text-gray-900 tabular-nums leading-none">
                          {producto.stock} <span className="text-sm font-medium text-gray-400">uds.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" /> Valoración
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <DollarSign className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">Precio Unitario</p>
                        <p className="text-2xl font-black text-gray-900 tabular-nums leading-none">
                          ${producto.precio.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-8 border-t border-gray-100 bg-white">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto h-11 px-8 font-medium text-gray-600 hover:bg-gray-50 border-gray-200 rounded-xl"
          >
            Cerrar Detalles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
