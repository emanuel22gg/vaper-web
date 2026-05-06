import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Pantalla de carga centrada para usar dentro de módulos/vistas.
 * Reemplaza los "Cargando..." de texto plano en las tablas.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando datos...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 w-full">
      <div className="relative flex items-center justify-center h-14 w-14">
        {/* Anillo exterior decorativo */}
        <div className="absolute h-14 w-14 rounded-full border-2 border-yellow-500/20" />
        {/* Spinner principal */}
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">{message}</p>
    </div>
  );
};
