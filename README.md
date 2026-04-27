# plan-dietetyczny

## Setup (lokalnie)

1. Zainstaluj zależności:
   - `npm install`
2. Uzupełnij `.env` na bazie `.env.example`.
3. Uruchom:
   - `npm start`

## Wymagane zmienne środowiskowe

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (np. `gemini-pro-latest`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Supabase

- W SQL Editor uruchom: `supabase/schema.sql`
- W Authentication -> Providers pozostaw Email/Password
- RLS jest włączone i ogranicza dane do zalogowanego użytkownika

## Vercel

Dodaj ENV dla Production/Preview:
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## iOS / release checklist

- [ ] `npm run cap:sync:ios` po każdej zmianie webowej
- [ ] Sprawdzone logowanie i synchronizacja profilu z Supabase
- [ ] Sprawdzone AI (backend publiczny + `API_BASE_URL`)
- [ ] Sprawdzone lokalne powiadomienia o posiłkach
- [ ] Ikona/splash aktualne i poprawnie widoczne
- [ ] `Product -> Clean Build Folder` przed buildem finalnym
- [ ] W Xcode: wersja (`MARKETING_VERSION`) i build (`CURRENT_PROJECT_VERSION`)
- [ ] Podpisywanie (`Signing & Capabilities`) na docelowym koncie
- [ ] Test na fizycznym iPhonie (co najmniej 1 pełen dzień planu)