import React from 'react';
import { Search, User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useCart } from '../contexts/CartContext';
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';

interface HeaderProps {
  onMenuToggle: () => void;
  currentView: 'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos';
  onNavigate: (view: 'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos') => void;
  user: any;
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
  onAdminNavigate?: (view: string) => void;
}

export function Header({ onMenuToggle, currentView, onNavigate, user, isAuthenticated, canAccessAdmin, onAdminNavigate }: HeaderProps) {
  const { getCartItemCount } = useCart();

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role.name) {
      case 'Administrador':
      case 'Admin': return '👑';
      case 'Empleado': return '💼';
      default: return '👤';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between mx-auto px-4">
        {/* Logo y menú */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <img
              src={logoImage}
              alt="VaperMedellín Logo"
              className="h-16 w-auto object-contain"
              style={{
                filter: 'drop-shadow(0 0 0 transparent)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Navegación central - Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            className="text-[rgb(0,0,0)] hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
            onClick={() => onNavigate('home')}
          >
            Inicio
          </Button>
          <Button
            variant={currentView === 'shop' ? 'default' : 'ghost'}
            className="text-[rgb(0,0,0)] hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
            onClick={() => onNavigate('shop')}
          >
            Tienda
          </Button>
        </div>

        {/* Navegación derecha */}
        <div className="flex items-center gap-4">
          {/* Barra de búsqueda */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 w-64 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Carrito */}
          <Button
            variant="ghost"
            className="relative text-black hover:text-yellow-500"
            onClick={() => onNavigate('cart')}
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs h-5 w-5 p-0 flex items-center justify-center">
              {getCartItemCount()}
            </Badge>
          </Button>

          {/* Menú de usuario */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>{getRoleIcon()}</span>
                  {user?.role.name}
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-black hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
              onClick={() => onNavigate('auth')}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
