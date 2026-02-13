import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface PhotoGalleryProps {
  refreshKey: number;
  onCountUpdate: (count: number) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ refreshKey, onCountUpdate }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [refreshKey]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
      onCountUpdate(data?.length || 0);
    } catch (err) {
      console.error("Error fetching photos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-4 text-gray-400">Caricamento galleria cloud...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-xl font-serif font-bold italic">Rullino Cloud</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{photos.length} file sincronizzati</span>
      </div>
      
      {photos.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
          <p className="text-gray-300 italic text-sm">Nessuna foto nel cloud. Inizia a caricarne qualcuna!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
          {photos.map((photo, index) => (
            <div key={photo.id || index} className="aspect-square rounded-2xl overflow-hidden shadow-md border border-gray-100 group relative">
              <img 
                src={photo.url} 
                alt={`Photo ${index}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;