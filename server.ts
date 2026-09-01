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
    console.log("[CONTATTI] richiesta ricevuta");
    try {
      const data = req.body;
      console.log("[CONTATTI] invio email");
      
      if (!resend) {
        console.warn("[CONTATTI] Manca la chiave API di Resend (RESEND_API_KEY). L'email non può essere inviata realmente.");
        res.status(500).json({ error: "Configurazione server mancante (API Key Resend)" });
        return;
      }

      const { data: responseData, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>",
        to: TARGET_EMAIL,
        subject: `Nuovo messaggio dal sito – ${data.name}`,
        html: `
          <h2>Nuovo messaggio dal sito (Sezione Contatti)</h2>
          <p><strong>Nome:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefono:</strong> ${data.phone || 'Non specificato'}</p>
          <p><strong>Tipo Evento:</strong> ${data.eventType || 'Non specificato'}</p>
          <p><strong>Messaggio:</strong><br/>${data.message.replace(/\\n/g, '<br/>')}</p>
        `,
      });

      if (error) {
        console.error("[CONTATTI] risposta provider email (ERRORE):", error);
        res.status(500).json({ error: error.message });
        return;
      }

      console.log("[CONTATTI] risposta provider email (SUCCESSO):", responseData);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[CONTATTI] errore server:", err);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  app.post("/api/wedding", async (req, res) => {
    console.log("[WEDDING] richiesta ricevuta");
    try {
      const data = req.body;
      console.log("[WEDDING] invio email");
      
      if (!resend) {
        console.warn("[WEDDING] Manca la chiave API di Resend (RESEND_API_KEY). L'email non può essere inviata realmente.");
        res.status(500).json({ error: "Configurazione server mancante (API Key Resend)" });
        return;
      }

      const { data: responseData, error } = await resend.emails.send({
        from: "Sito Web <onboarding@resend.dev>",
        to: TARGET_EMAIL,
        subject: `Nuova richiesta Consulenza Wedding – ${data.names}`,
        html: `
          <h2>Nuova richiesta Consulenza Wedding dal sito</h2>
          <p><strong>Nome degli sposi:</strong> ${data.names}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefono:</strong> ${data.phone || 'Non specificato'}</p>
          <p><strong>Data del Matrimonio:</strong> ${data.date || 'Non specificata'}</p>
          <p><strong>Location:</strong> ${data.location || 'Non specificata'}</p>
          <p><strong>Messaggio:</strong><br/>${data.message.replace(/\\n/g, '<br/>')}</p>
        `,
      });

      if (error) {
        console.error("[WEDDING] risposta provider email (ERRORE):", error);
        res.status(500).json({ error: error.message });
        return;
      }

      console.log("[WEDDING] risposta provider email (SUCCESSO):", responseData);
      res.json({ success: true });
    } catch (err: any) {
      console.error("[WEDDING] errore server:", err);
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
