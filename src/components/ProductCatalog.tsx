import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ShoppingCart, Plus, Minus, Loader2, ArrowLeft, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getProductos, getCategorias, getAllImages } from '../services/api';
import { Producto, Categoria } from '../types';

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
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-gray-100">
          <ImageWithFallback
            src={product.imagen || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'}
            alt={product.nombreProducto}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 line-clamp-2">{product.nombreProducto}</CardTitle>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.descripcion}</p>
        <p className="text-2xl font-bold text-primary">
          ${product.precio.toLocaleString('es-CO')}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
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
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full text-[rgb(0,0,0)] bg-[rgb(240,177,0,100)] hover:bg-gray-400 disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ProductCatalog: React.FC = () => {
  const [apiProductos, setApiProductos] = useState<Producto[]>([]);
  const [apiCategorias, setApiCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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

  // Obtenemos los productos para la categoría seleccionada
  const categoryProducts = selectedCategoryId 
    ? apiProductos.filter(p => p.categoriaId === selectedCategoryId)
    : [];

  const selectedCategory = selectedCategoryId 
    ? apiCategorias.find(c => c.id === selectedCategoryId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Nuestro Catálogo</h1>
          <p className="text-muted-foreground">
            Descubre nuestra selección de productos premium
          </p>
        </div>

        {selectedCategoryId === null ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiCategorias.map((category) => {
                // Determine if category has active products
                const hasProducts = apiProductos.some(p => p.categoriaId === category.id);
                if (!hasProducts) return null;

                return (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 overflow-hidden flex flex-col"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <div className="h-48 relative bg-gray-100 flex items-center justify-center border-b">
                      {category.imagen ? (
                        <ImageWithFallback 
                          src={category.imagen} 
                          alt={category.nombreCategoria}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Package className="h-8 w-8 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="text-center p-6 bg-white flex-1 flex flex-col justify-center">
                      <CardTitle className="text-2xl">{category.nombreCategoria}</CardTitle>
                      <p className="text-muted-foreground mt-2 text-sm line-clamp-2">
                        {category.descripcion || `Explora productos de ${category.nombreCategoria}`}
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
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategoryId(null)}
                className="mr-4 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a Categorías
              </Button>
              <h2 className="text-2xl font-bold border-l-4 border-yellow-500 pl-4">
                {selectedCategory?.nombreCategoria}
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
