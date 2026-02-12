
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Admin: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [count, setCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      const { data, error } = await supabase.storage.from('photos').list();
      if (error) throw error;
      if (data) setCount(data.length);
    } catch (err) {
      console.warn("Supabase Fetch Error: Probabile configurazione tenant errata.", err);
      // Fallback: non bloccare la UI
      setCount(0);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const files = Array.from(event.target.files);
      const remaining = 100 - count;

      if (remaining <= 0) {
        alert("Limite di 100 foto raggiunto!");
        return;
      }

      const filesToUpload = files.slice(0, remaining);

      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }

      alert("Caricamento completato!");
      fetchCount();
      onUploadSuccess();
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert("Errore nel caricamento: verifica la configurazione di Supabase o riprova più tardi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold">Gestione Stampe</h2>
          <p className="text-sm text-gray-500">Carica le tue foto per la stampa (Max 100)</p>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-full">
          <span className="text-xs font-bold uppercase tracking-widest">{count} / 100 Foto</span>
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all ${uploading ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50 hover:border-black border-gray-200'}`}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-[10px] uppercase tracking-widest">Caricamento in corso...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <i className="fas fa-plus text-gray-500"></i>
            </div>
            <p className="font-bold text-sm uppercase tracking-widest">Tocca per aggiungere foto</p>
            <p className="text-xs text-gray-400 mt-2">Caricamento protetto su cloud</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
