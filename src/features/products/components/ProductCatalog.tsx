 import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ShoppingCart, Plus, Minus, Loader2, ArrowLeft, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/shared/contexts/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/shared/components/figma/ImageWithFallback';
import { getProductos, getCategorias, getAllImages } from '@/shared/services/api';
import { Producto, Categoria } from '@/shared/types';

const ProductCard: React.FC<{ product: Producto }> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: product.nombreProducto,
        price: product.precio,
        image: product.imagen || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
        category: product.categoria?.nombreCategoria || 'Sin Categoría',
      },
      quantity
    );
    toast.success(`${quantity} ${product.nombreProducto} agregado al carrito`);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
      <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.imagen ? (
          <ImageWithFallback 
            src={product.imagen}
            alt={product.nombreProducto}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Package className="h-10 w-10 text-gray-300 group-hover:text-yellow-500 transition-colors" />
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">{product.categoria?.nombreCategoria || 'Sin Categoría'}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 mt-2 group-hover:text-yellow-600 transition-colors min-h-[3.5rem]" title={product.nombreProducto}>
          {product.nombreProducto}
        </h3>
        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-black">${product.precio.toLocaleString('es-CO')}</span>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 w-full bg-gray-50 p-1 rounded-lg border border-gray-100">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 shrink-0 text-gray-500 hover:text-black hover:bg-white rounded-md shadow-sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-base font-semibold w-8 text-center">{quantity}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 shrink-0 text-gray-500 hover:text-black hover:bg-white rounded-md shadow-sm"
                onClick={incrementQuantity}
                disabled={product.stock <= quantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              size="sm" 
              className="w-full text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 font-bold py-5 rounded-xl transition-all shadow-md shadow-yellow-500/20"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCatalog: React.FC = () => {
  const [apiProductos, setApiProductos] = useState<Producto[]>([]);
  const [apiCategorias, setApiCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prods, cats, images] = await Promise.all([
          getProductos(),
          getCategorias(),
          getAllImages()
        ]);
        
        const productsWithImages = prods.map(p => {
          const matchingImage = images.find(img => img.idImagen === p.idImagen);
          return {
            ...p,
            imagen: matchingImage ? matchingImage.urlimagen : p.imagen
          };
        });

        const categoriesWithImages = cats.map(c => {
          const matchingImage = images.find(img => img.idImagen === c.idImagen);
          return {
            ...c,
            imagen: matchingImage ? matchingImage.urlimagen : undefined
          };
        });

        setApiProductos(productsWithImages.filter(p => p.estado && p.stock > 0)); 
        setApiCategorias(categoriesWithImages.filter(c => c.estado));
      } catch (error) {
        console.error("Error fetching catalog data:", error);
        toast.error("Error al cargar el catálogo de productos");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  // Obtenemos los productos para la categoría seleccionada o todos
  const categoryProducts = selectedCategoryId === 'all'
    ? apiProductos
    : selectedCategoryId 
      ? apiProductos.filter(p => p.categoriaId === selectedCategoryId)
      : [];

  const selectedCategoryName = selectedCategoryId === 'all'
    ? 'Todos los Productos'
    : selectedCategoryId 
      ? apiCategorias.find(c => c.id === selectedCategoryId)?.nombreCategoria
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {selectedCategoryId === null ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tight">
                Explora Nuestras <span className="text-yellow-500">Categorías</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Navega por nuestras líneas de dispositivos y encuentra exactamente lo que buscas con la mejor calidad del mercado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card 
                className="group cursor-pointer rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white flex flex-col h-full"
                onClick={() => setSelectedCategoryId('all')}
              >
                {/* Image Section */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-yellow-50 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                    <ShoppingBag className="h-16 w-16 text-yellow-500/80 group-hover:text-yellow-600 transition-colors duration-300" />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                    Todos los Productos
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mt-1 flex-1">
                    Explora nuestro catálogo completo sin filtros.
                  </p>
                  
                  <div className="mt-4 flex items-center text-yellow-600 font-medium">
                    <span className="text-sm uppercase tracking-wider">Ver Productos</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>

              {apiCategorias.map((category) => {
                // Determine if category has active products
                const hasProducts = apiProductos.some(p => p.categoriaId === category.id);
                if (!hasProducts) return null;

                return (
                  <Card 
                    key={category.id} 
                    className="group cursor-pointer rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white flex flex-col h-full"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-50 flex items-center justify-center">
                      {category.imagen ? (
                        <ImageWithFallback 
                          src={category.imagen} 
                          alt={category.nombreCategoria}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                          <Package className="h-16 w-16 text-gray-300 group-hover:text-yellow-500 transition-colors duration-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                        {category.nombreCategoria}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mt-1 flex-1">
                        {category.descripcion || `Haz clic para ver los productos por categoría de ${category.nombreCategoria.toLowerCase()}.`}
                      </p>

                      <div className="mt-4 flex items-center text-yellow-600 font-medium">
                        <span className="text-sm uppercase tracking-wider">Ver Productos</span>
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {apiProductos.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No hay productos disponibles en el catálogo en este momento.
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="relative flex items-center justify-center mb-16 py-6 px-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategoryId(null)}
                className="absolute left-4 sm:left-6 hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Atrás</span>
              </Button>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-yellow-500" />
                {selectedCategoryName}
              </h2>
            </div>
            
            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
               <div className="text-center text-gray-500 py-12">
                 No hay productos disponibles en esta categoría.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
