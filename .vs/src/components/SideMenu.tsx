import React from 'react';
import {
  X,
  Home,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Phone,
  Mail,
  BarChart3,
  Users,
  Package,
  Building,
  Truck,
  UserCheck,
  ShoppingBag,
  FileText,
  Tag,
  Package2,
  CreditCard,
  RotateCcw,
  Receipt,
  FileX,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Shield,
  ClipboardList
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos';
  onNavigate: (view: 'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos') => void;
  user: any;
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
  // Nuevas props para navegación administrativa
  onAdminNavigate?: (view: string) => void;
  activeAdminView?: string;
}

export function SideMenu({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  user,
  isAuthenticated,
  canAccessAdmin,
  onAdminNavigate,
  activeAdminView
}: SideMenuProps) {
  const { logout } = useAuth();
  const [comprasOpen, setComprasOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);

  const handleNavigation = (view: 'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos') => {
    onNavigate(view);
    onClose();
  };

  const handleAdminNavigation = (view: string) => {
    if (onAdminNavigate) {
      onAdminNavigate(view);
    }
    onClose();
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
    onClose();
  };

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role.name) {
      case 'Administrador':
      case 'Admin': return '👑';
      case 'Empleado': return '💼';
      default: return '👤';
    }
  };

  const hasPermission = (permissionName: string) => {
    if (user?.role?.name === 'Administrador' || user?.role?.name === 'Admin') return true;
    if (!user?.role?.permissions) return false;
    return user.role.permissions.some((p: any) => p.name === permissionName);
  };

  // Determinar si mostrar menú administrativo
  const isInAdminPanel = currentView === 'admin';
  const showAdminMenu = isAuthenticated && canAccessAdmin && isInAdminPanel;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.26)] bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Side Menu */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {showAdminMenu ? 'Navegación del Sistema' : 'Menú'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Usuario Info */}
          {isAuthenticated && user ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <span>{getRoleIcon()}</span>
                    {user.role.name}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {user.email}
              </Badge>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-gray-600 mb-3">Inicia sesión para acceder a todas las funciones</p>
              <Button
                className="w-full"
                onClick={() => handleNavigation('auth')}
              >
                Iniciar Sesión
              </Button>
            </div>
          )}

          {/* Navigation Menu */}
          {showAdminMenu ? (
            // Menú administrativo jerárquico
            <nav className="space-y-2">
              {hasPermission('Ver Dashboard') && (
                <Button
                  variant={activeAdminView === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleAdminNavigation('dashboard')}
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  Dashboard
                </Button>
              )}

              {hasPermission('Gestionar Usuarios') && (
                <>
                  <Separator className="my-2" />
                  <Button
                    variant={activeAdminView === 'usuarios' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleAdminNavigation('usuarios')}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Gestión de Usuarios
                  </Button>
                </>
              )}

              {hasPermission('Gestionar Roles') && (
                <Button
                  variant={activeAdminView === 'roles' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleAdminNavigation('roles')}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Roles y Permisos
                </Button>
              )}

              {(hasPermission('Gestionar Proveedores') ||
                hasPermission('Gestionar Productos') ||
                hasPermission('Gestionar Categorías') ||
                hasPermission('Gestionar Compras')) && (
                  <>
                    <Separator className="my-2" />
                    <Collapsible open={comprasOpen} onOpenChange={setComprasOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-3" />
                            Compras
                          </div>
                          {comprasOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-4 mt-1">
                        {hasPermission('Gestionar Proveedores') && (
                          <Button
                            variant={activeAdminView === 'proveedores' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('proveedores')}
                          >
                            <Building className="h-4 w-4 mr-3" />
                            Proveedores
                          </Button>
                        )}
                        {hasPermission('Gestionar Categorías') && (
                          <Button
                            variant={activeAdminView === 'categorias' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('categorias')}
                          >
                            <Tag className="h-4 w-4 mr-3" />
                            Categorías
                          </Button>
                        )}
                        {hasPermission('Gestionar Productos') && (
                          <Button
                            variant={activeAdminView === 'productos' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('productos')}
                          >
                            <Package2 className="h-4 w-4 mr-3" />
                            Productos
                          </Button>
                        )}
                        {hasPermission('Gestionar Compras') && (
                          <Button
                            variant={activeAdminView === 'compras' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('compras')}
                          >
                            <ClipboardList className="h-4 w-4 mr-3" />
                            Órdenes de Compra
                          </Button>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}

              {(hasPermission('Gestionar Clientes') ||
                hasPermission('Gestionar Cotizaciones') ||
                hasPermission('Gestionar Pedidos') ||
                hasPermission('Gestionar Ventas') ||
                hasPermission('Gestionar Devoluciones')) && (
                  <>
                    <Separator className="my-2" />
                    <Collapsible open={ventasOpen} onOpenChange={setVentasOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                          <div className="flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-3" />
                            Ventas
                          </div>
                          {ventasOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-4 mt-1">
                        {hasPermission('Gestionar Clientes') && (
                          <Button
                            variant={activeAdminView === 'clientes' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('clientes')}
                          >
                            <UserCheck className="h-4 w-4 mr-3" />
                            Clientes
                          </Button>
                        )}
                        {hasPermission('Gestionar Cotizaciones') && (
                          <Button
                            variant={activeAdminView === 'cotizaciones' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('cotizaciones')}
                          >
                            <FileText className="h-4 w-4 mr-3" />
                            Cotizaciones
                          </Button>
                        )}
                        {hasPermission('Gestionar Pedidos') && (
                          <Button
                            variant={activeAdminView === 'pedidos' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('pedidos')}
                          >
                            <ShoppingBag className="h-4 w-4 mr-3" />
                            Pedidos
                          </Button>
                        )}
                        {hasPermission('Gestionar Ventas') && (
                          <Button
                            variant={activeAdminView === 'ventas' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('ventas')}
                          >
                            <DollarSign className="h-4 w-4 mr-3" />
                            Ventas
                          </Button>
                        )}
                        {hasPermission('Gestionar Devoluciones') && (
                          <Button
                            variant={activeAdminView === 'devoluciones' ? 'default' : 'ghost'}
                            className="w-full justify-start text-sm"
                            onClick={() => handleAdminNavigation('devoluciones')}
                          >
                            <RotateCcw className="h-4 w-4 mr-3" />
                            Devoluciones
                          </Button>
                        )}

                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}

              <Separator className="my-4" />
              <Button
                variant={activeAdminView === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleAdminNavigation('profile')}
              >
                <User className="h-4 w-4 mr-3" />
                Mi Perfil
              </Button>

              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleNavigation('home')}
              >
                <Home className="h-4 w-4 mr-3" />
                Ir a la Tienda
              </Button>
            </nav>
          ) : (
            // Menú normal para usuarios no administrativos o fuera del panel
            <nav className="space-y-2">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNavigation('home')}
              >
                <Home className="h-4 w-4 mr-3" />
                Inicio
              </Button>

              <Button
                variant={currentView === 'shop' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNavigation('shop')}
              >
                <ShoppingCart className="h-4 w-4 mr-3" />
                Tienda
              </Button>

              {isAuthenticated && (
                <Button
                  variant={currentView === 'profile' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleNavigation('profile')}
                >
                  <User className="h-4 w-4 mr-3" />
                  Mi Perfil
                </Button>
              )}

              {isAuthenticated && user?.role.name === 'Cliente' && (
                <Button
                  variant={currentView === 'pedidos' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleNavigation('pedidos')}
                >
                  <Package className="h-4 w-4 mr-3" />
                  Pedidos Realizados
                </Button>
              )}

              {isAuthenticated && canAccessAdmin && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-500">Administración</span>
                  </div>
                  <Button
                    variant={currentView === 'admin' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleNavigation('admin')}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Panel Administrativo
                  </Button>
                </>
              )}
            </nav>
          )}

          {/* Categorías de Productos - Solo para menú normal */}
          {!showAdminMenu && (
            <div className="mt-8">
              <Separator className="mb-4" />
              <h3 className="font-medium text-gray-900 mb-3">Categorías</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleNavigation('shop')}>
                  Vapes Desechables
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleNavigation('shop')}>
                  Vapes Recargables
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleNavigation('shop')}>
                  E-liquids
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleNavigation('shop')}>
                  Accesorios
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleNavigation('shop')}>
                  Ofertas Especiales
                </Button>
              </div>
            </div>
          )}

          {/* Contact Info - Solo para menú normal */}
          {!showAdminMenu && (
            <div className="mt-8">
              <Separator className="mb-4" />
              <h3 className="font-medium text-gray-900 mb-3">Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>+57 (4) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>info@vapermedellin.com</span>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          {isAuthenticated && (
            <div className="mt-8">
              <Separator className="mb-4" />
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
