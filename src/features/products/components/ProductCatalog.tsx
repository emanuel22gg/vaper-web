import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ShoppingCart, Plus, Minus, Loader2, ArrowLeft, Package } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {product.imagen ? (
          <ImageWithFallback 
            src={product.imagen}
            alt={product.nombreProducto}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-10 w-10 text-gray-400" />
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-sm text-gray-500">{product.categoria?.nombreCategoria || 'Sin Categoría'}</span>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" title={product.nombreProducto}>
          {product.nombreProducto}
        </h3>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-black">${product.precio.toLocaleString('es-CO')}</span>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-3 w-full">
              <Button
                size="sm"
                variant="outline"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={incrementQuantity}
                disabled={product.stock <= quantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              size="sm" 
              className="w-full text-[rgb(0,0,0)] bg-[rgb(240,177,0,100)] hover:bg-yellow-500 disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            {selectedCategoryId === null ? "Explora por Categorías" : "Nuestro Catálogo"}
          </h1>
          <p className="text-muted-foreground">
             {selectedCategoryId === null 
               ? "Selecciona la categoría que estás buscando para ver sus productos"
               : "Descubre nuestra selección de productos premium"}
          </p>
        </div>

        {selectedCategoryId === null ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer shadow-md border-gray-200 hover:shadow-lg hover:border-yellow-500 border-2 transition-all overflow-hidden flex flex-col justify-center items-center"
                onClick={() => setSelectedCategoryId('all')}
              >
                <CardHeader className="text-center p-8 bg-white flex-1 flex flex-col justify-center items-center w-full">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-yellow-500" />
                  </div>
                  <CardTitle className="text-2xl">Todos los Productos</CardTitle>
                  <p className="text-gray-500 mt-2 text-sm">
                    Haz clic para explorar nuestro catálogo completo sin filtros.
                  </p>
                </CardHeader>
              </Card>

              {apiCategorias.map((category) => {
                // Determine if category has active products
                const hasProducts = apiProductos.some(p => p.categoriaId === category.id);
                if (!hasProducts) return null;

                return (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer shadow-md border-gray-200 hover:shadow-lg hover:border-yellow-500 border-2 transition-all overflow-hidden flex flex-col justify-center items-center"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <CardHeader className="text-center p-8 bg-white flex-1 flex flex-col justify-center items-center w-full">
                      <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-yellow-500" />
                      </div>
                      <CardTitle className="text-2xl">{category.nombreCategoria}</CardTitle>
                      <p className="text-gray-500 mt-2 text-sm">
                        Haz clic para ver los productos por categoría de {category.nombreCategoria.toLowerCase()}.
                      </p>
                    </CardHeader>
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
