import customTshirtMockup from './assets/images/custom_tshirt_mockup_1788427612064.jpg';
import customMugProduct from './assets/images/custom_mug_product_1788427628499.jpg';

export { customTshirtMockup, customMugProduct };

/**
 * ==============================================================================
 * 📸 LINK DELLE FOTO DEI PRODOTTI PERSONALIZZATI
 * ==============================================================================
 * Per cambiare le foto dei prodotti, ti basta incollare il link desiderato
 * tra le virgolette qui sotto per ciascun prodotto.
 *
 * TIPI DI LINK SUPPORTATI:
 * - Link diretti immagine (.jpg, .png, .webp, Cloudinary, Imgur, Postimages, ecc.)
 * - Link Google Drive (anche link di condivisione: vengono formattati automaticamente in visualizzazione diretta)
 * - Link Dropbox (anche con ?dl=0: convertiti automaticamente in ?raw=1)
 * - Link Unsplash o qualsiasi URL web
 * ==============================================================================
 */
export const DEFAULT_PRODUCT_IMAGE_LINKS: Record<string, string> = {
  // 1. T-Shirt Personalizzata
  't-shirt-custom': customTshirtMockup,

  // 2. Tazza Personalizzata (Fino a 3 foto)
  'mug-custom': customMugProduct,

  // 3. Portachiavi Personalizzato
  'keychain-custom': 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',

  // 4. Collana Personalizzata
  'necklace-custom': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',

  // 5. Cuscino Personalizzato (30x30 cm)
  'pillow-custom': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',

  // 6. Cover Personalizzata Smartphone
  'phone-case-custom': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',

  // 7. Puzzle Personalizzato
  'puzzle-custom': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
};

/**
 * Nomi leggibili dei prodotti per etichette e pannello di modifica
 */
export const PRODUCT_NAMES: Record<string, string> = {
  't-shirt-custom': 'T-Shirt Personalizzata',
  'mug-custom': 'Tazza Personalizzata',
  'keychain-custom': 'Portachiavi Personalizzato',
  'necklace-custom': 'Collana Personalizzata',
  'pillow-custom': 'Cuscino Personalizzato (30x30 cm)',
  'phone-case-custom': 'Cover Personalizzata Smartphone',
  'puzzle-custom': 'Puzzle Personalizzato',
};

/**
 * Normalizza e formatta automaticamente i link delle immagini.
 * Ad es. trasforma i link di condivisione di Google Drive o Dropbox in link diretti per i tag <img>.
 */
export function formatImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // Gestione link Google Drive: https://drive.google.com/file/d/FILE_ID/view o open?id=FILE_ID
  const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch[1]}`;
  }

  // Gestione link Dropbox: trasforma dl=0 in raw=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  // Gestione link pagina Imgur senza estensione
  if (trimmed.includes('imgur.com/') && !trimmed.match(/\.(jpg|jpeg|png|webp|gif)$/i) && !trimmed.includes('/a/')) {
    const id = trimmed.split('imgur.com/').pop()?.split(/[?#]/)[0];
    if (id) {
      return `https://i.imgur.com/${id}.jpg`;
    }
  }

  return trimmed;
}

const STORAGE_KEY = 'custom_product_images_links_v1';
const DIRECT_SUPABASE_STORAGE_URL = 'https://thiyeerwwhwarekudhyg.supabase.co/storage/v1/object/public/app_config/product-images.json';

// Cache in-memory per accesso sincrono immediato nei componenti React
let inMemoryLinks: Record<string, string> | null = null;
let isFetchingPromise: Promise<Record<string, string>> | null = null;

// Inizializza la cache locale al caricamento
function initLocalCache(): Record<string, string> {
  if (inMemoryLinks) return inMemoryLinks;
  const result: Record<string, string> = {};
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach(k => {
            if (parsed[k] && typeof parsed[k] === 'string' && parsed[k].trim() && k !== 'updated_at') {
              result[k] = parsed[k].trim();
            }
          });
        }
      }
    }
  } catch (e) {}
  inMemoryLinks = result;
  return result;
}

/**
 * Recupera i link delle immagini dal Cloud (API Serverless / Supabase Storage).
 * Garantisce che visitatori su qualsiasi dispositivo vedano le immagini aggiornate dall'Admin.
 */
