import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  // CORS support
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

  console.log("[CUSTOM-ORDER] Richiesta ricevuta su Vercel Serverless Function");

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        console.error("[CUSTOM-ORDER] Errore nel parsing del body JSON");
        return res.status(400).json({ error: "Formato richiesta non valido (JSON corrotto)" });
      }
    }

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
    } = body || {};

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || "Cliente";

    // Validazione dati essenziali
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Il campo 'Email' è obbligatorio." });
    }
    if (!productName || typeof productName !== "string") {
      return res.status(400).json({ error: "Il campo 'Prodotto' è obbligatorio." });
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

    // 1. SALVATAGGIO DELL'ORDINE SU SUPABASE LATO SERVER (Evita violazioni RLS per clienti guest)
    let savedOrderId = orderId || `ord-custom-${Date.now()}`;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://thiyeerwwhwarekudhyg.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r';

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
        customer_email: cleanEmail.toLowerCase(),
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
        console.warn("[CUSTOM-ORDER] Avviso inserimento Supabase lato server:", dbError.message);
      } else if (dbData && dbData.length > 0) {
        savedOrderId = dbData[0].id;
        console.log("[CUSTOM-ORDER] Ordine registrato con successo nel DB Supabase, ID:", savedOrderId);
      }
    } catch (dbEx: any) {
      console.warn("[CUSTOM-ORDER] Eccezione connessione Supabase server-side:", dbEx.message);
    }

    // 2. INVIO NOTIFICA EMAIL VIA RESEND
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn("[CUSTOM-ORDER] Variabile RESEND_API_KEY non presente. Ordine registrato ma notifica email simulata.");
      return res.status(200).json({ success: true, id: savedOrderId, simulatedEmail: true });
    }

    const resend = new Resend(RESEND_API_KEY);
    const TARGET_EMAIL = "carminefotografo2@gmail.com";

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
      console.error("[CUSTOM-ORDER] Errore riscontrato da Resend:", error.name, error.message);
      return res.status(500).json({ error: error.message || "Errore durante l'invio dell'email tramite Resend" });
    }

    console.log("[CUSTOM-ORDER] Email inviata con successo, ID:", responseData?.id);
    return res.status(200).json({ success: true, id: savedOrderId, emailId: responseData?.id });
  } catch (err: any) {
    console.error("[CUSTOM-ORDER] Eccezione interna server:", err?.message || err);
    return res.status(500).json({ error: "Si è verificato un errore interno durante l'elaborazione dell'ordine." });
  }
}

