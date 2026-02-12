
import React, { useState } from 'react';
import { LOGO_URL, WHATSAPP_LINK, INSTAGRAM_URL, STUDIO_ADDRESS, STUDIO_PHONE } from '../constants';
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
      {/* Navigation */}
      <nav className="sticky top-0 z-[9999] bg-white border-b border-gray-100 px-4 md:px-6 py-4 shadow-sm w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div 
            className="cursor-pointer flex items-center shrink-0"
            onClick={() => handleNav('home')}
          >
            <img 
              src={LOGO_URL} 
              alt="Carmine Felice Napolitano Fotografo – Logo" 
              className="h-10 md:h-14 w-auto object-contain" 
            />
          </div>

          {/* Desktop Menu - Grandi come richiesto (text-[13px] + spacing) */}
          <div className="hidden lg:flex items-center space-x-10 text-[13px] font-bold uppercase tracking-[0.2em]">
            <button onClick={() => handleNav('home')} className="hover:text-gray-400 transition-colors">Home</button>
            <button onClick={() => handleNav('portfolio')} className="hover:text-gray-400 transition-colors">Portfolio</button>
            <button onClick={() => handleNav('dashboard')} className="hover:text-gray-400 transition-colors">Carica Foto</button>
            <button onClick={() => handleNav('packages')} className="hover:text-gray-400 transition-colors">Pacchetti</button>
            <button onClick={() => handleNav('contact')} className="hover:text-gray-400 transition-colors">Contatti</button>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <button 
                onClick={() => handleNav(user.role === 'admin' ? 'admin' : 'dashboard')}
                className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase"
              >
                {user.role === 'admin' ? 'ADMIN' : 'ACCOUNT'}
              </button>
            ) : (
              <button 
                onClick={() => handleNav('login')}
                className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase"
              >
                LOGIN
              </button>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-black rounded-lg"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-white`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white z-[10000] flex flex-col items-center justify-center space-y-8 p-10">
            <button onClick={() => handleNav('home')} className="text-xl font-bold uppercase tracking-widest">Home</button>
            <button onClick={() => handleNav('portfolio')} className="text-xl font-bold uppercase tracking-widest">Portfolio</button>
            <button onClick={() => handleNav('dashboard')} className="text-xl font-bold uppercase tracking-widest">Carica Foto</button>
            <button onClick={() => handleNav('packages')} className="text-xl font-bold uppercase tracking-widest">Pacchetti</button>
            <button onClick={() => handleNav('contact')} className="text-xl font-bold uppercase tracking-widest">Contatti</button>
            <button onClick={() => setIsMobileMenuOpen(false)} className="mt-10 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <img src={LOGO_URL} className="h-10 brightness-0 invert mx-auto md:mx-0 mb-6" alt="Logo" />
            <p className="text-gray-500 text-xs italic">{STUDIO_ADDRESS}</p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-gray-400">Social</h4>
            <div className="flex justify-center md:justify-start space-x-6">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><i className="fab fa-instagram text-xl"></i></a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-green-500"><i className="fab fa-whatsapp text-xl"></i></a>
            </div>
          </div>
          <div>
             <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-gray-400">Supporto</h4>
             <p className="text-xs text-gray-400">{STUDIO_PHONE}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
