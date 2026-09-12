import * as React from 'react';
import { useState, useRef, useEffect, type FC } from 'react';
import { CustomProduct, Order, OrderStatus, PaymentMethod, User } from '../types';
import { 
  getCustomProducts, 
  getCustomProductImage,
  fetchCustomProductImageLinks,
  STUDIO_ADDRESS, 
  STUDIO_PHONE, 
  SUMUP_CUSTOM_PRODUCTS_URL, 
  WHATSAPP_LINK 
} from '../constants';
import { EmailService } from '../services/email';

interface CustomProductsProps {
  navigate: (page: string) => void;
  user: User | null;
  addOrder?: (order: Order) => Promise<any>;
}

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

// Helper per preparare e ottimizzare l'immagine client-side se supera la soglia per-request di Cloudinary
// Permette l'upload fino a 25 MB preservando l'altissima qualità per la stampa
const prepareImageForUpload = async (file: File): Promise<File | Blob> => {
  const CLOUDINARY_MAX_DIRECT_BYTES = 9.5 * 1024 * 1024; // 9.5 MB
  if (file.size <= CLOUDINARY_MAX_DIRECT_BYTES) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Mantieni altissima risoluzione (fino a 4000px, perfetta per stampa di grandi dimensioni)
      const MAX_DIMENSION = 4000;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
};

// Funzione di upload su Cloudinary che riutilizza lo stesso storage degli ordini esistenti
const uploadToCloudinary = async (file: File): Promise<string> => {
  const fileToUpload = await prepareImageForUpload(file);
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", "fotocs");

  const response = await fetch("https://api.cloudinary.com/v1_1/divyx0t5b/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Errore durante il caricamento della foto su Cloudinary.");
  }
  return data.secure_url;
};

