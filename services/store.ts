
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus, PaymentMethod } from '../types';
import { supabase } from './supabase';

const AUTH_KEY = 'studio_auth_v2';
const ADMIN_EMAIL = "carminephotography0@gmail.com";

// Interfaccia per mappare esattamente le colonne della tabella Supabase
interface SupabaseOrder {
  id: string;
  customer_email: string;
  phone: string;
  photo_urls: string[];
  status: string;
  created_at: string;
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
      console.log(`[STORE] Recupero ordini per: ${user.email} (Ruolo: ${user.role})`);
      
      let query = supabase.from('orders').select('*');
      
      if (user.email !== ADMIN_EMAIL) {
        query = query.eq('customer_email', user.email);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("[STORE] Errore fetch ordini Supabase:", error.message);
        return;
      }

      if (data) {
        const mappedOrders: Order[] = (data as SupabaseOrder[]).map((item) => ({
          id: item.id,
          userId: '', 
          userName: item.customer_email.split('@')[0],
          userEmail: item.customer_email,
          phone: item.phone || '',
          packageId: 'standard_100', 
          packageName: 'Pacchetto 100 Foto',
          photos: (item.photo_urls || []).map((url: string, index: number) => {
            const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
            return {
              id: `photo-${index}`,
              name: `Foto_${index + 1}.${extension}`,
              url: url,
              size: 0
            };
          }),
          status: (item.status as OrderStatus) || OrderStatus.PENDING_PAYMENT,
          paymentMethod: PaymentMethod.ONLINE_SUMUP,
          createdAt: item.created_at,
          total: 20 
        }));
        setOrders(mappedOrders);
        console.log(`[STORE] Caricati ${mappedOrders.length} ordini.`);
      }
    } catch (err) {
      console.error("[STORE] Eccezione nel caricamento ordini:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) {
      console.error("[STORE] Errore Autenticazione Supabase:", authError.message);
      throw authError;
    }

    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'client';
    const loggedUser: User = {
      id: authData.user.id,
      name: authData.user.email?.split('@')[0] || email.split('@')[0],
      email: email.toLowerCase(),
      phone: authData.user.user_metadata?.phone || '',
      role: role as 'admin' | 'client',
      mustChangePassword: false
    };

    setUser(loggedUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(loggedUser));
    return loggedUser;
  };

  const signUp = async (email: string, pass: string, phone: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          phone: phone
        }
      }
    });

    if (authError) {
      console.error("[STORE] Errore Registrazione Supabase:", authError.message);
      throw authError;
    }

    const newUser: User = {
      id: authData.user?.id || Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      phone: phone,
      role: 'client',
      mustChangePassword: false
    };

    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    return newUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setOrders([]);
  };

  const addOrder = async (order: Order) => {
    // Sincronizzazione con il formato record previsto dai webhook: customer_email, photo_urls, status, phone
    const dbOrder = {
      customer_email: order.userEmail.toLowerCase(),
      phone: order.phone,
      photo_urls: order.photos.map(p => p.url),
      status: OrderStatus.PENDING_PAYMENT, // Imposta automaticamente status = 'PENDING'
      created_at: new Date().toISOString()
    };

    console.log("[STORE] Invio dati a Supabase (payload.record):", dbOrder);

    const { data, error } = await supabase.from('orders').insert([dbOrder]).select();

    if (error) {
      console.error("[STORE] Errore salvataggio Supabase:", error);
      throw error;
    }

    console.log("[STORE] Risposta successo Supabase:", data);
    await fetchOrders();
    return data ? data[0] : null;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    console.log(`[STORE] Aggiornamento status ordine ${orderId} a ${status}`);
    
    // Esegue solo l'UPDATE della colonna status come richiesto
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error("[STORE] Errore update status Supabase:", error.message);
      throw error;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const deleteOrder = async (orderId: string) => {
    console.log(`[STORE] Eliminazione definitiva ordine ${orderId}`);
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error("[STORE] Errore eliminazione Supabase:", error.message);
      throw error;
    }

    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return {
    user,
    orders,
    loading,
    login,
    signUp,
    logout,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    fetchOrders
  };
};