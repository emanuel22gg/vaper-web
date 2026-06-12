import React, { useEffect, useState } from "react";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { CartProvider } from "@/shared/contexts/CartContext";
import { LandingPage } from "@/features/public/components/LandingPage";
import { Toaster } from "sonner";

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Componente que maneja el routing principal
const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar cuando un admin/empleado hace login
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdminOrEmployee =
        user.role.name === "Super Administrador" ||
        user.role.name === "Administrador" ||
        user.role.name === "Admin" ||
        user.role.name === "Empleado" ||
        (user.role.permissions && user.role.permissions.length > 0);
      const isClient = user.role.name === "Cliente" && (!user.role.permissions || user.role.permissions.length === 0);

      // Redirigir al admin si entra a raíz o a auth
      if (isAdminOrEmployee && (location.pathname === '/' || location.pathname === '/auth')) {
        navigate('/admin');
      } else if (isClient && (location.pathname === '/auth')) {
        navigate('/shop');
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/*" element={<LandingPage />} />
    </Routes>
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
