
import * as React from 'react';
import { type FC } from 'react';
import { STUDIO_ADDRESS, STUDIO_PHONE, STUDIO_EMAIL, INSTAGRAM_URL, WHATSAPP_LINK } from '../constants';

const Contact: FC = () => {
  return (
    <div className="py-24 px-6 bg-white dark:bg-zinc-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-4">Contatti</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-8 dark:text-white">Passa a trovarci in studio.</h1>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Il nostro studio è aperto dal Lunedì al Sabato. Ti aspettiamo per il ritiro dei tuoi ricordi o per pianificare il tuo prossimo servizio fotografico.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-6 p-6 border border-gray-50 dark:border-zinc-800 rounded-3xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">Indirizzo</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{STUDIO_ADDRESS}</p>
              </div>
            </div>
            
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-6 p-6 border border-gray-50 dark:border-zinc-800 rounded-3xl hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group">
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <i className="fab fa-whatsapp text-2xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">WhatsApp Diretto</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{STUDIO_PHONE} (Click per chattare)</p>
              </div>
            </a>

            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-6 p-6 border border-gray-50 dark:border-zinc-800 rounded-3xl hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <i className="fab fa-instagram text-2xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">Instagram</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">@carmine_photograpy</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-900 p-10 md:p-16 rounded-[60px] shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-2xl font-serif mb-8 dark:text-white italic">Inviaci un messaggio rapido</h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Nome</label>
                <input type="text" className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="Mario" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Email</label>
                <input type="email" className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="mario@mail.it" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Messaggio</label>
              <textarea rows={4} className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="Ciao Carmine, vorrei info su..."></textarea>
            </div>
            <button type="button" onClick={() => alert('Messaggio inviato!')} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 shadow-2xl transition-all uppercase tracking-widest text-xs">
              Invia Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;