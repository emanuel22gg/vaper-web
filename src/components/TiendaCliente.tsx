import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Truck,
  CreditCard,
  MapPin,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PedidosCliente } from "./PedidosCliente";
import { getProductos, getCategorias, getAllImages } from "../services/api";
import { Producto, Categoria } from "../types";

interface CartItem {
  id: string; // Changed back to string since you might use `${id}-${variante}`? Or we can just use the int id from DB. Let's use string to keep it compatible with existing Cart logic that does `item.id === id` if needed.
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  variante?: string;
  productoId: number; // Keep real ID for sending to API later
}

export const TiendaCliente: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  // State for Real API Data
  const [apiProductos, setApiProductos] = useState<Producto[]>([]);
  const [apiCategorias, setApiCategorias] = useState<Categoria[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

      setApiProductos(productsWithImages.filter(p => p.estado && p.stock > 0)); // Only show active items with stock
      setApiCategorias(categoriesWithImages.filter(c => c.estado));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los productos de la tienda");
    } finally {
      setIsLoading(false);
    }
  };

  const categorias = [
    { id: "all", nombreCategoria: "Todos" },
    ...apiCategorias,
  ];

  const filteredProducts = apiProductos.filter((product) => {
    const matchesSearch =
      product.nombreProducto
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.descripcion
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    // Si la categoría seleccionada es "all" o el nombre de la categoría del producto coincide
    // o el ID de la categoría coincide si estamos filtrando por ID en `selectedCategory`.
    // Asumiremos que `selectedCategory` guarda el `nombreCategoria` para ser compatibles con el UI dropdown.
    const matchesCategory =
      selectedCategory === "all" ||
      (product.categoria?.nombreCategoria && product.categoria.nombreCategoria === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const addToCart = (
    product: Producto,
    variante?: string,
  ) => {
    const stringId = product.id.toString();
    const existingItem = cart.find(
      (item) =>
        item.productoId === product.id && item.variante === variante,
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productoId === product.id && item.variante === variante
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: stringId, // String id for frontend lists if needed
          productoId: product.id,
          nombre: product.nombreProducto,
          precio: product.precio,
          cantidad: 1,
          imagen: product.imagen || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop", // placeholder
          variante,
        },
      ]);
    }

    // Mostrar notificación de éxito
    toast.success(`${product.nombreProducto} agregado al carrito`);
  };

  const updateQuantity = (
    id: string, // this is the string id used in cart items mapped from existing stringId
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

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

          {/* Filtros y búsqueda - Solo mostrar cuando hay una categoría seleccionada (opcional, o siempre) */}
          {selectedCategory !== "all" && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-4 flex-1">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory("all")}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Categorías
                </Button>
                <h2 className="text-2xl font-bold border-l-4 border-yellow-500 pl-4">
                  {selectedCategory}
                </h2>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Grid Conditional */}
          {selectedCategory === "all" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apiCategorias.map((category) => {
                const hasProducts = apiProductos.some(p => p.categoriaId === category.id);
                if (!hasProducts) return null;

                return (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 overflow-hidden flex flex-col"
                    onClick={() => setSelectedCategory(category.nombreCategoria)}
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
                      <CardTitle className="text-xl">{category.nombreCategoria}</CardTitle>
                      <p className="text-muted-foreground mt-2 text-sm line-clamp-2">
                        {category.descripcion || `Explora productos de ${category.nombreCategoria}`}
                      </p>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <div className="relative">
                        <ImageWithFallback
                          src={product.imagen || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop"}
                          alt={product.nombreProducto}
                          className="w-full h-48 object-cover"
                        />

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

                      <CardHeader className="pb-3 flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {product.nombreProducto}
                        </CardTitle>

                        <CardDescription className="line-clamp-2 mt-2">
                          {product.descripcion}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 border-t mt-auto">
                        <div className="space-y-3 pt-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-green-600">
                              ${product.precio.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-[rgb(240,177,0)] hover:bg-yellow-600 text-black border border-yellow-700"
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
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No se encontraron productos en esta categoría o con esta búsqueda.
                </div>
              )}
            </>
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

                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-3xl font-bold text-green-600">
                            $
                            {selectedProduct.precio.toLocaleString()}
                          </span>
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
