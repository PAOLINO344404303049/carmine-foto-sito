
import React from 'react';

const Payment: React.FC = () => {
  const SUMUP_LINK = "https://pay.sumup.com/b2c/XS2N1R43GQ";

  return (
    <div className="bg-black text-white p-8 md:p-12 rounded-[40px] text-center shadow-2xl mt-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <h2 className="text-2xl md:text-3xl font-serif mb-4 italic">Pronto per la stampa?</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">Completa il pagamento sicuro tramite il circuito SumUp per avviare la lavorazione delle tue foto.</p>
      <button 
        onClick={() => window.open(SUMUP_LINK, '_blank')}
        className="px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px] shadow-xl inline-flex items-center gap-3"
      >
        <span>Paga ora con SumUp</span>
        <i className="fas fa-external-link-alt"></i>
      </button>
    </div>
  );
};

export default Payment;
