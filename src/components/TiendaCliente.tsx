import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Search,
  ShoppingCart,
  Star,
  Filter,
  Plus,
  Minus,
  Package,
  Heart,
  Check,
  ArrowRight,
  Truck,
  CreditCard,
  MapPin,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PedidosCliente } from "./PedidosCliente";

// Datos simulados de productos
const productos = [
  {
    id: "1",
    nombre: "Vape Desechable 2000 puffs",
    descripcion:
      "Vapeador desechable con sabor a frutas tropicales, 2000 puffs aproximados",
    precio: 25000,
    precioAnterior: 30000,
    categoria: "Desechables",
    stock: 45,
    rating: 4.8,
    reviews: 124,
    imagen:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
    sabores: ["Tropical", "Menta", "Fresa", "Mango"],
    enOferta: true,
    nuevo: false,
    destacado: true,
  },
  {
    id: "2",
    nombre: "Pod System Premium",
    descripcion:
      "Sistema de pods recargable con batería de larga duración y control de flujo de aire",
    precio: 180000,
    categoria: "Pods",
    stock: 12,
    rating: 4.9,
    reviews: 89,
    imagen:
      "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=300&h=300&fit=crop",
    colores: ["Negro", "Plateado", "Azul", "Rojo"],
    enOferta: false,
    nuevo: true,
    destacado: true,
  },
  {
    id: "3",
    nombre: "Líquido Premium 60ml",
    descripcion:
      "E-liquid premium con nicotina, sabor intenso y vapor denso",
    precio: 35000,
    categoria: "Líquidos",
    stock: 28,
    rating: 4.7,
    reviews: 201,
    imagen:
      "https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=300&h=300&fit=crop",
    nicotina: ["0mg", "3mg", "6mg", "12mg"],
    sabores: ["Vainilla", "Chocolate", "Café", "Tabaco"],
    enOferta: false,
    nuevo: false,
    destacado: false,
  },
  {
    id: "4",
    nombre: "Mod Avanzado 100W",
    descripcion:
      "Mod profesional con control de temperatura y pantalla OLED",
    precio: 320000,
    precioAnterior: 380000,
    categoria: "Mods",
    stock: 5,
    rating: 4.9,
    reviews: 67,
    imagen:
      "https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=300&h=300&fit=crop",
    colores: ["Negro", "Plateado"],
    enOferta: true,
    nuevo: false,
    destacado: true,
  },
  {
    id: "5",
    nombre: "Bobinas de Repuesto Pack x5",
    descripcion:
      "Pack de 5 bobinas de repuesto compatibles con varios modelos",
    precio: 45000,
    categoria: "Accesorios",
    stock: 35,
    rating: 4.6,
    reviews: 156,
    imagen:
      "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=300&h=300&fit=crop",
    resistencia: ["0.2Ω", "0.4Ω", "0.6Ω"],
    enOferta: false,
    nuevo: false,
    destacado: false,
  },
  {
    id: "6",
    nombre: "Kit Iniciación Completo",
    descripcion:
      "Kit perfecto para principiantes, incluye todo lo necesario para empezar",
    precio: 150000,
    precioAnterior: 200000,
    categoria: "Kits",
    stock: 18,
    rating: 4.8,
    reviews: 93,
    imagen:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
    incluye: ["Mod", "Tank", "Bobinas", "Cargador", "Manual"],
    enOferta: true,
    nuevo: true,
    destacado: true,
  },
];

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  variante?: string;
}