const CustomProducts: FC<CustomProductsProps> = ({ navigate, user, addOrder }) => {
  const [products, setProducts] = useState<CustomProduct[]>(() => getCustomProducts());
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct | null>(null);

  // Ascolta aggiornamenti dei link foto in tempo reale e sincronizza con il Cloud
  useEffect(() => {
    fetchCustomProductImageLinks().then(() => {
      const refreshed = getCustomProducts();
      setProducts(refreshed);
      setSelectedProduct(prev => prev ? refreshed.find(p => p.id === prev.id) || prev : null);
    }).catch(() => {});

    const handleUpdate = () => {
      const refreshed = getCustomProducts();
      setProducts(refreshed);
      setSelectedProduct(prev => prev ? refreshed.find(p => p.id === prev.id) || prev : null);
    };

    window.addEventListener('custom-product-images-updated', handleUpdate);
    return () => window.removeEventListener('custom-product-images-updated', handleUpdate);
  }, []);
  
  // Opzioni configurate
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [deviceModel, setDeviceModel] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  // Foto caricate (supporta 1 o fino a 3 foto in base al prodotto)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dati cliente
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name && user.name.includes(' ') ? user.name.split(' ').slice(1).join(' ') : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Metodo di pagamento per i prodotti personalizzati
  type CustomPaymentOption = 'pickup_pay_in_store' | 'pickup_pay_now';
  const [paymentOption, setPaymentOption] = useState<CustomPaymentOption>('pickup_pay_in_store');

  // Stati UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const maxPhotos = selectedProduct?.maxPhotos || 1;

  const clearAllPhotos = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset opzioni quando si cambia prodotto
  const handleSelectProduct = (product: CustomProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes ? product.sizes[2] || product.sizes[0] : 'L');
    setDeviceModel('');
    setQuantity(1);
    setPaymentOption('pickup_pay_in_store');
    setErrorMessage(null);
    setOrderSuccess(null);
    clearAllPhotos();
    
    // Scroll fluido al configuratore
    setTimeout(() => {
      const el = document.getElementById('product-configurator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleAddFiles = (files: FileList | File[]) => {
    if (!selectedProduct) return;
    const currentLimit = selectedProduct.maxPhotos || 1;
    const currentCount = photos.length;
    const allowedNewCount = currentLimit - currentCount;

    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setErrorMessage("Seleziona file immagine validi (JPEG, PNG, WEBP).");
      return;
    }

    // Controllo dimensione massima: 25 MB per singola immagine
    const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
    const oversizedFile = fileArray.find(f => f.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFile) {
      const sizeMB = (oversizedFile.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`La fotografia "${oversizedFile.name}" supera il limite massimo consentito di 25 MB (dimensione attuale: ${sizeMB} MB). Seleziona un'immagine fino a 25 MB.`);
      return;
    }

    if (currentLimit === 1) {
      // Sostituzione singola foto
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      const file = fileArray[0];
      setPhotos([{
        id: `${Date.now()}-0`,
        file,
        preview: URL.createObjectURL(file)
      }]);
      setErrorMessage(null);
    } else {
      if (allowedNewCount <= 0) {
        setErrorMessage(`Hai già raggiunto il limite massimo di ${currentLimit} foto per questo prodotto.`);
        return;
      }
      const toAdd = fileArray.slice(0, allowedNewCount);
      if (fileArray.length > allowedNewCount) {
        setErrorMessage(`Sono state aggiunte solo ${allowedNewCount} foto per rispettare il limite massimo di ${currentLimit}.`);
      } else {
        setErrorMessage(null);
      }
      const newPhotos: UploadedPhoto[] = toAdd.map((f, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        preview: URL.createObjectURL(f)
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const found = prev.find(p => p.id === photoId);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter(p => p.id !== photoId);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return Number((selectedProduct.price * quantity).toFixed(2));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProduct) {
      setErrorMessage("Seleziona prima un prodotto da personalizzare.");
      return;
    }

    if (photos.length === 0) {
      setErrorMessage(maxPhotos > 1 
        ? `Devi caricare almeno una foto (puoi caricarne fino a ${maxPhotos}) per la tua ${selectedProduct.name}.`
        : "Devi caricare una foto da stampare sul prodotto.");
      return;
    }

    if (selectedProduct.category === 't-shirt' && !selectedSize) {
      setErrorMessage("Seleziona la taglia per la tua T-Shirt.");
      return;
    }

    if (selectedProduct.requiresDeviceModel && !deviceModel.trim()) {
      setErrorMessage("Inserisci il modello del tuo smartphone per la Cover (es. iPhone 15 Pro).");
      return;
    }

    if (!firstName.trim()) {
      setErrorMessage("Inserisci il tuo nome.");
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage("Inserisci un indirizzo email valido.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Inserisci un recapito telefonico per le notifiche.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(photos.length > 1 
      ? `Caricamento di ${photos.length} fotografie in alta risoluzione...` 
      : "Caricamento della tua fotografia in alta risoluzione...");

    try {
      setUploadProgress(`Salvataggio di ${photos.length} ${photos.length > 1 ? 'immagini' : 'immagine'} nei nostri archivi protetti...`);
      const uploadedUrls = await Promise.all(photos.map(p => uploadToCloudinary(p.file)));
      const finalPhotoUrl = uploadedUrls[0];
      const finalPhotoUrls = uploadedUrls;

      const totalAmount = calculateTotal();
      const clientOrderId = `ord-custom-${Date.now()}`;

      // Invio e registrazione ordine tramite endpoint server-side sicuro (gestisce Supabase + notifica Resend)
      setUploadProgress("Registrazione ordine e invio al laboratorio...");

      const isPayNow = paymentOption === 'pickup_pay_now';
      const paymentChoiceText = isPayNow ? "Paga ora" : "Paga in sede";
      const paymentStatusText = isPayNow ? "Pagamento online: 10 €" : "Pagamento in sede";

      const emailResponse = await EmailService.sendCustomProductOrder({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productName: selectedProduct.name,
        size: selectedProduct.category === 't-shirt' ? selectedSize : undefined,
        deviceModel: selectedProduct.requiresDeviceModel ? deviceModel.trim() : undefined,
        quantity: quantity,
        unitPrice: selectedProduct.price,
        total: totalAmount,
        photoUrl: finalPhotoUrl,
        photoUrls: finalPhotoUrls,
        orderId: clientOrderId,
        paymentStatus: paymentStatusText,
        paymentChoice: paymentChoiceText,
        paymentOption: paymentOption,
        paymentMethod: paymentOption
      });

      const finalOrderId = (emailResponse?.result as any)?.id || clientOrderId;

      setOrderSuccess({
        id: finalOrderId,
        product: selectedProduct,
        quantity,
        total: totalAmount,
        size: selectedProduct.category === 't-shirt' ? selectedSize : undefined,
        deviceModel: selectedProduct.requiresDeviceModel ? deviceModel.trim() : undefined,
        photoUrl: finalPhotoUrl,
        photoUrls: finalPhotoUrls,
        paymentOption: paymentOption,
        paymentChoice: paymentChoiceText
      });

      // CASO 2: DOPO che l'ordine è stato confermato con successo, apri il link SumUp se l'utente ha scelto "Paga ora"
      if (isPayNow) {
        const sumupUrl = SUMUP_CUSTOM_PRODUCTS_URL || "https://pay.sumup.com/b2c/Q6R1I849";
        try {
          window.open(sumupUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn("[CUSTOM-PRODUCTS] Impossibile aprire finestra popup:", e);
        }
      }

    } catch (err: any) {
      console.error("[CUSTOM-PRODUCTS] Errore salvataggio ordine:", err);
      setErrorMessage(err.message || "Si è verificato un errore durante l'invio dell'ordine. Riprova o contattaci su WhatsApp.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-zinc-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 via-zinc-950/80 to-zinc-950 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <span className="inline-block py-1.5 px-5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase mb-6 shadow-sm">
            Creazioni Esclusive & Idee Regalo
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-white mb-6 leading-tight tracking-tight">
            Prodotti Personalizzati
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Trasforma i tuoi scatti fotografici in oggetti unici da indossare, regalare o custodire. 
            Stampa di altissima qualità e finitura artigianale nel nostro studio.
          </p>
        </div>
      </section>

      {/* SELEZIONE PRODOTTI (GRID) */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif italic text-white mb-3">
            Scegli il Prodotto da Creare
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest">
            Clicca su un prodotto per personalizzarlo con la tua foto
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const isSelected = selectedProduct?.id === prod.id;
            return (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod)}
                className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-zinc-900/90 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-zinc-950 border border-zinc-800">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      onError={(e) => {
                        // Fallback discreto in caso di URL errato
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-700 text-amber-400 text-xs font-bold font-mono">
                      € {prod.price.toFixed(2)}
                    </div>
                    {prod.maxPhotos && prod.maxPhotos > 1 && (
                      <div className="absolute bottom-2.5 left-2.5 bg-amber-400 text-black px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                        Fino a {prod.maxPhotos} Foto
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-serif italic text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 mb-4 font-light">
                    {prod.shortDescription}
                  </p>
                </div>

                <button
                  type="button"
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-zinc-800 group-hover:bg-zinc-700 text-white'
                  }`}
                >
                  {isSelected ? '✓ Selezionato' : 'Personalizza →'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODULO CONFIGURATORE & ORDINE */}
      {selectedProduct && (
        <section id="product-configurator" className="py-12 px-6 max-w-4xl mx-auto">
          {orderSuccess ? (
            /* SCHERMATA CONFERMA ORDINE SUCCESSO */
            <div className="bg-zinc-900/90 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                ✓
              </div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">Ordine Ricevuto con Successo</span>
              <h2 className="text-3xl sm:text-4xl font-serif italic text-white mt-2 mb-4">
                Grazie per il tuo ordine!
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
                Abbiamo registrato il tuo ordine per <strong>{orderSuccess.product.name}</strong>. 
                Riceverai le istruzioni e ti contatteremo non appena il tuo prodotto sarà stampato e pronto per il ritiro.
              </p>

              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 max-w-lg mx-auto text-left mb-8">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800 text-xs text-zinc-400">
                  <span>ID Ordine:</span>
                  <span className="font-mono text-white font-bold">{orderSuccess.id}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 text-sm">
                  <span className="text-zinc-400">Prodotto:</span>
                  <span className="text-white font-semibold">{orderSuccess.product.name}</span>
                </div>
                {orderSuccess.size && (
                  <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 text-sm">
                    <span className="text-zinc-400">Taglia:</span>
                    <span className="text-amber-400 font-bold">{orderSuccess.size}</span>
                  </div>
                )}
                {orderSuccess.deviceModel && (
                  <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 text-sm">
                    <span className="text-zinc-400">Modello Smartphone:</span>
                    <span className="text-amber-400 font-bold">{orderSuccess.deviceModel}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 text-sm">
                  <span className="text-zinc-400">Quantità:</span>
                  <span className="text-white font-bold">{orderSuccess.quantity}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-zinc-800 text-sm">
                  <span className="text-zinc-400">Metodo Pagamento:</span>
                  {orderSuccess.paymentOption === 'pickup_pay_now' ? (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <span>💳</span> Ritiro in sede – Paga ora (10 €)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                      <span>🏪</span> Ritiro in sede – Paga in sede
                    </span>
                  )}
                </div>
                {orderSuccess.photoUrls && orderSuccess.photoUrls.length > 0 && (
                  <div className="pt-3 pb-1 border-b border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-2 font-medium">
                      {orderSuccess.photoUrls.length > 1 ? `Foto inviate (${orderSuccess.photoUrls.length}):` : 'Foto inviata:'}
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {orderSuccess.photoUrls.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative group block w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 hover:border-amber-400 transition-all bg-black"
                        >
                          <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] text-amber-300 font-bold px-1 rounded-tl">
                            #{idx + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 text-base">
                  <span className="text-white font-bold">Totale:</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg">€ {orderSuccess.total.toFixed(2)}</span>
                </div>
              </div>

              {/* CASO 2: BOX PAGAMENTO ONLINE SUMUP (SOLO QUANDO SCELTO PAGA ORA) */}
              {orderSuccess.paymentOption === 'pickup_pay_now' && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 max-w-lg mx-auto mb-8 text-center shadow-xl">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                    💳
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">
                    Completa il Pagamento Online di 10 €
                  </h3>
                  <p className="text-xs text-zinc-300 font-light mb-4 leading-relaxed">
                    Il tuo ordine è stato registrato con successo. Se la pagina sicura di pagamento SumUp non si è aperta automaticamente, clicca sul pulsante qui sotto per effettuare il pagamento di 10 €:
                  </p>
                  <a
                    href={SUMUP_CUSTOM_PRODUCTS_URL || "https://pay.sumup.com/b2c/Q6R1I849"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                  >
                    <span>Paga Ora 10 € su SumUp</span>
                    <span className="text-sm">↗</span>
                  </a>
                  <p className="text-[10px] text-zinc-400 mt-2 font-light">
                    Transazione protetta e cifrata via SumUp • Accetta tutte le principali carte
                  </p>
                </div>
              )}

              {/* CASO 1: BOX RITIRO IN SEDE (PAGA IN SEDE - NESSUN LINK SUMUP) */}
              {orderSuccess.paymentOption === 'pickup_pay_in_store' && (
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 max-w-lg mx-auto mb-8 text-center text-xs text-zinc-300">
                  <span className="text-amber-400 font-bold block mb-1">📍 Pagamento in Sede</span>
                  Pagherai comodamente al momento del ritiro presso il nostro studio a Mugnano del Cardinale in contanti o tramite POS.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <button
                    onClick={() => navigate(user.role === 'admin' ? 'admin' : 'dashboard')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-amber-300 transition-all shadow-md"
                  >
                    Visualizza nei Miei Ordini →
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('home')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-md"
                  >
                    Torna alla Home
                  </button>
                )}
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setSelectedProduct(null);
                    clearAllPhotos();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all"
                >
                  Ordina un altro prodotto
                </button>
              </div>
            </div>
          ) : (
            /* MODULO DI PERSONALIZZAZIONE */
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-8">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shadow-md bg-zinc-950 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div>
                    <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Passo 2 di 2</span>
                    <h3 className="text-2xl sm:text-3xl font-serif italic text-white mt-1">
                      Personalizza: {selectedProduct.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Prezzo unitario:</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">€ {selectedProduct.price.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-8">
                {/* 1. UPLOAD FOTO */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      1. Carica la Foto da Stampare <span className="text-amber-400">*</span>
                    </label>
                    {maxPhotos > 1 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                        ☕ Tazza personalizzata: puoi selezionare fino a {maxPhotos} foto ({photos.length}/{maxPhotos})
                      </span>
                    )}
                  </div>

                  {maxPhotos > 1 && (
                    <p className="text-xs text-zinc-400 mb-3 italic">
                      Per la tazza puoi caricare da 1 a 3 fotografie differenti che verranno disposte panoramicamente attorno al prodotto.
                    </p>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple={maxPhotos > 1}
                    className="hidden"
                    id="custom-photo-upload"
                  />

                  {maxPhotos === 1 ? (
                    /* PRODOTTO A FOTO SINGOLA */
                    photos.length > 0 ? (
                      <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 p-4 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-zinc-800 shrink-0 bg-black">
                          <img
                            src={photos[0].preview}
                            alt="Foto selezionata"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-sm font-semibold text-white mb-1">Foto caricata pronta per la stampa</p>
                          <p className="text-xs text-zinc-400 font-light mb-4">
                            {photos[0].file?.name} ({(photos[0].file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg transition-all"
                            >
                              Sostituisci Foto
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhoto(photos[0].id)}
                              className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold text-red-300 rounded-lg transition-all"
                            >
                              Rimuovi
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                          dragActive
                            ? 'border-amber-400 bg-amber-500/5'
                            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-950'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                          📷
                        </div>
                        <p className="text-sm sm:text-base font-medium text-white mb-1">
                          Clicca qui o trascina la tua fotografia
                        </p>
                        <p className="text-xs text-zinc-400 font-light">
                          Supporta file JPEG, PNG, WEBP ad alta definizione (max 25MB)
                        </p>
                      </div>
                    )
                  ) : (
                    /* TAZZA: PRODOTTO MULTI-FOTO (FINO A 3 FOTO) */
                    <div className="space-y-4">
                      {photos.length > 0 ? (
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            {photos.map((item, index) => (
                              <div key={item.id} className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 p-3 flex flex-col items-center">
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-black mb-3">
                                  <img
                                    src={item.preview}
                                    alt={`Foto ${index + 1}`}
                                    className="w-full h-full object-contain"
                                  />
                                  <div className="absolute top-2 left-2 bg-amber-400 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                                    Foto {index + 1}
                                  </div>
                                </div>
                                <p className="text-[11px] text-zinc-300 truncate w-full text-center font-medium mb-1">
                                  {item.file.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 mb-3">
                                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(item.id)}
                                  className="w-full py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-[11px] font-bold text-red-300 rounded-lg transition-all"
                                >
                                  ✕ Rimuovi Foto {index + 1}
                                </button>
                              </div>
                            ))}

                            {photos.length < maxPhotos && (
                              <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[200px] ${
                                  dragActive
                                    ? 'border-amber-400 bg-amber-500/5'
                                    : 'border-zinc-700 hover:border-amber-400/70 bg-zinc-950/40 hover:bg-zinc-950'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center mb-3 text-xl">
                                  +
                                </div>
                                <p className="text-xs font-semibold text-white mb-1">
                                  Aggiungi Foto {photos.length + 1}
                                </p>
                                <p className="text-[10px] text-zinc-400">
                                  (fino a {maxPhotos} foto totali)
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <p className="text-xs text-zinc-400">
                              ✓ Hai caricato <strong className="text-white">{photos.length}</strong> su <strong className="text-amber-400">{maxPhotos}</strong> foto per la tua tazza.
                            </p>
                            {photos.length < maxPhotos && (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow"
                              >
                                + Aggiungi Foto ({photos.length + 1}/{maxPhotos})
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                            dragActive
                              ? 'border-amber-400 bg-amber-500/5'
                              : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-950'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                            ☕
                          </div>
                          <p className="text-sm sm:text-base font-medium text-white mb-1">
                            Clicca qui o trascina da 1 a 3 fotografie per la tua Tazza
                          </p>
                          <p className="text-xs text-zinc-400 font-light">
                            Puoi selezionare fino a 3 foto insieme (JPEG, PNG, WEBP ad alta definizione)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. OPZIONI SPECIFICHE (TAGLIA PER T-SHIRT / MODELLO PER COVER) */}
                {selectedProduct.category === 't-shirt' && selectedProduct.sizes && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                      2. Scegli la Taglia della T-Shirt <span className="text-amber-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedProduct.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`w-12 h-12 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            selectedSize === s
                              ? 'bg-amber-400 border-amber-400 text-black shadow-md scale-105'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.requiresDeviceModel && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                      2. Modello del tuo Smartphone <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="Es. iPhone 15 Pro, Samsung Galaxy S24, Xiaomi 14..."
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1.5 font-light">
                      Indica con precisione marca e modello per garantire una custodia perfetta.
                    </p>
                  </div>
                )}

                {/* 3. QUANTITÀ */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                    Quantità
                  </label>
                  <div className="inline-flex items-center bg-zinc-950 border border-zinc-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-mono font-bold text-white text-base">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(50, quantity + 1))}
                      className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 4. DATI CLIENTE */}
                <div className="pt-6 border-t border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">
                    Dati di Contatto & Ritiro <span className="text-amber-400">*</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                        Nome
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Il tuo nome"
                        className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                        Cognome
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Il tuo cognome"
                        className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@esempio.com"
                        className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                        Telefono (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Es. 340 1234567"
                        className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. SCELTA DEL METODO DI PAGAMENTO */}
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                      <span>Metodo di Pagamento</span>
                      <span className="text-amber-400">*</span>
                    </h4>
                    <span className="text-[11px] text-zinc-400">seleziona 1 opzione</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-light mb-4">
                    Scegli come preferisci pagare il tuo ordine con ritiro presso il nostro studio:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* OPZIONE 1: RITIRO IN SEDE - PAGA IN SEDE */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPaymentOption('pickup_pay_in_store')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentOption('pickup_pay_in_store'); }}
                      className={`cursor-pointer text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                        paymentOption === 'pickup_pay_in_store'
                          ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/50 shadow-lg shadow-amber-400/5'
                          : 'bg-zinc-950/70 hover:bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            paymentOption === 'pickup_pay_in_store'
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-zinc-600 bg-transparent'
                          }`}>
                            {paymentOption === 'pickup_pay_in_store' && (
                              <span className="w-2 h-2 rounded-full bg-black block" />
                            )}
                          </div>
                          <span className="text-sm font-bold text-white">
                            Ritiro in sede – Paga in sede
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-light pl-8">
                          Paga di persona al momento del ritiro in studio con contanti o POS.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs pl-8">
                        <span className="text-zinc-500">Opzione:</span>
                        <span className="font-semibold text-amber-400">
                          Pagamento in sede
                        </span>
                      </div>
                    </div>

                    {/* OPZIONE 2: RITIRO IN SEDE - PAGA ORA */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPaymentOption('pickup_pay_now')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPaymentOption('pickup_pay_now'); }}
                      className={`cursor-pointer text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none ${
                        paymentOption === 'pickup_pay_now'
                          ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/50 shadow-lg shadow-amber-400/5'
                          : 'bg-zinc-950/70 hover:bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            paymentOption === 'pickup_pay_now'
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-zinc-600 bg-transparent'
                          }`}>
                            {paymentOption === 'pickup_pay_now' && (
                              <span className="w-2 h-2 rounded-full bg-black block" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              Ritiro in sede – Paga ora
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Online
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-light pl-8">
                          Paga subito online in totale sicurezza tramite SumUp.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs pl-8">
                        <span className="text-zinc-500">Opzione:</span>
                        <span className="font-semibold text-emerald-400 font-mono">
                          Pagamento online: 10 €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIEPILOGO TOTALE & BOTTONE CONFERMA */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider block">Riepilogo Totale</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-mono font-bold text-amber-400">
                        € {calculateTotal().toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-500 font-light">
                        ({quantity}x €{selectedProduct.price.toFixed(2)})
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {paymentOption === 'pickup_pay_now' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <span>💳</span> Ritiro in sede • Pagamento online: 10 € (SumUp)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                          <span>📍</span> Ritiro in sede • Pagamento in sede
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-10 py-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Elaborazione in corso...' : 'Conferma Ordine Personalizzato →'}
                  </button>
                </div>

                {/* STATO UPLOAD O ERRORE */}
                {isSubmitting && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs text-amber-300 animate-pulse">
                    ⏳ {uploadProgress || 'Elaborazione in corso...'}
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 text-center">
                    ⚠️ {errorMessage}
                  </div>
                )}
              </form>
            </div>
          )}
        </section>
      )}

      {/* FOOTER INFORMATIVO & ASSISTENZA */}
      <section className="py-16 px-6 border-t border-zinc-800/80 bg-zinc-950 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-serif italic text-white mb-2">
            Hai una richiesta o un formato speciale?
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm font-light mb-6">
            Realizziamo anche gadget personalizzati per cerimonie ed eventi speciali. 
            Contattaci direttamente su WhatsApp per un preventivo rapido e dedicato.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95"
          >
            <span>💬</span> Scrivici su WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default CustomProducts;
