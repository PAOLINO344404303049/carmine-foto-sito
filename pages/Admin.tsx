
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import JSZip from 'jszip';
import { EmailService } from '../services/email';

interface AdminProps {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ orders, updateStatus, deleteOrder, onLogout }) => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    updateStatus(orderId, newStatus);
    
    // Se lo stato è "Stampato" (Pronto per il ritiro), invia email
    if (newStatus === OrderStatus.PRINTED) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await EmailService.sendCollectionReady(order);
        alert(`✅ Email di ritiro inviata correttamente a ${order.userEmail}`);
      }
    }
  };

  const handleDelete = (orderId: string) => {
    const isConfirmed = window.confirm(
      "⚠ AZIONE IRREVERSIBILE\n\nSei sicuro di voler eliminare DEFINITIVAMENTE l'ordine " + orderId + "?"
    );
    if (isConfirmed) {
      deleteOrder(orderId);
      alert("✅ Ordine eliminato.");
    }
  };

  const downloadAllAsZip = async (order: Order) => {
    if (order.photos.length === 0) {
      alert("L'ordine non contiene foto.");
      return;
    }

    setIsDownloading(order.id);
    setDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${order.id}_${order.userName.replace(/\s+/g, '_')}`);
      
      let processedCount = 0;
      for (let i = 0; i < order.photos.length; i++) {
        const photo = order.photos[i];
        try {
          const response = await fetch(photo.url, { cache: 'no-cache' });
          if (!response.ok) throw new Error("Status not OK");
          const blob = await response.blob();
          folder?.file(`${String(i + 1).padStart(3, '0')}_${photo.name}`, blob);
        } catch (err) {
          console.error(err);
          folder?.file(`${photo.name}_ERRORE.txt`, "File non disponibile.");
        }
        processedCount++;
        setDownloadProgress(Math.round((processedCount / order.photos.length) * 100));
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${order.userName.replace(/\s+/g, '_')}_${order.id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(`Errore ZIP: ${err.message}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrderStatus.PRINTED: return 'bg-purple-100 text-purple-700 border-purple-200';
      case OrderStatus.COLLECTED: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="py-12 px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-black">Area Amministratore</h1>
            <p className="text-gray-500 italic text-sm">Dashboard ordini — Carmine Felice Napolitano</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-red-700 transition-colors"
          >
            Esci Sessione
          </button>
        </header>

        <div className="flex items-center space-x-2 overflow-x-auto pb-6 scrollbar-hide mb-8">
            <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${filter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>TUTTI ({orders.length})</button>
            {Object.values(OrderStatus).map(status => (
              <button key={status} onClick={() => setFilter(status)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${filter === status ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>
                {status.toUpperCase()} ({orders.filter(o => o.status === status).length})
              </button>
            ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white p-24 rounded-[40px] text-center shadow-sm border border-gray-100">
            <i className="fas fa-check-circle text-5xl mb-6 text-green-100"></i>
            <h3 className="text-2xl font-serif mb-3">Nessun ordine</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden">
                <div className="md:w-1/4">
                  <span className="text-[9px] font-bold text-gray-300 uppercase block mb-1">Order ID: {order.id}</span>
                  <h3 className="font-bold text-xl text-black leading-tight mb-1 uppercase">{order.userName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.userEmail}</p>
                </div>

                <div className="md:w-1/4 md:border-l md:border-gray-50 md:pl-8">
                   <p className="font-bold text-black text-xs uppercase tracking-widest mb-1">{order.packageName}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                     <i className="fas fa-images mr-2"></i> {order.photos.length} FILE
                   </p>
                </div>

                <div className="md:w-2/4 flex flex-col sm:flex-row items-center justify-end gap-4">
                   <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-pointer border-2 ${getStatusBadgeClass(order.status)}`}
                    >
                      {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   
                   <button 
                      onClick={() => downloadAllAsZip(order)}
                      disabled={isDownloading === order.id}
                      className={`w-full sm:w-auto px-10 py-4 rounded-2xl transition-all flex items-center justify-center font-bold text-[10px] uppercase tracking-widest ${isDownloading === order.id ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800 shadow-xl'}`}
                    >
                      {isDownloading === order.id ? <><i className="fas fa-spinner fa-spin mr-3"></i>{downloadProgress}%</> : 'SCARICA ZIP'}
                   </button>

                   <button onClick={() => handleDelete(order.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                      <i className="fas fa-trash-alt"></i>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
