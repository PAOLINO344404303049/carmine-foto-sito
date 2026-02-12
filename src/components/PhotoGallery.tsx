
import React from 'react';

const PhotoGallery: React.FC<{ photos: string[] }> = ({ photos }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-xl font-serif font-bold italic">Le tue immagini</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{photos.length} file pronti</span>
      </div>
      
      {photos.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
          <p className="text-gray-300 italic text-sm">Nessuna foto caricata ancora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((url, index) => (
            <div key={index} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative">
              <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
