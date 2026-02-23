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
import { useAuth } from '../hooks/useAuth';

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
      style={{
        width: isOpen ? '175px' : '35px',
        minWidth: isOpen ? '175px' : '35px',
        maxWidth: isOpen ? '175px' : '35px'
      }}
      className="bg-white border-r border-gray-200 transition-[width] duration-300 ease-in-out flex flex-col h-full z-40 flex-none overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-3 min-w-0 max-w-full">
        {isAuthenticated && user && (
          <div className={`transition-all duration-300 ${isOpen ? 'bg-gray-50 rounded-lg p-1' : 'flex justify-center'}`}>
            <div className={`flex items-center gap-1 ${!isOpen && 'justify-center'}`}>
              <div className="w-6 h-6 min-w-[24px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              {isOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                  <div className="text-[9px] font-medium truncate leading-tight">{user.firstName}</div>
                  <div className="text-[7px] text-gray-500 flex items-center gap-0.5 leading-tight">
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
                  className={`w-full h-10 px-3 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                  style={{ fontSize: '11.5px' }}
                  onClick={() => handleAdminNavigation('dashboard')}
                  title="Dashboard"
                >
                  <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                    <BarChart3 className={`${isOpen ? 'h-4 w-4 mr-2.5 flex-shrink-0' : 'h-6 w-6'}`} />
                    {isOpen && <span className="truncate">Dashboard</span>}
                  </div>
                </Button>
              )}

              {hasPermission('Gestionar Usuarios') && (
                <Button
                  variant={activeAdminView === 'usuarios' ? 'default' : 'ghost'}
                  className={`w-full h-10 px-3 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                  style={{ fontSize: '11.5px' }}
                  onClick={() => handleAdminNavigation('usuarios')}
                  title="Usuarios"
                >
                  <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                    <Users className={`${isOpen ? 'h-4 w-4 mr-2.5 flex-shrink-0' : 'h-6 w-6'}`} />
                    {isOpen && <span className="truncate">Usuarios</span>}
                  </div>
                </Button>
              )}

              {hasPermission('Gestionar Roles') && (
                <Button
                  variant={activeAdminView === 'roles' ? 'default' : 'ghost'}
                  className={`w-full h-10 px-3 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                  style={{ fontSize: '11.5px' }}
                  onClick={() => handleAdminNavigation('roles')}
                  title="Roles y Permisos"
                >
                  <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                    <Shield className={`${isOpen ? 'h-4 w-4 mr-2.5 flex-shrink-0' : 'h-6 w-6'}`} />
                    {isOpen && <span className="truncate">Roles</span>}
                  </div>
                </Button>
              )}

              {isOpen ? (
                <>
                  <Separator className="my-1" />
                  {/* Grupo Compras */}
                  {hasPermission('Gestionar Proveedores') && (
                    <Button
                      variant={activeAdminView === 'proveedores' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('proveedores')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <Building className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Proveedores</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Categorías') && (
                    <Button
                      variant={activeAdminView === 'categorias' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('categorias')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <Tag className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Categorías</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Productos') && (
                    <Button
                      variant={activeAdminView === 'productos' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('productos')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <Package2 className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Productos</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Compras') && (
                    <Button
                      variant={activeAdminView === 'compras' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('compras')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <ClipboardList className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Compras</span>
                      </div>
                    </Button>
                  )}

                  <Separator className="my-2" />
                  {/* Grupo Ventas */}
                  {hasPermission('Gestionar Clientes') && (
                    <Button
                      variant={activeAdminView === 'clientes' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('clientes')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <UserCheck className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Clientes</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Cotizaciones') && (
                    <Button
                      variant={activeAdminView === 'cotizaciones' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('cotizaciones')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <FileText className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Cotizaciones</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Pedidos') && (
                    <Button
                      variant={activeAdminView === 'pedidos' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('pedidos')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <ShoppingBag className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Pedidos</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Ventas') && (
                    <Button
                      variant={activeAdminView === 'ventas' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('ventas')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <DollarSign className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Ventas</span>
                      </div>
                    </Button>
                  )}
                  {hasPermission('Gestionar Devoluciones') && (
                    <Button
                      variant={activeAdminView === 'devoluciones' ? 'default' : 'ghost'}
                      className="w-full h-8 px-3 justify-start whitespace-normal overflow-hidden flex-shrink-0"
                      style={{ fontSize: '11px' }}
                      onClick={() => handleAdminNavigation('devoluciones')}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <RotateCcw className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        <span className="truncate">Devoluciones</span>
                      </div>
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-4 py-4 border-t border-gray-100 mt-2 flex flex-col items-center">
                  {/* Iconos de acceso directo cuando está contraído */}
                  {hasPermission('Gestionar Proveedores') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('proveedores')} title="Proveedores">
                      <Building className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Categorías') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('categorias')} title="Categorías">
                      <Tag className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Productos') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('productos')} title="Productos">
                      <Package2 className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Compras') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('compras')} title="Órdenes de Compra">
                      <ClipboardList className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Clientes') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('clientes')} title="Clientes">
                      <UserCheck className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Cotizaciones') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('cotizaciones')} title="Cotizaciones">
                      <FileText className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Pedidos') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('pedidos')} title="Pedidos">
                      <ShoppingBag className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Ventas') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('ventas')} title="Ventas">
                      <DollarSign className="h-6 w-6" />
                    </Button>
                  )}
                  {hasPermission('Gestionar Devoluciones') && (
                    <Button variant="ghost" className="w-full justify-center px-0 h-9" onClick={() => handleAdminNavigation('devoluciones')} title="Devoluciones">
                      <RotateCcw className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              )}

              <Separator className="my-1" />
              <Button
                variant="ghost"
                className={`w-full h-9 px-3 whitespace-normal overflow-hidden ${isOpen ? 'justify-start text-blue-600 text-xs' : 'justify-center px-0 text-blue-600'}`}
                onClick={() => handleNavigation('home')}
                title="Tienda"
              >
                <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                  <Home className={`${isOpen ? 'h-3.5 w-3.5 mr-2 flex-shrink-0' : 'h-6 w-6'}`} />
                  {isOpen && <span className="truncate">Tienda</span>}
                </div>
              </Button>
            </div>
          ) : (
            // Menú normal
            <div className="space-y-1">
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                className={`w-full h-8 px-1 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                style={{ fontSize: '9px' }}
                onClick={() => handleNavigation('home')}
                title="Inicio"
              >
                <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                  <Home className={`${isOpen ? 'h-3.5 w-3.5 mr-1 flex-shrink-0' : 'h-6 w-6'}`} />
                  {isOpen && <span className="truncate">Inicio</span>}
                </div>
              </Button>

              <Button
                variant={currentView === 'shop' ? 'default' : 'ghost'}
                className={`w-full h-8 px-1 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                style={{ fontSize: '9px' }}
                onClick={() => handleNavigation('shop')}
                title="Tienda"
              >
                <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                  <ShoppingCart className={`${isOpen ? 'h-3.5 w-3.5 mr-1 flex-shrink-0' : 'h-6 w-6'}`} />
                  {isOpen && <span className="truncate">Tienda</span>}
                </div>
              </Button>

              {isAuthenticated && (
                <Button
                  variant={currentView === 'profile' ? 'default' : 'ghost'}
                  className={`w-full h-8 px-1 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                  style={{ fontSize: '9px' }}
                  onClick={() => handleNavigation('profile')}
                  title="Mi Perfil"
                >
                  <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                    <User className={`${isOpen ? 'h-3.5 w-3.5 mr-1 flex-shrink-0' : 'h-6 w-6'}`} />
                    {isOpen && <span className="truncate">Mi Perfil</span>}
                  </div>
                </Button>
              )}

              {isAuthenticated && user?.role.name === 'Cliente' && (
                <Button
                  variant={currentView === 'pedidos' ? 'default' : 'ghost'}
                  className={`w-full h-8 px-1 whitespace-normal overflow-hidden ${isOpen ? 'justify-start' : 'justify-center'}`}
                  style={{ fontSize: '9px' }}
                  onClick={() => handleNavigation('pedidos')}
                  title="Mis Pedidos"
                >
                  <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                    <Package className={`${isOpen ? 'h-3.5 w-3.5 mr-1 flex-shrink-0' : 'h-6 w-6'}`} />
                    {isOpen && <span className="truncate">Mis Pedidos</span>}
                  </div>
                </Button>
              )}

              {isAuthenticated && canAccessAdmin && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'secondary'}
                  className={`w-full h-8 px-1 whitespace-normal overflow-hidden ${isOpen ? 'justify-start mt-2' : 'justify-center mt-2'}`}
                  style={{ fontSize: '9px' }}
                  onClick={() => handleNavigation('admin')}
                  title="Administración"
                >
                  <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
                    <Settings className={`${isOpen ? 'h-3.5 w-3.5 mr-1 flex-shrink-0' : 'h-6 w-6'}`} />
                    {isOpen && <span className="truncate font-semibold">Admin</span>}
                  </div>
                </Button>
              )}
            </div>
          )}
        </nav>

        {/* Categories Shortcut (Solo cuando está abierto) */}
        {isOpen && !showAdminMenu && (
          <div className="pt-2">
            <h3 className="px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Categorías
            </h3>
            <div className="space-y-0.5">
              <Button variant="ghost" className="w-full justify-start text-[10px] h-7 px-2 whitespace-normal overflow-hidden" onClick={() => handleNavigation('shop')}>Desechables</Button>
              <Button variant="ghost" className="w-full justify-start text-[10px] h-7 px-2 whitespace-normal overflow-hidden" onClick={() => handleNavigation('shop')}>Recargables</Button>
              <Button variant="ghost" className="w-full justify-start text-[10px] h-7 px-2 whitespace-normal overflow-hidden" onClick={() => handleNavigation('shop')}>Líquidos</Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            className={`w-full h-8 px-1 whitespace-normal overflow-hidden text-red-600 hover:text-red-700 hover:bg-red-50 ${isOpen ? 'justify-start' : 'justify-center'}`}
            style={{ fontSize: '9px' }}
            onClick={handleLogout}
            title="Cerrar Sesión"
          >
            <div className={`flex items-center min-w-0 ${isOpen ? 'flex-1' : 'justify-center w-full'}`}>
              <LogOut className={`${isOpen ? 'h-3.5 w-3.5 mr-1 flex-shrink-0' : 'h-6 w-6'}`} />
              {isOpen && <span className="truncate">Cerrar Sesión</span>}
            </div>
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
