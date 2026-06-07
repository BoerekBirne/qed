import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini agent initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support JSON parsing
  app.use(express.json({ limit: '25mb' }));

  // API Status route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: AI Coach proxy
  app.post("/api/ai", async (req, res) => {
    try {
      const { inhalt, mode, titel, fach, uploadedImage } = req.body;

      if (!inhalt && !uploadedImage) {
        return res.status(400).json({ error: "Fehlender Inhalt oder Bild für die KI-Analyse." });
      }

      const ai = getGeminiClient();
      let prompt = "";
      let systemInstruction = "Du bist QEDs intelligenter AI Coach für Schüler-Prüfungsvorbereitung. Schreibe extrem kurze, präzise und knappe Antworten. Du darfst NIEMALS Begrüßungsformeln, Einleitungen, Höflichkeitsfloskeln oder Verabschiedungen verwenden. Beginne direkt mit dem angeforderten Inhalt. Benutze absolut KEINE Emojis. Benutze absolut KEINE Dollar-Symbole ($) oder LaTeX-Math-Syntax - schreibe mathematische und physikalische Formeln oder Hochzahlen immer als einfachen Klartext (z.B. CO2, H2O, x^2) und umschließe sie niemals mit $. Antworte immer auf Deutsch.";
      let responseMimeType = "text/plain";

      if (mode === "quiz") {
        responseMimeType = "application/json";
        prompt = `Erstelle ein interaktives Quiz bestehend aus GENAU 15 Multiple-Choice-Fragen basierend auf folgendem Text oder Bildinhalt: "${titel}" (Fach: ${fach || "Allgemein"}).
Inhalt / Kontext:
${inhalt || "Bildanalyse"}

Gib den Output AUSSCHLIESSLICH als ein gültiges JSON-Array zurück. Verwende exakt folgende JSON-Struktur, ohne Einleitung, Backticks (\`\`\`json) oder sonstigen Text:
[
  {
    "question": "Die Frage als Text geschrieben?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Sehr kurze, direkte Erklärung der richtigen Antwort."
  }
]
Das Array MUSS genau 15 Fragen enthalten. Generiere anspruchsvolle Fragen passend zum selben Fach "${fach}" und dem tatsächlichen Inhalt. Falls der Inhalt Vokabeln einer Fremdsprache enthält, frage nach deren Übersetzung oder Bedeutung. Antworte immer auf Deutsch. Verwende kein LaTeX, keine Dollar-Zeichen ($) und keine Emojis.`;
      } else if (mode === "vocab") {
        responseMimeType = "application/json";
        prompt = `Extrahiere wichtige Vokabeln, Fremdwörter, Fachbegriffe, Formeln, Definitionen oder Begriffspaare aus folgendem Text oder Bildinhalt für das Fach "${fach || "Allgemein"}" zum Thema "${titel}".
Inhalt / Kontext:
${inhalt || "Bildanalyse"}

WICHTIGE REGEL FÜR FREMDSPRACHEN (z.B. Englisch, Französisch, Spanisch, Latein etc.):
Falls der Inhalt Vokabeln aus einer Fremdsprache enthält oder das Fach eine Fremdsprache ist, erstelle die Karteikarten so, dass "term" das Vokabelwort in der Fremdsprache (z.B. Englisch) ist, und "definition" die genaue deutsche Übersetzung bzw. Entsprechung liefert (z.B. {"term": "apple", "definition": "Apfel"}). Erkläre keine Begriffe langatmig auf Deutsch, sondern liefere kurze, knackige Übersetzungen!

Gib den Output AUSSCHLIESSLICH als ein gültiges JSON-Array zurück. Verwende exakt folgende JSON-Struktur, ohne Einleitung, Backticks (\`\`\`json) oder sonstigen Text:
[
  {
    "term": "Was ist der Begriff oder das Wort?",
    "definition": "Die Definition, Übersetzung oder Erklärung des Begriffs."
  }
]
Generiere genau 5 bis 10 wichtige Vokabelkarten. Antworte immer auf Deutsch. Verwende kein LaTeX, keine Dollar-Zeichen ($) und keine Emojis.`;
      } else if (mode === "chat") {
        prompt = inhalt ? `Beantworte folgende Frage: "${inhalt}" basierend auf dem gezeigten Kontext bzw. Bild.` : "Analysiere das Bild und erkläre seinen Inhalt kurz und prägnant.";
      } else {
        // analyze
        prompt = `Erstelle eine extrem kurze Zusammenfassung und Analyse des folgenden Lernzettels oder Bildinhaltes: "${titel}" (Fach: ${fach || "Allgemein"}).
Inhalt / Kontext:
${inhalt || "Übermitteltes Bild"}

Erstelle direkt und ohne Einleitung:
1. Eine ultrakurze Synthese (maximal 2 Sätze).
2. Bis zu 3 kurze Kernpunkte (auf den Punkt gebracht).
3. 2 konkrete, kurze Lerntipps.
Benutze keine Emojis und absolut keine Dollar-Symbole ($) im Text.`;
      }

      let contents: any;
      if (uploadedImage) {
        const matches = uploadedImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        let mimeType = "image/jpeg";
        let data = uploadedImage;
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          data = matches[2];
        }
        contents = [
          {
            inlineData: {
              mimeType,
              data
            }
          },
          prompt
        ];
      } else {
        contents = prompt;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: responseMimeType as any
        }
      });

      const responseText = response.text || "Keine Rückmeldung von der KI erhalten.";
      return res.json({ text: responseText });

    } catch (err: any) {
      console.error("Gemini processing error:", err);
      return res.status(500).json({
        error: "Fehler bei der KI-Generierung",
        details: err?.message || String(err)
      });
    }
  });

  // API Route: OCR Image analysis
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Fehlendes Bild für die Analyse." });
      }

      // Format check & cleanup
      const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let data = imageBase64;
      
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        data = matches[2];
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType,
              data
            }
          },
          "Extrahiere den kompletten sichtbaren Text, Tabellen, Formeln oder Aufschriebe aus diesem Foto von einem Lernzettel bzw. Schulheft auf Deutsch. Wenn kein nennenswerter Text vorhanden ist, beschreibe das Bild extrem detailliert. Gib absolut nur den extrahierten Text zurück, fange direkt an ohne Einleitungen, Höflichkeitsfloskeln oder Erklärung."
        ]
      });

      return res.json({ text: response.text || "" });
    } catch (err: any) {
      console.error("Image analysis error:", err);
      return res.status(500).json({
        error: "Fehler bei der Bildanalyse",
        details: err?.message || String(err)
      });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QED Back-End] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start QED server:", error);
});
