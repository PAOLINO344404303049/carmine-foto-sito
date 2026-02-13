import React from 'react';

const Payment: React.FC = () => {
  const SUMUP_LINK = "https://pay.sumup.com/b2c/XS2N1R43GQ";

  return (
    <div className="mt-20 bg-black text-white p-12 md:p-20 rounded-[60px] text-center relative overflow-hidden shadow-2xl animate-fade-in-up">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <h2 className="text-3xl md:text-5xl font-serif mb-6 italic">Concludi il tuo ordine</h2>
      <p className="text-gray-400 text-sm md:text-base mb-12 max-w-2xl mx-auto leading-relaxed">
        Dopo aver verificato le tue foto nel rullino cloud, procedi al pagamento sicuro tramite SumUp. 
        Riceverai una conferma e il tuo pacchetto entrerà in produzione.
      </p>
      <button 
        onClick={() => window.open(SUMUP_LINK, '_blank')}
        className="px-16 py-6 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all uppercase tracking-[0.3em] text-[10px] shadow-2xl inline-flex items-center gap-4 group"
      >
        <span>Vai al pagamento SumUp</span>
        <i className="fas fa-external-link-alt group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
      </button>
    </div>
  );
};

export default Payment;