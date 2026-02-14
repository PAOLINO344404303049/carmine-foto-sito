import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/**
 * Supabase Edge Function: order-ready-email
 * Scopo: Inviare una notifica email al cliente quando l'ordine è pronto per il ritiro.
 * Mittente autorizzato Resend: onboarding@resend.dev
 */

// Declaring Deno global to resolve TypeScript error in the edge function environment
declare const Deno: any;

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  // Gestione delle richieste OPTIONS per CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  try {
    const payload = await req.json();
    console.log("Payload Webhook ricevuto:", JSON.stringify(payload, null, 2));

    const { record } = payload;

    // 1. Verifica esistenza record
    if (!record) {
      console.error("Errore: Nessun record trovato nel payload.");
      return new Response(JSON.stringify({ error: "Missing record" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 2. Controllo Stato: invio solo se lo stato è 'READY'
    // Nota: Nel sistema, lo stato 'READY' corrisponde all'ordine stampato e pronto al ritiro.
    if (record.status !== 'READY') {
      console.log(`Info: Ordine ${record.id} in stato '${record.status}'. Email non inviata.`);
      return new Response(JSON.stringify({ success: true, message: "Status is not READY. Skip email." }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 3. Verifica email cliente
    const email = record.customer_email;
    if (!email || !email.includes('@')) {
      console.error(`Errore: Indirizzo email '${email}' non valido per l'ordine ${record.id}.`);
      return new Response(JSON.stringify({ error: "Invalid customer_email" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    console.log(`Inizio processo di invio email per l'ordine ${record.id} a ${email}...`);

    // 4. Chiamata API Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Le tue foto sono pronte! 📸 - Carmine Felice Napolitano',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 26px; font-weight: 700; margin: 0; color: #000;">Ottime notizie! 🎉</h1>
              <p style="font-size: 16px; color: #666; margin-top: 10px;">Il tuo ordine è pronto per il ritiro.</p>
            </div>
            
            <div style="background-color: #f8f8f8; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #eeeeee;">
              <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 10px 0;">📍 Dove ritirare le tue stampe:</p>
              <p style="font-size: 17px; font-weight: 600; color: #000; margin: 0;">Via Roma 70, Mugnano del Cardinal (AV)</p>
              <p style="font-size: 13px; color: #666; margin-top: 8px;">Puoi passare in studio negli orari di apertura previsti.</p>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #333; margin-bottom: 24px;">
              Ciao! Abbiamo completato la stampa delle tue foto con la massima cura. Sono ora confezionate e ti aspettano in studio. 
              Se hai bisogno di coordinare il ritiro o hai domande, scrivici pure su WhatsApp tramite il nostro sito.
            </p>

            <div style="border-top: 1px solid #eee; padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="font-size: 14px; font-weight: 700; color: #000; margin: 0;">Carmine Felice Napolitano</p>
              <p style="font-size: 12px; color: #888; margin: 5px 0 0 0;">Fotografo Professionista</p>
            </div>

            <div style="margin-top: 50px; text-align: center;">
              <p style="font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 1.5px;">
                ID Ordine: ${record.id.slice(0, 8)} • Notifica di Consegna Automatica
              </p>
            </div>
          </div>
        `,
      }),
    });

    const resendResult = await resendResponse.json();

    if (resendResponse.ok) {
      console.log(`Successo: Email inviata a ${email}. ID Transazione: ${resendResult.id}`);
      return new Response(JSON.stringify({ success: true, id: resendResult.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      console.error("Errore API Resend:", JSON.stringify(resendResult));
      return new Response(JSON.stringify({ success: false, error: resendResult }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("Errore generico nell'esecuzione della Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});