
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Packages from './pages/Packages';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/Admin';
import { useStore } from './services/store';

const App: React.FC = () => {
  const { user, orders, login, logout, addOrder, updateOrderStatus, deleteOrder } = useStore();
  const [currentPage, setCurrentPage] = useState('home');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={setCurrentPage} />;
      case 'portfolio':
        return <Portfolio navigate={setCurrentPage} />;
      case 'packages':
        return <Packages navigate={setCurrentPage} user={user} />;
      case 'contact':
        return <Contact />;
      case 'login':
        return <Auth mode="login" navigate={setCurrentPage} onLogin={login} />;
      case 'register':
        return <Auth mode="register" navigate={setCurrentPage} onLogin={login} />;
      case 'dashboard':
        return user ? (
          <Dashboard 
            user={user} 
            orders={orders.filter(o => o.userId === user.id)} 
            addOrder={addOrder} 
            navigate={setCurrentPage} 
            onLogout={() => { logout(); setCurrentPage('home'); }} 
          />
        ) : (
          <Auth mode="login" navigate={setCurrentPage} onLogin={login} />
        );
      case 'admin':
        return user?.role === 'admin' ? (
          <AdminPage 
            orders={orders} 
            updateStatus={updateOrderStatus} 
            deleteOrder={deleteOrder} 
            onLogout={() => { logout(); setCurrentPage('home'); }} 
          />
        ) : (
          <Auth mode="login" navigate={setCurrentPage} onLogin={login} />
        );
      default:
        return <Home navigate={setCurrentPage} />;
    }
  };

  return (
    <Layout user={user} onLogout={() => { logout(); setCurrentPage('home'); }} navigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
