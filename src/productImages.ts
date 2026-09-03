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

/**
 * Ottiene l'immagine attuale per un dato prodotto (con supporto a modifiche dinamiche)
 */
export function getCustomProductImage(productId: string): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[productId] && typeof parsed[productId] === 'string' && parsed[productId].trim()) {
          return formatImageUrl(parsed[productId]);
        }
      }
    }
  } catch (e) {
    // Fallback sicuro
  }

  const defaultUrl = DEFAULT_PRODUCT_IMAGE_LINKS[productId] || '';
  return formatImageUrl(defaultUrl);
}

/**
 * Ottiene la mappa di tutte le immagini correnti
 */
export function getAllCustomProductImages(): Record<string, string> {
  const result: Record<string, string> = { ...DEFAULT_PRODUCT_IMAGE_LINKS };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach(k => {
            if (parsed[k] && typeof parsed[k] === 'string' && parsed[k].trim()) {
              result[k] = parsed[k].trim();
            }
          });
        }
      }
    }
  } catch (e) {}
  return result;
}

/**
 * Salva i link modificati dall'amministratore e notifica l'app in tempo reale
 */
export function saveCustomProductImageLinks(links: Record<string, string>): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      window.dispatchEvent(new Event('custom-product-images-updated'));
    }
  } catch (e) {
    console.error('Errore salvataggio link foto:', e);
  }
}

/**
 * Ripristina i link di default definiti nel codice
 */
export function resetCustomProductImageLinks(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('custom-product-images-updated'));
    }
  } catch (e) {
    console.error('Errore ripristino link foto:', e);
  }
}
