import { Phone, Mail, MapPin, Instagram, Download, Smartphone } from 'lucide-react';
import logoImage from 'figma:asset/da58514cc4a62145203981edd12b890ba8690130.png';

interface FooterProps {}

export function Footer({}: FooterProps = {}) {
  return (
    <footer id="footer" className="bg-black text-white relative pt-4">
      {/* Decorative Top Border Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-24 bg-yellow-500/5 blur-[50px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src={logoImage} 
                alt="VaperMedellín Logo" 
                className="h-14 w-auto object-contain brightness-0 invert"
                style={{ 
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 0 transparent)',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
            <p className="text-gray-300 text-sm">
              Tu tienda de confianza para vaporizadores de calidad premium. 
              Ofrecemos los mejores productos con garantía y envío rápido.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/vaperonemede9_2?igsh=MWlpNGt3MDAycXQ4eQ==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-yellow-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* Download App Button */}
            <div className="pt-2">
              <a 
                href="/vaperMovil.apk" 
                download="vaperMovil.apk"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-yellow-500/20"
              >
                <Smartphone className="h-5 w-5" />
                Descargar App Android
                <Download className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-semibold text-yellow-500">Contacto</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+573234190628" className="hover:text-yellow-500 transition-colors">
                  323 4190628
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@vapermedellin.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Medellín, Antioquia, Colombia</span>
              </div>
            </div>
          </div>

          {/* Ubicación (Mapa) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-yellow-500">Ubicación</h3>
            <div className="rounded-lg overflow-hidden border border-gray-800 h-32 relative shadow-lg">
              <iframe 
                src="https://maps.google.com/maps?q=Cl.+51+%23+51-12%2C+La+Candelaria%2C+Medell%C3%ADn%2C+Antioquia&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Vaper Medellín"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 VaperMedellín. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

