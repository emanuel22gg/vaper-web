import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { ImageWithFallback } from "@/shared/components/figma/ImageWithFallback";
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
import { PedidosCliente } from "@/features/clients/components/PedidosCliente";
import { getProductos, getCategorias, getAllImages } from "@/shared/services/api";
import { Producto, Categoria } from "@/shared/types";

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
  variante?: string;
  productoId: number;
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
      const newQuantity = existingItem.cantidad + 1;
      if (newQuantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades de este producto.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.productoId === product.id && item.variante === variante
            ? { ...item, cantidad: newQuantity }
            : item,
        ),
      );
    } else {
      if (product.stock <= 0) {
        toast.error("Producto sin stock disponible.");
        return;
      }
      setCart([
        ...cart,
        {
          id: stringId,
          productoId: product.id,
          nombre: product.nombreProducto,
          precio: product.precio,
          cantidad: 1,
          stock: product.stock,
          imagen: product.imagen || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
          variante,
        },
      ]);
    }

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
        cart.map((item) => {
          if (item.id === id && item.variante === variante) {
            if (newQuantity > item.stock) {
              toast.error(`Solo hay ${item.stock} unidades disponibles.`);
              return { ...item, cantidad: item.stock };
            }
            return { ...item, cantidad: newQuantity };
          }
          return item;
        }),
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
                                disabled={item.cantidad >= item.stock}
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
                    className="group cursor-pointer rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white flex flex-col h-full"
                    onClick={() => setSelectedCategory(category.nombreCategoria)}
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
                        {category.descripcion || `Explora nuestros productos de ${category.nombreCategoria}`}
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
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 relative"
                    >
                      {/* Image section */}
                      <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <ImageWithFallback
                          src={product.imagen || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop"}
                          alt={product.nombreProducto}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Stock badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <Badge variant={product.stock > 10 ? "secondary" : "destructive"} className="shadow-sm font-semibold">
                            {product.stock} disp.
                          </Badge>
                        </div>
                        {/* Wishlist */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-3 left-3 rounded-full h-8 w-8 z-10 bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-2">
                          <span className="text-xs font-semibold tracking-wider uppercase text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            {product.categoria?.nombreCategoria || "Sin Categoría"}
                          </span>
                        </div>
                        
                        <h3 
                          className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 mt-2 group-hover:text-yellow-600 transition-colors min-h-[3.5rem] cursor-pointer" 
                          title={product.nombreProducto}
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.nombreProducto}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-black">${product.precio.toLocaleString('es-CO')}</span>
                          </div>
                          
                          <div className="flex gap-2 w-full">
                            <Button
                              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all shadow-sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              disabled={product.stock === 0 || (cart.find(item => item.productoId === product.id)?.cantidad || 0) >= product.stock}
                            >
                              <ShoppingCart className="h-4 w-4 mx-auto sm:mr-2 sm:mx-0 inline-block" />
                              <span className="hidden sm:inline-block">
                                {product.stock === 0 
                                  ? "Agotado" 
                                  : (cart.find(item => item.productoId === product.id)?.cantidad || 0) >= product.stock 
                                    ? "Límite" 
                                    : "Agregar"}
                              </span>
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="hover:bg-gray-50 border-gray-200"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                              }}
                            >
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      disabled={selectedProduct.stock === 0 || (cart.find(item => item.productoId === selectedProduct.id)?.cantidad || 0) >= selectedProduct.stock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {selectedProduct.stock === 0
                        ? "Producto Agotado"
                        : (cart.find(item => item.productoId === selectedProduct.id)?.cantidad || 0) >= selectedProduct.stock
                          ? "Máximo en Carrito"
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
