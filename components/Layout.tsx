
import * as React from 'react';
import { useState, useEffect, type FC, type ReactNode } from 'react';
import { APP_NAME, STUDIO_ADDRESS, STUDIO_PHONE, INSTAGRAM_URL, LOGO_URL, WHATSAPP_LINK } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
  navigate: (page: string) => void;
}

const Layout: FC<LayoutProps> = ({ children, user, onLogout, navigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gestione scroll body per menu mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNav = (page: string) => {
    navigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-zinc-950 transition-colors">
      {/* NAVBAR FISSA */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950 lg:bg-white/90 lg:dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 lg:border-gray-200/60 lg:dark:border-zinc-800/60 px-4 md:px-8 py-2.5 shadow-md transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-12 md:h-14">
          <div 
            className="cursor-pointer flex items-center group shrink-0"
            onClick={() => handleNav('home')}
          >
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Fotografo – Logo" 
              className="h-10 md:h-14 w-auto object-contain brightness-0 invert lg:brightness-100 lg:invert-0 lg:dark:brightness-0 lg:dark:invert transition-all duration-300" 
            />
          </div>

          <div className="hidden lg:flex items-center space-x-10 text-[13px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            <button onClick={() => handleNav('home')} className="hover:text-black dark:hover:text-white transition-colors">Home</button>
            <button onClick={() => handleNav('portfolio')} className="hover:text-black dark:hover:text-white transition-colors">Portfolio</button>
            <button onClick={() => handleNav('packages')} className="hover:text-black dark:hover:text-white transition-colors">Pacchetti</button>
            <button onClick={() => handleNav('contact')} className="hover:text-black dark:hover:text-white transition-colors">Contatti</button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              {user ? (
                <button 
                  onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'dashboard')}
                  className="bg-black dark:bg-white dark:text-black text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                >
                  {user.role === 'admin' ? 'AREA ADMIN' : 'I MIEI ORDINI'}
                </button>
              ) : (
                <button 
                  onClick={() => handleNav('login')}
                  className="bg-black dark:bg-white dark:text-black text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                >
                  ACCESSO
                </button>
              )}
            </div>

            {/* BOTTONE HAMBURGER MOBILE */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 active:scale-95 rounded-xl border border-zinc-700/80 shadow-sm outline-none transition-all"
              aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
            >
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-5 bg-white transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-5 bg-white transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY FULLSCREEN SEPARATO (100% OPACO, NESSUNA TRASPARENZA) */}
      <div 
        className={`lg:hidden fixed inset-0 z-[99999] bg-zinc-950 transition-all duration-300 flex flex-col ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        style={{ height: '100dvh', width: '100vw' }}
      >
        {/* Header superiore dentro il menu mobile per allineamento perfetto */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <div 
            className="cursor-pointer flex items-center"
            onClick={() => handleNav('home')}
          >
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Logo" 
              className="h-10 w-auto object-contain brightness-0 invert" 
            />
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-11 h-11 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 active:scale-95 rounded-xl border border-zinc-700 text-white outline-none transition-all"
            aria-label="Chiudi menu"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo scrollabile del menu mobile con sfondo nero solido */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-between space-y-6 bg-zinc-950">
          <div className="flex flex-col space-y-3 text-left">
            <button 
              onClick={() => handleNav('home')} 
              className="w-full px-5 py-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl text-xl font-serif italic text-white flex justify-between items-center active:scale-[0.99] transition-all shadow-sm"
            >
              <span className="tracking-wide">Home</span>
              <span className="text-zinc-400 font-sans text-lg font-light">→</span>
            </button>
            <button 
              onClick={() => handleNav('portfolio')} 
              className="w-full px-5 py-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl text-xl font-serif italic text-white flex justify-between items-center active:scale-[0.99] transition-all shadow-sm"
            >
              <span className="tracking-wide">Portfolio</span>
              <span className="text-zinc-400 font-sans text-lg font-light">→</span>
            </button>
            <button 
              onClick={() => handleNav('packages')} 
              className="w-full px-5 py-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl text-xl font-serif italic text-white flex justify-between items-center active:scale-[0.99] transition-all shadow-sm"
            >
              <span className="tracking-wide">Pacchetti</span>
              <span className="text-zinc-400 font-sans text-lg font-light">→</span>
            </button>
            <button 
              onClick={() => handleNav('contact')} 
              className="w-full px-5 py-4 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 rounded-2xl text-xl font-serif italic text-white flex justify-between items-center active:scale-[0.99] transition-all shadow-sm"
            >
              <span className="tracking-wide">Contatti</span>
              <span className="text-zinc-400 font-sans text-lg font-light">→</span>
            </button>
            
            {user && (
              <button 
                onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'dashboard')} 
                className="w-full px-5 py-4 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 rounded-2xl text-xl font-serif italic text-amber-200 flex justify-between items-center active:scale-[0.99] transition-all shadow-sm"
              >
                <span>{user.role === 'admin' ? 'Pannello Admin' : 'I Miei Ordini'}</span>
                <span className="text-amber-400 text-xs font-sans font-bold uppercase tracking-wider bg-amber-400/20 px-2.5 py-1 rounded-full">Attivo</span>
              </button>
            )}
          </div>

          <div className="space-y-5 pt-4 border-t border-zinc-800/80 bg-zinc-950">
            {user ? (
              <button 
                onClick={onLogout} 
                className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all"
              >
                Esci dall'Account
              </button>
            ) : (
              <button 
                onClick={() => handleNav('login')} 
                className="w-full py-4 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg active:scale-98 transition-all font-sans"
              >
                Accedi / Registrati
              </button>
            )}

            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-400 px-2 pt-1">
              <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <span className="text-zinc-600">•</span>
              <button onClick={() => handleNav('cookie')} className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
            
            <div className="flex justify-center space-x-8 text-zinc-400 pt-1 pb-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-2" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-2" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow pt-[64px] lg:pt-0 bg-white dark:bg-zinc-950 transition-colors">
        {children}
      </main>

      <footer className="bg-black dark:bg-zinc-950 text-white pt-24 pb-12 px-6 border-t dark:border-zinc-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="md:col-span-1">
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Fotografo – Logo" 
              className="h-16 w-auto brightness-0 invert mx-auto md:mx-0 mb-8 object-contain" 
            />
            <p className="text-gray-500 text-xs italic leading-relaxed">Studio Fotografico Carmine Felice Napolitano</p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-8 text-gray-500">Legal</h3>
            <div className="flex flex-col space-y-4 text-[10px] uppercase tracking-widest text-gray-400">
              <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button>
              <button onClick={() => handleNav('cookie')} className="hover:text-white transition-colors text-left">Cookie Policy</button>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-8 text-gray-500">Contatti</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">{STUDIO_ADDRESS}<br/>{STUDIO_PHONE}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
