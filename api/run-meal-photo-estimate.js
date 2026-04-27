import { verifyChatCaller, chatRateLimitCheck, getClientIp } from "./chat-diet-guard.js";

export async function runMealPhotoEstimate(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = await verifyChatCaller(req);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const rateKey = auth.userId ? `photo:${auth.userId}` : `photo-ip:${getClientIp(req)}`;
  if (!chatRateLimitCheck(rateKey)) {
    res.status(429).json({ error: "Zbyt wiele analiz zdjęć. Spróbuj za chwilę." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || "";
  const preferredModel = String(process.env.GEMINI_VISION_MODEL || "gemini-1.5-flash").trim();
  const modelCandidates = uniqueModels([
    preferredModel,
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
  ]);
  if (!apiKey) {
    res.status(500).json({ error: "Brak GEMINI_API_KEY na serwerze." });
    return;
  }

  const imageDataUrl = String(req.body?.imageDataUrl || "");
  const note = String(req.body?.note || "").trim();
  if (!imageDataUrl.startsWith("data:image/")) {
    res.status(400).json({ error: "Brak poprawnego zdjęcia (data URL)." });
    return;
  }

  const parsedData = parseImageDataUrl(imageDataUrl);
  if (!parsedData) {
    res.status(400).json({ error: "Niepoprawny format zdjęcia." });
    return;
  }

  const prompt = [
    "Oceń kalorykę posiłku ze zdjęcia. Odpowiedz WYŁĄCZNIE JSON-em.",
    "Format:",
    '{"estimatedKcal":650,"proteinG":35,"fatG":20,"carbsG":70,"confidence":0.72,"summary":"krótki opis"}',
    "Zasady:",
    "- estimatedKcal: liczba całkowita (100-2500)",
    "- proteinG/fatG/carbsG: liczby (>=0)",
    "- confidence: 0-1",
    "- summary: 1-2 krótkie zdania po polsku",
    note ? `Notatka użytkownika: ${note}` : "Brak dodatkowej notatki."
  ].join("\n");

  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: parsedData.mimeType,
                data: parsedData.base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };
    const modelResult = await callGeminiWithFallback(apiKey, modelCandidates, payload);
    if (!modelResult.ok) {
      res.status(502).json({
        error: modelResult.message || "Błąd zewnętrznego API (Gemini).",
        details: modelResult.details || null
      });
      return;
    }
    const data = modelResult.data;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = safeJson(rawText);
    const normalized = normalizeEstimate(parsed);
    if (!normalized) {
      res.status(502).json({ error: "Nie udało się odczytać wyniku analizy zdjęcia." });
      return;
    }
    res.status(200).json({ ...normalized, model: modelResult.model });
  } catch (err) {
    console.error("[meal-photo-estimate]", err);
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
}

function parseImageDataUrl(url) {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(url);
  if (!m) return null;
  return { mimeType: m[1], base64: m[2] };
}

function safeJson(text) {
  const t = String(text || "").trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    const open = t.indexOf("{");
    const close = t.lastIndexOf("}");
    if (open === -1 || close <= open) return null;
    try {
      return JSON.parse(t.slice(open, close + 1));
    } catch {
      return null;
    }
  }
}

function normalizeEstimate(obj) {
  if (!obj || typeof obj !== "object") return null;
  const estimatedKcal = Math.round(Number(obj.estimatedKcal));
  if (!Number.isFinite(estimatedKcal) || estimatedKcal < 100 || estimatedKcal > 2500) return null;
  const proteinG = clampNumber(obj.proteinG, 0, 300);
  const fatG = clampNumber(obj.fatG, 0, 250);
  const carbsG = clampNumber(obj.carbsG, 0, 400);
  const confidence = clampNumber(obj.confidence, 0, 1);
  const summary = String(obj.summary || "").trim().slice(0, 500);
  return { estimatedKcal, proteinG, fatG, carbsG, confidence, summary };
}

function clampNumber(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n * 10) / 10));
}

function uniqueModels(models) {
  const out = [];
  for (const m of models) {
    const v = String(m || "").trim();
    if (!v || out.includes(v)) continue;
    out.push(v);
  }
  return out;
}

async function callGeminiWithFallback(apiKey, models, payload) {
  let lastStatus = 0;
  let lastBody = "";
  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (r.ok) {
      const data = await r.json();
      return { ok: true, model, data };
    }
    const txt = await r.text();
    lastStatus = r.status;
    lastBody = String(txt || "");
    console.error("[meal-photo] Gemini HTTP", r.status, model, lastBody.slice(0, 800));
    // Retry with another model on unsupported/not found/server errors.
    if ([404, 429, 500, 502, 503].includes(r.status)) continue;
    break;
  }
  return {
    ok: false,
    message: "Błąd zewnętrznego API (Gemini).",
    details: {
      status: lastStatus || null,
      body: lastBody ? lastBody.slice(0, 280) : null
    }
  };
}
