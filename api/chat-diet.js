export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-pro-latest";
  if (!apiKey) {
    res.status(500).json({ error: "Brak GEMINI_API_KEY na serwerze." });
    return;
  }

  const message = String(req.body?.message || "").trim();
  const context = req.body?.context || {};
  const mode = String(req.body?.mode || "plan");
  const forceChanges = Boolean(req.body?.forceChanges);
  const forceRecipePatch = Boolean(req.body?.forceRecipePatch);
  const target = req.body?.target || null;
  if (!message) {
    res.status(400).json({ error: "Brak pytania." });
    return;
  }

  if (mode === "recipe") {
    const fid = String(context?.focusRecipe?.id || "").trim();
    if (!fid) {
      res.status(400).json({ error: "Brak wybranego przepisu (focusRecipe)." });
      return;
    }
  }

  const systemPrompt =
    mode === "recipe"
      ? buildRecipeModePrompt(forceRecipePatch)
      : buildPlanModePrompt(forceChanges, target);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nKontekst:\n${JSON.stringify(context, null, 2)}\n\nPytanie użytkownika:\n${message}`
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

    if (mode === "recipe") {
      const focus = context.focusRecipe;
      const recipePatch = validateRecipePatch(parsed.recipePatch, focus);
      res.status(200).json({
        answer: parsed.answer,
        changes: [],
        recipePatch
      });
      return;
    }

    parsed.changes = validateChanges(parsed.changes, context, target);
    res.status(200).json({ answer: parsed.answer, changes: parsed.changes, recipePatch: null });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Nieznany błąd serwera." });
  }
}

function buildRecipeModePrompt(forceRecipePatch) {
  return [
    "Jestes asystentem dietetycznym. Uzytkownik wybral JEDEN przepis (pole focusRecipe w kontekscie).",
    "Odpowiadaj po polsku, konkretnie i praktycznie.",
    "Gdy proponujesz zmodyfikowana wersje przepisu, zwroc JSON:",
    '{"answer":"...","recipePatch":{"title":"...","kcal":600,"ingredients":["..."],"steps":["..."],"reason":"..."}}',
    "Pole recipePatch jest opcjonalne: uzupelnij tylko pola, ktore sie zmieniaja.",
    "Jesli zmieniasz ingredients lub steps, podaj PELNA nowa liste (wszystkie pozycje / kroki), nie fragmenty ani diff.",
    "kcal — liczba calkowita, szacunek dla proponowanej wersji.",
    "Nie uzywaj pola changes ani slotow planu — tylko recipePatch.",
    "Nie proponuj zmian medycznych ani farmakologicznych.",
    forceRecipePatch
      ? "W TEJ odpowiedzi musisz zwrocic recipePatch z co najmniej jednym sensownym polem (np. ingredients lub steps lub kcal)."
      : "Gdy uzytkownik prosi o zmiane przepisu, dodaj recipePatch; przy samej poradzie bez zmiany przepisu mozesz pominac recipePatch."
  ].join("\n");
}

function buildPlanModePrompt(forceChanges, target) {
  return [
    "Jestes asystentem planu dietetycznego.",
    "Odpowiadaj po polsku, konkretnie i praktycznie.",
    "Mozesz proponowac zmiany tylko w formacie:",
    '{"answer":"...","changes":[{"week":1,"day":2,"slotId":"meal2","recipeId":"R10","reason":"..."}]}',
    "Zasady slotow: meal1=sniadanie, meal2=obiad, meal3=kolacja, snack=przekaska.",
    "Mozesz wybierac recipeId z calej listy availableRecipes, a nie tylko z biezacego dnia.",
    "Nie proponuj zmian medycznych ani farmakologicznych.",
    "Jesli nie proponujesz zmian, zwroc pusta tablice changes.",
    forceChanges
      ? "W TEJ odpowiedzi musisz zwrocic przynajmniej jedna poprawna zmiane w polu changes."
      : "Gdy uzytkownik pyta o zamiane/zmiane planu, dodaj konkretne propozycje w changes.",
    target?.slotId && Number.isInteger(Number(target?.week)) && Number.isInteger(Number(target?.day))
      ? `UWAGA: Proponuj zmiany tylko dla week=${Number(target.week)}, day=${Number(target.day)}, slotId=${String(target.slotId)}.`
      : "Brak sztywnego targetu slotu."
  ].join("\n");
}

function parseAssistantJson(rawText) {
  const cleaned = String(rawText || "").trim();
  const extracted = extractJsonBlock(cleaned);
  if (!extracted) {
    return { answer: cleaned || "Brak odpowiedzi.", changes: [], recipePatch: null };
  }

  try {
    const parsed = JSON.parse(extracted);
    const answer = String(parsed.answer || "").trim() || cleaned;
    const changes = Array.isArray(parsed.changes) ? parsed.changes.map(normalizeChange).filter(Boolean) : [];
    const recipePatch = parsed.recipePatch && typeof parsed.recipePatch === "object" ? parsed.recipePatch : null;
    return { answer, changes, recipePatch };
  } catch {
    return { answer: cleaned || "Brak odpowiedzi.", changes: [], recipePatch: null };
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

function validateChanges(changes, context, target) {
  const available = Array.isArray(context?.availableRecipes) ? context.availableRecipes : [];
  const byId = Object.fromEntries(available.map((r) => [r.id, r]));

  return (changes || []).filter((change) => {
    if (!byId[change.recipeId]) return false;
    if (target?.slotId && target?.week && target?.day) {
      if (change.slotId !== String(target.slotId)) return false;
      if (change.week !== Number(target.week)) return false;
      if (change.day !== Number(target.day)) return false;
    }
    const cats = byId[change.recipeId]?.categories || [];
    if (change.slotId === "meal1" || change.slotId === "meal3") {
      return cats.includes("sniadanie") || cats.includes("kolacja");
    }
    if (change.slotId === "meal2") return cats.includes("obiad");
    if (change.slotId === "snack") return cats.includes("przekaska");
    return false;
  });
}

function validateRecipePatch(patch, focusRecipe) {
  if (!patch || typeof patch !== "object" || !focusRecipe?.id) return null;
  const id = String(focusRecipe.id);
  const out = {};

  if (typeof patch.title === "string") {
    const t = patch.title.trim();
    if (t && t.length <= 220) out.title = t;
  }

  if (patch.kcal !== undefined && patch.kcal !== null) {
    const k = Number(patch.kcal);
    if (Number.isFinite(k) && k >= 150 && k <= 4000) out.kcal = Math.round(k);
  }

  if (Array.isArray(patch.ingredients)) {
    const ing = patch.ingredients
      .filter((x) => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 100);
    if (ing.length) out.ingredients = ing;
  }

  if (Array.isArray(patch.steps)) {
    const st = patch.steps
      .filter((x) => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 80);
    if (st.length) out.steps = st;
  }

  if (typeof patch.reason === "string") {
    const r = patch.reason.trim();
    if (r && r.length <= 2000) out.reason = r;
  }

  if (!out.title && out.kcal === undefined && !out.ingredients && !out.steps) return null;

  out.recipeId = id;
  return out;
}

function extractJsonBlock(text) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  const openIdx = text.indexOf("{");
  const closeIdx = text.lastIndexOf("}");
  if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) return null;
  return text.slice(openIdx, closeIdx + 1);
}
