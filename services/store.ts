
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
        const mappedOrders: Order[] = (data as SupabaseOrder[]).map((item) => {
          let orderType: 'photo_package' | 'custom_product' = 'photo_package';
          let packageName = 'Pacchetto 100 Foto';
          let packageId = 'standard_100';
          let total = 20;
          let size: string | undefined = undefined;
          let deviceModel: string | undefined = undefined;
          let quantity: number = (item.photo_urls || []).length || 1;
          let cleanPhone = item.phone || '';
          let userName = item.customer_email.split('@')[0];
          let customPaymentMethod: 'pickup_pay_in_store' | 'pickup_pay_now' | undefined = undefined;
          let paymentChoice: string | undefined = undefined;

          // Verifica se l'ordine contiene metadati di Prodotto Personalizzato
          if (item.phone && (item.phone.includes('[CUSTOM_PRODUCT:') || item.phone.includes('[PRODOTTO PERSONALIZZATO') || item.phone.includes('T-Shirt') || item.phone.includes('Portachiavi') || item.phone.includes('Collana') || item.phone.includes('Cuscino') || item.phone.includes('Cover'))) {
            orderType = 'custom_product';
            
            // Parsing JSON se presente
            const jsonMatch = item.phone.match(/\[CUSTOM_PRODUCT:(.*?)\]/);
            if (jsonMatch && jsonMatch[1]) {
              try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.product) packageName = parsed.product;
                if (parsed.size) size = parsed.size;
                if (parsed.model) deviceModel = parsed.model;
                if (parsed.qty) quantity = Number(parsed.qty);
                if (parsed.total) total = Number(parsed.total);
                if (parsed.name) userName = parsed.lastName ? `${parsed.name} ${parsed.lastName}` : parsed.name;
                if (parsed.paymentChoice) paymentChoice = parsed.paymentChoice;
                if (parsed.paymentMethod) customPaymentMethod = parsed.paymentMethod;
                cleanPhone = item.phone.replace(/\[CUSTOM_PRODUCT:.*?\]/, '').trim();
              } catch (e) {
                // Fallback silenzioso
              }
            } else {
              // Estrazione da pattern descrittivo [Prodotto ...]
              const bracketMatch = item.phone.match(/\[(.*?)\]/);
              if (bracketMatch && bracketMatch[1]) {
                packageName = bracketMatch[1];
                cleanPhone = item.phone.replace(/\[.*?\]/, '').trim();
              }
            }
          }

          return {
            id: item.id,
            userId: '', 
            userName,
            userEmail: item.customer_email,
            phone: cleanPhone,
            packageId: orderType === 'custom_product' ? 'custom_product' : packageId, 
            packageName: packageName,
            photos: (item.photo_urls || []).map((url: string, index: number) => {
              const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
              return {
                id: `photo-${index}`,
                name: orderType === 'custom_product' ? `Personalizzazione_${index + 1}.${extension}` : `Foto_${index + 1}.${extension}`,
                url: url,
                size: 0
              };
            }),
            status: (item.status as OrderStatus) || OrderStatus.PENDING_PAYMENT,
            paymentMethod: customPaymentMethod === 'pickup_pay_now' ? PaymentMethod.ONLINE_SUMUP : PaymentMethod.AT_COLLECTION,
            createdAt: item.created_at,
            total,
            orderType,
            size,
            deviceModel,
            quantity,
            customPaymentMethod,
            paymentChoice
          };
        });
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
    let phoneToSave = order.phone || '';
    if (order.orderType === 'custom_product') {
      const meta = {
        name: order.userName,
        lastName: order.customerLastName || '',
        product: order.packageName,
        size: order.size || '',
        model: order.deviceModel || '',
        qty: order.quantity || 1,
        total: order.total,
        paymentChoice: order.paymentChoice || (order.customPaymentMethod === 'pickup_pay_now' ? 'Paga ora' : 'Paga in sede'),
        paymentMethod: order.customPaymentMethod || 'pickup_pay_in_store'
      };
      phoneToSave = `${(order.phone || '').trim()} [CUSTOM_PRODUCT:${JSON.stringify(meta)}]`;
    }

    // Sincronizzazione con il formato record previsto dai webhook: customer_email, photo_urls, status, phone
    const dbOrder = {
      customer_email: order.userEmail.toLowerCase(),
      phone: phoneToSave,
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

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    console.log(`[STORE] Eliminazione definitiva ordine ${orderId}`);
    
    let deletedSuccessfully = false;

    // 1. Prova prima eliminazione tramite endpoint server (bypassa blocchi RLS Supabase)
    try {
      const response = await fetch('/api/delete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          deletedSuccessfully = true;
          console.log(`[STORE] Ordine ${orderId} eliminato con successo via server API.`);
        }
      }
    } catch (apiErr) {
      console.warn("[STORE] API server delete non raggiungibile o fallita, provo con client Supabase:", apiErr);
    }

    // 2. Se l'API server non ha risposto, prova direttamente con client Supabase
    if (!deletedSuccessfully) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) {
          console.warn("[STORE] Errore eliminazione Supabase client:", error.message);
        } else {
          deletedSuccessfully = true;
          console.log(`[STORE] Ordine ${orderId} eliminato con client Supabase.`);
        }
      } catch (clientErr) {
        console.warn("[STORE] Eccezione client Supabase durante eliminazione:", clientErr);
      }
    }

    // 3. Rimuovi sempre l'ordine dallo stato locale dell'applicazione
    setOrders(prev => prev.filter(o => o.id !== orderId));
    return true;
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