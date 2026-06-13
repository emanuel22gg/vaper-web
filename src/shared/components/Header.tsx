import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, LogOut, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { AdminNotifications } from '@/shared/components/AdminNotifications';
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';

interface HeaderProps {
  onMenuToggle: () => void;
  currentView: string;
  user: any;
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function Header({ onMenuToggle, currentView, user, isAuthenticated, canAccessAdmin, searchTerm, onSearchChange }: HeaderProps) {
  const navigate = useNavigate();
  const { getCartItemCount } = useCart();
  const { logout } = useAuth();

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
          {canAccessAdmin && currentView === 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}<div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
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
          {currentView !== 'admin' && (
            <>
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                className="text-[rgb(0,0,0)] hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
                onClick={() => navigate('/')}
              >
                Inicio
              </Button>
              <Button
                variant={currentView === 'shop' ? 'default' : 'ghost'}
                className="text-[rgb(0,0,0)] hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
                onClick={() => navigate('/shop')}
              >
                Tienda
              </Button>
              {isAuthenticated && (
                <Button
                  variant={currentView === 'pedidos' ? 'default' : 'ghost'}
                  className="text-[rgb(0,0,0)] hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
                  onClick={() => navigate('/pedidos')}
                >
                  Mis Pedidos
                </Button>
              )}
            </>
          )}
        </div>

        {/* Navegación derecha */}
        <div className="flex items-center gap-4">
          {currentView !== 'admin' && (
            <>
              {/* Barra de búsqueda */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-10 w-64 bg-gray-50 border-gray-200"
                  value={searchTerm || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>

              {/* Carrito */}
              <Button
                variant="ghost"
                className="relative text-black hover:text-yellow-500"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-6 w-6" />
                <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs h-5 w-5 p-0 flex items-center justify-center">
                  {getCartItemCount()}
                </Badge>
              </Button>
            </>
          )}

          {/* Campanita de Notificaciones para Admin */}
          {isAuthenticated && canAccessAdmin && currentView === 'admin' && (
            <AdminNotifications />
          )}

          {/* Menú de usuario */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm shadow-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{getRoleIcon()}</span>
                      {user?.role?.name}
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 shadow-md">
                <DropdownMenuLabel className="font-semibold text-gray-900">Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem onClick={() => navigate(canAccessAdmin ? '/admin/profile' : '/profile')} className="cursor-pointer hover:bg-gray-50 font-medium">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>

                {canAccessAdmin && (
                  currentView === 'admin' ? (
                    <DropdownMenuItem onClick={() => navigate('/shop')} className="cursor-pointer hover:bg-gray-50 font-medium">
                      <span className="mr-2">🏪</span>
                      <span>Ir a la Tienda</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer hover:bg-gray-50 font-medium">
                      <span className="mr-2">🛡️</span>
                      <span>Panel Admin</span>
                    </DropdownMenuItem>
                  )
                )}
                
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem onClick={() => {
                  logout();
                  navigate('/');
                }} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-black hover:text-yellow-500 bg-[rgb(240,177,0,100)]"
              onClick={() => navigate('/auth')}
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
