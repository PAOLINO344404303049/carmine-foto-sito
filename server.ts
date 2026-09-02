import express from "express";
import path from "path";
import { Resend } from "resend";

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
