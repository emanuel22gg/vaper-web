import { useEffect, useState } from 'react';
import { ImageWithFallback } from '@/shared/components/figma/ImageWithFallback';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { getProductos, getCategorias, getAllImages } from '@/shared/services/api';
import { Producto, Categoria } from '@/shared/types';
import { Loader2, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/shared/contexts/CartContext';
import { toast } from 'sonner';

const FeaturedProductCard: React.FC<{ product: Producto, categoryName: string }> = ({ product, categoryName }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: product.nombreProducto,
        price: product.precio,
        image: product.imagen || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
        category: categoryName,
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
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
        <Badge className="absolute top-3 left-3 bg-yellow-500 text-black hover:bg-yellow-400">
          Destacado
        </Badge>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-sm text-gray-500">{categoryName}</span>
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
              className="w-full text-[rgb(0,0,0)] bg-[rgb(240,177,0,100)] hover:bg-gray-400 disabled:opacity-50"
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

export function FeaturedProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats, images] = await Promise.all([
          getProductos(),
          getCategorias(),
          getAllImages()
        ]);
        
        const productsWithImages = prods.filter(p => p.estado).slice(0, 4).map(p => {
          const matchingImage = images.find(img => img.idImagen === p.idImagen);
          return {
            ...p,
            imagen: matchingImage ? matchingImage.urlimagen : p.imagen
          };
        });

        setProducts(productsWithImages);
        setCategories(cats);
      } catch (error) {
        console.error('Error cargando productos destacados', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (id: number) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.nombreCategoria : 'General';
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Productos <span className="text-yellow-500">Destacados</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de vaporizadores más populares, 
            cuidadosamente elegidos por su calidad y rendimiento excepcional.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No hay productos destacados por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                categoryName={getCategoryName(product.categoriaId)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
