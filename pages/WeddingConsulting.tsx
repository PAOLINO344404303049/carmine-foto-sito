import * as React from 'react';
import { type FC, useState } from 'react';
import { STUDIO_ADDRESS, STUDIO_PHONE, STUDIO_EMAIL, INSTAGRAM_URL, WHATSAPP_LINK } from '../constants';

const WeddingConsulting: FC = () => {
  const [formData, setFormData] = useState({
    names: '',
    email: '',
    phone: '',
    date: '',
    location: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.names || !formData.email || !formData.message) {
      setError('Compila i campi obbligatori (Nomi, Email, Messaggio).');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Errore dal server');
      }

      setIsSuccess(true);
      setFormData({ names: '', email: '', phone: '', date: '', location: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError('Si è verificato un errore durante l\'invio. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-24 px-6 bg-white dark:bg-zinc-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-4">Consulenza Wedding</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-8 dark:text-white">Raccontaci il tuo sogno.</h1>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Ogni matrimonio è unico, proprio come voi. Scrivici o fissa un appuntamento in studio per progettare insieme il reportage perfetto per il vostro grande giorno.
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
                <h4 className="font-bold text-lg mb-1 dark:text-white">Fissa un appuntamento in Studio</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{STUDIO_ADDRESS}</p>
              </div>
            </div>
            
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-6 p-6 border border-gray-50 dark:border-zinc-800 rounded-3xl hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group">
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">Scrivici su WhatsApp</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{STUDIO_PHONE} (Risposta rapida)</p>
              </div>
            </a>

            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-6 p-6 border border-gray-50 dark:border-zinc-800 rounded-3xl hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors group">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">Instagram</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">@carmine_photograpy</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-900 p-10 md:p-16 rounded-[60px] shadow-sm border border-gray-100 dark:border-zinc-800">
          <h3 className="text-2xl font-serif mb-8 dark:text-white italic">Richiedi un Preventivo</h3>
          
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-2xl border border-green-200">
              Richiesta inviata con successo! Ti risponderemo al più presto.
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Nome degli sposi*</label>
                <input type="text" name="names" value={formData.names} onChange={handleChange} required className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="Mario e Giulia" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Email*</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="mario@mail.it" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Numero di telefono</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="+39 333 1234567" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Data del Matrimonio (se stabilita)</label>
                <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="Es: 15 Giugno 2026" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Luogo del Matrimonio</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="Città, Chiesa o Location" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Raccontaci il tuo evento*</label>
              <textarea rows={4} name="message" value={formData.message} onChange={handleChange} required className="w-full px-6 py-4 bg-white dark:bg-zinc-800 dark:text-white border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white shadow-sm transition-all" placeholder="Ciao Carmine, ci sposeremo a Napoli e vorremmo maggiori informazioni sui tuoi servizi fotografici..."></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 shadow-2xl transition-all uppercase tracking-widest text-xs disabled:opacity-50">
              {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeddingConsulting;
