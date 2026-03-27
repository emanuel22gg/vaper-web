import React from 'react';
import { Button } from '@/shared/ui/button';
import { PhoneIcon } from 'lucide-react';

export const ContactFooterCTA: React.FC = () => {
  return (
    <section className="bg-yellow-500 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-black rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              ¿No sabes qué vaporizador elegir?
            </h2>
            <p className="text-gray-300 text-lg">
              Te asesoramos para que encuentres el equipo perfecto para ti. Escríbenos 
              por WhatsApp y un experto de <span className="text-yellow-500 font-semibold">Vaper One</span> te responderá al instante.
            </p>
          </div>
          
          <div className="shrink-0">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-green-500/30 group transition-all"
              onClick={() => window.open('https://wa.me/numerodetelefono', '_blank')}
            >
              <PhoneIcon className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              Chatear por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