export async function fetchCustomProductImageLinks(forceRefresh = false): Promise<Record<string, string>> {
  if (isFetchingPromise && !forceRefresh) {
    return isFetchingPromise;
  }

  isFetchingPromise = (async () => {
    let cloudLinks: Record<string, string> | null = null;

    // 1. Prova prima tramite l'endpoint API ufficiale con cache busting
    try {
      const cacheBust = Date.now();
      const res = await fetch(`/api/product-images?t=${cacheBust}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.links && typeof data.links === 'object') {
          cloudLinks = data.links;
        }
      }
    } catch (apiErr) {
      // API locale non disponibile o fetch fallita, fallback su Supabase Storage diretto
    }

    // 2. Fallback diretto sul file pubblico di Supabase Storage se l'API non risponde
    if (!cloudLinks) {
      try {
        const cacheBust = Date.now();
        const res = await fetch(`${DIRECT_SUPABASE_STORAGE_URL}?t=${cacheBust}`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            cloudLinks = data;
          }
        }
      } catch (storageErr) {
        // Nessun cloud raggiungibile, useremo la cache o i default
      }
    }

    if (cloudLinks) {
      const cleaned: Record<string, string> = {};
      Object.keys(cloudLinks).forEach(k => {
        if (k !== 'updated_at' && cloudLinks[k] && typeof cloudLinks[k] === 'string' && cloudLinks[k].trim()) {
          cleaned[k] = cloudLinks[k].trim();
        }
      });

      inMemoryLinks = cleaned;

      // Aggiorna anche la cache locale per velocizzare i caricamenti futuri
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
      } catch (e) {}

      // Notifica tutti i componenti React montati
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('custom-product-images-updated', { detail: cleaned }));
      }

      return cleaned;
    }

    // Se il cloud non è raggiungibile, usa la cache locale
    return initLocalCache();
  })().finally(() => {
    isFetchingPromise = null;
  });

  return isFetchingPromise;
}

// Avvia automaticamente il caricamento in background se siamo in browser
if (typeof window !== 'undefined') {
  initLocalCache();
  fetchCustomProductImageLinks().catch(() => {});
}

/**
 * Ottiene l'immagine attuale per un dato prodotto (con supporto a modifiche dinamiche)
 */
export function getCustomProductImage(productId: string): string {
  const currentLinks = inMemoryLinks || initLocalCache();
  if (currentLinks && currentLinks[productId] && currentLinks[productId].trim()) {
    return formatImageUrl(currentLinks[productId]);
  }

  const defaultUrl = DEFAULT_PRODUCT_IMAGE_LINKS[productId] || '';
  return formatImageUrl(defaultUrl);
}

/**
 * Ottiene la mappa di tutte le immagini correnti
 */
export function getAllCustomProductImages(): Record<string, string> {
  const currentLinks = inMemoryLinks || initLocalCache();
  return {
    ...DEFAULT_PRODUCT_IMAGE_LINKS,
    ...currentLinks
  };
}

/**
 * Salva i link modificati dall'amministratore su Supabase Cloud e notifica l'app in tempo reale
 */
export async function saveCustomProductImageLinks(links: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  // 1. Aggiornamento ottimistico immediato in memoria e locale
  inMemoryLinks = { ...links };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-product-images-updated', { detail: links }));
  }

  // 2. Persistenza reale nel Cloud tramite API Serverless / Express
  try {
    const res = await fetch('/api/product-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ links }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Errore HTTP ${res.status}`);
    }

    const resData = await res.json();
    return { success: true };
  } catch (err: any) {
    console.error('[PRODUCT-IMAGES] Errore sincronizzazione cloud:', err);
    return { success: false, error: err?.message || 'Errore salvataggio cloud' };
  }
}

/**
 * Ripristina i link di default definiti nel codice sia nel Cloud che in locale
 */
export async function resetCustomProductImageLinks(): Promise<{ success: boolean; error?: string }> {
  inMemoryLinks = {};
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-product-images-updated', { detail: {} }));
  }

  try {
    const res = await fetch('/api/product-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ links: {} }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Errore HTTP ${res.status}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[PRODUCT-IMAGES] Errore ripristino cloud:', err);
    return { success: false, error: err?.message || 'Errore ripristino cloud' };
  }
}
