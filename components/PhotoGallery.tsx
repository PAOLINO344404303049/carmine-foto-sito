
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PhotoGallery: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [refreshKey]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data, error: supabaseError } = await supabase.storage.from('photos').list();
      
      if (supabaseError) throw supabaseError;

      if (data) {
        const urls = data.map(file => {
          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(file.name);
          return publicUrl;
        });
        setPhotos(urls);
      }
    } catch (err: any) {
      console.warn("Gallery Error: Tenant config non valida o progetto sospeso.", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-xs font-bold uppercase tracking-widest text-gray-400">Caricamento galleria...</div>;

  if (error) return (
    <div className="bg-gray-50 p-10 rounded-3xl text-center border border-dashed border-gray-200">
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">
        Il servizio di anteprima cloud è momentaneamente non disponibile.<br/>Le tue foto caricate rimangono comunque al sicuro per la stampa.
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((url, idx) => (
        <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative">
          <img src={url} alt="Uploaded" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
        </div>
      ))}
      {photos.length === 0 && (
        <div className="col-span-full py-20 text-center text-gray-400 italic">
          Nessuna foto visualizzata.
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
