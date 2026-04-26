/** Maks. długość pytania do modelu (znaki). */
export const CHAT_MAX_MESSAGE_LEN = 16_000;
/** Maks. rozmiar serializowanego kontekstu (JSON). */
export const CHAT_MAX_CONTEXT_BYTES = 400_000;

const rateBuckets = new Map();
const RATE_WINDOW_MS = Number(process.env.CHAT_RATE_WINDOW_MS || 60_000);
const RATE_MAX = Number(process.env.CHAT_RATE_MAX || 30);

export function getClientIp(req) {
  const h = req.headers || {};
  const xff = h["x-forwarded-for"] || h["x-real-ip"] || h["x-vercel-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    const first = xff.split(",")[0].trim();
    if (first) return first.slice(0, 128);
  }
  const ra = req.socket?.remoteAddress;
  if (ra) return String(ra).slice(0, 128);
  return "unknown";
}

/**
 * Prosty limit częstotliwości (okno czasowe na klucz).
 * Na serverless bez wspólnej pamięci między instancjami ochrona jest przybliżona.
 */
export function chatRateLimitCheck(key) {
  const now = Date.now();
  let e = rateBuckets.get(key);
  if (!e || now - e.t0 >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { t0: now, n: 1 });
    if (rateBuckets.size > 15_000) rateBuckets.clear();
    return true;
  }
  e.n += 1;
  return e.n <= RATE_MAX;
}

/**
 * Gdy na serwerze ustawione są SUPABASE_URL i SUPABASE_ANON_KEY — wymagany jest
 * ważny access token użytkownika (Authorization: Bearer …).
 * Bez tych zmiennych (lokalny serwer bez Supabase) — brak weryfikacji JWT.
 * CHAT_REQUIRE_AUTH=false — wyłącza JWT mimo skonfigurowanego Supabase (niezalecane).
 */
export async function verifyChatCaller(req) {
  const url = String(process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const anon = String(process.env.SUPABASE_ANON_KEY || "").trim();
  const authDisabled = String(process.env.CHAT_REQUIRE_AUTH || "").toLowerCase() === "false";

  if (!url || !anon) {
    return { ok: true, userId: null, mode: "no_supabase_env" };
  }
  if (authDisabled) {
    return { ok: true, userId: null, mode: "auth_disabled" };
  }

  const raw = String(req.headers?.authorization || "").trim();
  const m = /^Bearer\s+(.+)$/i.exec(raw);
  const token = m?.[1]?.trim();
  if (!token) {
    return { ok: false, status: 401, error: "Wymagane logowanie: brak tokenu sesji." };
  }

  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anon
      }
    });
    if (!r.ok) {
      return { ok: false, status: 401, error: "Nieprawidłowa lub wygasła sesja. Zaloguj się ponownie." };
    }
    const body = await r.json();
    const id = body?.id ? String(body.id) : null;
    if (!id) {
      return { ok: false, status: 401, error: "Brak identyfikatora użytkownika w tokenie." };
    }
    return { ok: true, userId: id, mode: "jwt" };
  } catch {
    return { ok: false, status: 503, error: "Nie udało się zweryfikować sesji. Spróbuj ponownie." };
  }
}
