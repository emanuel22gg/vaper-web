import React, { useEffect, useState } from "react";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { CartProvider } from "@/shared/contexts/CartContext";
import { LandingPage } from "@/features/public/components/LandingPage";
import { Toaster } from "sonner";

// Componente que maneja el routing principal
const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [shouldRedirectToAdmin, setShouldRedirectToAdmin] =
    useState(false);
  const [shouldRedirectToShop, setShouldRedirectToShop] =
    useState(false);

  // Detectar cuando un admin/empleado hace login
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdminOrEmployee =
        user.role.name === "Super Administrador" ||
        user.role.name === "Administrador" ||
        user.role.name === "Admin" ||
        user.role.name === "Empleado" ||
        user.role.permissions?.some((p: any) => p.name === 'Ver Dashboard');
      const isClient = user.role.name === "Cliente" && !user.role.permissions?.some((p: any) => p.name === 'Ver Dashboard');

      if (isAdminOrEmployee) {
        setShouldRedirectToAdmin(true);
        setShouldRedirectToShop(false);
      } else if (isClient) {
        setShouldRedirectToShop(true);
        setShouldRedirectToAdmin(false);
      }
    }
  }, [isAuthenticated, user]);

  // Función para resetear la redirección (cuando el usuario navega manualmente)
  const resetRedirection = () => {
    setShouldRedirectToAdmin(false);
    setShouldRedirectToShop(false);
  };

  return (
    <LandingPage
      shouldRedirectToAdmin={shouldRedirectToAdmin}
      shouldRedirectToShop={shouldRedirectToShop}
      onResetRedirection={resetRedirection}
    />
  );
};

// Componente App principal con el Provider
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
          closeButton
          richColors
        />
      </CartProvider>
    </AuthProvider>
  );
}
