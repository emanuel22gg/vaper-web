import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { getAllImages } from '@/shared/services/api';
import { ImageneDto } from '@/shared/types';
import { Image, Upload, X, Check } from 'lucide-react';
import { cn } from '@/shared/ui/utils';
import { toast } from "sonner";

interface ImageSelectorProps {
    // Current selection
    selectedImageId?: number;
    previewUrl?: string; // For new file uploads or existing image preview logic

    // Callbacks
    onImageSelect: (id: number, url: string) => void;
    onFileSelect: (file: File) => void;
    onClear: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
    selectedImageId,
    previewUrl,
    onImageSelect,
    onFileSelect,
    onClear
}) => {
    const [images, setImages] = useState<ImageneDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("upload");

    // Fetch images when gallery tab is active
    useEffect(() => {
        if (activeTab === 'gallery' && images.length === 0) {
            setLoading(true);
            getAllImages()
                .then(data => setImages(data))
                .catch(err => console.error("Error loading images", err))
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar que solo sean archivos PNG o JPG
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Solo se permiten archivos PNG o JPG");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("La imagen no puede pesar más de 5MB");
                e.target.value = '';
                return;
            }
            onFileSelect(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Imagen de Categoría</Label>
                {previewUrl && (
                    <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-red-500 hover:text-red-600">
                        <X className="h-4 w-4 mr-1" /> Limpiar selección
                    </Button>
                )}
            </div>

            <div className="border rounded-md p-4 bg-gray-50/50">
                {previewUrl ? (
                    <div className="flex flex-col items-center justify-center p-4 space-y-2">
                        <div className="relative h-24 w-full max-w-xs overflow-hidden rounded-md border bg-white shadow-sm">
                            <img
                                src={previewUrl}
                                alt="Selected"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <p className="text-sm text-gray-500">
                            {selectedImageId ? `Imagen ID: ${selectedImageId}` : 'Nueva imagen seleccionada'}
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">
                                <Upload className="h-4 w-4 mr-2" />
                                Subir Nueva
                            </TabsTrigger>
                            <TabsTrigger value="gallery">
                                <Image className="h-4 w-4 mr-2" />
                                Galería Existente
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="pt-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-10 bg-white">
                                <Upload className="h-10 w-10 text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500 mb-4 text-center">
                                    Arrastra una imagen o haz clic para seleccionar
                                </p>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        document.getElementById('image-upload')?.click();
                                    }}
                                >
                                    Seleccionar Archivo
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="gallery" className="pt-4">
                            <ScrollArea className="h-[300px] w-full rounded-md border bg-white p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-sm text-gray-500">Cargando imágenes...</p>
                                    </div>
                                ) : images.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-sm text-gray-500">No hay imágenes disponibles</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                        {images.map((img) => (
                                            <div
                                                key={img.idImagen}
                                                className={cn(
                                                    "relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 group transition-all",
                                                    selectedImageId === img.idImagen
                                                        ? "border-blue-500 ring-2 ring-blue-500/20"
                                                        : "border-transparent hover:border-gray-200"
                                                )}
                                                onClick={() => onImageSelect(img.idImagen, img.urlimagen)}
                                            >
                                                <img
                                                    src={img.urlimagen}
                                                    alt={`Img ${img.idImagen}`}
                                                    className="h-full w-full object-cover"
                                                />
                                                {selectedImageId === img.idImagen && (
                                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                        <div className="bg-blue-500 rounded-full p-1">
                                                            <Check className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[10px] text-white text-center truncate">ID: {img.idImagen}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};
