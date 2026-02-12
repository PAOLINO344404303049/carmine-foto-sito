
import React from 'react';
import { LOGO_URL } from '../constants';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <img src={LOGO_URL} alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
          <div className="hidden md:flex space-x-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span className="text-black">Servizio Stampa</span>
            <span>Portfolio</span>
            <span>Contatti</span>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
          {children}
        </div>
      </main>
      <footer className="bg-black text-white py-12 px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold">© 2024 Carmine Felice Napolitano Fotografo</p>
      </footer>
    </div>
  );
};

export default Layout;
