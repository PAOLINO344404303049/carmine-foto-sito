
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { supabase } from './supabase';

const AUTH_KEY = 'studio_auth_v2';
const ADMIN_EMAIL = "carminephotography0@gmail.com";
const ADMIN_PASS = "Carmine01.";

export const useStore = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Carica gli ordini da Supabase quando l'utente è loggato
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    
    let query = supabase.from('orders').select('*');
    
    // Se non è admin, filtra per la propria email
    if (user.role !== 'admin') {
      query = query.eq('user_email', user.email);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      const mappedOrders: Order[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        userName: item.customer_name,
        userEmail: item.user_email,
        packageId: item.package_id,
        packageName: item.package_name,
        photos: item.photo_urls.map((url: string, index: number) => ({
          id: `photo-${index}`,
          name: `Foto ${index + 1}`,
          url: url,
          size: 0
        })),
        status: item.status as OrderStatus,
        paymentMethod: item.payment_method,
        createdAt: item.created_at,
        total: item.total
      }));
      setOrders(mappedOrders);
    }
    setLoading(false);
  };

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
    setOrders([]);
  };

  const addOrder = async (order: Order) => {
    const { error } = await supabase.from('orders').insert([{
      id: order.id,
      user_id: order.userId,
      customer_name: order.userName,
      user_email: order.userEmail,
      package_id: order.packageId,
      package_name: order.packageName,
      photo_urls: order.photos.map(p => p.url),
      status: order.status,
      payment_method: order.paymentMethod,
      total: order.total,
      created_at: new Date().toISOString()
    }]);

    if (!error) {
      await fetchOrders();
    } else {
      console.error("Errore salvataggio Supabase:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  return {
    user,
    orders,
    loading,
    login,
    logout,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    fetchOrders
  };
};
