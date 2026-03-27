import React from 'react';
import { Truck, ShieldCheck, CreditCard, Award } from 'lucide-react';

export const TrustIndicators: React.FC = () => {
  const indicators = [
    {
      icon: <Truck className="h-8 w-8 text-yellow-500 mb-3 group-hover:-translate-y-1 transition-transform duration-300" />,
      title: "Envío Rápido",
      description: "Entregas en Medellín en 24h",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-yellow-500 mb-3 group-hover:-translate-y-1 transition-transform duration-300" />,
      title: "100% Originales",
      description: "Productos importados garantizados",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-yellow-500 mb-3 group-hover:-translate-y-1 transition-transform duration-300" />,
      title: "Pago Seguro",
      description: "Múltiples métodos de pago",
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-500 mb-3 group-hover:-translate-y-1 transition-transform duration-300" />,
      title: "Garantía de Calidad",
      description: "Respaldo en todas tus compras",
    },
  ];

  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {indicators.map((item, index) => (
            <div 
              key={index} 
              className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
            >
              {item.icon}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