export const TiendaCliente: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof productos)[0] | null
  >(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const categorias = [
    "all",
    "Desechables",
    "Pods",
    "Líquidos",
    "Mods",
    "Accesorios",
    "Kits",
  ];

  const filteredProducts = productos.filter((product) => {
    const matchesSearch =
      product.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.descripcion
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (
    product: (typeof productos)[0],
    variante?: string,
  ) => {
    const existingItem = cart.find(
      (item) =>
        item.id === product.id && item.variante === variante,
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.variante === variante
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          cantidad: 1,
          imagen: product.imagen,
          variante,
        },
      ]);
    }

    // Mostrar notificación de éxito
    toast.success(`${product.nombre} agregado al carrito`);
  };

  const updateQuantity = (
    id: string,
    variante: string | undefined,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      setCart(
        cart.filter(
          (item) =>
            !(item.id === id && item.variante === variante),
        ),
      );
    } else {
      setCart(
        cart.map((item) =>
          item.id === id && item.variante === variante
            ? { ...item, cantidad: newQuantity }
            : item,
        ),
      );
    }
  };

  const getTotalCart = () => {
    return cart.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0,
    );
  };

  const getTotalItems = () => {
    return cart.reduce(
      (total, item) => total + item.cantidad,
      0,
    );
  };

  return (
    <Tabs defaultValue="tienda" className="space-y-6">
      <TabsList className="bg-white border border-gray-200">
        <TabsTrigger value="tienda" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Tienda
        </TabsTrigger>
        <TabsTrigger value="pedidos" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
          <Package className="h-4 w-4 mr-2" />
          Mis Pedidos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tienda">
        <div className="space-y-6">
          {/* Header de la tienda */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Tienda Vaper One
              </h1>
              <p className="text-gray-600">
                Descubre nuestros productos premium
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Dialog
                open={isCartOpen}
                onOpenChange={setIsCartOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Carrito ({getTotalItems()})
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Carrito de Compras</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          Tu carrito está vacío
                        </p>
                      </div>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div
                            key={`${item.id}-${item.variante}`}
                            className="flex items-center space-x-4 border-b pb-4"
                          >
                            <ImageWithFallback
                              src={item.imagen}
                              alt={item.nombre}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {item.nombre}
                              </h4>
                              {item.variante && (
                                <p className="text-sm text-gray-500">
                                  {item.variante}
                                </p>
                              )}
                              <p className="font-semibold">
                                ${item.precio.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.variante,
                                    item.cantidad - 1,
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">
                                {item.cantidad}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.variante,
                                    item.cantidad + 1,
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">
                              Total:
                            </span>
                            <span className="text-xl font-bold">
                              ${getTotalCart().toLocaleString()}
                            </span>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => {
                              setIsCartOpen(false);
                              setIsCheckoutOpen(true);
                            }}
                          >
                            Proceder al Checkout
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={
                    selectedCategory === categoria
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(categoria)}
                  className="whitespace-nowrap"
                >
                  {categoria === "all" ? "Todos" : categoria}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <ImageWithFallback
                    src={product.imagen}
                    alt={product.nombre}
                    className="w-full h-48 object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.enOferta && (
                      <Badge className="bg-red-500">Oferta</Badge>
                    )}
                    {product.nuevo && (
                      <Badge className="bg-green-500">Nuevo</Badge>
                    )}
                    {product.destacado && (
                      <Badge className="bg-purple-500">
                        Destacado
                      </Badge>
                    )}
                  </div>

                  {/* Stock badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        product.stock > 10
                          ? "default"
                          : "destructive"
                      }
                    >
                      {product.stock} disponibles
                    </Badge>
                  </div>

                  {/* Wishlist */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {product.nombre}
                    </CardTitle>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm ml-1">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviews} reseñas)
                    </span>
                  </div>

                  <CardDescription className="line-clamp-2">
                    {product.descripcion}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${product.precio.toLocaleString()}
                      </span>
                      {product.precioAnterior && (
                        <span className="text-lg text-gray-400 line-through">
                          ${product.precioAnterior.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock === 0
                          ? "Agotado"
                          : "Agregar"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                      {selectedProduct.nombre}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ImageWithFallback
                        src={selectedProduct.imagen}
                        alt={selectedProduct.nombre}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span>{selectedProduct.rating}</span>
                          <span className="text-gray-500">
                            ({selectedProduct.reviews} reseñas)
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {selectedProduct.descripcion}
                        </p>

                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-3xl font-bold text-green-600">
                            $
                            {selectedProduct.precio.toLocaleString()}
                          </span>
                          {selectedProduct.precioAnterior && (
                            <span className="text-xl text-gray-400 line-through">
                              $
                              {selectedProduct.precioAnterior.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm">
                            <Package className="h-4 w-4 inline mr-1" />
                            {selectedProduct.stock} disponibles
                          </p>
                          <p className="text-sm">
                            Categoría: {selectedProduct.categoria}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      className="w-full"
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={selectedProduct.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {selectedProduct.stock === 0
                        ? "Producto Agotado"
                        : "Agregar al Carrito"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog de Checkout */}
          <Dialog
            open={isCheckoutOpen}
            onOpenChange={setIsCheckoutOpen}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Finalizar Compra</DialogTitle>
                <DialogDescription>
                  Completa tu información para procesar el pedido
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">
                    Resumen del pedido:
                  </h4>
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.variante}`}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.nombre} x{item.cantidad}
                      </span>
                      <span>
                        $
                        {(
                          item.precio * item.cantidad
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        ${getTotalCart().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>
                      Envío gratis en compras mayores a $100,000
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>Pago contra entrega disponible</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Entrega en Medellín en 24-48 horas</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Seguir Comprando
                </Button>
                <Button
                  onClick={() => {
                    toast.success(
                      "¡Pedido realizado con éxito! Nos pondremos en contacto contigo.",
                    );
                    setCart([]);
                    setIsCheckoutOpen(false);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Pedido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      <TabsContent value="pedidos">
        <PedidosCliente />
      </TabsContent>
    </Tabs>
  );
};
