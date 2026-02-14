
import * as React from 'react';
import { type FC, useEffect, useState } from 'react';
import { PORTFOLIO_BG_URL, CARMINE_PHOTO_URL, SHOTS_GALLERY } from '../constants';

interface PortfolioProps {
  navigate: (page: string) => void;
}

const Portfolio: FC<PortfolioProps> = ({ navigate }) => {
  const [images, setImages] = useState<string[]>(SHOTS_GALLERY);

  useEffect(() => {
    // Gestione dell'override delle immagini tramite URL e logging
    const params = new URLSearchParams(window.location.search);
    const updatedImages = [...SHOTS_GALLERY];
    let hasChanges = false;

    // Logghiamo tutte le 12 immagini e verifichiamo se ci sono parametri nell'URL
    for (let i = 1; i <= 12; i++) {
      const overrideUrl = params.get(`photo${i}`);
      const currentUrl = overrideUrl || SHOTS_GALLERY[i - 1];
      
      if (overrideUrl) {
        updatedImages[i - 1] = overrideUrl;
        hasChanges = true;
      }
      
      // Log richiesto: 📸 photoX: [link immagine]
      console.log(`📸 photo${i}: ${currentUrl}`);
    }

    if (hasChanges) {
      setImages(updatedImages);
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden bg-zinc-900 dark:bg-zinc-950 transition-colors">
      <div className="fixed inset-0 z-0">
        <img 
          src={PORTFOLIO_BG_URL} 
          alt="Portfolio Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]"></div>
      </div>

      {/* Main Profile Section */}
      <div className="relative z-10 w-full max-w-6xl px-4 pt-20 md:pt-32 pb-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-[40px] md:rounded-[60px] border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="w-full md:w-5/12 lg:w-4/12 relative">
              <div className="h-80 md:h-full min-h-[400px] overflow-hidden">
                <img 
                  src={CARMINE_PHOTO_URL} 
                  alt="Carmine Felice Napolitano" 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
              </div>
            </div>

            <div className="w-full md:w-7/12 lg:w-8/12 p-8 md:p-16 flex flex-col justify-center">
              <div className="mb-8">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Profilo Professionale</span>
                <h1 className="text-4xl md:text-6xl font-serif text-white mb-2 italic">CIAO,</h1>
                <h2 className="text-2xl md:text-4xl font-serif text-white">qui Carmine!</h2>
              </div>

              <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base font-light">
                <p>
                  Sono <strong className="text-white font-bold">Carmine Felice Napolitano</strong>, fotografo specializzato in matrimoni ed eventi, e da ben 12 anni mi immergo con passione e dedizione nel meraviglioso mondo della fotografia.
                </p>
                <p>
                  Per me, la fotografia non è solo un lavoro, ma una vera e propria vocazione. Ogni scatto che catturo racconta una story, trasmette un'emozione e testimonia un momento prezioso nella vita delle persone che fotografo.
                </p>
                <p>
                  La mia esperienza nel settore wedding ed eventi mi ha permesso di affinare le mie abilità nel catturare istanti unici e irripetibili, dando vita a immagini che narrano con autenticità e stile il vostro giorno speciale.
                </p>
                <p>
                  Ambizioso e determinato, mi impegno costantemente per migliorare le mie capacità e offrire ai miei clienti servizi sempre più eccellenti ed emozionanti.
                </p>
                <p>
                  Il mio approccio alla fotografia si ispira allo stile reportage, dove la spontaneità e l'autenticità sono al centro di ogni immagine.
                </p>
                <p className="pt-6 border-t border-white/10 italic text-white/80">
                  Spero di avere l'opportunità di condividere con voi la mia passione per la fotografia e di poter catturare insieme momenti indimenticabili.
                </p>
              </div>

              <div className="mt-10 pt-8 flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-white font-serif text-xl">Cordiali saluti,</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Carmine Felice Napolitano</p>
                </div>
                <div className="sm:ml-auto flex gap-4">
                  <button 
                    onClick={() => navigate('home')}
                    className="flex-1 sm:flex-none px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px] shadow-xl"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => navigate('packages')}
                    className="flex-1 sm:flex-none px-8 py-3 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Pacchetti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Portfolio: I Miei Scatti 📷 */}
      <section className="relative z-10 w-full max-w-7xl px-4 pb-24 md:pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-white italic">I Miei Scatti 📷</h2>
          <div className="w-16 h-1 bg-white/20 mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {images.map((url, index) => (
            <div 
              key={index} 
              className="group relative aspect-[4/5] overflow-hidden rounded-[30px] border border-white/10 shadow-2xl bg-white/5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={url} 
                alt={`Scatto ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.1] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
