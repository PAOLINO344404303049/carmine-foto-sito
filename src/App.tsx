
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Admin from './components/Admin';
import PhotoGallery from './components/PhotoGallery';
import Payment from './components/Payment';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>(() => {
    const saved = localStorage.getItem('uploaded_photos_urls');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('uploaded_photos_urls', JSON.stringify(photos));
  }, [photos]);

  const handleNewPhoto = (url: string) => {
    setPhotos(prev => [...prev, url]);
  };

  return (
    <Layout>
      <div className="animate-fade-in-up">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Servizio Stampa Foto</h1>
          <div className="w-20 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base px-4">
            Trasforma i tuoi pixel in ricordi tangibili di alta qualità. Carica le tue foto, paga in sicurezza e ritira il tuo pacchetto in studio.
          </p>
        </div>

        <Admin onUploadSuccess={handleNewPhoto} currentCount={photos.length} />
        
        <PhotoGallery photos={photos} />
        
        <Payment />
      </div>
    </Layout>
  );
};

export default App;
