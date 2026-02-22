import vapeImage from 'figma:asset/6c1887bd6eba23fed5ff96a23e2c0895aa21c8a1.png';

export function HeroBanner() {
  return (
    <section className="bg-black text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto corporativo */}
          <div className="space-y-6 z-10 relative">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              La Mejor Experiencia en 
              <span className="text-yellow-500"> Vapeo</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Somos Vaper One Medellín, una empresa líder en el mercado de vaporizadores, 
              comprometida con ofrecer productos de la más alta calidad. Con años de 
              experiencia en el sector, nos especializamos en brindar una amplia gama 
              de dispositivos desechables, recargables y accesorios premium.
            </p>
            <p className="text-gray-300">
              Nuestra misión es proporcionar a nuestros clientes la mejor experiencia de vapeo, 
              con productos seguros, innovadores y de calidad superior que satisfacen las 
              necesidades de todos los usuarios, desde principiantes hasta expertos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                Ver Catálogo
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors">
                Contáctanos
              </button>
            </div>
          </div>

          {/* Imagen del vape con títulos flotantes - CORREGIDO */}
          <div className="relative flex items-center justify-center min-h-[500px] max-w-full">
            {/* Contenedor principal con posicionamiento mejorado */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Vape principal - Tamaño responsivo corregido */}
              <div className="relative z-10 flex items-center justify-center">
                <img 
                  src={vapeImage} 
                  alt="Snoopy Smoke Extra Tank Vape" 
                  className="w-[400px] lg:w-[500px] xl:w-[600px] h-auto object-contain max-w-full white-aura-animation"
                />
              </div>

              {/* Efecto de fondo más contenido */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-full blur-3xl opacity-40"></div>
              </div>

              {/* Títulos flotantes - Posiciones mejoradas y responsivas */}
              {/* SNOOPY SMOKE - Arriba izquierda */}
              <div className="absolute top-8 left-4 lg:top-16 lg:left-8 bg-white text-black px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-lg transform -rotate-12 float-animation z-20">
                <span className="font-bold text-sm lg:text-lg">SNOOPY SMOKE</span>
                <div className="text-xs text-gray-600">Extra Tank</div>
              </div>

              {/* 15000 PUFFS - Arriba derecha */}
              <div className="absolute top-8 right-4 lg:top-12 lg:right-8 bg-yellow-500 text-black px-3 py-2 lg:px-4 lg:py-3 rounded-lg shadow-lg transform rotate-12 float-reverse-animation z-20">
                <span className="font-bold text-lg lg:text-2xl">15000</span>
                <div className="text-xs font-medium">PUFFS</div>
              </div>

              {/* Mesh Coil - Izquierda centro */}
              <div className="absolute left-0 lg:left-2 top-1/3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-lg shadow-lg transform -rotate-6 float-animation z-20">
                <div className="text-xs">MESH COIL</div>
                <div className="text-xs lg:text-sm font-bold">RECHARGEABLE</div>
              </div>

              {/* 5% Nicotine - Derecha centro */}
              <div className="absolute right-0 lg:right-2 top-1/4 bg-red-500 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-lg shadow-lg transform rotate-6 glow-animation z-20">
                <div className="text-sm lg:text-lg font-bold">5%</div>
                <div className="text-xs">NICOTINE</div>
              </div>

              {/* Capacidad - Abajo izquierda */}
              <div className="absolute bottom-12 left-2 lg:bottom-20 lg:left-8 bg-blue-500 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-lg shadow-lg transform rotate-3 float-reverse-animation z-20">
                <div className="text-xs lg:text-sm font-bold">18ML</div>
                <div className="text-xs">CAPACITY</div>
              </div>

              {/* Batería - Abajo derecha */}
              <div className="absolute bottom-12 right-2 lg:bottom-16 lg:right-8 bg-green-500 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-lg shadow-lg transform -rotate-6 float-animation z-20">
                <div className="text-xs lg:text-sm font-bold">650</div>
                <div className="text-xs">MAH</div>
              </div>

              {/* Design in USA - Centro abajo */}
              <div className="absolute bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 lg:px-4 lg:py-2 rounded-full shadow-lg glow-animation z-20">
                <span className="text-xs lg:text-sm font-medium">Design in USA</span>
              </div>

              {/* Sabor - Flotante central izquierda */}
              <div className="absolute top-1/2 left-0 lg:left-4 transform -translate-y-1/2 bg-gradient-to-r from-pink-400 to-red-400 text-white px-2 py-1 lg:px-4 lg:py-3 rounded-lg shadow-lg rotate-12 float-reverse-animation z-20">
                <div className="text-xs">FROZEN</div>
                <div className="text-xs lg:text-sm font-bold">STRAWBERRY</div>
                <div className="text-xs">CREAM</div>
              </div>
            </div>

            {/* Partículas flotantes - Mejoradas y contenidas */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
              <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
              <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-50"></div>
              <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
            </div>
            
            {/* Emojis decorativos - Posiciones mejoradas */}
            <div className="absolute bottom-1/3 left-1/4 text-lg animate-pulse opacity-60 pointer-events-none">🍓</div>
            <div className="absolute top-1/2 right-1/4 text-lg float-animation opacity-50 pointer-events-none">❄️</div>
            <div className="absolute top-2/5 left-2/5 text-sm opacity-40 animate-pulse pointer-events-none">💨</div>
          </div>
        </div>
      </div>

      {/* Efecto de humo global */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none"></div>
    </section>
  );
}
