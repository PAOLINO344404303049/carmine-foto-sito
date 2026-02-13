
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
    // Log richiesto per debug
    console.log("Uploading file:", file);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "fotocs");

    const response = await fetch("https://api.cloudinary.com/v1_1/divyx0t5b/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    // Log richiesto per debug
    console.log("Cloudinary response:", data);

    if (!response.ok) {
      console.error("Errore upload Cloudinary:", data);
      throw new Error(data.error?.message || "Errore nel caricamento delle immagini");
    }

    return data.secure_url;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedPackage) return;
    
    const newFiles = Array.from(files);
    const totalAllowed = selectedPackage.count;
    const currentCount = localFiles.length;
    const remaining = Math.max(0, totalAllowed - currentCount);
    
    const filesToAdd = newFiles.slice(0, remaining);
    
    if (remaining === 0) {
      alert(`Hai già raggiunto il limite di ${totalAllowed} foto.`);
      return;
    }

    setLocalFiles(prev => [...prev, ...filesToAdd]);
    
    // Generazione anteprime locali
    const newPreviews: PhotoFile[] = filesToAdd.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setUploadedPhotosPreview(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Inizio processo di invio ordine...");

    if (!selectedPackage || localFiles.length === 0) {
      console.warn("Dati mancanti per l'invio (pacchetto o file).");
      return;
    }
    
    // Blocca il bottone impostando isUploading a true
    setIsUploading(true);

    try {
      const uploadedUrls: PhotoFile[] = [];
      
      // Upload Cloudinary sequenziale per massima stabilità
      for (const file of localFiles) {
        const secureUrl = await uploadToCloudinary(file);
        uploadedUrls.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          url: secureUrl
        });
      }

      console.log("Tutti gli upload Cloudinary completati con successo.");

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

      // Salvataggio su Supabase
      const savedOrder = await addOrder(newOrderData);
      
      // Successo: Reset del form
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLocalFiles([]);
      setUploadedPhotosPreview([]);
      
      const finalId = savedOrder?.id || newOrderData.id;
      setCurrentOrderId(finalId);
      setShowCheckout(true);
      
      alert("Foto caricate e ordine salvato con successo!");
      
      // Invio email di conferma (senza bloccare la UI)
      EmailService.sendOrderConfirmation({...newOrderData, id: finalId}).catch(err => console.error("Email service error:", err));
      
    } catch (error: any) {
      console.error("ERRORE CRITICO NEL FLUSSO DI INVIO:", error);
      alert("Errore durante l'operazione: " + (error.message || "Verifica la connessione e riprova."));
    } finally {
      // Sblocca il bottone
      setIsUploading(false);
    }
  };

  const finalizePayment = async () => {
    if (!currentOrderId) return;

    const paymentWindow = window.open(SUMUP_PAY_LINK, '_blank');
    setIsFinalizing(true);

    try {
      // Aggiorniamo lo status identificato dall'ID reale restituito da Supabase
      await updateStatus(currentOrderId, OrderStatus.PAID);

      if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
        window.open(SUMUP_PAY_LINK, '_blank');
      }
      
      setShowCheckout(false);
      setCurrentOrderId(null);
      alert("Grazie! Il tuo ordine è stato ricevuto ed è ora in fase di elaborazione.");
    } catch (error) {
      console.error("Errore aggiornamento pagamento:", error);
    } finally {
      setIsFinalizing(false);
    }
  };

  const currentStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT: return 'bg-orange-100 text-orange-700';
      case OrderStatus.PAID: return 'bg-green-100 text-green-700';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.PRINTED: return 'bg-purple-100 text-purple-700';
      case OrderStatus.COLLECTED: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRemovePhoto = (id: string, index: number) => {
    setUploadedPhotosPreview(prev => prev.filter(p => p.id !== id));
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="py-12 px-4 md:px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-serif mb-8 text-black">Il tuo Ordine</h2>
            {!selectedPackage ? (
              <div className="space-y-6">
                <p className="text-gray-500 mb-6 font-bold uppercase tracking-widest text-[10px]">1. Seleziona il pacchetto</p>
                <div className="grid grid-cols-1 gap-6">
                  {PRINT_PACKAGES.map(pkg => (
                    <button 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className="p-8 border-2 border-gray-50 rounded-3xl text-left hover:border-black hover:shadow-xl transition-all bg-gray-50/50"
                    >
                      <h4 className="font-bold text-lg">{pkg.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{pkg.count} foto professionali</p>
                      <p className="text-2xl font-serif font-bold mt-4">€{pkg.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : !showCheckout ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg md:text-xl uppercase tracking-tighter">{selectedPackage.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      {uploadedPhotosPreview.length} / {selectedPackage.count} foto selezionate
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[40px] p-8 md:p-16 text-center cursor-pointer transition-all ${isUploading ? 'bg-gray-100 opacity-70 pointer-events-none' : 'hover:bg-gray-50/80 hover:border-black bg-gray-50/30 border-gray-200'}`}
                >
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Invio in corso...</p>
                    </div>
                  ) : (
                    <>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-black border border-gray-100">
                          <i className="fas fa-upload text-xl md:text-2xl"></i>
                        </div>
                        <h4 className="font-bold text-base md:text-lg mb-2 text-black uppercase tracking-widest">Seleziona i tuoi file</h4>
                        <p className="text-xs text-gray-400 font-medium">Tocca per selezionare le immagini (JPG/PNG).</p>
                    </>
                  )}
                </div>

                {uploadedPhotosPreview.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {uploadedPhotosPreview.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                        {!isUploading && (
                          <button onClick={(e) => { e.stopPropagation(); handleRemovePhoto(photo.id, index); }} className="absolute top-1 right-1 bg-black/80 text-white w-6 h-6 rounded-full shadow-md flex items-center justify-center">
                            <i className="fas fa-times text-[8px]"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uploadedPhotosPreview.length > 0 && (
                  <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-xl md:text-2xl font-serif font-bold text-black italic">Totale: €{selectedPackage.price}</p>
                    <button 
                      onClick={handleSubmit} 
                      disabled={isUploading}
                      className="w-full sm:w-auto px-12 py-5 bg-black text-white rounded-full font-bold hover:bg-gray-800 shadow-2xl transition-all uppercase tracking-[0.2em] text-[10px] disabled:opacity-50"
                    >
                      {isUploading ? 'Attendere...' : 'Invia Foto e Procedi'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 py-4">
                <div className="text-center mb-10">
                   <h3 className="text-2xl md:text-3xl font-serif mb-4">Ordine Registrato!</h3>
                   <p className="text-gray-500 italic text-sm">Il tuo ordine è stato correttamente salvato nel nostro database.</p>
                </div>
                
                <div className="max-w-md mx-auto bg-gray-50 p-8 md:p-12 rounded-[50px] border border-gray-100 text-center shadow-lg">
                   <div className="w-20 h-20 bg-black text-white rounded-[28px] flex items-center justify-center mx-auto mb-8 text-3xl shadow-xl">
                      <i className="fas fa-shield-alt"></i>
                   </div>
                   <h4 className="font-bold text-lg mb-4 uppercase tracking-widest">Pagamento SumUp</h4>
                   <p className="text-[10px] text-gray-400 mb-10 leading-relaxed font-medium uppercase tracking-widest leading-loose">
                      Effettua ora il pagamento sicuro per avviare la stampa dei tuoi ricordi.
                   </p>
                   <button 
                    onClick={finalizePayment}
                    disabled={isFinalizing}
                    className="w-full py-5 bg-black text-white rounded-full font-bold hover:bg-gray-800 shadow-2xl transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                      {isFinalizing ? 'Elaborazione...' : 'Paga ora online'}
                      {!isFinalizing && <i className="fas fa-external-link-alt"></i>}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-16 h-16 bg-black text-white rounded-[20px] flex items-center justify-center text-2xl font-serif shadow-xl">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-xl text-black leading-none">{user.name}</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">Area Personale</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full py-4 border border-gray-100 text-gray-400 hover:text-red-600 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all">
               LOGOUT
            </button>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
            <h2 className="text-lg font-serif mb-8 text-black border-b border-gray-50 pb-5">Storico Ordini</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest text-center py-10 italic">Nessun ordine presente.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">ID: {order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${currentStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-gray-900 mb-1">{order.packageName}</p>
                    <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">{order.photos.length} Foto &bull; €{order.total}</p>
                    <p className="text-[7px] text-gray-300 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
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
