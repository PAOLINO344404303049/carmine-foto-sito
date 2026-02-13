import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-100 py-16 px-6 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Carmine Felice Napolitano Fotografo</p>
          <div className="w-12 h-px bg-gray-200 mx-auto"></div>
          <p className="text-[9px] text-gray-300 uppercase tracking-widest">Mugnano del Cardinale (AV) • Studio Professionale</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;