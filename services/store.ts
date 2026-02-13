
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus, PaymentMethod } from '../types';
import { supabase } from './supabase';

const AUTH_KEY = 'studio_auth_v2';
const ADMIN_EMAIL = "carminephotography0@gmail.com";
const ADMIN_PASS = "Carmine01.";

// Interfaccia flessibile per riflettere i campi reali del DB
interface SupabaseOrder {
  id: string;
  customer_email: string;
  photo_urls: string[];
  status: string;
  created_at: string;
  // Campi opzionali per evitare errori se non presenti nelle policy o nel DB
  customer_name?: string;
  package?: string;
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
      
      // Admin vede tutto, Cliente filtra per email
      // Assicurarsi che l'email dell'admin sia corretta per le policy RLS
      if (user.role !== 'admin') {
        query = query.eq('customer_email', user.email);
      }

      // Ordinamento per data decrescente come richiesto
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Errore fetch ordini Supabase:", error);
        return;
      }

      if (data) {
        const mappedOrders: Order[] = (data as SupabaseOrder[]).map((item) => ({
          id: item.id,
          userId: '', 
          userName: item.customer_name || item.customer_email.split('@')[0],
          userEmail: item.customer_email,
          packageId: item.package || 'standard_100', 
          packageName: item.package || 'Pacchetto 100 Foto',
          photos: (item.photo_urls || []).map((url: string, index: number) => ({
            id: `photo-${index}`,
            name: `Foto ${index + 1}`,
            url: url,
            size: 0
          })),
          status: (item.status as OrderStatus) || OrderStatus.PENDING_PAYMENT,
          paymentMethod: PaymentMethod.ONLINE_SUMUP,
          createdAt: item.created_at,
          total: item.total || 20 
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Eccezione fetch ordini:", err);
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
    // 1) Prepariamo l'oggetto inviando SOLO i campi esistenti nella tabella orders
    const dbOrder = {
      customer_email: order.userEmail,
      photo_urls: order.photos.map(p => p.url),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log("Tentativo inserimento ordine su Supabase:", dbOrder);

    // Usiamo .select() per ottenere il record appena inserito (incluso l'ID generato dal DB)
    const { data, error } = await supabase.from('orders').insert([dbOrder]).select();

    if (error) {
      console.error("Errore critico Supabase nell'inserimento:", error);
      throw error;
    }

    console.log("Risposta Supabase (Insert successo):", data);

    // Refresh ordini per aggiornare la dashboard
    await fetchOrders();
    
    // Restituiamo il primo record (quello inserito)
    return data ? data[0] : null;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error("Errore update status Supabase:", error);
      return;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error("Errore eliminazione ordine Supabase:", error);
      return;
    }

    setOrders(prev => prev.filter(o => o.id !== orderId));
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
