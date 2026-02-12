
import React from 'react';

const Payment: React.FC = () => {
  const SUMUP_LINK = "https://pay.sumup.com/b2c/XS2N1R43GQ";

  return (
    <div className="mt-16 bg-black text-white p-10 md:p-16 rounded-[50px] text-center relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <h2 className="text-3xl md:text-4xl font-serif mb-4 italic">Concludi l'ordine</h2>
      <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
        Dopo aver caricato le foto, procedi al pagamento sicuro per avviare la stampa professionale in studio.
      </p>
      <button 
        onClick={() => window.open(SUMUP_LINK, '_blank')}
        className="px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl inline-flex items-center gap-3"
      >
        <span>Paga ora con SumUp</span>
        <i className="fas fa-external-link-alt text-[10px]"></i>
      </button>
    </div>
  );
};

export default Payment;
