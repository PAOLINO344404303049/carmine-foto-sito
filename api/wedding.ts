import { Resend } from "resend";

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

  console.log("[WEDDING] Richiesta ricevuta su Vercel Serverless Function");

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        console.error("[WEDDING] Errore nel parsing del body JSON");
        return res.status(400).json({ error: "Formato richiesta non valido (JSON corrotto)" });
      }
    }

    const { names, email, phone, date, location, message } = body || {};

    // Validazione dati
    if (!names || typeof names !== "string" || !names.trim()) {
      return res.status(400).json({ error: "Il campo 'Nome degli sposi' è obbligatorio." });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Il campo 'Email' è obbligatorio." });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Il campo 'Raccontaci il tuo evento / Messaggio' è obbligatorio." });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error("[WEDDING] ERRORE: Variabile d'ambiente RESEND_API_KEY non configurata!");
      return res.status(500).json({
        error: "Configurazione server mancante: la chiave RESEND_API_KEY non è impostata nelle variabili d'ambiente di Vercel.",
      });
    }

    const resend = new Resend(RESEND_API_KEY);
    const TARGET_EMAIL = "carminefotografo2@gmail.com";

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
      console.error("[WEDDING] Errore riscontrato da Resend:", error.name, error.message);
      return res.status(500).json({ error: error.message || "Errore durante l'invio dell'email tramite Resend" });
    }

    console.log("[WEDDING] Email inviata con successo, ID:", responseData?.id);
    return res.status(200).json({ success: true, id: responseData?.id });
  } catch (err: any) {
    console.error("[WEDDING] Eccezione interna server:", err?.message || err);
    return res.status(500).json({ error: "Si è verificato un errore interno durante l'elaborazione della richiesta." });
  }
}
