import express from "express";
import path from "path";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Need to parse JSON bodies
  app.use(express.json());

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
  const TARGET_EMAIL = "carminefotografo2@gmail.com"; // Richiesto dalle istruzioni

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gestione centralizzata immagini prodotti personalizzati (Persistenza cloud Supabase)
  const APP_CONFIG_BUCKET = "app_config";
  const PRODUCT_IMAGES_FILE = "product-images.json";

  const getSupabaseServerClient = () => {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://thiyeerwwhwarekudhyg.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r';
    return createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  };

  app.get("/api/product-images", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.storage.from(APP_CONFIG_BUCKET).download(PRODUCT_IMAGES_FILE);
      if (error || !data) {
        res.json({ success: true, links: {}, source: "defaults" });
        return;
      }
      const text = await data.text();
      const parsed = JSON.parse(text);
      res.json({ success: true, links: parsed, source: "supabase" });
    } catch (err: any) {
      console.error("[SERVER] Errore GET /api/product-images:", err?.message || err);
      res.json({ success: true, links: {}, error: err?.message });
    }
  });

  app.post("/api/product-images", async (req, res) => {
    try {
      const links = req.body?.links;
      if (!links || typeof links !== "object") {
        res.status(400).json({ error: "Il campo 'links' deve essere un oggetto valido" });
        return;
      }
      const supabase = getSupabaseServerClient();
      try {
        await supabase.storage.createBucket(APP_CONFIG_BUCKET, { public: true });
      } catch {
        // Ignora se il bucket esiste già
      }

      const payloadToSave = {
        ...links,
        updated_at: new Date().toISOString()
      };
      const buffer = Buffer.from(JSON.stringify(payloadToSave, null, 2));
      const { data, error } = await supabase.storage.from(APP_CONFIG_BUCKET).upload(PRODUCT_IMAGES_FILE, buffer, {
        contentType: "application/json",
        upsert: true
      });

      if (error) {
        console.error("[SERVER] Errore salvataggio Supabase:", error.message);
        res.status(500).json({ error: error.message });
        return;
      }
      console.log("[SERVER] Link foto prodotti aggiornati con successo nel cloud Supabase:", data);
      res.json({ success: true, links: payloadToSave, updatedAt: payloadToSave.updated_at });
    } catch (err: any) {
      console.error("[SERVER] Eccezione POST /api/product-images:", err?.message || err);
      res.status(500).json({ error: "Errore interno durante il salvataggio" });
    }
  });

  // API routes FIRST
  app.post("/api/contact", async (req, res) => {
    console.log("[CONTATTI] Richiesta ricevuta su server Express");
    try {
      const { name, email, phone, eventType, message } = req.body || {};

      if (!name || typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "Il campo 'Nome' è obbligatorio." });
        return;
      }
      if (!email || typeof email !== "string" || !email.trim()) {
        res.status(400).json({ error: "Il campo 'Email' è obbligatorio." });
        return;
      }
      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "Il campo 'Messaggio' è obbligatorio." });
        return;
      }
      
      if (!resend) {
        console.warn("[CONTATTI] Manca la chiave API di Resend (RESEND_API_KEY). L'email non può essere inviata realmente.");
        res.status(500).json({ error: "Configurazione server mancante (API Key Resend non impostata)" });
        return;
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim();
      const cleanPhone = (phone && typeof phone === "string") ? phone.trim() : "Non specificato";
      const cleanEventType = (eventType && typeof eventType === "string") ? eventType.trim() : "Non specificato";
      const cleanMessage = message.trim().replace(/\n/g, "<br/>");

      console.log(`[CONTATTI] Invio email per: ${cleanName} (${cleanEmail}) a ${TARGET_EMAIL}`);

      const { data: responseData, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>",
        to: TARGET_EMAIL,
        replyTo: cleanEmail,
        subject: `Nuovo messaggio dal sito – ${cleanName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; padding: 24px; background-color: #ffffff;">
            <h2 style="color: #111; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; margin-top: 0;">Nuovo Messaggio dal Sito (Contatti)</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 140px;">Nome:</td>
                <td style="padding: 8px 0; color: #111;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; color: #111;"><a href="mailto:${cleanEmail}" style="color: #0066cc;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Telefono:</td>
                <td style="padding: 8px 0; color: #111;">${cleanPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Tipo Evento:</td>
                <td style="padding: 8px 0; color: #111;">${cleanEventType}</td>
              </tr>
            </table>

            <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #111;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #444;">Messaggio:</p>
              <p style="margin: 0; color: #222;">${cleanMessage}</p>
            </div>

            <p style="font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 12px; text-align: center;">
              Email inviata automaticamente tramite modulo Contatti del sito web.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("[CONTATTI] Risposta provider email (ERRORE):", error);
        res.status(500).json({ error: error.message || "Errore durante l'invio dell'email tramite Resend" });
        return;
      }

      console.log("[CONTATTI] Email inviata con successo, ID:", responseData?.id);
      res.json({ success: true, id: responseData?.id });
    } catch (err: any) {
      console.error("[CONTATTI] Errore server:", err?.message || err);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.post("/api/wedding", async (req, res) => {
    console.log("[WEDDING] Richiesta ricevuta su server Express");
    try {
      const { names, email, phone, date, location, message } = req.body || {};

      if (!names || typeof names !== "string" || !names.trim()) {
        res.status(400).json({ error: "Il campo 'Nome degli sposi' è obbligatorio." });
        return;
      }
      if (!email || typeof email !== "string" || !email.trim()) {
        res.status(400).json({ error: "Il campo 'Email' è obbligatorio." });
        return;
      }
      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "Il campo 'Raccontaci il tuo evento / Messaggio' è obbligatorio." });
        return;
      }
      
      if (!resend) {
        console.warn("[WEDDING] Manca la chiave API di Resend (RESEND_API_KEY). L'email non può essere inviata realmente.");
        res.status(500).json({ error: "Configurazione server mancante (API Key Resend non impostata)" });
        return;
      }

      const cleanNames = names.trim();
      const cleanEmail = email.trim();
      const cleanPhone = (phone && typeof phone === "string") ? phone.trim() : "Non specificato";
      const cleanDate = (date && typeof date === "string") ? date.trim() : "Non specificata";
      const cleanLocation = (location && typeof location === "string") ? location.trim() : "Non specificata";
      const cleanMessage = message.trim().replace(/\n/g, "<br/>");

      console.log(`[WEDDING] Invio email per: ${cleanNames} (${cleanEmail}) a ${TARGET_EMAIL}`);

      const { data: responseData, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>",
        to: TARGET_EMAIL,
        replyTo: cleanEmail,
        subject: `Nuova richiesta Consulenza Wedding – ${cleanNames}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; padding: 24px; background-color: #ffffff;">
            <h2 style="color: #111; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; margin-top: 0;">Nuova Richiesta Consulenza Wedding</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 160px;">Nome degli Sposi:</td>
                <td style="padding: 8px 0; color: #111; font-weight: bold; font-size: 16px;">${cleanNames}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; color: #111;"><a href="mailto:${cleanEmail}" style="color: #0066cc;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Telefono:</td>
                <td style="padding: 8px 0; color: #111;">${cleanPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Data del Matrimonio:</td>
                <td style="padding: 8px 0; color: #111;">${cleanDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Luogo / Location:</td>
                <td style="padding: 8px 0; color: #111;">${cleanLocation}</td>
              </tr>
            </table>

            <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #111;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #444;">Dettagli dell'Evento / Richiesta:</p>
              <p style="margin: 0; color: #222;">${cleanMessage}</p>
            </div>

            <p style="font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 12px; text-align: center;">
              Email inviata automaticamente tramite il modulo Consulenza Wedding del sito web.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("[WEDDING] Risposta provider email (ERRORE):", error);
        res.status(500).json({ error: error.message || "Errore durante l'invio dell'email tramite Resend" });
        return;
      }

      console.log("[WEDDING] Email inviata con successo, ID:", responseData?.id);
      res.json({ success: true, id: responseData?.id });
    } catch (err: any) {
      console.error("[WEDDING] Errore server:", err?.message || err);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.post("/api/delete-order", async (req, res) => {
    console.log("[DELETE-ORDER] Richiesta cancellazione ricevuta su server Express");
    try {
      const { orderId } = req.body || {};
      if (!orderId || typeof orderId !== "string") {
        res.status(400).json({ error: "ID ordine non valido o mancante" });
        return;
      }

      console.log(`[DELETE-ORDER] Eliminazione ordine: ${orderId}`);
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
        res.status(500).json({ error: error.message });
        return;
      }

      console.log(`[DELETE-ORDER] Ordine ${orderId} eliminato con successo su Supabase.`);
      res.json({ success: true, orderId });
    } catch (err: any) {
      console.error("[DELETE-ORDER] Errore server:", err?.message || err);
      res.status(500).json({ error: "Errore interno durante l'eliminazione" });
    }
  });

  // API PER RECUPERO ORDINI PER IL PANNELLO ADMIN (Bypassa limitazioni RLS)
  app.get("/api/orders", async (req, res) => {
    console.log("[ORDERS-API] Richiesta recupero lista ordini ricevuta");
    try {
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

      const { data, error } = await supabaseServer
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("[ORDERS-API] Errore Supabase get orders:", error.message);
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true, data: data || [] });
    } catch (err: any) {
      console.error("[ORDERS-API] Eccezione GET /api/orders:", err?.message || err);
      res.status(500).json({ error: "Errore interno durante il recupero ordini" });
    }
  });

  app.patch("/api/orders", async (req, res) => {
    console.log("[ORDERS-API] Richiesta modifica stato ordine ricevuta");
    try {
      const { orderId, status } = req.body || {};
      if (!orderId || !status) {
        res.status(400).json({ error: "orderId e status sono obbligatori" });
        return;
      }

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

      const { data, error } = await supabaseServer
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error("[ORDERS-API] Errore aggiornamento stato Supabase:", error.message);
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ success: true, data });
    } catch (err: any) {
      console.error("[ORDERS-API] Eccezione PATCH /api/orders:", err?.message || err);
      res.status(500).json({ error: "Errore interno durante l'aggiornamento stato" });
    }
  });

  app.post("/api/custom-order", async (req, res) => {
    console.log("[CUSTOM-ORDER] Richiesta ricevuta su server Express");
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        productName,
        size,
        deviceModel,
        quantity,
        unitPrice,
        total,
        photoUrl,
        photoUrls,
        orderId,
        paymentStatus,
        paymentChoice,
        paymentOption,
        paymentMethod
      } = req.body || {};

      const fullName = `${firstName || ''} ${lastName || ''}`.trim() || "Cliente";

      if (!email || typeof email !== "string" || !email.trim()) {
        res.status(400).json({ error: "Il campo 'Email' è obbligatorio." });
        return;
      }
      if (!productName || typeof productName !== "string") {
        res.status(400).json({ error: "Il campo 'Prodotto' è obbligatorio." });
        return;
      }

      const cleanEmail = email.trim();
      const cleanPhone = (phone && typeof phone === "string") ? phone.trim() : "Non specificato";
      const qty = quantity || 1;
      const finalTotal = typeof total === "number" ? total.toFixed(2) : String(total || "0.00");
      const isPayNow = paymentOption === 'pickup_pay_now' || paymentChoice === 'Paga ora' || paymentMethod === 'pickup_pay_now';
      const choiceText = isPayNow ? "Ritiro in sede – Paga ora" : "Ritiro in sede – Paga in sede";
      const statusText = paymentStatus || (isPayNow ? "Pagamento online: 10 €" : "Pagamento in sede");

      // Normalizzazione array foto
      const allPhotos: string[] = Array.isArray(photoUrls) && photoUrls.length > 0 
        ? photoUrls 
        : (photoUrl ? [photoUrl] : []);

      // 1. SALVATAGGIO DELL'ORDINE SU SUPABASE LATO SERVER
      let savedOrderId = orderId || `ord-custom-${Date.now()}`;
      const supabaseUrl = process.env.SUPABASE_URL || 'https://thiyeerwwhwarekudhyg.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                          process.env.SUPABASE_SERVICE_KEY || 
                          process.env.SUPABASE_SECRET_KEY || 
                          process.env.SUPABASE_SERVICE_ROLE || 
                          process.env.SUPABASE_ANON_KEY || 
                          'sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r';

      try {
        const supabaseServer = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        const meta = {
          name: firstName || '',
          lastName: lastName || '',
          product: productName,
          size: size || '',
          model: deviceModel || '',
          qty: qty,
          total: Number(finalTotal),
          paymentChoice: isPayNow ? 'Paga ora' : 'Paga in sede',
          paymentMethod: isPayNow ? 'pickup_pay_now' : 'pickup_pay_in_store'
        };

        const phoneToSave = `${cleanPhone} [CUSTOM_PRODUCT:${JSON.stringify(meta)}]`;

        const dbOrder = {
          customer_name: fullName,
          customer_email: cleanEmail.toLowerCase(),
          package: productName,
          phone: phoneToSave,
          photo_urls: allPhotos,
          status: 'PENDING',
          created_at: new Date().toISOString()
        };

        const { data: dbData, error: dbError } = await supabaseServer
          .from('orders')
          .insert([dbOrder])
          .select();

        if (dbError) {
          console.error("[CUSTOM-ORDER] ERRORE inserimento Supabase lato server:", dbError.message);
        } else if (dbData && dbData.length > 0) {
          savedOrderId = dbData[0].id;
          console.log("[CUSTOM-ORDER] Ordine registrato con successo nel DB Supabase, ID:", savedOrderId);
        }
      } catch (dbEx: any) {
        console.error("[CUSTOM-ORDER] Eccezione connessione Supabase server-side:", dbEx.message);
      }

      if (!resend) {
        console.warn("[CUSTOM-ORDER] Manca la chiave API di Resend (RESEND_API_KEY). Simulazione invio ordine.");
        res.json({ success: true, id: savedOrderId, simulated: true });
        return;
      }

      console.log(`[CUSTOM-ORDER] Invio email per: ${fullName} (${cleanEmail}) a ${TARGET_EMAIL} - Prodotto: ${productName}`);

      const { data: responseData, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>",
        to: TARGET_EMAIL,
        replyTo: cleanEmail,
        subject: `NUOVO ORDINE - PRODOTTO PERSONALIZZATO: ${productName} – ${fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px;">
                NUOVO ORDINE • PRODOTTO PERSONALIZZATO
              </span>
              <h2 style="color: #111; margin-top: 14px; margin-bottom: 4px; font-size: 22px;">Riepilogo Ordine Personalizzato</h2>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">ID Ordine: <strong>${savedOrderId}</strong></p>
            </div>

            <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
              <h3 style="color: #111; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
                Dati del Cliente
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 140px; font-weight: bold;">Cliente:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: bold;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Email:</td>
                  <td style="padding: 6px 0; color: #111;"><a href="mailto:${cleanEmail}" style="color: #2563eb; text-decoration: none;">${cleanEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Telefono:</td>
                  <td style="padding: 6px 0; color: #111;">${cleanPhone}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
              <h3 style="color: #111; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
                Dettagli Prodotto & Configurazione
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; width: 140px; font-weight: bold;">Prodotto:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: bold; font-size: 15px;">${productName}</td>
                </tr>
                ${size ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Taglia:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: bold; font-size: 14px;"><span style="background-color: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${size}</span></td>
                </tr>
                ` : ''}
                ${deviceModel ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Modello smartphone:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: bold; font-size: 14px;">${deviceModel}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Quantità:</td>
                  <td style="padding: 6px 0; color: #111;">${qty}</td>
                </tr>
                ${unitPrice ? `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Prezzo unitario:</td>
                  <td style="padding: 6px 0; color: #111;">€ ${Number(unitPrice).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #111; font-weight: bold; font-size: 16px; border-top: 1px solid #e5e7eb;">Totale Ordine:</td>
                  <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px; border-top: 1px solid #e5e7eb;">€ ${finalTotal}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Scelta Pagamento:</td>
                  <td style="padding: 6px 0; color: #111; font-weight: bold;">
                    ${isPayNow 
                      ? '<span style="color: #059669; font-weight: bold;">Ritiro in sede – Paga ora (Pagamento online: 10 €)</span>' 
                      : '<span style="color: #d97706; font-weight: bold;">Ritiro in sede – Paga in sede (Pagamento in sede)</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Stato Pagamento:</td>
                  <td style="padding: 6px 0; color: #d97706; font-weight: bold;">${statusText}</td>
                </tr>
              </table>
            </div>

            ${allPhotos.length > 0 ? `
            <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #111; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0; margin-bottom: 14px;">
                ${allPhotos.length > 1 ? `Foto Caricate dal Cliente (${allPhotos.length} Foto)` : 'Foto Caricata dal Cliente'}
              </h3>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-bottom: 12px;">
                ${allPhotos.map((url, idx) => `
                  <div style="text-align: center; max-width: ${allPhotos.length === 1 ? '320px' : '170px'}; margin: 0 auto;">
                    ${allPhotos.length > 1 ? `<div style="font-size: 11px; font-weight: bold; color: #475569; margin-bottom: 4px;">Foto ${idx + 1}</div>` : ''}
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                      <img src="${url}" alt="Foto ${idx + 1}" style="width: 100%; max-height: ${allPhotos.length === 1 ? '260px' : '150px'}; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" />
                    </a>
                    <div style="margin-top: 8px;">
                      <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 6px 12px; font-size: 11px; font-weight: bold; text-decoration: none; border-radius: 6px;">
                        Apri Foto ${allPhotos.length > 1 ? (idx + 1) : ''} in Alta Risoluzione ↗
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <p style="font-size: 11px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px; text-align: center;">
              Email di notifica inviata automaticamente dal sistema ordini del sito Carmine Felice Napolitano.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("[CUSTOM-ORDER] Risposta provider email (ERRORE):", error);
        res.status(500).json({ error: error.message || "Errore durante l'invio dell'email tramite Resend" });
        return;
      }

      console.log("[CUSTOM-ORDER] Email inviata con successo, ID:", responseData?.id);
      res.json({ success: true, id: savedOrderId, emailId: responseData?.id });
    } catch (err: any) {
      console.error("[CUSTOM-ORDER] Errore server:", err?.message || err);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
