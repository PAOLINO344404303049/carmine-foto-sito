
import * as React from 'react';
import { type FC } from 'react';

const Cookie: FC = () => {
  return (
    <div className="py-24 px-6 bg-white dark:bg-zinc-950 transition-colors min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif mb-12 text-black dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-6">COOKIE POLICY</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-widest font-bold">Ultimo aggiornamento: 13 Febbraio 2026</p>
        
        <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <p className="font-medium text-black dark:text-white italic">Questo sito utilizza cookie tecnici necessari al corretto funzionamento della piattaforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black dark:text-white mb-4 italic">Cosa sono i cookie</h2>
            <p>I cookie sono piccoli file di testo salvati sul dispositivo dell’utente.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black dark:text-white mb-4 italic">Gestione dei cookie</h2>
            <p>L’utente può disabilitare i cookie tramite le impostazioni del proprio browser.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookie;