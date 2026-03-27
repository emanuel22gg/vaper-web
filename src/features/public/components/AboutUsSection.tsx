import React from 'react';
import { Button } from '@/shared/ui/button';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';

export const AboutUsSection: React.FC = () => {
  return (
    <section className="py-20 bg-black text-white overflow-hidden relative">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-500/10 to-transparent pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Texto de Quiénes Somos Centrado */}
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-yellow-500 uppercase mb-3 text-center">Conócenos</h2>
            <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Redefiniendo el vapeo en <span className="text-yellow-500">Medellín</span>
            </h3>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Somos Vaper One Medellín, una empresa líder en el mercado de vaporizadores, 
              comprometida con ofrecer productos de la más alta calidad. Nos especializamos en brindar 
              una amplia gama de dispositivos desechables, recargables y accesorios premium.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <CheckCircle2 className="h-6 w-6 text-yellow-500 shrink-0 mt-0 sm:mt-1" />
              <p className="text-gray-300">
                <strong className="text-white">Nuestra Misión:</strong> Proporcionar a nuestros clientes 
                la mejor experiencia con productos seguros e innovadores.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <CheckCircle2 className="h-6 w-6 text-yellow-500 shrink-0 mt-0 sm:mt-1" />
              <p className="text-gray-300">
                <strong className="text-white">Para Todos:</strong> Opciones de vanguardia que satisfacen 
                las necesidades tanto de principiantes como de expertos.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-4 flex flex-col items-center">
             <h4 className="text-xl font-bold text-white mb-2">¿Necesitas asesoría personalizada?</h4>
             <p className="text-gray-400 text-sm mb-6">Escríbenos por WhatsApp y un experto de Vaper One te ayudará a elegir el equipo perfecto.</p>
             <Button 
               onClick={() => window.open('https://wa.me/numerodetelefono', '_blank')}
               className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-green-500/20 group transition-all w-full sm:w-auto flex items-center justify-center"
             >
               <Phone className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
               Chatear por WhatsApp
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
