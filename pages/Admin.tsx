
import * as React from 'react';
import { useState, type FC } from 'react';
import { Order, OrderStatus, OrderStatusLabels } from '../types';
import * as JSZip from 'jszip';
import { EmailService } from '../services/email';

interface AdminProps {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  onLogout: () => void;
}

const Admin: FC<AdminProps> = ({ orders, updateStatus, deleteOrder, onLogout }) => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    updateStatus(orderId, newStatus);
    if (newStatus === OrderStatus.PRINTED) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await EmailService.sendCollectionReady(order);
        alert(`✅ Email di ritiro inviata correttamente a ${order.userEmail}`);
      }
    }
  };

  const handleDelete = (orderId: string) => {
    const isConfirmed = window.confirm("⚠ AZIONE IRREVERSIBILE\n\nSei sicuro di voler eliminare DEFINITIVAMENTE l'ordine?");
    if (isConfirmed) {
      deleteOrder(orderId);
      alert("✅ Ordine eliminato.");
    }
  };

  const downloadAllAsZip = async (order: Order) => {
    if (order.photos.length === 0) return;
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
    } catch (err: any) {
      alert(`Errore ZIP: ${err.message}`);
    } finally {
      setIsDownloading(null);
      setDownloadProgress(0);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT: return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900';
      case OrderStatus.PAID: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900';
      case OrderStatus.PRINTED: return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900';
      case OrderStatus.COLLECTED: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700';
    }
  };

  return (
    <div className="py-12 px-6 bg-gray-50 dark:bg-zinc-950 transition-colors min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-black dark:text-white">Area Amministratore</h1>
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">Dashboard ordini — Carmine Felice Napolitano</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-red-700 transition-colors"
          >
            Esci Sessione
          </button>
        </header>

        <div className="flex items-center space-x-2 overflow-x-auto pb-6 scrollbar-hide mb-8">
            <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${filter === 'all' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-gray-400 dark:text-gray-500'}`}>TUTTI ({orders.length})</button>
            {Object.values(OrderStatus).map(status => (
              <button key={status} onClick={() => setFilter(status)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${filter === status ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-900 text-gray-400 dark:text-gray-500'}`}>
                {OrderStatusLabels[status].toUpperCase()} ({orders.filter(o => o.status === status).length})
              </button>
            ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-24 rounded-[40px] text-center shadow-sm border border-gray-100 dark:border-zinc-800">
            <i className="fas fa-check-circle text-5xl mb-6 text-green-100 dark:text-green-950/30"></i>
            <h3 className="text-2xl font-serif mb-3 dark:text-white">Nessun ordine</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden">
                <div className="md:w-1/4">
                  <span className="text-[9px] font-bold text-gray-300 dark:text-zinc-600 uppercase block mb-1">ID Ordine: {order.id}</span>
                  <h3 className="font-bold text-xl text-black dark:text-white leading-tight mb-1 uppercase">{order.userName}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{order.userEmail}</p>
                </div>

                <div className="md:w-1/4 md:border-l md:border-gray-50 dark:md:border-zinc-800 md:pl-8">
                   <p className="font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-1">{order.packageName}</p>
                   <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">
                     <i className="fas fa-images mr-2"></i> {order.photos.length} FILE
                   </p>
                </div>

                <div className="md:w-2/4 flex flex-col sm:flex-row items-center justify-end gap-4">
                   <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-pointer border-2 bg-white dark:bg-zinc-800 transition-colors ${getStatusBadgeClass(order.status)}`}
                    >
                      {Object.entries(OrderStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                   </select>
                   
                   <button 
                      onClick={() => downloadAllAsZip(order)}
                      disabled={isDownloading === order.id}
                      className={`w-full sm:w-auto px-10 py-4 rounded-2xl transition-all flex items-center justify-center font-bold text-[10px] uppercase tracking-widest ${isDownloading === order.id ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-xl'}`}
                    >
                      {isDownloading === order.id ? <><i className="fas fa-spinner fa-spin mr-3"></i>{downloadProgress}%</> : 'SCARICA ZIP'}
                   </button>

                   <button onClick={() => handleDelete(order.id)} className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white dark:hover:bg-red-500 transition-all">
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