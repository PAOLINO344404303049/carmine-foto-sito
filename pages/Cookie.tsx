import React from 'react';

const Cookie: React.FC = () => {
  return (
    <div className="py-24 px-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif mb-12 text-black border-b border-gray-100 pb-6">COOKIE POLICY</h1>
        <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-bold">Ultimo aggiornamento: 13 Febbraio 2026</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <p className="font-medium text-black italic">Questo sito utilizza cookie tecnici necessari al corretto funzionamento della piattaforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Cosa sono i cookie</h2>
            <p>I cookie sono piccoli file di testo salvati sul dispositivo dell’utente.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Tipologie di cookie utilizzate</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cookie tecnici:</strong> necessari al funzionamento del sito.</li>
              <li><strong>Eventuali cookie analitici:</strong> anonimizzati per migliorare l’esperienza utente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-black mb-4 italic">Gestione dei cookie</h2>
            <p>L’utente può disabilitare i cookie tramite le impostazioni del proprio browser.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookie;