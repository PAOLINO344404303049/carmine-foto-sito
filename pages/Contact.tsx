
import React from 'react';
import { STUDIO_ADDRESS, STUDIO_PHONE, STUDIO_EMAIL, INSTAGRAM_URL, WHATSAPP_LINK } from '../constants';

const Contact: React.FC = () => {
  return (
    <div className="py-24 px-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        <div className="space-y-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-4">Contatti</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-8">Passa a trovarci in studio.</h1>
            <p className="text-gray-500 leading-relaxed max-w-md">
              Il nostro studio è aperto dal Lunedì al Sabato. Ti aspettiamo per il ritiro dei tuoi ricordi o per pianificare il tuo prossimo servizio fotografico.
            </p>
          </div>

          <div className="space-y-6">
            {/* Box Indirizzo */}
            <div className="flex items-start space-x-6 p-6 border border-gray-50 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Indirizzo</h4>
                <p className="text-gray-500 text-sm">{STUDIO_ADDRESS}</p>
              </div>
            </div>
            
            {/* Box WhatsApp */}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-6 p-6 border border-gray-50 rounded-3xl hover:bg-green-50 transition-colors group">
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">WhatsApp Diretto</h4>
                <p className="text-gray-500 text-sm">{STUDIO_PHONE} (Click per chattare)</p>
              </div>
            </a>

            {/* Box Instagram */}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-6 p-6 border border-gray-50 rounded-3xl hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Instagram</h4>
                <p className="text-gray-500 text-sm">@carmine_photograpy</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-gray-50 p-10 md:p-16 rounded-[60px] shadow-sm border border-gray-100">
          <h3 className="text-2xl font-serif mb-8">Inviaci un messaggio rapido</h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Nome</label>
                <input type="text" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black shadow-sm" placeholder="Mario" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
                <input type="email" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black shadow-sm" placeholder="mario@mail.it" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Messaggio</label>
              <textarea rows={4} className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black shadow-sm" placeholder="Ciao Carmine, vorrei info su..."></textarea>
            </div>
            <button type="button" onClick={() => alert('Messaggio inviato!')} className="w-full py-5 bg-black text-white rounded-full font-bold hover:bg-gray-800 shadow-2xl transition-all uppercase tracking-widest text-xs">
              Invia Email
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400 italic">
            Oppure clicca il pulsante WhatsApp in basso a destra per una risposta immediata.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
