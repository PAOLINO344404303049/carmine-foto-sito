
import * as React from 'react';
import { type FC, useEffect, useState, useRef } from 'react';
import { PORTFOLIO_BG_URL, CARMINE_PHOTO_URL, SHOTS_GALLERY } from '../constants';

/**
 * I MIEI SCATTI PIÙ VOTATI - ESATTAMENTE 4 FOTOGRAFIE ORIZZONTALI
 * Sostituisci facilmente questi 4 URL con le tue immagini definitive.
 */
export const topRatedShots: string[] = [
  "https://res.cloudinary.com/onovtrod/image/upload/f_auto,q_auto/NCF08015_2",
  "https://res.cloudinary.com/onovtrod/image/upload/f_auto,q_auto/DSC05155",
  "https://res.cloudinary.com/onovtrod/image/upload/f_auto,q_auto/6af882cbfb3d_picture-day_2026_124-carmine-felice-napolitano"
];

/**
 * Componente Galleria Carousel per "I miei scatti più votati"
 * - 4 foto orizzontali in grande formato
 * - Scorrimento orizzontale fluido e ciclo infinito
 * - Autoplay con pausa al passaggio del mouse
 * - Frecce laterali discrete e swipe su smartphone
 * - Nessun effetto sfocato (NO blur, NO backdrop-filter)
 * - Immagini nitide con object-contain per preservare il formato originale
 */
const TopRatedCarousel: FC = () => {
  // Array esteso con elementi clonati ai margini per garantire un ciclo infinito continuo senza salti
  const slides = [
    topRatedShots[topRatedShots.length - 1], // Clone dell'ultima foto (indice 0)
    ...topRatedShots,                        // Foto 1, 2, 3, 4 (indici 1, 2, 3, 4)
    topRatedShots[0]                         // Clone della prima foto (indice 5)
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Riferimenti per la gestione dello swipe su touchscreen
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Calcolo dell'indice attivo per i 4 indicatori/pallini (0, 1, 2, 3)
  const activeDot = (currentIndex - 1 + topRatedShots.length) % topRatedShots.length;

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  };

  const goToSlide = (slideIndex: number) => {
    setIsTransitioning(true);
    setCurrentIndex(slideIndex + 1);
  };

  // Autoplay continuo ogni 4.5 secondi (si mette in pausa quando il cursore è sopra la foto)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, currentIndex]);

  // Gestione della transizione infinita invisibile sui cloni
  const handleTransitionEnd = () => {
    if (currentIndex === slides.length - 1) {
      // Ha appena visualizzato il clone della prima foto: riposiziona istantaneamente all'indice 1 reale
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Ha appena visualizzato il clone dell'ultima foto: riposiziona istantaneamente all'indice 4 reale
      setIsTransitioning(false);
      setCurrentIndex(slides.length - 2);
    }
  };

  // Timer di sicurezza se onTransitionEnd non dovesse scattare (es. cambio tab)
  useEffect(() => {
    if (currentIndex === slides.length - 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 550);
      return () => clearTimeout(timer);
    }
    if (currentIndex === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(slides.length - 2);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, slides.length]);

  // Gestione Gesture Touch / Swipe per smartphone
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Se il movimento orizzontale prevale su quello verticale e supera 40px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <section className="relative z-10 w-full max-w-5xl px-4 py-12 md:py-16">
      {/* Titolo e Frase Descrittiva */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-white tracking-wide uppercase">
          I Miei Scatti Più Votati
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-light mt-3 max-w-xl mx-auto leading-relaxed">
          Una selezione degli scatti che raccontano meglio il mio modo di fotografare.
        </p>
        <div className="w-16 h-0.5 bg-white/20 mx-auto mt-6"></div>
      </div>

      {/* Contenitore Carousel */}
      <div
        className="relative w-full rounded-2xl md:rounded-3xl border border-white/10 bg-black overflow-hidden shadow-2xl select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Viewport Orizzontale (NO blur, NO backdrop-filter, foto nitida e completa) */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] overflow-hidden bg-black">
          <div
            className="flex w-full h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: isTransitioning ? 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((url, idx) => (
              <div
                key={idx}
                className="w-full h-full flex-shrink-0 flex items-center justify-center bg-black"
              >
                <img
                  src={url}
                  alt={`Scatto più votato ${(idx % topRatedShots.length) + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                  loading="eager"
                />
              </div>
            ))}
          </div>

          {/* Freccia Sinistra */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Foto precedente"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 shadow-xl"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Freccia Destra */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Foto successiva"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 shadow-xl"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Indicatori / Pallini sotto la fotografia */}
      <div className="flex items-center justify-center gap-2.5 mt-6">
        {topRatedShots.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            aria-label={`Visualizza scatto ${i + 1} di ${topRatedShots.length}`}
            className={`transition-all duration-300 rounded-full h-2 ${
              activeDot === i
                ? 'w-8 bg-white'
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

interface PortfolioProps {
  navigate: (page: string) => void;
}

const Portfolio: FC<PortfolioProps> = ({ navigate }) => {
  const [images, setImages] = useState<string[]>(SHOTS_GALLERY);

  useEffect(() => {
    // Gestione dell'override tramite URL parameters e LOG obbligatorio in console
    const params = new URLSearchParams(window.location.search);
    const updatedImages = [...SHOTS_GALLERY];
    let hasChanges = false;

    // Log e controllo per le 12 foto
    for (let i = 1; i <= 12; i++) {
      const paramKey = `photo${i}`;
      const overrideUrl = params.get(paramKey);
      
      if (overrideUrl) {
        updatedImages[i - 1] = overrideUrl;
        hasChanges = true;
      }
      
      // Log richiesto per identificare le immagini
      console.log(`📸 photo${i}: ${updatedImages[i - 1]}`);
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

      {/* Sezione Profilo Personale */}
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
                  Per me, la fotografia non è solo un lavoro, ma una vera e propria vocazione. Ogni scatto che catturo racconta una storia, trasmette un'emozione e testimonia un momento prezioso nella vita delle persone che fotografo.
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

      {/* Sezione: I Miei Scatti Più Votati */}
      <TopRatedCarousel />

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
