import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Ensure environment variables are loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to lazily initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in environment variables. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Ensure the endpoint doesn't crash on standard errors by providing a wrapper
function handleAsync(fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res, next).catch((err) => {
      console.error("API Error:", err);
      res.status(500).json({ error: err.message || "An internal error occurred." });
    });
  };
}

// ── 1. VOX DIRECTOR COMPOSITION ENDPOINT ──
app.post("/api/vox-director", handleAsync(async (req, res) => {
  const { prompt, bpm, energy, mood, genre } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Creative prompt is required." });
  }

  const ai = getGeminiClient();

  const userQuery = `Create a complete digital music and video concept brief based on this description:\nPrompt: "${prompt}"\nBPM Target: ${bpm}\nEnergy level: ${energy}%\nMood vibe: ${mood}\nPrimary genre: ${genre}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: userQuery,
    config: {
      systemInstruction: "You are the Vox Director AI, a world-class award-winning electronic music producer, audio engineer, and creative visual director. Given a music prompt and style parameters, compile a structured track concept blueprint. Be incredibly vivid, inspiring, and cinematic.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A highly creative, memorable, futuristic name for the song." },
          genre: { type: Type.STRING, description: "Primary genre of the composed track." },
          subgenre: { type: Type.STRING, description: "Vibe or subgenre style (e.g. Dreamwave, Cyber-Industrial, Ambient Noir)." },
          bpm: { type: Type.INTEGER, description: "Numeric BPM closest to target." },
          key: { type: Type.STRING, description: "Suggested musical key (e.g., F Minor, D# Major, A Minor)." },
          duration: { type: Type.STRING, description: "Estimated track duration in X:XX format." },
          concept: { type: Type.STRING, description: "3-sentence cinematic summary explaining the track's sonic journey, instrumentation shifts, and emotional climax." },
          hook: { type: Type.STRING, description: "A striking, deeply memorable main lyric hook or vocal theme." },
          structure: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of song structure parts, e.g. ['Intro', 'Verse 1', 'Chorus', 'Drop', 'Outro']."
          },
          keyInstruments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 4-5 core instruments or synth patches used in this track's blueprint."
          },
          productionTips: { type: Type.STRING, description: "A pro production secret tip to make this track sound full and cinematic." },
          videoVibe: { type: Type.STRING, description: "A 1-sentence cinematic visual scenario/setting for a beat-reactive AI music video." },
          captions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2 distinct viral social media captions with hashtags (one upbeat/hype, one deep/conceptual)."
          },
          viralScore: { type: Type.INTEGER, description: "An estimated score between 75 and 99 reflecting modern viral potential." }
        },
        required: [
          "title", "genre", "subgenre", "bpm", "key", "duration",
          "concept", "hook", "structure", "keyInstruments",
          "productionTips", "videoVibe", "captions", "viralScore"
        ]
      }
    }
  });

  const textOutput = response.text;
  if (!textOutput) {
    throw new Error("Unable to generate track concept. Please try again.");
  }

  const blueprint = JSON.parse(textOutput);
  res.json(blueprint);
}));

// ── 2. PROMPT ENHANCER ENDPOINT ──
app.post("/api/enhance-prompt", handleAsync(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Original prompt is required." });
  }

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Transform this basic music/video prompt into an intensely descriptive, sonic, visual, and highly production-ready creative brief under 150 words: "${prompt}"\nIncorporate details about synthesizers, drums, sub-bass, atmospheric soundscapes, emotional peaks, and cinematic styling. Only return the enhanced paragraph. Keep it clean and inspirational.`,
  });

  res.json({ enhanced: response.text?.trim() || prompt });
}));

// ── 3. LYRICS GENERATOR ENDPOINT ──
app.post("/api/lyrics", handleAsync(async (req, res) => {
  const { title, topic, genre, mood, bpm, hook, mode } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "A theme or topic is required." });
  }

  const ai = getGeminiClient();

  const promptText = `Compose lyrics for a song titled "${title || 'Vox Track'}" about the theme of "${topic}".
Genre: ${genre || 'Pop'}
Style: ${mood || 'Emotional'}
Tempo: ${bpm || 120} BPM
Incorporate this hook reference if applicable: "${hook || ''}"
Lyrics mode: ${mode || 'full'}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: promptText,
    config: {
      systemInstruction: "You are an elite, chart-topping visual songwriter and lyricist. Write song lyrics that have rhythm, strong rhymes, and genuine emotional resonance. Avoid cheesy cliches. Structure each block of lyrics cleanly.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Section header e.g. INTRO, VERSE 1, CHORUS, BRIDGE, OUTRO" },
                lyrics: { type: Type.STRING, description: "Multi-line verse text with correct linebreaks" }
              },
              required: ["label", "lyrics"]
            }
          }
        },
        required: ["sections"]
      }
    }
  });

  const textOutput = response.text;
  if (!textOutput) {
    throw new Error("Unable to write lyrics. Try a different topic.");
  }

  res.json(JSON.parse(textOutput));
}));

// ── 4. CHAT ASSISTANT ENDPOINT ──
app.post("/api/chat-assistant", handleAsync(async (req, res) => {
  const { message, blueprintContext } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const ai = getGeminiClient();

  let contextString = "No active track blueprint compiled yet.";
  if (blueprintContext) {
    contextString = `Active blueprint: "${blueprintContext.title}" — Genre: ${blueprintContext.genre} (${blueprintContext.subgenre}) at ${blueprintContext.bpm} BPM. Key: ${blueprintContext.key}. Hook: "${blueprintContext.hook}". Concept: ${blueprintContext.concept}`;
  }

  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction: `You are the Vox Director AI, a brilliant, futuristic master producer inside the Vox MusicGen creation studio. Your duty is to help user design world-class music, suggest dynamic vertical video scenes, tweak lyrics, suggest mixing/mastering tricks, or optimize social post captions. Offer highly specific, technical, and creative advice. Keep responses strictly under 150 words. Current Context: ${contextString}`
    }
  });

  const response = await chat.sendMessage({ message: message });
  res.json({ text: response.text });
}));

// ── VITE OR STATIC FILE SERVING MIDDLEWARE ──
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully running on http://0.0.0.0:${PORT}`);
  });
}

initServer();
