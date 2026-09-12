import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://thiyeerwwhwarekudhyg.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.SUPABASE_SERVICE_KEY || 
                      process.env.SUPABASE_SECRET_KEY || 
                      process.env.SUPABASE_ANON_KEY || 
                      'sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r';

  const supabaseServer = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  if (req.method === "GET") {
    try {
      console.log("[ORDERS-API] Fetching all orders via server-side Supabase client...");
      const { data, error } = await supabaseServer
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("[ORDERS-API] Errore Supabase get orders:", error.message);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err: any) {
      console.error("[ORDERS-API] Eccezione GET /api/orders:", err?.message || err);
      return res.status(500).json({ error: "Errore interno durante il recupero ordini" });
    }
  }

  if (req.method === "PATCH") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: "Formato richiesta non valido (JSON corrotto)" });
        }
      }

      const { orderId, status } = body || {};
      if (!orderId || !status) {
        return res.status(400).json({ error: "orderId e status sono obbligatori" });
      }

      console.log(`[ORDERS-API] Aggiornamento status ordine ${orderId} a ${status}`);
      const { data, error } = await supabaseServer
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error("[ORDERS-API] Errore update status:", error.message);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error("[ORDERS-API] Eccezione PATCH /api/orders:", err?.message || err);
      return res.status(500).json({ error: "Errore interno durante l'aggiornamento stato" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: `Metodo ${req.method} non consentito.` });
}
