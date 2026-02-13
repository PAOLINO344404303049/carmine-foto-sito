
import * as React from 'react';
import { useState, useRef, type FC } from 'react';
import { User, PhotoPackage, PhotoFile, Order, OrderStatus, PaymentMethod } from '../types';
import { PRINT_PACKAGES, SUMUP_PAY_LINK } from '../constants';
import { EmailService } from '../services/email';

interface DashboardProps {
  user: User;
  orders: Order[];
  addOrder: (order: Order) => Promise<any>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  navigate: (page: string) => void;
  onLogout: () => void;
}

const Dashboard: FC<DashboardProps> = ({ user, orders, addOrder, updateStatus, navigate, onLogout }) => {
  const [selectedPackage, setSelectedPackage] = useState<PhotoPackage | null>(PRINT_PACKAGES.length === 1 ? PRINT_PACKAGES[0] : null);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [uploadedPhotosPreview, setUploadedPhotosPreview] = useState<PhotoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "fotocs");

    const response = await fetch("https://api.cloudinary.com/v1_1/divyx0t5b/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Errore upload.");
    return data.secure_url;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedPackage) return;
    const newFiles = Array.from(files) as File[];
    const totalAllowed = selectedPackage.count;
    const currentCount = localFiles.length;
    const remaining = Math.max(0, totalAllowed - currentCount);
    const filesToAdd = newFiles.slice(0, remaining);
    
    if (newFiles.length > remaining && remaining > 0) alert(`Solo ${remaining} foto extra.`);
    else if (remaining === 0) { alert(`Limite raggiunto.`); return; }

    setLocalFiles(prev => [...prev, ...filesToAdd]);
    const newPreviews: PhotoFile[] = filesToAdd.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    setUploadedPhotosPreview(prev => [...prev, ...newPreviews]);
  };

  const resetForm = () => {
    setLocalFiles([]);
    setUploadedPhotosPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPackage || localFiles.length === 0) return;
    setIsUploading(true);

    try {
      const uploadedUrls: PhotoFile[] = [];
      for (const file of localFiles) {
        const secureUrl = await uploadToCloudinary(file);
        uploadedUrls.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          url: secureUrl
        });
      }

      const newOrderData: Order = {
        id: `TEMP-${Date.now()}`, 
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        photos: uploadedUrls,
        status: OrderStatus.PENDING_PAYMENT, 
        paymentMethod: PaymentMethod.ONLINE_SUMUP,
        createdAt: new Date().toISOString(),
        total: selectedPackage.price
      };

      const savedOrder = await addOrder(newOrderData);
      setCurrentOrderId(savedOrder?.id || newOrderData.id);
      resetForm();
      setShowCheckout(true);
      EmailService.sendOrderConfirmation({...newOrderData, id: currentOrderId || ''}).catch(err => console.error(err));
    } catch (error: any) {
      alert("Errore: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const finalizePayment = async () => {
    if (!currentOrderId) return;
    window.open(SUMUP_PAY_LINK, '_blank');
    setIsFinalizing(true);
    try {
      await updateStatus(currentOrderId, OrderStatus.PAID);
      setShowCheckout(false);
      setCurrentOrderId(null);
      alert("Pagamento registrato!");
    } catch (error) {
      alert("Errore pagamento.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const currentStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT: return 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400';
      case OrderStatus.PAID: return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case OrderStatus.PRINTED: return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
      case OrderStatus.COLLECTED: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400';
    }
  };

  const handleRemovePhoto = (id: string, index: number) => {
    setUploadedPhotosPreview(prev => prev.filter(p => p.id !== id));
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="py-12 px-4 md:px-6 bg-gray-50 dark:bg-zinc-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-6 md:p-12 rounded-[40px] shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-2xl md:text-3xl font-serif mb-8 text-black dark:text-white italic">Il tuo Ordine</h2>
            {!selectedPackage ? (
              <div className="space-y-6">
                <p className="text-gray-500 dark:text-gray-400 mb-6 font-bold uppercase tracking-widest text-[10px]">1. Seleziona il pacchetto</p>
                <div className="grid grid-cols-1 gap-6">
                  {PRINT_PACKAGES.map(pkg => (
                    <button 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className="p-8 border-2 border-gray-50 dark:border-zinc-800 rounded-3xl text-left hover:border-black dark:hover:border-white transition-all bg-gray-50 dark:bg-zinc-800/50"
                    >
                      <h4 className="font-bold text-lg dark:text-white">{pkg.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{pkg.count} foto professionali</p>
                      <p className="text-2xl font-serif font-bold mt-4 dark:text-white">€{pkg.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : !showCheckout ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg md:text-xl uppercase tracking-tighter italic dark:text-white">{selectedPackage.name}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {uploadedPhotosPreview.length} / {selectedPackage.count} foto caricate
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[40px] p-8 md:p-16 text-center cursor-pointer transition-all ${isUploading ? 'bg-gray-100 dark:bg-zinc-800 opacity-70 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-black dark:hover:border-white bg-gray-50/30 dark:bg-zinc-800/20 border-gray-200 dark:border-zinc-700'}`}
                >
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold uppercase tracking-[0.2em] text-[10px] dark:text-white">Caricamento in corso...</p>
                    </div>
                  ) : (
                    <>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-black dark:text-white border border-gray-100 dark:border-zinc-700">
                          <i className="fas fa-upload text-xl md:text-2xl"></i>
                        </div>
                        <h4 className="font-bold text-base md:text-lg mb-2 text-black dark:text-white uppercase tracking-widest">Scegli le tue foto</h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium italic">Seleziona i file dal tuo dispositivo</p>
                    </>
                  )}
                </div>

                {uploadedPhotosPreview.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {uploadedPhotosPreview.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                        {!isUploading && (
                          <button onClick={(e) => { e.stopPropagation(); handleRemovePhoto(photo.id, index); }} className="absolute top-1 right-1 bg-black/80 dark:bg-white/80 text-white dark:text-black w-6 h-6 rounded-full shadow-md flex items-center justify-center">
                            <i className="fas fa-times text-[8px]"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uploadedPhotosPreview.length > 0 && (
                  <div className="pt-8 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-xl md:text-2xl font-serif font-bold text-black dark:text-white italic">Prezzo: €{selectedPackage.price}</p>
                    <button 
                      onClick={handleSubmit} 
                      disabled={isUploading}
                      className="w-full sm:w-auto px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 shadow-2xl transition-all uppercase tracking-[0.2em] text-[10px] disabled:opacity-50"
                    >
                      {isUploading ? 'Salvataggio...' : 'Conferma e procedi'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 py-4">
                <div className="text-center mb-10">
                   <h3 className="text-2xl md:text-3xl font-serif mb-4 italic dark:text-white">Ordine Ricevuto!</h3>
                   <p className="text-gray-500 dark:text-gray-400 italic text-sm">Abbiamo salvato correttamente le tue foto.</p>
                </div>
                
                <div className="max-w-md mx-auto bg-gray-50 dark:bg-zinc-800 p-8 md:p-12 rounded-[50px] border border-gray-100 dark:border-zinc-700 text-center shadow-lg">
                   <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-[28px] flex items-center justify-center mx-auto mb-8 text-3xl shadow-xl">
                      <i className="fas fa-credit-card"></i>
                   </div>
                   <h4 className="font-bold text-lg mb-4 uppercase tracking-widest italic dark:text-white">Pagamento sicuro</h4>
                   <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-10 leading-relaxed font-bold uppercase tracking-widest leading-loose">
                      Completa l'operazione con SumUp per avviare la stampa.
                   </p>
                   <button 
                    onClick={finalizePayment}
                    disabled={isFinalizing}
                    className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 shadow-2xl transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                      {isFinalizing ? 'Attendi...' : 'Paga ora online'}
                      {!isFinalizing && <i className="fas fa-external-link-alt"></i>}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-[20px] flex items-center justify-center text-2xl font-serif shadow-xl italic">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-xl text-black dark:text-white leading-none italic">{user.name}</h3>
                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2">Profilo Attivo</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full py-4 border border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all">
               CHIUDI SESSIONE
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-serif mb-8 text-black dark:text-white border-b border-gray-50 dark:border-zinc-800 pb-5 italic">I tuoi Ordini</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-[9px] font-bold uppercase tracking-widest text-center py-10 italic">Ancora nessun ordine.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-5 border border-gray-100 dark:border-zinc-800 rounded-2xl bg-gray-50 dark:bg-zinc-800/50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] font-bold text-gray-300 dark:text-zinc-600 uppercase tracking-widest">ID: {order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${currentStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white mb-1 italic">{order.packageName}</p>
                    <p className="text-[8px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">{order.photos.length} Foto &bull; €{order.total}</p>
                    <p className="text-[7px] text-gray-300 dark:text-zinc-600 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;