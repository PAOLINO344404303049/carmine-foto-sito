
import * as React from 'react';
import { type FC } from 'react';

const Privacy: FC = () => {
  return (
    <div className="py-24 px-6 bg-white dark:bg-zinc-950 transition-colors min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif mb-12 text-black dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-6">PRIVACY POLICY</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-widest font-bold">Ultimo aggiornamento: 13 Febbraio 2026</p>
        
        <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <p className="font-medium text-black dark:text-white">Il presente sito web è di proprietà di Carmine Felice Napolitano.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black dark:text-white mb-4 italic">Dati raccolti</h2>
            <p>Il sito può raccogliere i seguenti dati:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nome e cognome</li>
              <li>Indirizzo email</li>
              <li>Numero di telefono</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black dark:text-white mb-4 italic">Diritti dell’utente</h2>
            <p>L’utente può richiedere accesso, modifica o cancellazione dei propri dati scrivendo all’email di contatto del titolare.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;