import * as React from 'react';
import { useState, useMemo, useEffect, type FC } from 'react';
import { Order, OrderStatus, OrderStatusLabels } from '../types';
import * as JSZip from 'jszip';
import { EmailService } from '../services/email';
import { 
  getAllCustomProductImages, 
  saveCustomProductImageLinks, 
  resetCustomProductImageLinks,
  fetchCustomProductImageLinks,
  formatImageUrl,
  PRODUCT_NAMES 
} from '../constants';

interface AdminProps {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => Promise<any> | void;
  onLogout: () => void;
}

interface ToastInfo {
  type: 'success' | 'error' | 'info';
  message: string;
}

const Admin: FC<AdminProps> = ({ orders, updateStatus, deleteOrder, onLogout }) => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Modal per gestione link foto prodotti personalizzati (Sincronizzazione Cloud Supabase)
  const [showImagesModal, setShowImagesModal] = useState<boolean>(false);
  const [productLinks, setProductLinks] = useState<Record<string, string>>(() => getAllCustomProductImages());
  const [isSavingImages, setIsSavingImages] = useState<boolean>(false);
  const [uploadingProdId, setUploadingProdId] = useState<string | null>(null);

  const openImagesModal = async () => {
    setProductLinks(getAllCustomProductImages());
    setShowImagesModal(true);
    try {
      const fresh = await fetchCustomProductImageLinks(true);
      if (fresh) {
        setProductLinks(getAllCustomProductImages());
      }
    } catch {}
  };

  const handleSaveProductLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingImages(true);
    try {
      const res = await saveCustomProductImageLinks(productLinks);
      if (res.success) {
        showToast('success', 'Foto dei prodotti salvate e sincronizzate nel Cloud con successo! Visibili ora anche su Vercel.');
        setShowImagesModal(false);
      } else {
        showToast('error', `Errore durante il salvataggio nel Cloud: ${res.error || 'Riprova'}`);
      }
    } catch (err: any) {
      showToast('error', `Errore imprevisto: ${err?.message || err}`);
    } finally {
      setIsSavingImages(false);
    }
  };

  const handleResetProductLinks = async () => {
    setIsSavingImages(true);
    try {
      const res = await resetCustomProductImageLinks();
      if (res.success) {
        setProductLinks(getAllCustomProductImages());
        showToast('info', 'Foto dei prodotti ripristinate ai valori predefiniti nel Cloud.');
      } else {
        showToast('error', `Errore durante il ripristino: ${res.error || 'Riprova'}`);
      }
    } catch (err: any) {
      showToast('error', `Errore imprevisto: ${err?.message || err}`);
    } finally {
      setIsSavingImages(false);
    }
  };

  const handleUploadImageFile = async (prodId: string, file: File) => {
    setUploadingProdId(prodId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "fotocs");

      const response = await fetch("https://api.cloudinary.com/v1_1/divyx0t5b/image/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Errore durante il caricamento della foto su Cloudinary.");
      }

      setProductLinks(prev => ({
        ...prev,
        [prodId]: data.secure_url
      }));
      showToast('success', `Foto caricata con successo! Clicca "Salva Modifiche" per confermare nel Cloud.`);
    } catch (err: any) {
      showToast('error', `Errore caricamento foto: ${err?.message || 'Riprova'}`);
    } finally {
      setUploadingProdId(null);
    }
  };

  // Stato e toggle del tema (Chiaro / Scuro)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const updateThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    updateThemeState();
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextThemeIsDark = !isDarkMode;
    setIsDarkMode(nextThemeIsDark);
    if (nextThemeIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Stato per la cancellazione dell'ordine (in-app modal)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notifiche in-app
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Statistiche rapide
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING_PAYMENT).length,
      paidOrProcessing: orders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.PROCESSING).length,
      ready: orders.filter(o => o.status === OrderStatus.PRINTED).length,
      collected: orders.filter(o => o.status === OrderStatus.COLLECTED).length,
      customProductsCount: orders.filter(o => o.orderType === 'custom_product' || (o.packageName && (o.packageName.includes('T-Shirt') || o.packageName.includes('Portachiavi') || o.packageName.includes('Collana') || o.packageName.includes('Cuscino') || o.packageName.includes('Cover') || o.packageName.includes('Tazza') || o.packageName.includes('Puzzle')))).length,
    };
  }, [orders]);

  // Filtro combinato per stato e ricerca testuale
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = filter === 'all' || order.status === filter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const name = (order.userName || '').toLowerCase();
      const lastName = (order.customerLastName || '').toLowerCase();
      const email = (order.userEmail || '').toLowerCase();
      const phone = (order.phone || '').toLowerCase();
      const id = (order.id || '').toLowerCase();
      const product = (order.packageName || '').toLowerCase();

      return (
        name.includes(q) ||
        lastName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        id.includes(q) ||
        product.includes(q)
      );
    });
  }, [orders, filter, searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      updateStatus(orderId, newStatus);
      showToast('info', `Stato ordine aggiornato a "${OrderStatusLabels[newStatus]}".`);
      
      if (newStatus === OrderStatus.PRINTED) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          showToast('info', `Invio notifica di ritiro a ${order.userEmail}...`);
          await EmailService.sendCollectionReady(order);
          showToast('success', `Email di ritiro inviata con successo a ${order.userEmail}`);
        }
      }
    } catch (err: any) {
      showToast('error', `Errore durante l'aggiornamento dello stato: ${err?.message || 'errore imprevisto'}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    const idToDelete = orderToDelete.id;
    const clientName = orderToDelete.userName;

    try {
      await Promise.resolve(deleteOrder(idToDelete));
      setOrderToDelete(null);
      showToast('success', `Ordine di ${clientName} (${idToDelete.slice(0, 10)}) eliminato con successo.`);
    } catch (err: any) {
      console.error("[ADMIN] Errore eliminazione:", err);
      showToast('error', `Impossibile eliminare l'ordine: ${err?.message || 'Riprova'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadAllAsZip = async (order: Order) => {
    if (order.photos.length === 0) {
      showToast('error', "Nessuna foto associata a questo ordine.");
      return;
    }
    setIsDownloading(order.id);
    setDownloadProgress(0);
    try {
      const JSZipConstructor = (JSZip as any).default || JSZip;
      const zip = new JSZipConstructor();
      const folderName = `${order.userName.replace(/\s+/g, '_')}_${order.id.slice(0, 8)}`;
      const folder = zip.folder(folderName);
      
      let processedCount = 0;
      for (let i = 0; i < order.photos.length; i++) {
        const photo = order.photos[i];
        try {
          const response = await fetch(photo.url, { method: 'GET', mode: 'cors', cache: 'no-cache' });
          if (!response.ok) throw new Error(`HTTP: ${response.status}`);
          const blob = await response.blob();
          const fileName = photo.name.includes('.') ? photo.name : `${photo.name}.jpg`;
          folder?.file(fileName, blob, { binary: true });
        } catch (err) {
          folder?.file(`ERRORE_FOTO_${i+1}.txt`, `Errore: ${photo.url}`);
        }
        processedCount++;
        setDownloadProgress(Math.round((processedCount / order.photos.length) * 100));
      }
      
      const content = await zip.generateAsync({ type: 'blob', compression: "DEFLATE", compressionOptions: { level: 6 } });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      showToast('success', `Archivio ZIP scaricato correttamente.`);
    } catch (err: any) {
      showToast('error', `Errore creazione ZIP: ${err?.message || err}`);
    } finally {
      setIsDownloading(null);
      setDownloadProgress(0);
    }
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return {
          pill: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
          dot: 'bg-amber-500 dark:bg-amber-400',
          select: 'border-amber-300 text-amber-800 bg-amber-50 dark:border-amber-400/40 dark:text-amber-400 dark:bg-amber-950/30'
        };
      case OrderStatus.PAID:
        return {
          pill: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
          dot: 'bg-blue-600 dark:bg-blue-400',
          select: 'border-blue-300 text-blue-800 bg-blue-50 dark:border-blue-400/40 dark:text-blue-400 dark:bg-blue-950/30'
        };
      case OrderStatus.PROCESSING:
        return {
          pill: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
          dot: 'bg-indigo-600 dark:bg-indigo-400 animate-pulse',
          select: 'border-indigo-300 text-indigo-800 bg-indigo-50 dark:border-indigo-400/40 dark:text-indigo-300 dark:bg-indigo-950/30'
        };
      case OrderStatus.PRINTED:
        return {
          pill: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
          dot: 'bg-purple-600 dark:bg-purple-400',
          select: 'border-purple-300 text-purple-800 bg-purple-50 dark:border-purple-400/40 dark:text-purple-300 dark:bg-purple-950/30'
        };
      case OrderStatus.COLLECTED:
        return {
          pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
          dot: 'bg-emerald-600 dark:bg-emerald-400',
          select: 'border-emerald-300 text-emerald-800 bg-emerald-50 dark:border-emerald-400/40 dark:text-emerald-300 dark:bg-emerald-950/30'
        };
      default:
        return {
          pill: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/30',
          dot: 'bg-zinc-500 dark:bg-zinc-400',
          select: 'border-zinc-300 text-zinc-800 bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:bg-zinc-900'
        };
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOAST IN-APP */}
        {toast && (
          <div className="fixed top-24 right-5 z-50 max-w-md animate-fade-in">
            <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50' 
                : toast.type === 'error'
                ? 'bg-red-950/90 text-red-100 border-red-700/50'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700'
            }`}>
              <div className="text-xl shrink-0 mt-0.5">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : 'ℹ'}
              </div>
              <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                {toast.message}
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-zinc-400 hover:text-white text-xs px-1 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* HEADER AREA AMMINISTRATORE (SPAZIATO CORRETTAMENTE SOTTO LA NAVBAR) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Pannello di Gestione Ordini
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-white tracking-tight">
              Area Amministratore
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-light mt-1">
              Studio Fotografico Carmine Felice Napolitano • Gestione ordini in tempo reale
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* PULSANTE GESTIONE FOTO PRODOTTI */}
            <button
              onClick={openImagesModal}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              title="Modifica i link delle foto per i prodotti personalizzati"
            >
              <span className="text-sm">🖼️</span>
              <span>Modifica Foto Prodotti</span>
            </button>

            {/* TOGGLE TEMA CHIARO / SCURO */}
            <button
              onClick={toggleTheme}
              className="px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              title={isDarkMode ? "Passa al Tema Bianco" : "Passa al Tema Scuro"}
            >
              <span className="text-sm">{isDarkMode ? '☀️' : '🌙'}</span>
              <span>{isDarkMode ? 'Tema Bianco' : 'Tema Scuro'}</span>
            </button>

            {/* PULSANTE LOGOUT */}
            <button 
              onClick={onLogout}
              className="px-5 py-2.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              title="Disconnetti account"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Esci Sessione
            </button>
          </div>
        </header>

        {/* METRICHE RAPIDE */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Totale Ordini</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-white mt-1">{stats.total}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In Attesa</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Lavorazione</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{stats.paidOrProcessing}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Pronti al Ritiro</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">{stats.ready}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ritirati</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{stats.collected}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">Personalizzati</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-300 mt-1">{stats.customProductsCount}</span>
          </div>
        </div>

        {/* BARRA STRUMENTI: RICERCA E FILTRI */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Input Ricerca */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per cliente, email, telefono o ID..."
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 shadow-sm transition-colors"
              />
              <span className="absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <span className="text-xs text-zinc-600 dark:text-zinc-400 self-center">
              Visualizzati <strong className="text-zinc-900 dark:text-white">{filteredOrders.length}</strong> su {orders.length} ordini
            </span>
          </div>

          {/* Filtri pillola */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === 'all' 
                  ? 'bg-zinc-900 dark:bg-amber-400 text-white dark:text-black shadow-md' 
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
              }`}
            >
              Tutti ({orders.length})
            </button>
            {Object.values(OrderStatus).map(status => {
              const count = orders.filter(o => o.status === status).length;
              const isSelected = filter === status;
              return (
                <button 
                  key={status} 
                  onClick={() => setFilter(status)} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isSelected 
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md' 
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                  }`}
                >
                  {OrderStatusLabels[status].toUpperCase()} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA ORDINI */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-16 rounded-3xl text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mx-auto mb-4 text-2xl text-zinc-400">
              📋
            </div>
            <h3 className="text-xl font-serif text-zinc-900 dark:text-white mb-2">Nessun ordine trovato</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {searchQuery 
                ? `Nessun risultato corrispondente al termine di ricerca "${searchQuery}". Prova a reimpostare i filtri.` 
                : 'Al momento non sono presenti ordini in questo stato.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Azzera ricerca
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map(order => {
              const isCustomProduct = order.orderType === 'custom_product' || 
                (order.packageName && (
                  order.packageName.includes('T-Shirt') || 
                  order.packageName.includes('Portachiavi') || 
                  order.packageName.includes('Collana') || 
                  order.packageName.includes('Cuscino') || 
                  order.packageName.includes('Cover') ||
                  order.packageName.includes('Tazza') ||
                  order.packageName.includes('Puzzle')
                ));

              const photosList = order.photos || [];
              const firstPhoto = photosList.length > 0 ? photosList[0] : null;
              const statusStyle = getStatusBadgeStyle(order.status);
              const cleanPhone = (order.phone || '').replace(/\[.*?\]/, '').trim();
              const waNumber = cleanPhone.replace(/[^0-9]/g, '');

              return (
                <div 
                  key={order.id} 
                  className={`border rounded-3xl p-5 sm:p-7 shadow-sm transition-all ${
                    isCustomProduct 
                      ? 'bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/10 border-amber-300/80 dark:border-amber-500/30 hover:border-amber-400' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* INTESTAZIONE SCHEDA ORDINE */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-mono text-[11px] font-bold bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                        ID: {order.id.slice(0, 16)}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        • {order.createdAt ? new Date(order.createdAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data n.d.'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCustomProduct ? (
                        <span className="bg-amber-50 dark:bg-amber-400/15 border border-amber-300 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <span>★</span> Prodotto Personalizzato
                        </span>
                      ) : (
                        <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          Pacchetto Stampa
                        </span>
                      )}

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusStyle.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                        {OrderStatusLabels[order.status]}
                      </span>
                    </div>
                  </div>

                  {/* CORPO DELLA SCHEDA ORDINE */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5">
                    
                    {/* COLONNA FOTO / ANTEPRIME */}
                    <div className="md:col-span-3 flex flex-col justify-center">
                      {isCustomProduct && firstPhoto ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <a 
                              href={firstPhoto.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-400/40 bg-zinc-100 dark:bg-black group shadow-md shrink-0"
                              title="Apri immagine originale a piena risoluzione"
                            >
                              <img 
                                src={firstPhoto.url} 
                                alt="Foto cliente" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                                Apri ↗
                              </div>
                            </a>

                            {photosList.length > 1 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block tracking-wider">
                                  {photosList.length} Foto Totali
                                </span>
                                <div className="flex flex-wrap gap-1.5 max-w-[120px]">
                                  {photosList.map((p, idx) => (
                                    <a
                                      key={idx}
                                      href={p.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 hover:border-amber-500 relative block bg-zinc-100 dark:bg-black shadow-sm"
                                      title={`Foto ${idx + 1}`}
                                    >
                                      <img src={p.url} alt={`#${idx+1}`} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                            Clicca sull'anteprima per ingrandire
                          </span>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center p-2">
                          <span className="text-2xl mb-1">📸</span>
                          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                            {photosList.length} File
                          </span>
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                            Stampa Foto
                          </span>
                        </div>
                      )}
                    </div>

                    {/* COLONNA DATI CLIENTE */}
                    <div className="md:col-span-5 space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                        Cliente
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                        {order.userName} {order.customerLastName || ''}
                      </h3>
                      
                      <div className="space-y-1 pt-1 text-xs">
                        <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <span className="text-zinc-400 dark:text-zinc-500 text-xs">✉</span>
                          <a href={`mailto:${order.userEmail}`} className="hover:text-amber-600 dark:hover:text-amber-300 hover:underline truncate">
                            {order.userEmail}
                          </a>
                        </p>
                        
                        {cleanPhone && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-zinc-400 dark:text-zinc-500 text-xs">📞</span>
                            <a href={`tel:${cleanPhone}`} className="text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-300 hover:underline">
                              {cleanPhone}
                            </a>
                            {waNumber && (
                              <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors inline-flex items-center gap-1 shadow-sm"
                                title="Apri chat WhatsApp con il cliente"
                              >
                                <span>WhatsApp</span> ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLONNA DETTAGLI PRODOTTO E TOTALE */}
                    <div className="md:col-span-4 space-y-2 md:border-l md:border-zinc-200 dark:md:border-zinc-800 md:pl-6">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                        Prodotto / Pacchetto
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white uppercase">
                        {order.packageName}
                      </h4>

                      <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                        {order.size && (
                          <p>
                            Taglia: <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-400/10 px-2 py-0.5 rounded text-[11px] border border-amber-300 dark:border-amber-400/20">{order.size}</span>
                          </p>
                        )}
                        {order.deviceModel && (
                          <p>
                            Modello Smartphone: <span className="font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] border border-zinc-200 dark:border-zinc-700">{order.deviceModel}</span>
                          </p>
                        )}
                        <p>
                          Quantità: <strong className="text-zinc-900 dark:text-white">{order.quantity || 1}</strong>
                        </p>
                        <p className="pt-1 flex items-baseline gap-2">
                          <span className="text-zinc-500 dark:text-zinc-400 text-xs">Totale Ordine:</span>
                          <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            € {(order.total || 0).toFixed(2)}
                          </span>
                        </p>

                        {isCustomProduct && (
                          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">
                              Metodo di Pagamento:
                            </span>
                            {order.customPaymentMethod === 'pickup_pay_now' || order.paymentChoice === 'Paga ora' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                                <span>💳</span> Ritiro in sede – Paga ora (Pagamento online: 10 €)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                                <span>🏪</span> Ritiro in sede – Paga in sede
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* BARRA AZIONI PULSANTI */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    
                    {/* CAMBIO STATO */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                        Stato:
                      </label>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${statusStyle.select}`}
                      >
                        {Object.entries(OrderStatusLabels).map(([key, label]) => (
                          <option key={key} value={key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* BOTTONI AZIONE (DOWNLOAD/FOTO + ELIMINA) */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5">
                      {isCustomProduct ? (
                        photosList.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {photosList.map((photo, pIdx) => (
                              <a
                                key={pIdx}
                                href={photo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider shadow transition-all flex items-center gap-1.5 active:scale-95"
                                title="Apri fotografia ad alta risoluzione"
                              >
                                <span>{photosList.length > 1 ? `Foto ${pIdx + 1}` : 'Vedi Foto'}</span>
                                <span className="text-[10px]">↗</span>
                              </a>
                            ))}
                          </div>
                        )
                      ) : (
                        <button 
                          onClick={() => downloadAllAsZip(order)}
                          disabled={isDownloading === order.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
                            isDownloading === order.id 
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                              : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black'
                          }`}
                        >
                          {isDownloading === order.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Download {downloadProgress}%</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span>Scarica ZIP ({photosList.length})</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* BOTTONE ELIMINA ORDINE */}
                      <button 
                        onClick={() => setOrderToDelete(order)} 
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        title="Elimina definitivamente questo ordine"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Elimina</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODALE IN-APP DI CONFERMA ELIMINAZIONE ORDINE */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 text-zinc-900 dark:text-zinc-100">
            
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/50 flex items-center justify-center text-lg shrink-0">
                ⚠
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Conferma Eliminazione Ordine</h3>
                <p className="text-xs text-red-600 dark:text-red-400/90 font-medium uppercase tracking-wider">Azione irreversibile</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Sei sicuro di voler eliminare <strong>definitivamente</strong> l'ordine selezionato? Tutti i dati e i riferimenti ai file verranno rimossi.
            </p>

            {/* Riepilogo ordine da eliminare */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">ID Ordine:</span>
                <span className="text-zinc-800 dark:text-zinc-300">{orderToDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cliente:</span>
                <span className="text-zinc-900 dark:text-white font-bold">{orderToDelete.userName} {orderToDelete.customerLastName || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Prodotto:</span>
                <span className="text-amber-600 dark:text-amber-400">{orderToDelete.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Totale:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">€ {(orderToDelete.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Bottoni azione modale */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Annulla
              </button>
              
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Eliminazione in corso...</span>
                  </>
                ) : (
                  <span>Elimina Definitivamente</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODALE GESTIONE FOTO PRODOTTI PERSONALIZZATI */}
      {showImagesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🖼️</span>
                  <h3 className="text-xl font-serif text-zinc-900 dark:text-white">
                    Modifica Link Foto Prodotti Personalizzati
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                  Incolla i link (URL) delle foto per ciascun prodotto. Le immagini si aggiorneranno istantaneamente in tutto il sito.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImagesModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              <div className="flex items-center gap-2 mb-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Persistenza Cloud Supabase Attiva</span>
              </div>
              💡 Le immagini salvate qui vengono registrate su <strong>Supabase Cloud</strong> e saranno visibili automaticamente a tutti i visitatori, sia in anteprima che sul sito pubblicato su <strong>Vercel</strong>.
              <br />
              <span className="opacity-90 mt-1 block">Puoi <strong>incollare un link</strong> (Cloudinary, Google Drive, Unsplash, ecc.) oppure cliccare su <strong>"Scegli Foto"</strong> per caricarla direttamente dal tuo dispositivo!</span>
            </div>

            <form onSubmit={handleSaveProductLinks} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {Object.keys(PRODUCT_NAMES).map((prodId) => {
                const name = PRODUCT_NAMES[prodId];
                const currentLink = productLinks[prodId] || '';
                const formatted = formatImageUrl(currentLink);
                const isUploadingThis = uploadingProdId === prodId;

                return (
                  <div 
                    key={prodId} 
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 relative">
                      <img 
                        src={formatted || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'} 
                        alt={name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover" 
                      />
                      {isUploadingThis && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                          {name}
                        </label>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 transition-colors">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={isUploadingThis || isSavingImages}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImageFile(prodId, file);
                            }}
                          />
                          <span>📁 {isUploadingThis ? 'Caricamento...' : 'Scegli Foto'}</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={currentLink}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductLinks(prev => ({
                            ...prev,
                            [prodId]: val
                          }));
                        }}
                        placeholder="Incolla qui l'URL dell'immagine (https://...)"
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isSavingImages}
                  onClick={handleResetProductLinks}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Ripristina Foto Predefinite
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSavingImages}
                    onClick={() => setShowImagesModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingImages}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingImages ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Salvataggio Cloud...</span>
                      </>
                    ) : (
                      <span>Salva Modifiche</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
