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