
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus, PaymentMethod } from '../types';
import { supabase } from './supabase';

const AUTH_KEY = 'studio_auth_v2';
const ADMIN_EMAIL = "carminephotography0@gmail.com";
const ADMIN_PASS = "Carmine01.";

// Interfaccia per mappare esattamente le colonne della tabella Supabase
interface SupabaseOrder {
  id: string;
  customer_email: string;
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
      console.log("Recupero ordini per:", user.email);
      let query = supabase.from('orders').select('*');
      
      // Admin vede tutto, Cliente filtra per la propria email
      // La policy RLS su Supabase dovrebbe già gestire questo, 
      // ma aggiungiamo il filtro esplicito per sicurezza e pulizia.
      if (user.email !== ADMIN_EMAIL) {
        query = query.eq('customer_email', user.email);
      }

      // Ordinamento per data decrescente (DESC) come richiesto
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Errore fetch ordini Supabase:", error);
        return;
      }

      if (data) {
        const mappedOrders: Order[] = (data as SupabaseOrder[]).map((item) => ({
          id: item.id,
          userId: '', 
          userName: item.customer_email.split('@')[0],
          userEmail: item.customer_email,
          packageId: 'standard_100', 
          packageName: 'Pacchetto 100 Foto',
          photos: (item.photo_urls || []).map((url: string, index: number) => ({
            id: `photo-${index}`,
            name: `Foto ${index + 1}`,
            url: url,
            size: 0
          })),
          status: (item.status as OrderStatus) || OrderStatus.PENDING_PAYMENT,
          paymentMethod: PaymentMethod.ONLINE_SUMUP,
          createdAt: item.created_at,
          total: 20 
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Eccezione nel caricamento ordini:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<User> => {
    // 1) Tentativo di autenticazione reale su Supabase per attivare RLS
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) {
      console.error("Errore Autenticazione Supabase:", authError.message);
      throw authError;
    }

    const role = email === ADMIN_EMAIL ? 'admin' : 'client';
    const loggedUser: User = {
      id: authData.user.id,
      name: email.split('@')[0],
      email: email,
      role: role as 'admin' | 'client',
      mustChangePassword: false
    };

    setUser(loggedUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(loggedUser));
    return loggedUser;
  };

  const signUp = async (email: string, pass: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (authError) {
      console.error("Errore Registrazione Supabase:", authError.message);
      throw authError;
    }

    const newUser: User = {
      id: authData.user?.id || Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
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
    // 1) Prepariamo i dati per Supabase (Solo i campi richiesti dalla tabella)
    const dbOrder = {
      customer_email: order.userEmail,
      photo_urls: order.photos.map(p => p.url),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Log richiesto: Dati inviati
    console.log("Saving to Supabase:", dbOrder);

    const result = await supabase.from('orders').insert([dbOrder]).select();

    // Log richiesto: Risposta Supabase
    console.log("Supabase response:", result);

    if (result.error) {
      // Log richiesto: Errore Supabase
      console.error("Supabase error:", result.error);
      throw result.error;
    }

    // Refresh degli ordini locale
    await fetchOrders();
    
    return result.data ? result.data[0] : null;
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
    signUp,
    logout,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    fetchOrders
  };
};
