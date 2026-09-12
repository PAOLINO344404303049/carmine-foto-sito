
import { useState, useEffect } from 'react';
import { User, Order, OrderStatus, PaymentMethod } from '../types';
import { supabase } from './supabase';

const AUTH_KEY = 'studio_auth_v2';
export const ADMIN_EMAILS = ["carminephotography0@gmail.com", "paolinofoglia01@gmail.com"];
export const isAdminEmail = (email?: string | null) => 
  email ? ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase()) : false;

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
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.email && isAdminEmail(parsed.email)) {
        parsed.role = 'admin';
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    
    try {
      // Recupera utente corrente da stato o localStorage
      let currentUser = user;
      if (!currentUser) {
        try {
          const stored = localStorage.getItem(AUTH_KEY);
          if (stored) {
            currentUser = JSON.parse(stored);
            if (currentUser && currentUser.email && isAdminEmail(currentUser.email)) {
              currentUser.role = 'admin';
            }
          }
        } catch {}
      }

      const isCurrentAdmin = currentUser && (currentUser.role === 'admin' || isAdminEmail(currentUser.email));
      console.log(`[STORE] Inizio recupero ordini per: ${currentUser?.email || 'anonimo'} (Admin: ${!!isCurrentAdmin})`);
      
      let rawData: SupabaseOrder[] | null = null;

      // 1. Canale Primario: Server-side API /api/orders (Node/Express o Vercel Serverless Function con Service Role Key)
      // Questo bypassa ogni limitazione RLS e restituisce tutti gli ordini per gli admin
      try {
        const apiRes = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        if (apiRes.ok) {
          const contentType = apiRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await apiRes.json();
            if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
              rawData = json.data;
              console.log(`[STORE] Recuperati con successo ${rawData.length} ordini tramite API server.`);
            }
          }
        }
      } catch (apiErr) {
        console.warn("[STORE] Fetch API server /api/orders non riuscito, provo client Supabase:", apiErr);
      }

      // 2. Canale Secondario: Client Supabase diretto
      if (!rawData || rawData.length === 0) {
        try {
          let query = supabase.from('orders').select('*');
          if (!isCurrentAdmin && currentUser?.email) {
            query = query.eq('customer_email', currentUser.email);
          }
          const { data, error } = await query.order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            rawData = data as SupabaseOrder[];
            console.log(`[STORE] Recuperati ${rawData.length} ordini tramite Supabase client.`);
          } else if (error) {
            console.warn("[STORE] Supabase client get orders:", error.message);
          }
        } catch (clientErr) {
          console.warn("[STORE] Eccezione fetch Supabase client:", clientErr);
        }
      }

      if (rawData && rawData.length > 0) {
        const mappedOrders: Order[] = rawData.map((item) => {
          let orderType: 'photo_package' | 'custom_product' = 'photo_package';
          let packageName = item.package || 'Pacchetto 100 Foto';
          let packageId = 'standard_100';
          let total = 20;
          let size: string | undefined = undefined;
          let deviceModel: string | undefined = undefined;
          let quantity: number = (item.photo_urls || []).length || 1;
          let cleanPhone = item.phone || '';
          let userName = item.customer_name || item.customer_email.split('@')[0];
          let customPaymentMethod: 'pickup_pay_in_store' | 'pickup_pay_now' | undefined = undefined;
          let paymentChoice: string | undefined = undefined;

          // Verifica se l'ordine contiene metadati di Prodotto Personalizzato
          const isCustom = (item.phone && (
            item.phone.includes('[CUSTOM_PRODUCT:') || 
            item.phone.includes('[PRODOTTO PERSONALIZZATO') || 
            item.phone.includes('T-Shirt') || 
            item.phone.includes('Portachiavi') || 
            item.phone.includes('Collana') || 
            item.phone.includes('Cuscino') || 
            item.phone.includes('Cover') ||
            item.phone.includes('Tazza') ||
            item.phone.includes('Puzzle')
          )) || (item.package && item.package !== 'Pacchetto 100 Foto' && item.package !== 'standard_100');

          if (isCustom) {
            orderType = 'custom_product';
            if (item.package) packageName = item.package;
            
            // Parsing JSON se presente
            const jsonMatch = item.phone ? item.phone.match(/\[CUSTOM_PRODUCT:(.*?)\]/) : null;
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
                cleanPhone = (item.phone || '').replace(/\[CUSTOM_PRODUCT:.*?\]/, '').trim();
              } catch (e) {
                // Fallback silenzioso
              }
            } else {
              // Estrazione da pattern descrittivo [Prodotto ...]
              const bracketMatch = item.phone ? item.phone.match(/\[(.*?)\]/) : null;
              if (bracketMatch && bracketMatch[1]) {
                packageName = bracketMatch[1];
                cleanPhone = (item.phone || '').replace(/\[.*?\]/, '').trim();
              }
            }
          } else {
            // Per Pacchetto 100 Foto o stampe fotografiche
            if (item.phone && item.phone.includes('[PAGAMENTO:Paga ora]')) {
              paymentChoice = 'Paga ora';
              customPaymentMethod = 'pickup_pay_now';
              cleanPhone = item.phone.replace(/\[PAGAMENTO:.*?\]/, '').trim();
            } else if (item.phone && item.phone.includes('[PAGAMENTO:Paga in sede]')) {
              paymentChoice = 'Paga in sede';
              customPaymentMethod = 'pickup_pay_in_store';
              cleanPhone = item.phone.replace(/\[PAGAMENTO:.*?\]/, '').trim();
            }

            if (item.photo_urls && item.photo_urls.length === 100) {
              packageName = 'Pacchetto 100 Foto';
              orderType = 'photo_package';
              total = 20;
            } else if (item.photo_urls && item.photo_urls.length === 1) {
              packageName = 'Stampa Foto / Prodotto Personalizzato';
              total = 20;
            } else if (item.photo_urls && item.photo_urls.length > 0) {
              packageName = `Pacchetto ${item.photo_urls.length} Foto`;
              total = 20;
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
        console.log(`[STORE] Mappati e impostati ${mappedOrders.length} ordini nello stato.`);
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

    const role = isAdminEmail(email) ? 'admin' : 'client';
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
    
    let updated = false;
    // 1. Prova prima tramite endpoint server (bypassa blocchi RLS)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          updated = true;
          console.log(`[STORE] Status ordine ${orderId} aggiornato con successo via API server.`);
        }
      }
    } catch (apiErr) {
      console.warn("[STORE] API server PATCH /api/orders non raggiungibile, provo client Supabase:", apiErr);
    }

    // 2. Fallback con client Supabase
    if (!updated) {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error("[STORE] Errore update status Supabase:", error.message);
        throw error;
      }
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