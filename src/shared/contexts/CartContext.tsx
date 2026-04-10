import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  category: string;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: Omit<CartProduct, 'quantity'>, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addToCart = (product: Omit<CartProduct, 'quantity'>, quantity: number) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      
      if (existingProduct) {
        const newQuantity = existingProduct.quantity + quantity;
        
        if (newQuantity > product.stock) {
          toast.error(`No hay suficiente stock disponible. (Máximo: ${product.stock})`);
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: product.stock } // Ajustar al máximo si se intenta exceder
              : item
          );
        }

        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      // Si es un producto nuevo, también validamos la cantidad inicial
      const initialQuantity = Math.min(quantity, product.stock);
      if (quantity > product.stock) {
        toast.warning(`Cantidad ajustada al stock disponible (${product.stock})`);
      }

      return [...prevCart, { ...product, quantity: initialQuantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            toast.error(`Solo hay ${item.stock} unidades disponibles de este producto.`);
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
