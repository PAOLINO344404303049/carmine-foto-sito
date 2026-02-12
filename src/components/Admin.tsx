
import React, { useState, useRef } from 'react';
import axios from 'axios';

interface AdminProps {
  onUploadSuccess: (url: string) => void;
  currentCount: number;
}

const Admin: React.FC<AdminProps> = ({ onUploadSuccess, currentCount }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const CLOUD_NAME = "divyx0t5b";
  const UPLOAD_PRESET = "foto";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 100 - currentCount;
    if (remaining <= 0) {
      alert("Hai raggiunto il limite massimo di 100 foto.");
      return;
    }

    setUploading(true);
    const filesToUpload = Array.from(files).slice(0, remaining);

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          formData
        );
        
        onUploadSuccess(res.data.secure_url);
      }
      alert("Caricamento completato con successo!");
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      alert("Errore durante il caricamento. Riprova.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold">Carica le tue foto</h2>
          <p className="text-gray-400 text-sm italic">Qualità massima garantita (Max 100 foto)</p>
        </div>
        <div className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase">
          {currentCount} / 100 Caricate
        </div>
      </div>

      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${uploading ? 'opacity-50' : 'hover:border-black hover:bg-white border-gray-200'}`}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Caricamento in corso...</p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-gray-400">
              <i className="fas fa-cloud-upload-alt text-2xl"></i>
            </div>
            <p className="font-bold text-sm uppercase tracking-widest">Tocca per selezionare i file</p>
            <p className="text-[10px] text-gray-400 mt-2">Supporta JPG, PNG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
