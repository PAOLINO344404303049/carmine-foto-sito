
import * as React from 'react';
import { type FC } from 'react';
import { WHATSAPP_LINK, HERO_BG_URL, SERVICE_IMG_PRINT, SERVICE_IMG_100, SERVICE_IMG_CONSULT, INSTAGRAM_URL, LOGO_URL } from '../constants';

interface HomeProps {
  navigate: (page: string) => void;
}

const Home: FC<HomeProps> = ({ navigate }) => {
  return (
    <div className="bg-white">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={HERO_BG_URL} 
            alt="Macchina Fotografica Sony - Sfondo Hero" 
            className="w-full h-full object-cover brightness-[0.35] scale-105"
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-5xl flex flex-col items-center">
          <div className="animate-fade-in transition-transform hover:scale-105 duration-700">
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Logo" 
              className="h-24 md:h-60 w-auto mb-8 brightness-0 invert object-contain"
            />
          </div>
          <p className="text-sm md:text-lg text-white mb-12 font-bold max-w-xl mx-auto leading-relaxed tracking-wide animate-fade-in-up">
            Carica le tue foto, scegli il pacchetto e ritira le stampe in studio. <br className="hidden md:block" /> La qualità professionale a portata di click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={() => navigate('dashboard')}
              className="w-full sm:w-auto px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all shadow-2xl uppercase tracking-widest text-[10px]"
            >
              Carica le tue foto
            </button>
            <button 
              onClick={() => navigate('packages')}
              className="w-full sm:w-auto px-12 py-5 border-2 border-white/40 text-white font-bold rounded-full hover:bg-white hover:text-black transition-all uppercase tracking-widest text-[10px]"
            >
              Vedi Pacchetti
            </button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-black italic">I Nostri Servizi</h2>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group cursor-pointer" onClick={() => navigate('dashboard')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl">
                <img src={SERVICE_IMG_PRINT} alt="Stampa Foto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 italic">Servizio Stampa Foto</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 italic">Stampe di alta qualità su carta lucida professionale. Colori vibranti e neri profondi per i tuoi ricordi.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 group-hover:pr-4 transition-all italic">Scegli Formato →</span>
            </div>
            <div className="group cursor-pointer" onClick={() => navigate('packages')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl">
                <img src={SERVICE_IMG_100} alt="Pacchetto 100 Foto" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 italic">Pacchetto 100 Foto</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 italic">La nostra offerta più popolare. 100 stampe professionali ad un prezzo imbattibile per i tuoi eventi.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 group-hover:pr-4 transition-all italic">Vedi Offerta →</span>
            </div>
            <div className="group cursor-pointer" onClick={() => navigate('contact')}>
              <div className="relative overflow-hidden rounded-[40px] aspect-[4/5] mb-6 shadow-xl">
                <img src={SERVICE_IMG_CONSULT} alt="Consulenza" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 italic">Consulenza Personalizzata</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 italic">Hai bisogno di un servizio fotografico o di stampe speciali? Prenota una consulenza in studio.</p>
              <span className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 group-hover:pr-4 transition-all italic">Contattaci →</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto bg-black p-16 md:p-24 rounded-[60px] shadow-2xl relative overflow-hidden">
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
