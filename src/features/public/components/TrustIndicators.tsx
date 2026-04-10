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
    <section className="bg-white py-16 border-y border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white border-2 border-yellow-400/50 hover:border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:bg-yellow-50/40 transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] cursor-pointer"
            >
              <div className="bg-yellow-50/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 border border-yellow-100">
                {item.icon}
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
