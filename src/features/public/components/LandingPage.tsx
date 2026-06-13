import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { HeroBanner } from '@/features/products/components/HeroBanner';
import { TrustIndicators } from '@/features/public/components/TrustIndicators';
import { FeaturedProducts } from '@/features/products/components/FeaturedProducts';
import { Footer } from '@/shared/components/Footer';
import { SideMenu } from '@/shared/components/SideMenu';
import { useAuth } from '@/shared/hooks/useAuth';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Carga perezosa (Lazy Loading) de componentes pesados
const ProductCatalog = lazy(() => import('@/features/products/components/ProductCatalog').then(m => ({ default: m.ProductCatalog })));
const ShoppingCart = lazy(() => import('@/features/sales/components/ShoppingCart').then(m => ({ default: m.ShoppingCart })));
const Checkout = lazy(() => import('@/features/sales/components/Checkout').then(m => ({ default: m.Checkout })));
const AuthForm = lazy(() => import('@/features/auth/components/AuthForm').then(m => ({ default: m.AuthForm })));
const UserProfile = lazy(() => import('@/features/admin/components/UserProfile').then(m => ({ default: m.UserProfile })));
const Dashboard = lazy(() => import('@/features/admin/components/Dashboard').then(m => ({ default: m.Dashboard })));
const PedidosCliente = lazy(() => import('@/features/clients/components/PedidosCliente').then(m => ({ default: m.PedidosCliente })));

// Fallback visual mientras carga el componente
const LoadingFallback = () => (
  <div className="min-h-[50vh] flex justify-center items-center">
    <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
  </div>
);

interface LandingPageProps {}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Derivar currentView de la URL para compatibilidad con Header y SideMenu
  const currentView = location.pathname === '/' ? 'home' 
    : location.pathname.startsWith('/admin') ? 'admin' 
    : location.pathname.split('/')[1] || 'home';

  const activeAdminView = location.pathname.startsWith('/admin/') ? location.pathname.split('/')[2] : '';

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const handleNavigation = (view: string) => {
    setIsSideMenuOpen(false);
    switch (view) {
      case 'home': navigate('/'); break;
      case 'shop': navigate('/shop'); break;
      case 'cart': navigate('/cart'); break;
      case 'checkout': navigate('/checkout'); break;
      case 'profile': navigate(canAccessAdmin() ? '/admin/profile' : '/profile'); break;
      case 'admin': navigate('/admin'); break;
      case 'auth': navigate('/auth'); break;
      case 'pedidos': navigate('/pedidos'); break;
      default: navigate('/'); break;
    }
  };

  const handleAdminNavigation = (view: string) => {
    navigate(`/admin/${view}`);
  };

  const canAccessAdmin = () => {
    if (!isAuthenticated || !user) return false;
    return user.role.name === 'Super Administrador' ||
      user.role.name === 'Administrador' ||
      user.role.name === 'Admin' ||
      user.role.name === 'Empleado' ||
      (user.role.permissions && user.role.permissions.length > 0);
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
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={
            <>
              <HeroBanner />
              <TrustIndicators />
              <FeaturedProducts />
              <ProductCatalog searchTerm={searchTerm} />
            </>
          } />
          <Route path="/shop" element={<ProductCatalog searchTerm={searchTerm} />} />
          <Route path="/cart" element={
            <ShoppingCart
              onCheckout={() => {
                if (isAuthenticated) {
                  navigate('/checkout');
                } else {
                  toast.warning('Para continuar con la compra debes registrarte o iniciar sesión');
                  navigate('/auth', { state: { intendedView: '/checkout' } });
                }
              }}
              onContinueShopping={() => navigate('/shop')}
            />
          } />
          <Route path="/checkout" element={
            <Checkout
              onBack={() => navigate('/cart')}
              onSuccess={() => navigate('/shop')}
            />
          } />
          <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/auth" replace />} />
          <Route path="/admin/*" element={
            canAccessAdmin() ? (
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
            )
          } />
          <Route path="/auth" element={<AuthForm onSuccess={handleAuthSuccess} />} />
          <Route path="/pedidos" element={<PedidosCliente />} />
        </Routes>
      </Suspense>
    );
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
            user={user}
            isAuthenticated={isAuthenticated}
            canAccessAdmin={canAccessAdmin()}
            activeAdminView={activeAdminView}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={toggleSideMenu}
          currentView={currentView}
          user={user}
          isAuthenticated={isAuthenticated}
          canAccessAdmin={canAccessAdmin()}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        <main className="flex-1 pt-4 pb-10">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
            {renderMainContent()}
          </div>
          {isMainView && <Footer />}
        </main>
      </div>
    </div>
  );
};
