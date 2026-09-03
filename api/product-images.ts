import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "app_config";
const FILE_NAME = "product-images.json";

function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://thiyeerwwhwarekudhyg.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "sb_publishable_9L_viW10ykD4HaQ44sF2tQ_d_4aR09r";

  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req: any, res: any) {
  // CORS & Cache prevention headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabase = getSupabaseServerClient();

  // GET: Recupera i link salvati nel Cloud (Supabase)
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(FILE_NAME);

      if (error || !data) {
        // Se non esiste ancora, restituisce oggetto vuoto (i client useranno i fallback predefiniti)
        return res.status(200).json({ success: true, links: {}, source: "defaults" });
      }

      const text = await data.text();
      const parsed = JSON.parse(text);
      return res.status(200).json({ success: true, links: parsed, source: "supabase" });
    } catch (err: any) {
      console.error("[PRODUCT-IMAGES API] Errore lettura:", err?.message || err);
      return res.status(200).json({ success: true, links: {}, error: err?.message });
    }
  }

  // POST: Salva o aggiorna i link nel Cloud (Supabase)
  if (req.method === "POST") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: "Formato richiesta non valido (JSON non valido)" });
        }
      }

      const links = body?.links;
      if (!links || typeof links !== "object") {
        return res.status(400).json({ error: "Il campo 'links' deve essere un oggetto valido" });
      }

      const payloadToSave = {
        ...links,
        updated_at: new Date().toISOString(),
      };

      // Assicura che il bucket esista
      try {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      } catch {
        // Ignora se il bucket esiste già
      }

      const buffer = Buffer.from(JSON.stringify(payloadToSave, null, 2));
      const { data: upData, error: upError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(FILE_NAME, buffer, {
          contentType: "application/json",
          upsert: true,
        });

      if (upError) {
        console.error("[PRODUCT-IMAGES API] Errore salvataggio Supabase:", upError.message);
        return res.status(500).json({ error: upError.message });
      }

      console.log("[PRODUCT-IMAGES API] Link foto aggiornati con successo nel cloud:", upData);
      return res.status(200).json({
        success: true,
        links: payloadToSave,
        updatedAt: payloadToSave.updated_at,
      });
    } catch (err: any) {
      console.error("[PRODUCT-IMAGES API] Eccezione salvataggio:", err?.message || err);
      return res.status(500).json({ error: "Errore interno durante il salvataggio" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
  return res.status(405).json({ error: `Metodo ${req.method} non consentito` });
}
