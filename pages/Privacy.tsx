import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="py-24 px-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif mb-12 text-black border-b border-gray-100 pb-6">PRIVACY POLICY</h1>
        <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-bold">Ultimo aggiornamento: 13 Febbraio 2026</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p className="font-medium text-black">Il presente sito web è di proprietà di Carmine Felice Napolitano.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Dati raccolti</h2>
            <p>Il sito può raccogliere i seguenti dati:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nome e cognome</li>
              <li>Indirizzo email</li>
              <li>Numero di telefono</li>
              <li>Eventuali messaggi inviati tramite modulo di contatto o WhatsApp</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Finalità del trattamento</h2>
            <p>I dati vengono raccolti esclusivamente per:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Rispondere alle richieste di informazioni</li>
              <li>Gestire preventivi e servizi fotografici</li>
              <li>Comunicazioni relative ai servizi offerti</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Base giuridica</h2>
            <p>Il trattamento si basa sul consenso dell’utente e sull’esecuzione di misure precontrattuali.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Conservazione dei dati</h2>
            <p>I dati vengono conservati per il tempo strettamente necessario a soddisfare le finalità indicate.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Condivisione dei dati</h2>
            <p>I dati non vengono venduti a terzi. Possono essere trattati da fornitori tecnici per hosting e funzionamento del sito.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Diritti dell’utente</h2>
            <p>L’utente può richiedere accesso, modifica o cancellazione dei propri dati scrivendo all’email di contatto del titolare.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;