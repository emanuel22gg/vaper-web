import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { HeroBanner } from './HeroBanner';
import { FeaturedProducts } from './FeaturedProducts';
import { ProductCatalog } from './ProductCatalog';
import { ShoppingCart } from './ShoppingCart';
import { Checkout } from './Checkout';
import { Footer } from './Footer';
import { SideMenu } from './SideMenu';
import { AuthForm } from './AuthForm';
import { TiendaCliente } from './TiendaCliente';
import { UserProfile } from './UserProfile';
import { Dashboard } from './Dashboard';
import { useAuth } from '../hooks/useAuth';
import { Dialog, DialogContent } from './ui/dialog';
import { PedidosCliente } from './PedidosCliente';

interface LandingPageProps {
  shouldRedirectToAdmin?: boolean;
  shouldRedirectToShop?: boolean;
  onResetRedirection?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  shouldRedirectToAdmin = false,
  shouldRedirectToShop = false,
  onResetRedirection
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos'>('home');
  const [activeAdminView, setActiveAdminView] = useState<string>('dashboard');

  // Redirección automática para admin/empleado después del login
  useEffect(() => {
    if (shouldRedirectToAdmin && isAuthenticated && user) {
      const isAdminOrEmployee =
        user.role.name === 'Super Administrador' ||
        user.role.name === 'Administrador' ||
        user.role.name === 'Admin' ||
        user.role.name === 'Empleado' ||
        user.role.permissions?.some((p: any) => p.name === 'Ver Dashboard');

      if (isAdminOrEmployee) {
        // Solo redirigir si no estamos ya en el panel admin
        if (currentView !== 'admin') {
          setCurrentView('admin');
          setActiveAdminView('dashboard');
        }

        // Notificar que la redirección ya se procesó
        if (onResetRedirection) {
          onResetRedirection();
        }
      }
    }
  }, [shouldRedirectToAdmin, isAuthenticated, user, currentView, onResetRedirection]);

  // Redirección automática para clientes después del login
  useEffect(() => {
    if (shouldRedirectToShop && isAuthenticated && user) {
      const isClient = user.role.name === 'Cliente';
      if (isClient) {
        if (currentView !== 'shop') {
          setCurrentView('shop');
        }

        if (onResetRedirection) {
          onResetRedirection();
        }
      }
    }
  }, [shouldRedirectToShop, isAuthenticated, user, currentView, onResetRedirection]);

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const handleNavigation = (view: 'home' | 'shop' | 'profile' | 'admin' | 'auth' | 'cart' | 'checkout' | 'pedidos') => {
    setCurrentView(view);
    setIsSideMenuOpen(false);

    // Si navega al admin, resetear la vista administrativa al dashboard
    if (view === 'admin') {
      setActiveAdminView('dashboard');
    }

    // Resetear la redirección automática cuando el usuario navega manualmente
    if (onResetRedirection) {
      onResetRedirection();
    }
  };

  const handleAdminNavigation = (view: string) => {
    setActiveAdminView(view);
  };

  const canAccessAdmin = () => {
    if (!isAuthenticated || !user) return false;
    return user.role.name === 'Super Administrador' ||
      user.role.name === 'Administrador' ||
      user.role.name === 'Admin' ||
      user.role.name === 'Empleado' ||
      user.role.permissions?.some((p: any) => p.name === 'Ver Dashboard');
  };

  const handleAuthSuccess = () => {
    // No hacer nada aquí - la redirección se maneja en el useEffect
    // El usuario será redirigido automáticamente por la lógica del App.tsx
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'shop':
        return <ProductCatalog />;
      case 'cart':
        return (
          <ShoppingCart
            onCheckout={() => setCurrentView('checkout')}
            onContinueShopping={() => setCurrentView('shop')}
          />
        );
      case 'checkout':
        return (
          <Checkout
            onBack={() => setCurrentView('cart')}
            onSuccess={() => setCurrentView('shop')}
          />
        );
      case 'profile':
        return isAuthenticated ? <UserProfile /> : <AuthForm onSuccess={handleAuthSuccess} />;
      case 'admin':
        return canAccessAdmin() ? (
          <Dashboard
            onAdminNavigate={handleAdminNavigation}
            activeAdminView={activeAdminView}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
              <p className="text-gray-600">No tienes permisos para acceder al panel administrativo.</p>
            </div>
          </div>
        );
      case 'auth':
        return <AuthForm onSuccess={handleAuthSuccess} />;
      case 'pedidos':
        return <PedidosCliente />;
      default:
        return (
          <>
            <HeroBanner onNavigate={handleNavigation} />
            <ProductCatalog />
          </>
        );
    }
  };

  const isMainView = currentView === 'home';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        currentView={currentView}
        onNavigate={handleNavigation}
        user={user}
        isAuthenticated={isAuthenticated}
        canAccessAdmin={canAccessAdmin()}
        onAdminNavigate={handleAdminNavigation}
        activeAdminView={activeAdminView}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={toggleSideMenu}
          currentView={currentView}
          onNavigate={handleNavigation}
          user={user}
          isAuthenticated={isAuthenticated}
          canAccessAdmin={canAccessAdmin()}
          onAdminNavigate={handleAdminNavigation}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-screen-2xl mx-auto">
            {renderMainContent()}
          </div>
          {isMainView && <Footer />}
        </main>
      </div>
    </div>
  );
};
