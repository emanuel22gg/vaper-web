import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/shared/ui/dialog';
import { Categoria } from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { getImage } from '@/shared/services/api';
import { Building2, Info, LayoutDashboard, Tag, Image as ImageIcon } from 'lucide-react';
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
              <div className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={categoria.nombreCategoria}
                  className="w-full h-full object-cover"
                />
              </div>
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
              <TabsTrigger 
                value="media" 
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none transition-all"
              >
                <ImageIcon className="h-4 w-4" /> Elementos Visuales
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

            <TabsContent value="media" className="space-y-8 animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vista Previa de Imagen</h4>
                {imageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-gray-100 max-w-sm mx-auto">
                    <img src={imageUrl} alt={categoria.nombreCategoria} className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center flex flex-col items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500">Sin elemento visual asignado</p>
                  </div>
                )}
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
