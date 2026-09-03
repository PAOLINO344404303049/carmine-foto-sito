
import { PhotoPackage, CustomProduct } from './types';
import { 
  customTshirtMockup, 
  customMugProduct, 
  DEFAULT_PRODUCT_IMAGE_LINKS,
  getCustomProductImage,
  getAllCustomProductImages,
  saveCustomProductImageLinks,
  resetCustomProductImageLinks,
  fetchCustomProductImageLinks,
  formatImageUrl,
  PRODUCT_NAMES
} from './src/productImages';

export { 
  customTshirtMockup, 
  customMugProduct, 
  DEFAULT_PRODUCT_IMAGE_LINKS as CUSTOM_PRODUCT_IMAGE_LINKS,
  getCustomProductImage,
  getAllCustomProductImages,
  saveCustomProductImageLinks,
  resetCustomProductImageLinks,
  fetchCustomProductImageLinks,
  formatImageUrl,
  PRODUCT_NAMES
};

export const PRINT_PACKAGES: PhotoPackage[] = [
  {
    id: 'standard_100',
    name: 'Pacchetto 100 Foto',
    count: 100,
    price: 20,
    description: 'Il nostro pacchetto esclusivo per la stampa dei tuoi ricordi. Qualità professionale su carta lucida premium. Ritiro esclusivamente in studio.'
  }
];

/**
 * Generatore dei prodotti personalizzati con immagini dinamiche aggiornabili via link
 */
export const getCustomProducts = (): CustomProduct[] => [
  {
    id: 't-shirt-custom',
    name: 'T-Shirt Personalizzata',
    shortDescription: 'T-shirt in 100% cotone morbido con stampa fotografica ad altissima definizione. Disponibile in diverse taglie.',
    price: 10,
    image: getCustomProductImage('t-shirt-custom'),
    category: 't-shirt',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    requiresDeviceModel: false
  },
  {
    id: 'mug-custom',
    name: 'Tazza Personalizzata',
    shortDescription: 'Tazza in ceramica bianca con stampa fotografica panoramica. Puoi selezionare da 1 a 3 foto.',
    price: 10,
    image: getCustomProductImage('mug-custom'),
    category: 'mug',
    maxPhotos: 3,
    requiresDeviceModel: false
  },
  {
    id: 'keychain-custom',
    name: 'Portachiavi Personalizzato',
    shortDescription: 'Elegante portachiavi fotografico double-face per portare sempre con te i tuoi ricordi più cari.',
    price: 10,
    image: getCustomProductImage('keychain-custom'),
    category: 'keychain',
    requiresDeviceModel: false
  },
  {
    id: 'necklace-custom',
    name: 'Collana Personalizzata',
    shortDescription: 'Ciondolo raffinato con inserto fotografico smaltato e catenina in acciaio inossidabile.',
    price: 10,
    image: getCustomProductImage('necklace-custom'),
    category: 'necklace',
    requiresDeviceModel: false
  },
  {
    id: 'pillow-custom',
    name: 'Cuscino Personalizzato',
    shortDescription: 'Morbido cuscino d\'arredo 30x30 cm con tessuto anallergico e stampa fotografica ultra brillante.',
    price: 10,
    image: getCustomProductImage('pillow-custom'),
    category: 'pillow',
    requiresDeviceModel: false
  },
  {
    id: 'phone-case-custom',
    name: 'Cover Personalizzata',
    shortDescription: 'Custodia protettiva anti-urto su misura per il tuo smartphone con la tua fotografia preferita.',
    price: 10,
    image: getCustomProductImage('phone-case-custom'),
    category: 'phone_case',
    requiresDeviceModel: true
  }
];

export const CUSTOM_PRODUCTS: CustomProduct[] = getCustomProducts();

export const APP_NAME = "Carmine Felice Napolitano";
export const APP_SUBTITLE = "Fotografo";
export const STUDIO_ADDRESS = "Via Roma 70, Mugnano del Cardinal (AV)";
export const STUDIO_PHONE = "340 952 3725";
export const STUDIO_EMAIL = "carminephotography0@gmail.com";
export const INSTAGRAM_USER = "@carmine_photograpy";
export const INSTAGRAM_URL = "https://www.instagram.com/carmine_photograpy/";
export const SUMUP_PAY_LINK = "https://pay.sumup.com/b2c/XS2N1R43GQ";
export const SUMUP_CUSTOM_PRODUCTS_URL = "https://pay.sumup.com/b2c/Q6R1I849"; // Link SumUp da 10 € per prodotti personalizzati
export const WHATSAPP_LINK = `https://wa.me/393409523725`;

/**
 * Logo ufficiale istituzionale - Nuova versione PNG
 */
export const LOGO_URL = "https://i.imgur.com/Tsho2j9.png";

// Sfondo professionale con fotocamera SONY Alpha
export const HERO_BG_URL = "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";

// Sfondo Portfolio
export const PORTFOLIO_BG_URL = "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";

// Foto personale di Carmine
export const CARMINE_PHOTO_URL = "https://i.imgur.com/7QWZ8j2.jpeg";

// Immagini Servizi
export const SERVICE_IMG_PRINT = "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80";
export const SERVICE_IMG_100 = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80";
export const SERVICE_IMG_CONSULT = "https://i.imgur.com/7QWZ8j2.jpeg";

// Gallery "I Miei Scatti" - Modifica qui i 12 link per aggiornare le foto nel sito
export const SHOTS_GALLERY = [
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",  // photo1
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",  // photo2
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",  // photo3
  "https://images.unsplash.com/photo-1465495910483-0d6749ee9f4a?auto=format&fit=crop&w=800&q=80",  // photo4
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",  // photo5
  "https://images.unsplash.com/photo-1522673607200-1648482ce486?auto=format&fit=crop&w=800&q=80",  // photo6
  "https://images.unsplash.com/photo-1439539698758-ba2680ecadb9?auto=format&fit=crop&w=800&q=80",  // photo7
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",  // photo8
  "https://images.unsplash.com/photo-1510076857177-74700760beaa?auto=format&fit=crop&w=800&q=80",  // photo9
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=800&q=80",  // photo10
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",  // photo11
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80"   // photo12
];
