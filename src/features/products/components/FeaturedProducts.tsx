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
        <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 px-3 py-1 shadow-md font-semibold tracking-wide hover:bg-red-600">
          🔥 TOP VENTAS
        </Badge>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">{categoryName}</span>
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
        
        const targetNames = ["encendedor zippo", "encendedor clipper", "pipa metalica premium"];
        const filteredProds = prods.filter(p => {
          if (!p.estado) return false;
          // Normalize to avoid accent issues
          const n = p.nombreProducto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return n.includes("zippo") || n.includes("clipper") || n.includes("pipa metalica");
        }).slice(0, 3);

        const productsWithImages = filteredProds.map(p => {
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
          <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tight">
            Nuestros <span className="text-yellow-500">Top Ventas</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
