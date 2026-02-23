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
    // Solo cerramos si estamos en móvil? Por ahora mantengamos la navegación
  };

  const handleAdminNavigation = (view: string) => {
    if (onAdminNavigate) {
      onAdminNavigate(view);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
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

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col h-full z-40 ${isOpen ? 'w-56' : 'w-20'
        }`}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
        {/* Usuario Info Simple */}
        {isAuthenticated && user && (
          <div className={`transition-all duration-300 ${isOpen ? 'bg-gray-50 rounded-lg p-3' : 'flex justify-center'}`}>
            <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
              <div className="w-10 h-10 min-w-[40px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              {isOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                  <div className="font-medium truncate">{user.firstName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span>{getRoleIcon()}</span>
                    {user.role.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {showAdminMenu ? (
            // Menú administrativo
            <div className="space-y-1">
              {hasPermission('Ver Dashboard') && (
                <Button
                  variant={activeAdminView === 'dashboard' ? 'default' : 'ghost'}
                  className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                  onClick={() => handleAdminNavigation('dashboard')}
                  title="Dashboard"
                >
                  <BarChart3 className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                  {isOpen && <span>Dashboard</span>}
                </Button>
              )}

              {hasPermission('Gestionar Usuarios') && (
                <Button
                  variant={activeAdminView === 'usuarios' ? 'default' : 'ghost'}
                  className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                  onClick={() => handleAdminNavigation('usuarios')}
                  title="Usuarios"
                >
                  <Users className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                  {isOpen && <span>Usuarios</span>}
                </Button>
              )}

              {hasPermission('Gestionar Roles') && (
                <Button
                  variant={activeAdminView === 'roles' ? 'default' : 'ghost'}
                  className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                  onClick={() => handleAdminNavigation('roles')}
                  title="Roles y Permisos"
                >
                  <Shield className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                  {isOpen && <span>Roles y Permisos</span>}
                </Button>
              )}

              {isOpen ? (
                <>
                  <Separator className="my-2" />
                  <Collapsible open={comprasOpen} onOpenChange={setComprasOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-3" />
                          <span>Compras</span>
                        </div>
                        {comprasOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4 mt-1">
                      {hasPermission('Gestionar Proveedores') && (
                        <Button
                          variant={activeAdminView === 'proveedores' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('proveedores')}
                        >
                          <Building className="h-3 w-3 mr-2" />
                          Proveedores
                        </Button>
                      )}
                      {hasPermission('Gestionar Categorías') && (
                        <Button
                          variant={activeAdminView === 'categorias' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('categorias')}
                        >
                          <Tag className="h-3 w-3 mr-2" />
                          Categorías
                        </Button>
                      )}
                      {hasPermission('Gestionar Productos') && (
                        <Button
                          variant={activeAdminView === 'productos' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('productos')}
                        >
                          <Package2 className="h-3 w-3 mr-2" />
                          Productos
                        </Button>
                      )}
                      {hasPermission('Gestionar Compras') && (
                        <Button
                          variant={activeAdminView === 'compras' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('compras')}
                        >
                          <ClipboardList className="h-3 w-3 mr-2" />
                          Órdenes de Compra
                        </Button>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={ventasOpen} onOpenChange={setVentasOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between mt-2">
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-3" />
                          <span>Ventas</span>
                        </div>
                        {ventasOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4 mt-1">
                      {hasPermission('Gestionar Clientes') && (
                        <Button
                          variant={activeAdminView === 'clientes' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('clientes')}
                        >
                          <UserCheck className="h-3 w-3 mr-2" />
                          Clientes
                        </Button>
                      )}
                      {hasPermission('Gestionar Cotizaciones') && (
                        <Button
                          variant={activeAdminView === 'cotizaciones' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('cotizaciones')}
                        >
                          <FileText className="h-3 w-3 mr-2" />
                          Cotizaciones
                        </Button>
                      )}
                      {hasPermission('Gestionar Pedidos') && (
                        <Button
                          variant={activeAdminView === 'pedidos' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('pedidos')}
                        >
                          <ShoppingBag className="h-3 w-3 mr-2" />
                          Pedidos
                        </Button>
                      )}
                      {hasPermission('Gestionar Ventas') && (
                        <Button
                          variant={activeAdminView === 'ventas' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('ventas')}
                        >
                          <DollarSign className="h-3 w-3 mr-2" />
                          Ventas
                        </Button>
                      )}
                      {hasPermission('Gestionar Devoluciones') && (
                        <Button
                          variant={activeAdminView === 'devoluciones' ? 'default' : 'ghost'}
                          className="w-full justify-start text-xs"
                          onClick={() => handleAdminNavigation('devoluciones')}
                        >
                          <RotateCcw className="h-3 w-3 mr-2" />
                          Devoluciones
                        </Button>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <div className="space-y-4 py-4 border-t border-gray-100 mt-2 flex flex-col items-center">
                  {/* Iconos de acceso directo cuando está contraído */}
                  {hasPermission('Gestionar Roles') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('roles')} title="Roles y Permisos">
                      <Shield className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Proveedores') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('proveedores')} title="Proveedores">
                      <Building className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Categorías') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('categorias')} title="Categorías">
                      <Tag className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Productos') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('productos')} title="Productos">
                      <Package2 className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Compras') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('compras')} title="Órdenes de Compra">
                      <ClipboardList className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Clientes') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('clientes')} title="Clientes">
                      <UserCheck className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Cotizaciones') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('cotizaciones')} title="Cotizaciones">
                      <FileText className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Pedidos') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('pedidos')} title="Pedidos">
                      <ShoppingBag className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Ventas') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('ventas')} title="Ventas">
                      <DollarSign className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Devoluciones') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-10" onClick={() => handleAdminNavigation('devoluciones')} title="Devoluciones">
                      <RotateCcw className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              )}

              <Separator className="my-2" />
              <Button
                variant="ghost"
                className={`w-full ${isOpen ? 'justify-start text-blue-600' : 'justify-center px-0 text-blue-600'}`}
                onClick={() => handleNavigation('home')}
                title="Tienda"
              >
                <Home className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                {isOpen && <span>Tienda</span>}
              </Button>
            </div>
          ) : (
            // Menú normal
            <div className="space-y-1">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                onClick={() => handleNavigation('home')}
                title="Inicio"
              >
                <Home className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                {isOpen && <span>Inicio</span>}
              </Button>

              <Button
                variant={currentView === 'shop' ? 'default' : 'ghost'}
                className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                onClick={() => handleNavigation('shop')}
                title="Tienda"
              >
                <ShoppingCart className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                {isOpen && <span>Tienda</span>}
              </Button>

              {isAuthenticated && (
                <Button
                  variant={currentView === 'profile' ? 'default' : 'ghost'}
                  className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                  onClick={() => handleNavigation('profile')}
                  title="Mi Perfil"
                >
                  <User className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                  {isOpen && <span>Mi Perfil</span>}
                </Button>
              )}

              {isAuthenticated && user?.role.name === 'Cliente' && (
                <Button
                  variant={currentView === 'pedidos' ? 'default' : 'ghost'}
                  className={`w-full ${isOpen ? 'justify-start' : 'justify-center px-0'}`}
                  onClick={() => handleNavigation('pedidos')}
                  title="Mis Pedidos"
                >
                  <Package className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                  {isOpen && <span>Mis Pedidos</span>}
                </Button>
              )}

              {isAuthenticated && canAccessAdmin && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'secondary'}
                  className={`w-full ${isOpen ? 'justify-start mt-4' : 'justify-center px-0 mt-4'}`}
                  onClick={() => handleNavigation('admin')}
                  title="Administración"
                >
                  <Settings className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
                  {isOpen && <span className="font-semibold">Administración</span>}
                </Button>
              )}
            </div>
          )}
        </nav>

        {/* Categories Shortcut (Solo cuando está abierto) */}
        {isOpen && !showAdminMenu && (
          <div className="pt-4">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Categorías
            </h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm h-8" onClick={() => handleNavigation('shop')}>Desechables</Button>
              <Button variant="ghost" className="w-full justify-start text-sm h-8" onClick={() => handleNavigation('shop')}>Recargables</Button>
              <Button variant="ghost" className="w-full justify-start text-sm h-8" onClick={() => handleNavigation('shop')}>Líquidos</Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${isOpen ? 'justify-start' : 'justify-center px-0'
              }`}
            onClick={handleLogout}
            title="Cerrar Sesión"
          >
            <LogOut className={`${isOpen ? 'h-4 w-4 mr-3' : 'h-6 w-6'}`} />
            {isOpen && <span>Cerrar Sesión</span>}
          </Button>
        ) : (
          !isOpen && (
            <Button
              variant="ghost"
              className="w-full justify-center px-0"
              onClick={() => handleNavigation('auth')}
              title="Iniciar Sesión"
            >
              <UserCheck className="h-6 w-6" />
            </Button>
          )
        )}
      </div>
    </aside>
  );
}
