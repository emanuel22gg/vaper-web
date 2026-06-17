import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ShoppingCart, Plus, Minus, Loader2, ArrowLeft, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/shared/components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { getProductos, getCategorias, getAllImages } from '@/shared/services/api';
import { Producto, Categoria } from '@/shared/types';

const ProductCard: React.FC<{ product: Producto, isMayorista: boolean }> = ({ product, isMayorista }) => {
  const { cart, addToCart } = useCart();
  const quantityInCart = cart.find(item => item.id === product.id.toString())?.quantity || 0;
  const maxAvailable = product.stock - quantityInCart;
  const [quantity, setQuantity] = useState(1);
  const currentPrice = isMayorista && product.precioMayorista && product.precioMayorista > 0 ? product.precioMayorista : product.precio;

  // Ajustar cantidad local si el stock disponible cambia (ej. al agregar al carrito)
  useEffect(() => {
    if (maxAvailable <= 0) {
      setQuantity(0);
    } else if (quantity > maxAvailable) {
      setQuantity(maxAvailable);
    } else if (quantity === 0 && maxAvailable > 0) {
      setQuantity(1);
    }
  }, [maxAvailable, quantity]);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: product.nombreProducto,
        price: currentPrice,
        stock: product.stock,
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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(0); // Temporalmente 0 para permitir borrar el input
      return;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;

    if (parsed > maxAvailable) {
      setQuantity(maxAvailable);
      toast.warning(`Solo hay ${maxAvailable} unidades disponibles`);
    } else {
      setQuantity(parsed);
    }
  };

  const handleBlur = () => {
    if (quantity < 1 && maxAvailable > 0) {
      setQuantity(1);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 relative">
      <div 
        className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-4 cursor-pointer"
        onClick={() => {
          const detailEvent = new CustomEvent('showProductDetail', { detail: product });
          window.dispatchEvent(detailEvent);
        }}
      >
        {product.imagen ? (
          <ImageWithFallback
            src={product.imagen}
            alt={product.nombreProducto}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Package className="h-10 w-10 text-gray-300 group-hover:text-yellow-500 transition-colors" />
        )}

      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">{product.categoria?.nombreCategoria || 'Sin Categoría'}</span>
        </div>
        <div style={{ height: "2.8rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }} className="mb-1">
          <h3 
            className="font-bold text-gray-900 text-base group-hover:text-yellow-600 transition-colors w-full leading-tight cursor-pointer" 
            title={product.nombreProducto}
            onClick={() => {
              const detailEvent = new CustomEvent('showProductDetail', { detail: product });
              window.dispatchEvent(detailEvent);
            }}
          >
            {product.nombreProducto}
          </h3>
        </div>
        {product.descripcion && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-2 leading-relaxed" title={product.descripcion}>
            {product.descripcion}
          </p>
        )}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex flex-col mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-black">${currentPrice.toLocaleString('es-CO')}</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                {product.stock > 0 ? `${product.stock} disp.` : "Agotado"}
              </span>
            </div>
            {isMayorista && product.precioMayorista && product.precioMayorista > 0 && product.precioMayorista < product.precio && (
              <span className="text-xs text-gray-400 line-through mt-1">Normal: ${product.precio.toLocaleString('es-CO')}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1 w-full bg-gray-50 p-1 rounded-lg border border-gray-100">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 shrink-0 text-gray-500 hover:text-black hover:bg-white rounded-md shadow-sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity === 0 ? '' : quantity}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                className="w-12 text-center text-sm font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 shrink-0 text-gray-500 hover:text-black hover:bg-white rounded-md shadow-sm"
                onClick={incrementQuantity}
                disabled={quantity >= maxAvailable || maxAvailable === 0}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 font-bold py-4 rounded-xl transition-all shadow-md shadow-yellow-500/20"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || maxAvailable <= 0 || quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {product.stock > 0 && maxAvailable <= 0 ? "Límite" : "Agregar"}
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-gray-50 border-gray-200 py-4 rounded-xl px-3"
                onClick={() => {
                  const detailEvent = new CustomEvent('showProductDetail', { detail: product });
                  window.dispatchEvent(detailEvent);
                }}
              >
                Ver
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductCatalogProps {
  searchTerm?: string;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ searchTerm = '' }) => {
  const { user } = useAuth();
  const isMayorista = user?.tipoCliente === 'Mayorista';
  const [apiProductos, setApiProductos] = useState<Producto[]>([]);
  const [apiCategorias, setApiCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const { cart, addToCart } = useCart();

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
          const matchingCategory = cats.find(c => c.id === p.categoriaId);
          return {
            ...p,
            imagen: matchingImage ? matchingImage.urlimagen : p.imagen,
            categoria: matchingCategory || p.categoria
          };
        });

        const categoriesWithImages = cats.map(c => {
          const matchingImage = images.find(img => img.idImagen === c.idImagen);
          return {
            ...c,
            imagen: matchingImage ? matchingImage.urlimagen : undefined
          };
        });

        setApiProductos(productsWithImages.filter(p => p.estado));
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

  useEffect(() => {
    const handleCategorySelection = (e: Event) => {
      const customEvent = e as CustomEvent<{ categoryId: number }>;
      setSelectedCategoryId(customEvent.detail.categoryId);
    };

    window.addEventListener('selectCategory', handleCategorySelection);
    
    const handleShowDetail = (e: Event) => {
      const customEvent = e as CustomEvent<Producto>;
      setSelectedProduct(customEvent.detail);
    };
    window.addEventListener('showProductDetail', handleShowDetail);
    
    return () => {
      window.removeEventListener('selectCategory', handleCategorySelection);
      window.removeEventListener('showProductDetail', handleShowDetail);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  // Obtenemos los productos para la categoría seleccionada o todos
  let categoryProducts = selectedCategoryId === 'all'
    ? apiProductos
    : selectedCategoryId
      ? apiProductos.filter(p => p.categoriaId === selectedCategoryId)
      : apiProductos; // If null, we might use all products for global search

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    categoryProducts = categoryProducts.filter(p => 
      p.nombreProducto.toLowerCase().includes(term) || 
      (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
      (p.categoria?.nombreCategoria && p.categoria.nombreCategoria.toLowerCase().includes(term))
    );
  }

  const selectedCategoryName = selectedCategoryId === 'all'
    ? 'Todos los Productos'
    : selectedCategoryId
      ? apiCategorias.find(c => c.id === selectedCategoryId)?.nombreCategoria
      : null;

  return (
    <div id="catalogo" className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {selectedCategoryId === null && !searchTerm ? (
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
              {selectedCategoryId !== null && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCategoryId(null)}
                  className="absolute left-4 sm:left-6 hover:bg-gray-100 text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Atrás</span>
                </Button>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-yellow-500" />
                {searchTerm && selectedCategoryId === null ? `Resultados para "${searchTerm}"` : selectedCategoryName}
              </h2>
            </div>

            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} isMayorista={isMayorista} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No hay productos disponibles en esta categoría.
              </div>
            )}
            
            {/* Dialog de producto detallado */}
            <Dialog
              open={!!selectedProduct}
              onOpenChange={() => setSelectedProduct(null)}
            >
              <DialogContent className="sm:max-w-2xl">
                {selectedProduct && (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedProduct.nombreProducto}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ImageWithFallback
                          src={selectedProduct.imagen || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop"}
                          alt={selectedProduct.nombreProducto}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-600 mb-4 text-lg">
                            {selectedProduct.descripcion}
                          </p>

                          <div className="flex flex-col mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-3xl font-bold text-green-600">
                                $
                                {isMayorista && selectedProduct.precioMayorista && selectedProduct.precioMayorista > 0 ? selectedProduct.precioMayorista.toLocaleString() : selectedProduct.precio.toLocaleString()}
                              </span>
                            </div>
                            {isMayorista && selectedProduct.precioMayorista && selectedProduct.precioMayorista > 0 && selectedProduct.precioMayorista < selectedProduct.precio && (
                              <span className="text-sm text-gray-400 line-through mt-1">Normal: ${selectedProduct.precio.toLocaleString()}</span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm">
                              <Package className="h-4 w-4 inline mr-1" />
                              {selectedProduct.stock} disponibles
                            </p>
                            <p className="text-sm border p-2 rounded-md inline-block bg-gray-50">
                              Categoría: <span className="font-semibold">{selectedProduct.categoria?.nombreCategoria || "Sin categoría"}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        className="w-full"
                        onClick={() => {
                          addToCart({
                            id: selectedProduct.id.toString(),
                            name: selectedProduct.nombreProducto,
                            price: isMayorista && selectedProduct.precioMayorista && selectedProduct.precioMayorista > 0 ? selectedProduct.precioMayorista : selectedProduct.precio,
                            stock: selectedProduct.stock,
                            image: selectedProduct.imagen || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
                            category: selectedProduct.categoria?.nombreCategoria || 'Sin Categoría',
                          }, 1);
                          setSelectedProduct(null);
                          toast.success(`1 ${selectedProduct.nombreProducto} agregado al carrito`);
                        }}
                        disabled={selectedProduct.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {selectedProduct.stock === 0 ? "Producto Agotado" : "Agregar al Carrito"}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

          </div>
        )}
      </div>
    </div>
  );
};
