import React, { useState, useEffect } from 'react';
import { Header } from '@/shared/components/Header';
import { HeroBanner } from '@/features/products/components/HeroBanner';
import { FeaturedProducts } from '@/features/products/components/FeaturedProducts';
import { ProductCatalog } from '@/features/products/components/ProductCatalog';
import { TrustIndicators } from '@/features/public/components/TrustIndicators';
import { ShoppingCart } from '@/features/sales/components/ShoppingCart';
import { Checkout } from '@/features/sales/components/Checkout';
import { Footer } from '@/shared/components/Footer';
import { SideMenu } from '@/shared/components/SideMenu';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { TiendaCliente } from '@/features/public/components/TiendaCliente';
import { UserProfile } from '@/features/admin/components/UserProfile';
import { Dashboard } from '@/features/admin/components/Dashboard';
import { useAuth } from '@/shared/hooks/useAuth';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { PedidosCliente } from '@/features/clients/components/PedidosCliente';
import { toast } from 'sonner';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [intendedView, setIntendedView] = useState<string | null>(null);

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
        if (intendedView === 'checkout') {
          setCurrentView('checkout');
          setIntendedView(null);
        } else if (currentView !== 'home') {
          setCurrentView('home');
        }

        if (onResetRedirection) {
          onResetRedirection();
        }
      }
    }
  }, [shouldRedirectToShop, isAuthenticated, user, currentView, onResetRedirection, intendedView]);

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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    
    // Si estamos en home, hacer scroll hacia el catálogo
    if (currentView === 'home' && term) {
      setTimeout(() => {
        const catalogo = document.getElementById('catalogo');
        if (catalogo) {
          catalogo.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleAuthSuccess = () => {
    // No hacer nada aquí - la redirección se maneja en el useEffect
    // El usuario será redirigido automáticamente por la lógica del App.tsx
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'shop':
        return <ProductCatalog searchTerm={searchTerm} />;
      case 'cart':
        return (
          <ShoppingCart
            onCheckout={() => {
              if (isAuthenticated) {
                setCurrentView('checkout');
              } else {
                toast.warning('Para continuar con la compra debes registrarte o iniciar sesión');
                setIntendedView('checkout');
                setCurrentView('auth');
              }
            }}
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
            <TrustIndicators />
            <FeaturedProducts />
            <ProductCatalog searchTerm={searchTerm} />
          </>
        );
    }
  };

  const isMainView = currentView === 'home';

  return (
    <div className="min-h-screen flex bg-gray-50 relative">
      {canAccessAdmin() && currentView === 'admin' && (
        <div className="sticky top-0 h-screen flex-none z-40 shadow-sm border-r border-gray-200">
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
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={toggleSideMenu}
          currentView={currentView}
          onNavigate={handleNavigation}
          user={user}
          isAuthenticated={isAuthenticated}
          canAccessAdmin={canAccessAdmin()}
          onAdminNavigate={handleAdminNavigation}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        <main className="flex-1 pt-4 pb-10">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
            {renderMainContent()}
          </div>
          {isMainView && <Footer onNavigate={handleNavigation} />}
        </main>
      </div>
    </div>
  );
};
