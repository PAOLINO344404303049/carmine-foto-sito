import React, { useState, useEffect } from 'react';
import { APP_NAME, STUDIO_ADDRESS, STUDIO_PHONE, INSTAGRAM_URL, LOGO_URL, WHATSAPP_LINK } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  navigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, navigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleNav = (page: string) => {
    navigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Navigation - Urgent Visibility Fix */}
      <nav className="fixed top-0 left-0 w-full z-[9999] bg-black/80 lg:bg-white border-b border-white/10 lg:border-gray-100 px-4 md:px-6 py-2 md:py-4 shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div 
            className="cursor-pointer flex items-center group shrink-0"
            onClick={() => handleNav('home')}
          >
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Fotografo – Logo" 
              className="h-10 md:h-16 w-auto object-contain brightness-0 invert lg:brightness-100 lg:invert-0 transition-all duration-300" 
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-10 text-[13px] font-bold uppercase tracking-[0.2em] text-gray-500">
            <button onClick={() => handleNav('home')} className="hover:text-black transition-colors">Home</button>
            <button onClick={() => handleNav('portfolio')} className="hover:text-black transition-colors">Portfolio</button>
            <button onClick={() => handleNav('packages')} className="hover:text-black transition-colors">Pacchetti</button>
            <button onClick={() => handleNav('contact')} className="hover:text-black transition-colors">Contatti</button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              {user ? (
                <button 
                  onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'dashboard')}
                  className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-gray-800 transition-all"
                >
                  {user.role === 'admin' ? 'AREA ADMIN' : 'I MIEI ORDINI'}
                </button>
              ) : (
                <button 
                  onClick={() => handleNav('login')}
                  className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md hover:bg-gray-800 transition-all"
                >
                  ACCESSO
                </button>
              )}
            </div>

            {/* Hamburger Toggle - FIX VISIBILITÀ (URGENTISSIMO) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-12 h-12 flex items-center justify-center bg-black rounded-xl z-[10001] relative border-none outline-none"
              aria-label="Menu"
            >
              <div className="relative w-6 h-5">
                {/* Tre linee bianche, 28px visual equivalent size, high contrast */}
                <span className={`absolute block h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 top-2' : 'top-0'}`}></span>
                <span className={`absolute block h-0.5 w-6 bg-white transform transition duration-300 ease-in-out top-2 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute block h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 top-2' : 'top-4'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay - Full Screen Opaque Black */}
        <div 
          className={`lg:hidden fixed inset-0 bg-black z-[10000] transition-all duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
        >
          <div className="flex flex-col h-full pt-24 pb-12 px-8 overflow-y-auto">
            <div className="flex flex-col space-y-6 text-left">
              <button onClick={() => handleNav('home')} className="text-4xl font-serif font-bold italic text-white flex justify-between items-center group">
                <span>Home</span>
                <i className="fas fa-chevron-right text-xs opacity-20 group-active:translate-x-2 transition-transform"></i>
              </button>
              <button onClick={() => handleNav('portfolio')} className="text-4xl font-serif font-bold italic text-white flex justify-between items-center group">
                <span>Portfolio</span>
                <i className="fas fa-chevron-right text-xs opacity-20 group-active:translate-x-2 transition-transform"></i>
              </button>
              <button onClick={() => handleNav('packages')} className="text-4xl font-serif font-bold italic text-white flex justify-between items-center group">
                <span>Pacchetti</span>
                <i className="fas fa-chevron-right text-xs opacity-20 group-active:translate-x-2 transition-transform"></i>
              </button>
              <button onClick={() => handleNav('contact')} className="text-4xl font-serif font-bold italic text-white flex justify-between items-center group">
                <span>Contatti</span>
                <i className="fas fa-chevron-right text-xs opacity-20 group-active:translate-x-2 transition-transform"></i>
              </button>
              
              {user && (
                <button onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'dashboard')} className="text-4xl font-serif font-bold italic text-white flex justify-between items-center group border-t border-white/10 pt-6">
                  <span>{user.role === 'admin' ? 'Pannello Admin' : 'I Miei Ordini'}</span>
                  <i className="fas fa-user-circle text-sm opacity-20"></i>
                </button>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 gap-4">
              <button onClick={() => handleNav('privacy')} className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 text-left">Privacy Policy</button>
              <button onClick={() => handleNav('cookie')} className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 text-left">Cookie Policy</button>
            </div>
            
            <div className="mt-auto pt-10 space-y-6">
              {user ? (
                <button 
                  onClick={onLogout} 
                  className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-transform"
                >
                  Esci Account
                </button>
              ) : (
                <button 
                  onClick={() => handleNav('login')} 
                  className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-transform"
                >
                  Accedi / Registrati
                </button>
              )}
              
              <div className="flex justify-center space-x-10 text-white/40 pt-4">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-2xl"><i className="fab fa-instagram"></i></a>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-2xl"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-[64px] lg:pt-0">
        {children}
      </main>

      <footer className="bg-black text-white pt-24 pb-12 px-6">
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