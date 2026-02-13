
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus, PaymentMethod } from '../types';
import { supabase } from './supabase';

const AUTH_KEY = 'studio_auth_v2';
const ADMIN_EMAIL = "carminephotography0@gmail.com";
const ADMIN_PASS = "Carmine01.";

/**
 * Definizione esplicita dell'interfaccia per gli ordini su Supabase
 * Allineata alle richieste del backend.
 */
interface SupabaseOrder {
  id?: string;
  customer_name: string;
  customer_email: string;
  package: string;
  photo_urls: string[];
  status: string;
  created_at?: string;
  user_id?: string;
  payment_method?: string;
  total?: number;
}

export const useStore = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      let query = supabase.from('orders').select('*');
      
      // Filtro per email per garantire visibilità su qualsiasi dispositivo
      if (user.role !== 'admin') {
        query = query.eq('customer_email', user.email);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        const mappedOrders: Order[] = (data as SupabaseOrder[]).map((item: SupabaseOrder) => ({
          id: item.id || '',
          userId: item.user_id || '',
          userName: item.customer_name,
          userEmail: item.customer_email,
          packageId: item.package, 
          packageName: item.package,
          photos: (item.photo_urls || []).map((url: string, index: number) => ({
            id: `photo-${index}`,
            name: `Foto ${index + 1}`,
            url: url,
            size: 0
          })),
          status: item.status as OrderStatus,
          paymentMethod: (item.payment_method as PaymentMethod) || PaymentMethod.ONLINE_SUMUP,
          createdAt: item.created_at || new Date().toISOString(),
          total: item.total || 0
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Errore fetch ordini:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = (email: string, pass: string): User => {
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
    const dbOrder: SupabaseOrder = {
      id: order.id,
      user_id: order.userId,
      customer_name: order.userName,
      customer_email: order.userEmail,
      package: order.packageName,
      photo_urls: order.photos.map(p => p.url),
      status: order.status,
      payment_method: order.paymentMethod,
      total: order.total
    };

    const { error } = await supabase.from('orders').insert([dbOrder]);

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
