
import * as React from 'react';
import { type FC } from 'react';
import { WHATSAPP_LINK, SERVICE_IMG_PRINT, SERVICE_IMG_100, SERVICE_IMG_CONSULT, INSTAGRAM_URL, LOGO_URL, customTshirtMockup, getCustomProductImage } from '../constants';

// ARRAY DELLE IMMAGINI DELLA GALLERIA (MODIFICA QUI I LINK PER CAMBIARE LE FOTO DELLO SFONDO)
const heroGallery = [
  "https://res.cloudinary.com/wj6gezu1/image/upload/f_auto,q_auto/1", // Verticale 1
  "https://res.cloudinary.com/wj6gezu1/image/upload/f_auto,q_auto/9", // Verticale 2
  "https://res.cloudinary.com/wj6gezu1/image/upload/f_auto,q_auto/15", // Verticale 3
  "https://res.cloudinary.com/wj6gezu1/image/upload/f_auto,q_auto/12", // Verticale 4
  "https://res.cloudinary.com/wj6gezu1/image/upload/f_auto,q_auto/18", // Verticale 5
  "https://res.cloudinary.com/wj6gezu1/image/upload/f_auto,q_auto/16"  // Verticale 6
];

interface HomeProps {
  navigate: (page: string) => void;
}

const Home: FC<HomeProps> = ({ navigate }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* GALLERIA FOTOGRAFICA IN MOVIMENTO (BLOCCHI VERTICALI) */}
        <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden pointer-events-none flex items-center">
          <div className="flex animate-slide w-max">
            {/* GRUPPO 1 */}
            <div className="flex gap-4 md:gap-6 lg:gap-8 pr-4 md:pr-6 lg:pr-8 items-center">
              {heroGallery.map((url, i) => (
                <div 
                  key={`g1-${i}`} 
                  className={`relative flex-shrink-0 w-[220px] sm:w-[280px] md:w-[320px] lg:w-[360px] aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl ${i % 2 === 0 ? 'translate-y-4 md:translate-y-8' : '-translate-y-4 md:-translate-y-8'}`}
                >
                  <img 
                    src={url} 
                    alt={`Sfondo Matrimonio ${i}`} 
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
              ))}
            </div>
            {/* GRUPPO 2 (Copia per loop continuo perfetto) */}
            <div className="flex gap-4 md:gap-6 lg:gap-8 pr-4 md:pr-6 lg:pr-8 items-center">
              {heroGallery.map((url, i) => (
                <div 
                  key={`g2-${i}`} 
                  className={`relative flex-shrink-0 w-[220px] sm:w-[280px] md:w-[320px] lg:w-[360px] aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl ${i % 2 === 0 ? 'translate-y-4 md:translate-y-8' : '-translate-y-4 md:-translate-y-8'}`}
                >
                  <img 
                    src={url} 
                    alt={`Sfondo Matrimonio ${i}`} 
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* OVERLAY SCURO / GRADIENTE PER LEGGIBILITÀ TESTI */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/60 to-[#0a0a0a]/90 z-0"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl flex flex-col items-center justify-center w-full">
          <div className="animate-fade-in transition-transform hover:scale-105 duration-700 flex flex-col justify-center items-center w-full">
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Logo" 
              className="h-40 sm:h-52 md:h-60 w-auto max-w-[90vw] brightness-0 invert object-contain mx-auto"
            />
            <h2 className="mt-6 md:mt-10 text-white/95 font-serif text-sm sm:text-base md:text-xl lg:text-2xl tracking-[0.18em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase font-light text-center leading-relaxed max-w-xl">
              Non fotografo momenti. Racconto emozioni.
            </h2>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      <section className="py-24 px-6 bg-gray-50 dark:bg-zinc-900 transition-colors flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-2xl md:text-4xl text-black dark:text-white font-serif italic mb-12 leading-relaxed">
            Carica le tue foto, scegli il pacchetto e ritira le stampe in studio. <br className="hidden md:block" /> La qualità professionale a portata di click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('dashboard')}
              className="w-full sm:w-auto px-12 py-5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest text-[10px]"
            >
              Carica le tue foto
            </button>
            <button 
              onClick={() => navigate('packages')}
              className="w-full sm:w-auto px-12 py-5 border-2 border-black/20 dark:border-white/20 text-black dark:text-white font-bold rounded-full hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-widest text-[10px]"
            >
              Vedi Pacchetti
            </button>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-6 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-black dark:text-white italic">I Nostri Servizi</h2>
            <div className="w-20 h-1 bg-black dark:bg-white mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group cursor-pointer" onClick={() => navigate('wedding-consulting')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl">
                <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800" alt="Consulenza Wedding" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 dark:text-white italic">Consulenza Wedding</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">Un servizio su misura per il tuo matrimonio. Raccontaci la tua idea e creeremo il reportage perfetto per il tuo grande giorno.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-black dark:border-white dark:text-white pb-1 group-hover:pr-4 transition-all italic">Richiedi Info →</span>
            </div>
            <div className="group cursor-pointer" onClick={() => navigate('packages')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl">
                <img src={SERVICE_IMG_100} alt="Pacchetto 100 Foto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 dark:text-white italic">Pacchetto 100 Foto</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">La nostra offerta più popolare. 100 stampe professionali ad un prezzo imbattibile per i tuoi eventi.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-black dark:border-white dark:text-white pb-1 group-hover:pr-4 transition-all italic">Vedi Offerta →</span>
            </div>
            <div className="group cursor-pointer" onClick={() => navigate('contact')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl">
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" alt="Consulenza Eventi" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 dark:text-white italic">Consulenza per tutti i tuoi eventi</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">Battesimi, comunioni, 18 anni, lauree o feste private. Progettiamo insieme il servizio fotografico perfetto per ogni tua occasione speciale.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-black dark:border-white dark:text-white pb-1 group-hover:pr-4 transition-all italic">Contattaci →</span>
            </div>
            <div className="group cursor-pointer" onClick={() => navigate('custom-products')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl bg-zinc-900">
                <img 
                  src={getCustomProductImage('t-shirt-custom') || customTshirtMockup} 
                  alt="Prodotti Personalizzati" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = customTshirtMockup;
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute top-4 right-4 bg-amber-400 text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                  Novità
                </div>
              </div>
              <h3 className="text-2xl font-serif mb-3 dark:text-white italic">Prodotti Personalizzati</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">T-Shirt, Tazze, Cover, Collane, Portachiavi e Cuscini con la tua foto stampata ad altissima definizione.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 pb-1 group-hover:pr-4 transition-all italic">Personalizza Ora →</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gray-50 dark:bg-zinc-900 transition-colors text-center">
        <div className="max-w-4xl mx-auto bg-black dark:bg-zinc-800 p-16 md:p-24 rounded-[60px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-8 relative z-10 italic">Pronto a stampare i tuoi momenti migliori?</h2>
          <p className="text-gray-400 mb-12 relative z-10 max-w-xl mx-auto text-lg italic font-light">Unisciti ai nostri clienti e trasforma i tuoi pixel in carta di alta qualità.</p>
          <div className="flex flex-col items-center gap-8 relative z-10">
            <button 
              onClick={() => navigate('dashboard')}
              className="px-16 py-6 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-xl uppercase tracking-widest text-sm"
            >
              Inizia Ora
            </button>
            <div className="flex items-center gap-10">
               <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#25D366] transition-colors text-3xl">
                  <i className="fab fa-whatsapp"></i>
               </a>
               <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-500 transition-colors text-3xl">
                  <i className="fab fa-instagram"></i>
               </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
