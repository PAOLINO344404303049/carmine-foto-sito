import React, { useState } from 'react';
import Layout from './components/Layout';
import Admin from './components/Admin';
import PhotoGallery from './components/PhotoGallery';
import Payment from './components/Payment';

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="text-center mb-16 md:mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400 block mb-6">Stampa Professionale</span>
          <h1 className="text-4xl md:text-7xl font-serif mb-6 italic tracking-tight">Cattura il momento,<br/>noi lo rendiamo eterno.</h1>
          <div className="w-24 h-1 bg-black mx-auto mb-10"></div>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-lg px-4 leading-relaxed font-light">
            Benvenuto nel nostro portale di stampa. Carica le tue foto preferite, 
            sincronizzale nel nostro cloud e procedi al pagamento per ricevere stampe di qualità premium.
          </p>
        </div>

        <Admin onUploadSuccess={handleRefresh} currentCount={photoCount} />
        
        <PhotoGallery refreshKey={refreshKey} onCountUpdate={setPhotoCount} />
        
        <Payment />
      </div>
    </Layout>
  );
};

export default App;