import React, { useState } from 'react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Macchina Fotografica */}
        <a 
          href="/" 
          className="flex items-center shrink-0 transition-transform hover:scale-105 active:scale-95"
          aria-label="Torna alla Home"
        >
          <svg 
            className="h-[44px] md:h-[56px] w-auto text-black" 
            viewBox="0 0 512 512" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M416 128H352L320 64H192L160 128H96C60.65 128 32 156.65 32 192V416C32 451.35 60.65 480 96 480H416C451.35 480 480 451.35 480 416V192C480 156.65 451.35 128 416 128ZM256 400C202.98 400 160 357.02 160 304C160 250.98 202.98 208 256 208C309.02 208 352 250.98 352 304C352 357.02 309.02 400 256 400ZM368 192C359.16 192 352 184.84 352 176C352 167.16 359.16 160 368 160C376.84 160 384 167.16 384 176C384 184.84 376.84 192 368 192Z"/>
            <circle cx="256" cy="304" r="64"/>
          </svg>
        </a>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-10 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <a href="#" className="text-black hover:text-gray-600 transition-colors">Servizio Stampa</a>
          <a href="#" className="hover:text-black transition-colors">Portfolio</a>
          <a href="#" className="hover:text-black transition-colors">Contatti</a>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center bg-black rounded-xl text-white shadow-lg"
          aria-label="Apri menu"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl p-8 flex flex-col space-y-6 items-center text-center">
          <a href="#" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest">Servizio Stampa</a>
          <a href="#" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest">Portfolio</a>
          <a href="#" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest">Contatti</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;