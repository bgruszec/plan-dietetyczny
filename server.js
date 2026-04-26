import express from "express";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

loadDotEnv();

const app = express();
const port = Number(process.env.PORT || 3000);
const apiKey = process.env.GEMINI_API_KEY || "";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(process.cwd()));

app.post("/api/chat-diet", async (req, res) => {
  if (!apiKey) {
    res.status(500).json({ error: "Brak GEMINI_API_KEY na serwerze." });
    return;
  }

  const message = String(req.body?.message || "").trim();
  const context = req.body?.context || {};
  const forceChanges = Boolean(req.body?.forceChanges);
  if (!message) {
    res.status(400).json({ error: "Brak pytania." });
    return;
  }

  const systemPrompt = [
    "Jestes asystentem planu dietetycznego.",
    "Odpowiadaj po polsku, konkretnie i praktycznie.",
    "Mozesz proponowac zmiany tylko w formacie:",
    "{\"answer\":\"...\",\"changes\":[{\"week\":1,\"day\":2,\"slotId\":\"meal2\",\"recipeId\":\"R10\",\"reason\":\"...\"}]}",
    "Zasady slotow: meal1=sniadanie, meal2=obiad, meal3=kolacja, snack=przekaska.",
    "Mozesz wybierac recipeId z calej listy availableRecipes, a nie tylko z biezacego dnia.",
    "Nie proponuj zmian medycznych ani farmakologicznych.",
    "Jesli nie proponujesz zmian, zwroc pusta tablice changes.",
    forceChanges
      ? "W TEJ odpowiedzi musisz zwrocic przynajmniej jedna poprawna zmiane w polu changes."
      : "Gdy uzytkownik pyta o zamiane/zmiane planu, dodaj konkretne propozycje w changes."
  ].join("\n");

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nKontekst planu:\n${JSON.stringify(context, null, 2)}\n\nPytanie użytkownika:\n${message}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3
      }
    };

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const txt = await geminiRes.text();
      res.status(502).json({ error: `Gemini API error: ${txt}` });
      return;
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = parseAssistantJson(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Nieznany błąd serwera." });
  }
});

app.get("*", (req, res) => {
  const indexPath = resolve(process.cwd(), "index.html");
  if (existsSync(indexPath)) {
    res.type("html").send(readFileSync(indexPath, "utf8"));
    return;
  }
  res.status(404).send("Brak index.html");
});

app.listen(port, () => {
  console.log(`Server started: http://localhost:${port}`);
});

function parseAssistantJson(rawText) {
  const cleaned = String(rawText || "").trim();
  const extracted = extractJsonBlock(cleaned);
  if (!extracted) {
    return { answer: cleaned || "Brak odpowiedzi.", changes: [] };
  }

  try {
    const parsed = JSON.parse(extracted);
    const answer = String(parsed.answer || "").trim() || cleaned;
    const changes = Array.isArray(parsed.changes) ? parsed.changes.map(normalizeChange).filter(Boolean) : [];
    return { answer, changes };
  } catch {
    return { answer: cleaned || "Brak odpowiedzi.", changes: [] };
  }
}

function normalizeChange(change) {
  const week = Number(change?.week);
  const day = Number(change?.day);
  const slotId = String(change?.slotId || "");
  const recipeId = String(change?.recipeId || "");
  if (!Number.isInteger(week) || week < 1 || week > 4) return null;
  if (!Number.isInteger(day) || day < 1 || day > 7) return null;
  if (!["meal1", "meal2", "meal3", "snack"].includes(slotId)) return null;
  if (!/^R\d+$/.test(recipeId)) return null;
  return {
    week,
    day,
    slotId,
    recipeId,
    reason: String(change?.reason || "")
  };
}

function extractJsonBlock(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  const openIdx = text.indexOf("{");
  const closeIdx = text.lastIndexOf("}");
  if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) return null;
  return text.slice(openIdx, closeIdx + 1);
}

function loadDotEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}
