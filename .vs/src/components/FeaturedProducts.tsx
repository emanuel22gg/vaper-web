import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const featuredProducts = [
  {
    id: 1,
    name: "Vape Pro Max",
    category: "Desechable",
    price: "$25.99",
    image: "https://images.unsplash.com/photo-1617289276747-e4df46e2c6e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: "Más Vendido"
  },
  {
    id: 2,
    name: "Ultra Rechargeable",
    category: "Recargable",
    price: "$45.99",
    image: "https://images.unsplash.com/photo-1586244439413-bc2288941dda?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: "Nuevo"
  },
  {
    id: 3,
    name: "Premium Edition",
    category: "Recargable",
    price: "$89.99",
    image: "https://images.unsplash.com/photo-1592364395653-d1b28f299ad9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: "Premium"
  },
  {
    id: 4,
    name: "Starter Kit",
    category: "Desechable",
    price: "$15.99",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    badge: "Oferta"
  }
];

export function FeaturedProducts() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-black hover:bg-yellow-400">
                  {product.badge}
                </Badge>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm text-gray-500">{product.category}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-black">{product.price}</span>
                  <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3">
            Ver Todos los Productos
          </Button>
        </div>
      </div>
    </section>
  );
}
