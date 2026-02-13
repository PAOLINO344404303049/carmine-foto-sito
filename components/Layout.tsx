
import React, { useState } from 'react';
import { APP_NAME, APP_SUBTITLE, STUDIO_ADDRESS, STUDIO_PHONE, STUDIO_EMAIL, INSTAGRAM_URL, LOGO_URL, WHATSAPP_LINK } from '../constants';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  navigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, navigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (page: string) => {
    navigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Navigation - Forced Opacity and Max Z-Index */}
      <nav className="sticky top-0 z-[9999] bg-white border-b border-gray-100 px-4 md:px-6 py-2 md:py-4 shadow-lg w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo - Slightly larger as requested */}
          <div 
            className="cursor-pointer flex items-center group shrink-0"
            onClick={() => handleNav('home')}
          >
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Fotografo – Logo" 
              className="h-12 md:h-16 w-auto object-contain transition-all duration-300" 
            />
          </div>

          {/* Desktop Menu - Increased font size from [10px] to [13px] */}
          <div className="hidden lg:flex items-center space-x-10 text-[13px] font-bold uppercase tracking-[0.2em]">
            <button onClick={() => handleNav('home')} className="hover:text-gray-400 transition-colors">Home</button>
            <button onClick={() => handleNav('portfolio')} className="hover:text-gray-400 transition-colors">Portfolio</button>
            <button onClick={() => handleNav('dashboard')} className="hover:text-gray-400 transition-colors">Carica Foto</button>
            <button onClick={() => handleNav('packages')} className="hover:text-gray-400 transition-colors">Pacchetti</button>
            <button onClick={() => handleNav('contact')} className="hover:text-gray-400 transition-colors">Contatti</button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button 
                onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'dashboard')}
                className="bg-black text-white px-4 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-md"
              >
                {user.role === 'admin' ? 'ADMIN' : 'ACCOUNT'}
              </button>
            ) : (
              <button 
                onClick={() => handleNav('login')}
                className="bg-black text-white px-4 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-md"
              >
                LOGIN
              </button>
            )}

            {/* Hamburger Toggle - ULTRA HIGH VISIBILITY FIX WITH WHITE STROKE */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-12 h-12 flex items-center justify-center bg-black rounded-xl shadow-2xl z-[10001] transition-transform active:scale-90 overflow-hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                // Close Icon (X) - Forced White
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger Icon (3 lines) - Forced White and thicker
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`lg:hidden fixed inset-0 bg-white z-[10000] transition-all duration-500 ease-in-out transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
        >
          <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8 text-center">
            <div className="mb-4">
               <img 
                src={LOGO_URL} 
                alt="Carmine Felice Napolitano Fotografo – Logo" 
                className="h-16 w-auto mx-auto mb-2 object-contain" 
               />
               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu Navigazione</p>
            </div>
            
            <button onClick={() => handleNav('home')} className="text-2xl font-bold uppercase tracking-[0.3em] text-black w-full py-4 active:bg-gray-50 rounded-2xl">Home</button>
            <button onClick={() => handleNav('portfolio')} className="text-2xl font-bold uppercase tracking-[0.3em] text-black w-full py-4 active:bg-gray-50 rounded-2xl">Portfolio</button>
            <button onClick={() => handleNav('dashboard')} className="text-2xl font-bold uppercase tracking-[0.3em] text-black w-full py-4 active:bg-gray-50 rounded-2xl">Carica Foto</button>
            <button onClick={() => handleNav('packages')} className="text-2xl font-bold uppercase tracking-[0.3em] text-black w-full py-4 active:bg-gray-50 rounded-2xl">Pacchetti</button>
            <button onClick={() => handleNav('contact')} className="text-2xl font-bold uppercase tracking-[0.3em] text-black w-full py-4 active:bg-gray-50 rounded-2xl">Contatti</button>
            
            {user && (
              <button onClick={onLogout} className="text-xl font-bold uppercase tracking-[0.2em] text-red-600 w-full pt-8 border-t border-gray-100">Esci Account</button>
            )}

            <div className="pt-8 flex justify-center space-x-12">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-4xl text-black"><i className="fab fa-instagram"></i></a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-4xl text-[#25D366]"><i className="fab fa-whatsapp"></i></a>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-12 px-14 py-5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl"
            >
              Indietro
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
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
            <p className="text-gray-500 text-xs italic leading-relaxed">Studio Professionale Carmine Felice Napolitano</p>
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
