
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';

const ORDERS_KEY = 'studio_orders_v2';
const AUTH_KEY = 'studio_auth_v2';

const ADMIN_EMAIL = "carminephotography0@gmail.com";
const ADMIN_PASS = "Carmine01.";

export const useStore = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const login = (email: string, pass: string) => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      const adminUser: User = {
        id: 'admin_primary',
        name: 'Carmine Felice Napolitano',
        email: ADMIN_EMAIL,
        role: 'admin',
        mustChangePassword: false
      };
      setUser(adminUser);
      localStorage.setItem(AUTH_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role: 'client',
      mustChangePassword: false
    };

    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const addOrder = (order: Order) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  };

  /**
   * ELIMINAZIONE REALE E PERMANENTE
   * Questo metodo agisce come un database reale rimuovendo la chiave dal localStorage.
   */
  const deleteOrder = (orderId: string) => {
    // 1. Identifica l'ordine
    const orderToDelete = orders.find(o => o.id === orderId);
    
    if (orderToDelete) {
      // 2. Elimina i file fisici (filesystem virtuale del browser / Blob cache)
      orderToDelete.photos.forEach(photo => {
        if (photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
      });
    }

    // 3. Rimuovi l'ordine dall'array in memoria
    const remainingOrders = orders.filter(o => o.id !== orderId);
    
    // 4. Aggiorna lo stato per il re-render immediato della UI
    setOrders(remainingOrders);
    
    // 5. Persisti la modifica nel database locale (localStorage)
    // Questo garantisce che al refresh l'ordine sia scomparso per sempre.
    localStorage.setItem(ORDERS_KEY, JSON.stringify(remainingOrders));
    
    console.log(`[STORAGE] Ordine ${orderId} rimosso permanentemente.`);
    return { success: true };
  };

  return {
    user,
    orders,
    login,
    logout,
    addOrder,
    updateOrderStatus,
    deleteOrder
  };
};
