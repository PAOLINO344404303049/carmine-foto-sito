import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Metodo ${req.method} non consentito. Utilizza POST.` });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({ error: "Formato richiesta non valido (JSON corrotto)" });
      }
    }

    const { orderId } = body || {};
    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ error: "ID ordine non valido o mancante" });
    }

    console.log(`[DELETE-ORDER] Richiesta cancellazione ordine: ${orderId}`);
    const supabaseUrl = process.env.SUPABASE_URL || 'https://thiyeerwwhwarekudhyg.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.SUPABASE_SERVICE_KEY || 
                        process.env.SUPABASE_SECRET_KEY || 
                        process.env.SUPABASE_SERVICE_ROLE || 
                        process.env.SUPABASE_ANON_KEY || 
                        'sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r';

    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await supabaseServer
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error("[DELETE-ORDER] Errore Supabase:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[DELETE-ORDER] Ordine ${orderId} eliminato con successo.`);
    return res.status(200).json({ success: true, orderId });
  } catch (err: any) {
    console.error("[DELETE-ORDER] Errore:", err?.message || err);
    return res.status(500).json({ error: "Errore interno durante l'eliminazione dell'ordine" });
  }
}
