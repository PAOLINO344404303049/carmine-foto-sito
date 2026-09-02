import * as React from 'react';
import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: number;
  status?: 'accepted' | 'rejected' | 'custom';
}

const STORAGE_KEY = 'cookie-consent';

interface CookieConsentProps {
  onNavigate?: (page: string) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Preferenze modificabili nella modale
  const [preferences, setPreferences] = useState<{
    preferences: boolean;
    analytics: boolean;
    marketing: boolean;
  }>({
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Nessun consenso salvato: mostra il banner
        setIsVisible(true);
      }
    } catch (e) {
      // In caso di sessionStorage/localStorage disabilitato nel browser
      console.warn('[CookieConsent] Impossibile accedere a localStorage:', e);
    }
  }, []);

  const saveConsent = (status: 'accepted' | 'rejected' | 'custom', customPrefs?: typeof preferences) => {
    const consentData: CookiePreferences = {
      necessary: true,
      preferences: status === 'accepted' ? true : status === 'rejected' ? false : (customPrefs?.preferences ?? false),
      analytics: status === 'accepted' ? true : status === 'rejected' ? false : (customPrefs?.analytics ?? false),
      marketing: status === 'accepted' ? true : status === 'rejected' ? false : (customPrefs?.marketing ?? false),
      timestamp: Date.now(),
      status,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.warn('[CookieConsent] Errore durante il salvataggio in localStorage:', e);
    }

    setIsVisible(false);
    setIsModalOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent('accepted');
  };

  const handleRejectAll = () => {
    saveConsent('rejected');
  };

  const handleSaveCustom = () => {
    saveConsent('custom', preferences);
  };

  const handleOpenPreferences = () => {
    setIsModalOpen(true);
  };

  if (!isVisible && !isModalOpen) {
    return null;
  }

  return (
    <>
      {/* BANNER PRINCIPALE IN BASSO */}
      {isVisible && !isModalOpen && (
        <aside
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-5 md:left-6 md:right-auto md:max-w-2xl z-[10500] bg-zinc-950 text-white border border-zinc-800/90 rounded-2xl shadow-2xl p-5 md:p-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all"
        >
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <h3 id="cookie-consent-title" className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>🍪</span>
                <span>La tua privacy è importante</span>
              </h3>
              <p id="cookie-consent-desc" className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                Utilizziamo cookie e tecnologie simili per migliorare la tua esperienza sul sito e, dove previsto, per analizzare il traffico. Puoi scegliere se accettare o gestire le tue preferenze.
              </p>
            </div>

            {/* PULSANTI DI AZIONE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-3 px-4 bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.98] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-center"
                aria-label="Accetta tutti i cookie"
              >
                Accetta tutti
              </button>

              <button
                type="button"
                onClick={handleRejectAll}
                className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 active:scale-[0.98] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all text-center"
                aria-label="Rifiuta i cookie non necessari"
              >
                Rifiuta
              </button>

              <button
                type="button"
                onClick={handleOpenPreferences}
                className="py-3 px-4 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 active:scale-[0.98] font-sans text-xs font-medium uppercase tracking-wider rounded-xl transition-all text-center"
                aria-label="Gestisci preferenze cookie"
              >
                Preferenze
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MODALE GESTIONE PREFERENZE */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl text-white p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            {/* Intestazione modale */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <h2 id="cookie-modal-title" className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <span>🍪</span>
                <span>Centro Preferenze Privacy</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                aria-label="Chiudi finestra preferenze"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              Personalizza le tue scelte relative ai cookie. I cookie necessari sono indispensabili per il funzionamento tecnico del sito e non possono essere disattivati.
            </p>

            {/* Categorie di Cookie */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 text-left divide-y divide-zinc-900">
              {/* 1. Cookie Necessari */}
              <div className="pt-3 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-white">Cookie necessari</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Essenziali per consentire la navigazione del sito, la memorizzazione delle sessioni e la sicurezza. Non possono essere disattivati.
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700">
                    Sempre attivi
                  </span>
                </div>
              </div>

              {/* 2. Cookie di Preferenza */}
              <div className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-white">Cookie di preferenza</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Consentono al sito di ricordare le scelte effettuate dall'utente per offrire funzionalità personalizzate.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Attiva cookie di preferenza"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                  </label>
                </div>
              </div>

              {/* 3. Cookie Analitici */}
              <div className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-white">Cookie analitici</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Aiutano a comprendere come i visitatori interagiscono con il sito per migliorare le prestazioni e l'usabilità complessiva.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Attiva cookie analitici"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                  </label>
                </div>
              </div>

              {/* 4. Cookie di Marketing */}
              <div className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-white">Cookie di marketing</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Utilizzati unicamente se presenti per mostrare annunci o contenuti rilevanti e personalizzati.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Attiva cookie di marketing"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Pulsanti azioni modale */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="py-3 px-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 active:scale-[0.98] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all text-center"
              >
                Salva preferenze
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="py-3 px-5 bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.98] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-center"
              >
                Accetta tutti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
