# Claude Code Prompt: Annual Sport Plan — Full Implementation

## Context

Im `sportplan` Repo liegt unter `src/components/AnnualSportPlan.tsx` ein funktionierender React-Prototyp für meinen Jahres-Sportplan. Das Repo nutzt aktuell Vite + React + TypeScript.

Mein bestehender Stack:
- **GitHub**: `pschmeing/sportplan` (React/TS/Vite)
- **Vercel**: Deployment (mit Custom Domain möglich über Cloudflare)
- **Supabase**: Bereits vorhanden als DB (Projekt existiert)
- **Cloudflare**: DNS für philippschmeing.com
- **Strava API**: Soll Aktivitäten automatisch syncen
- **Homepage**: `pschmeing/ps_homepage` — statische HTML-Seite auf philippschmeing.com

## Aufgabe

Baue den Prototyp aus `AnnualSportPlan.tsx` zu einer produktionsfertigen App aus. Die App soll als eigene Vercel-Deployment laufen (z.B. `sportplan.philippschmeing.com` oder `philippschmeing.com/fitness/sportplan`).

### 1. Supabase Schema aufsetzen

Erstelle zwei Tabellen:

```sql
-- Jahresplan: Wochen mit Fokus, Load-Typ, geplante Workouts
CREATE TABLE weeks (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL DEFAULT 2026,
  kw INT NOT NULL,
  fokus TEXT NOT NULL CHECK (fokus IN ('Strength', 'Marathon', 'Deload / Longevity')),
  load TEXT NOT NULL CHECK (load IN ('Normal', 'Load', 'Deload')),
  workouts JSONB NOT NULL DEFAULT '{}', -- z.B. {"Mo": "S:Chest_A", "Di": "S:Back_A", "Do": "R:4x4"}
  UNIQUE(year, kw)
);

-- Strava-Aktivitäten
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  strava_id BIGINT UNIQUE,
  date DATE NOT NULL,
  kw INT NOT NULL,
  day_of_week TEXT NOT NULL, -- Mo, Di, Mi, Do, Fr, Sa, So
  type TEXT NOT NULL CHECK (type IN ('Run', 'Strength', 'Ride', 'Yoga')),
  heading TEXT, -- Strava activity name/title
  distance_km NUMERIC, -- null for Strength/Yoga
  duration_minutes NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_kw ON activities(kw);
CREATE INDEX idx_activities_date ON activities(date);
```

Seed die `weeks`-Tabelle mit den Daten aus `INITIAL_WEEKS` in der Komponente.

### 2. App-Architektur

Refactore die App:

- **`/` (public)**: Read-only Ansicht des Sportplans mit Strava-Daten. Kein Login nötig.
- **`/admin`**: Die Bulk-Edit UI wie im Prototyp. Geschützt mit einem simplen Passwort (Env Var `ADMIN_PASSWORD`), kein Auth-System nötig — einfacher Token/Cookie reicht.
- **API Routes / Server Functions**:
  - `GET /api/plan?year=2026` — liest alle Wochen + Aktivitäten
  - `PUT /api/plan/weeks` — Bulk-Update von Wochen (für Admin)
  - `POST /api/strava/sync` — Strava-Sync Endpoint (wird vom Cron aufgerufen)

### 3. Supabase Integration

- Ersetze den lokalen `useState` für `weeks` durch Supabase-Reads/Writes
- Admin-Seite: Bulk-Edit schreibt direkt in Supabase (`UPSERT` auf weeks-Tabelle)
- Public-Seite: Liest Plan + Aktivitäten und merged sie für die Anzeige
- Nutze `@supabase/supabase-js` Client

### 4. Strava API Sync

- Erstelle eine Vercel Cron Function die täglich läuft (oder alle 6 Stunden)
- Die Funktion nutzt den Strava API OAuth2 Refresh Token Flow:
  - Env Vars: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`
  - Refresh den Access Token bei jedem Aufruf
  - Hole die letzten Aktivitäten seit dem letzten Sync
  - Mappe Strava Activity Types:
    - `Run` → `Run`
    - `WeightTraining` → `Strength`
    - `Ride`, `VirtualRide` → `Ride`
    - `Yoga` → `Yoga`
  - Schreibe in die `activities`-Tabelle
  - Extrahiere aus dem Strava Activity Name (heading): bei Runs prüfe ob "Intervall", "Tempo", "Threshold" im Namen steht
- Konfiguriere `vercel.json` für den Cron:
  ```json
  { "crons": [{ "path": "/api/strava/sync", "schedule": "0 */6 * * *" }] }
  ```

### 5. Farb-Schema (WICHTIG, nicht ändern!)

**Phasen (Zeilen-Hintergrund):**
- Strength → orange (`bg-orange-50`, `border-orange-300`, etc.)
- Marathon → blue (`bg-blue-50`, `border-blue-300`, etc.)
- Deload / Longevity → green (`bg-green-50`, `border-green-300`, etc.)

**Aktivitäten (Badges in der Tagesansicht):**
- Strength → orange (`bg-orange-200`) — zeigt Training-Name aus Strava heading
- Run → blue (`bg-blue-200`) — zeigt Intervall-Typ (falls vorhanden) + Distanz
- Ride → purple (`bg-purple-200`) — zeigt Distanz
- Yoga/Mobility → green (`bg-green-200`) — zeigt Session-Name

**Load-Indikatoren:**
- Normal → grauer Dot
- Load → roter Dot
- Deload → grüner Dot

### 6. UI Features (aus dem Prototyp beibehalten)

- ✅ Bulk-Edit Panel (sticky, kein Layout-Jump, `minHeight: 52`)
- ✅ Checkboxen pro Woche + "Block auswählen" + "Alle Strength/Marathon" Buttons
- ✅ Quick-Pattern Buttons (Strength 5er, Marathon 5er, Longevity 4er)
- ✅ Block-Boundary Handles (▲/▼) zum Verschieben der Phasen-Grenzen
- ✅ Block-Splitten Funktion
- ✅ Feste Zeilen-Höhe (`h-10`) mit `contain: layout style`
- ✅ Aktuelle Woche (gelb highlighted)
- ✅ Phase-Gruppierung mit farbigen Headers

### 7. Deployment

- Stelle sicher dass `vercel.json` korrekt konfiguriert ist
- Env Vars die gebraucht werden:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (für Server-Side/Cron)
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - `STRAVA_REFRESH_TOKEN`
  - `ADMIN_PASSWORD`
- Falls du auf Next.js migrierst (empfohlen für API Routes + Cron), mach das als erstes bevor du den Rest baust

### 8. Optional: Einbindung in ps_homepage

Erstelle auf der ps_homepage unter `/fitness` oder `/fitness/sportplan` einen iframe oder Link zur Sportplan-App. Oder setze eine Subdomain `sportplan.philippschmeing.com` via Cloudflare auf.

## Reihenfolge

1. Evaluiere ob Migration zu Next.js sinnvoll ist (wegen API Routes + Cron) — falls ja, migriere zuerst
2. Supabase Schema + Seed
3. API Layer (Read + Write)
4. Refactore UI-Komponente auf Supabase statt lokalem State
5. Admin Auth (simpler Token)
6. Strava Sync Cron
7. Deploy + Cloudflare DNS
8. Teste end-to-end
