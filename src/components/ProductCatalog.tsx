import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ShoppingCart, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
}

const PRODUCTS: Product[] = [
  // Vapes Desechables
  {
    id: 'vd1',
    name: 'Vape Desechable Mango',
    price: 35000,
    images: [
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400',
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],
    category: 'Vapes Desechables',
    description: '5000 puffs, sabor mango tropical'
  },
  {
    id: 'vd2',
    name: 'Vape Desechable Fresa',
    price: 35000,
    images: [
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400',
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400',
      'https://images.unsplash.com/photo-1761311984592-9f27e34dd9ae?w=400'
    ],
    category: 'Vapes Desechables',
    description: '5000 puffs, sabor fresa dulce'
  },
  {
    id: 'vd3',
    name: 'Vape Desechable Menta',
    price: 35000,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      'https://images.unsplash.com/photo-1761311984592-9f27e34dd9ae?w=400',
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400'
    ],
    category: 'Vapes Desechables',
    description: '5000 puffs, sabor menta fresca'
  },
  // Vapes Recargables
  {
    id: 'vr1',
    name: 'Vape Recargable Pro',
    price: 120000,
    images: [
      'https://images.unsplash.com/photo-1761311984592-9f27e34dd9ae?w=400',
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400',
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400'
    ],
    category: 'Vapes Recargables',
    description: 'Sistema recargable con control de flujo de aire'
  },
  {
    id: 'vr2',
    name: 'Vape Recargable Elite',
    price: 150000,
    images: [
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400'
    ],
    category: 'Vapes Recargables',
    description: 'Modelo premium con pantalla LED'
  },
  {
    id: 'vr3',
    name: 'Vape Recargable Basic',
    price: 80000,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      'https://images.unsplash.com/photo-1761311984592-9f27e34dd9ae?w=400',
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400'
    ],
    category: 'Vapes Recargables',
    description: 'Modelo básico ideal para principiantes'
  },
  // Baterías
  {
    id: 'bat1',
    name: 'Batería 510 Standard',
    price: 45000,
    images: [
      'https://images.unsplash.com/photo-1701120286678-7cb81e752725?w=400',
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400',
      'https://images.unsplash.com/photo-1754821305554-e76d884076db?w=400'
    ],
    category: 'Baterías',
    description: 'Batería estándar 510 thread, 650mAh'
  },
  {
    id: 'bat2',
    name: 'Batería Variable Voltage',
    price: 65000,
    images: [
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400',
      'https://images.unsplash.com/photo-1701120286678-7cb81e752725?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],
    category: 'Baterías',
    description: 'Batería con voltaje variable, 900mAh'
  },
  {
    id: 'bat3',
    name: 'Batería Premium Box',
    price: 95000,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      'https://images.unsplash.com/photo-1701120286678-7cb81e752725?w=400',
      'https://images.unsplash.com/photo-1760443728269-767e903b94e4?w=400'
    ],
    category: 'Baterías',
    description: 'Box mod premium con pantalla digital'
  },
];

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
      },
      quantity
    );
    toast.success(`${quantity} ${product.name} agregado al carrito`);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-gray-100">
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2">{product.name}</CardTitle>
        <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
        <p className="text-2xl font-bold text-primary">
          ${product.price.toLocaleString('es-CO')}
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
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full text-[rgb(0,0,0)] bg-[rgb(240,177,0,100)] hover:bg-gray-400"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ProductCatalog: React.FC = () => {
  const categories = ['Vapes Desechables', 'Vapes Recargables', 'Baterías'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Nuestro Catálogo</h1>
          <p className="text-muted-foreground">
            Descubre nuestra selección de productos premium
          </p>
        </div>

        {categories.map((category) => {
          const categoryProducts = PRODUCTS.filter(
            (product) => product.category === category
          );

          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
