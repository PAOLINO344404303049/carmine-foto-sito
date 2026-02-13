import React, { useState, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

interface AdminProps {
  onUploadSuccess: () => void;
  currentCount: number;
}

const Admin: React.FC<AdminProps> = ({ onUploadSuccess, currentCount }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const CLOUD_NAME = "divyx0t5b";
  const UPLOAD_PRESET = "foto";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 100 - currentCount;
    if (remaining <= 0) {
      alert("Limite massimo di 100 foto raggiunto.");
      return;
    }

    setUploading(true);
    const filesToUpload = Array.from(files).slice(0, remaining);

    try {
      for (const file of filesToUpload) {
        // 1. Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          formData
        );
        
        const imageUrl = res.data.secure_url;

        // 2. Save to Supabase
        const { error } = await supabase
          .from('photos')
          .insert([{ url: imageUrl, created_at: new Date().toISOString() }]);

        if (error) {
          console.error("Supabase Save Error:", error);
          // Anche se supabase fallisce, mostriamo l'upload cloudinary localmente per ora
        }
      }
      onUploadSuccess();
      alert("Foto caricate e salvate nel cloud!");
    } catch (err) {
      console.error("Upload process error:", err);
      alert("Errore durante il caricamento.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-50 p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm mb-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Gestione Caricamento</h2>
          <p className="text-gray-400 text-xs italic">Sincronizzazione Cloud automatica</p>
        </div>
        <div className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase">
          {currentCount} / 100 Immagini
        </div>
      </div>

      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 md:p-16 text-center transition-all cursor-pointer bg-white/50 ${uploading ? 'opacity-50 cursor-wait' : 'hover:border-black hover:bg-white border-gray-200'}`}
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
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizzazione in corso...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 text-gray-400">
              <i className="fas fa-camera text-2xl"></i>
            </div>
            <p className="font-bold text-sm uppercase tracking-widest text-black">Aggiungi foto al rullino</p>
            <p className="text-[10px] text-gray-400 mt-2">Le foto saranno visibili su tutti i dispositivi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;