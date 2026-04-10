import { useEffect, useState } from 'react';
import { ImageWithFallback } from '@/shared/components/figma/ImageWithFallback';
import { Badge } from '@/shared/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/shared/ui/carousel';
import { getProductos, getCategorias, getAllImages } from '@/shared/services/api';
import { Producto, Categoria } from '@/shared/types';
import { Loader2, Package, Star, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/shared/ui/button';

const FeaturedProductCard: React.FC<{ product: Producto, categoryName: string }> = ({ product, categoryName }) => {
  return (
    <div 
      className="group bg-black border border-white/10 transition-all duration-300 overflow-hidden flex flex-col w-full rounded-2xl hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] relative h-full min-h-[450px] cursor-pointer"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('selectCategory', { detail: { categoryId: product.categoriaId } }));
        setTimeout(() => {
          document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }}
    >
      <div className="relative w-full h-56 bg-zinc-950 flex items-center justify-center overflow-hidden group-hover:bg-zinc-900 transition-colors border-b border-white/5 shrink-0">
        {product.imagen ? (
          <ImageWithFallback 
            src={product.imagen}
            alt={product.nombreProducto}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-xl p-4"
          />
        ) : (
          <Package className="h-10 w-10 text-zinc-700 group-hover:text-yellow-500 transition-colors" />
        )}
        <Badge className="absolute top-3 left-3 bg-yellow-400 text-black rounded font-bold tracking-widest uppercase text-[10px] px-2 py-0.5 shadow-sm z-10">
           MÁS VENDIDO
        </Badge>
        <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md rounded px-2 py-1 flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-[10px] font-bold">5.0</span>
        </div>
        {/* El badge de Agotado se movió debajo del nombre */}
      </div>
      
      <div className="p-6 flex flex-col w-full flex-1 text-left bg-black">
        <div className="mb-3">
          <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded px-2 py-1">{categoryName}</span>
        </div>
        <div style={{ height: "3.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }} className="mb-1">
          <h3 className="font-extrabold text-white text-xl leading-tight tracking-tight group-hover:text-yellow-400 transition-colors w-full" title={product.nombreProducto}>
            {product.nombreProducto}
          </h3>
        </div>
        {product.stock === 0 && (
          <div className="flex items-center gap-1.5 text-red-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Agotado</span>
          </div>
        )}
        
        <div style={{ height: "4.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          <p className="text-gray-400 text-sm leading-relaxed">
            {product.descripcion || "Rendimiento premium garantizado con nuestros mejores dispositivos."}
          </p>
        </div>
      </div>
    </div>
  );
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [api]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats, images] = await Promise.all([
          getProductos(),
          getCategorias(),
          getAllImages()
        ]);
        
        const filteredProds = prods.filter(p => p.estado).slice(0, 5);

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
    <section className="py-16 bg-black rounded-3xl overflow-hidden relative border border-white/5 my-12">
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Columna Izquierda: Información (About) */}
          <div className="w-full lg:w-[60%] space-y-10 pr-0 lg:pr-10">
            <div className="space-y-6">
              <h2 className="text-sm font-bold tracking-widest text-yellow-500 uppercase border-l-4 border-yellow-500 pl-4">Conócenos</h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Redefiniendo el <br className="hidden xl:block" /> vapeo en <span className="text-yellow-500">Medellín</span>
              </h3>
              <p className="text-xl text-gray-400 leading-loose max-w-xl">
                Somos Vaper One Medellín, una empresa líder en el mercado de vaporizadores, 
                comprometida con ofrecer productos de la más alta calidad y accesorios premium para una experiencia única.
              </p>
            </div>

            <div className="space-y-6 max-w-lg">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white block mb-1">Nuestra Misión</strong> 
                  Garantizar la mejor experiencia con productos seguros, innovadores y con respaldo total.
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white block mb-1">Para Todos</strong> 
                  Desde kits de inicio hasta dispositivos avanzados para expertos y coleccionistas.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center text-center w-full">
              <p className="text-gray-400 text-sm italic mb-4">¿Necesitas asesoría personalizada?</p>
              <Button 
                onClick={() => window.open('https://wa.me/573052359631', '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-2xl text-md font-bold shadow-lg shadow-green-500/20 group transition-all flex items-center justify-center transform hover:scale-105"
              >
                <Phone className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Chatear por WhatsApp
              </Button>
            </div>
          </div>

          {/* Columna Derecha: Carrusel */}
          <div className="w-full lg:w-[40%]">
            <div className="text-center mb-10">
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                Top 5 <span className="text-yellow-500">Más Buscados</span>
              </h3>
              <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full" />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-zinc-500 font-bold uppercase py-20 bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl mx-auto">
                No hay productos destacados por ahora.
              </div>
            ) : (
              <div className="relative px-2 overflow-visible">
                <Carousel
                  setApi={setApi}
                  opts={{
                    align: "start",
                    loop: true,
                    skipSnaps: false
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4 flex">
                    {products.map((product) => (
                      <CarouselItem key={product.id} className="pl-4 py-4 shrink-0 flex-none" style={{ flex: "0 0 50%", minWidth: "50%" }}>
                        <div className="h-full w-full px-2">
                          <FeaturedProductCard
                            product={product}
                            categoryName={getCategoryName(product.categoriaId)}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="bg-yellow-500 border-0 text-black hover:bg-white hover:text-black w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex shadow-lg -left-5 z-20" />
                  <CarouselNext className="bg-yellow-500 border-0 text-black hover:bg-white hover:text-black w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex shadow-lg -right-5 z-20" />
                </Carousel>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
