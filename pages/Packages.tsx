
import * as React from 'react';
import { type FC } from 'react';
import { PRINT_PACKAGES } from '../constants';
import { User } from '../types';

interface PackagesProps {
  navigate: (page: string) => void;
  user: User | null;
}

const Packages: FC<PackagesProps> = ({ navigate, user }) => {
  return (
    <div className="py-24 px-4 md:px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4">La Nostra Migliore Offerta</span>
          <h1 className="text-3xl md:text-5xl font-serif mb-6">Pacchetti Stampa Foto</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base px-4">
            Qualità professionale garantita. Carica i tuoi scatti e ritira le stampe 10x15 su carta lucida premium.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {PRINT_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                className="group border border-gray-100 p-8 md:p-12 rounded-[40px] hover:border-black transition-all hover:shadow-2xl flex flex-col items-center text-center bg-gray-50"
              >
                <div className="bg-black text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-6">Più Scelto</div>
                <h3 className="text-2xl md:text-3xl font-serif mb-2">{pkg.name}</h3>
                <div className="my-6">
                  <span className="text-5xl md:text-6xl font-bold">€{pkg.price}</span>
                </div>
                <div className="space-y-4 mb-10 w-full">
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">{pkg.description}</p>
                  <div className="flex items-center justify-center space-x-3 text-xs md:text-sm font-bold text-black uppercase tracking-widest pt-4 border-t border-gray-100">
                    <i className="fas fa-check-circle text-black"></i>
                    <span>{pkg.count} Stampe 10x15</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                    <i className="fas fa-check-circle text-black"></i>
                    <span>Carta Lucida Premium</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                    <i className="fas fa-check-circle text-black"></i>
                    <span>Ritiro in Studio</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(user ? 'dashboard' : 'login')}
                  className="w-full py-5 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors uppercase tracking-[0.2em] text-[10px] shadow-xl"
                >
                  Carica Foto Ora
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-8 md:p-12 bg-black text-white rounded-[40px] md:rounded-[60px] grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
                <i className="fas fa-award text-3xl mb-6 text-gray-500"></i>
                <h4 className="font-bold text-base mb-2 uppercase tracking-widest">Carta Lucida Premium</h4>
                <p className="text-gray-500 text-[10px] italic leading-relaxed uppercase tracking-widest">Effetto professionale al tatto e alla vista.</p>
            </div>
            <div className="text-center">
                <i className="fas fa-map-marked-alt text-3xl mb-6 text-gray-500"></i>
                <h4 className="font-bold text-base mb-2 uppercase tracking-widest">Punto Ritiro</h4>
                <p className="text-gray-500 text-[10px] italic leading-relaxed uppercase tracking-widest">Vieni a trovarci in Via Roma 70.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;
