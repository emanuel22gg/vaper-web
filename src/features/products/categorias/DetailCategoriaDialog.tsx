import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/shared/ui/dialog';
import { Categoria } from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { getImage } from '@/shared/services/api';
import { Info, LayoutDashboard, Tag } from 'lucide-react';
import { cn } from "@/shared/ui/utils";

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-lg">
        <DialogHeader className="p-8 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Detalles de la Categoría</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Información del grupo de productos.
              </DialogDescription>
            </div>
            <Badge 
              variant="outline"
              className={cn(
                "px-3 py-1 rounded-full text-[12px] font-bold border-none text-white",
                categoria.estado ? "bg-emerald-500" : "bg-gray-400"
              )}
            >
              {categoria.estado ? "Activa" : "Inactiva"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-10">
          {/* Cabecera */}
          <div className="flex items-center gap-6">
            {imageUrl ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div title="Ver imagen ampliada" className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-blue-500 transition-all">
                    <img
                      src={imageUrl}
                      alt={categoria.nombreCategoria}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent hideClose={true} className="sm:max-w-2xl bg-transparent border-none shadow-none flex justify-center p-0">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Imagen de {categoria.nombreCategoria}</DialogTitle>
                    <DialogDescription>Vista ampliada</DialogDescription>
                  </DialogHeader>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md p-2">
                    <img
                      src={imageUrl}
                      alt={categoria.nombreCategoria}
                      className="max-w-full max-h-[80vh] object-contain rounded-xl"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                <LayoutDashboard className="h-10 w-10 text-gray-300" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {categoria.nombreCategoria}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none hover:bg-gray-200">
                  ID: {categoria.id}
                </Badge>
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
            </TabsList>

            <TabsContent value="info" className="space-y-10 animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" /> Descripción de Categoría
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {categoria.descripcion || "Sin descripción disponible."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-8 border-t border-gray-100 bg-white">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 px-8 font-medium text-gray-600 hover:bg-gray-50 border-gray-200 rounded-xl"
          >
            Cerrar Detalles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
