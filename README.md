# Jugendgruppen-Dashboard

Eine Multi-Tenant Web-App für Jugendgruppen: Termine, Aktivitäten, Anliegen
(Nöte/Danksagungen), Themen-/Aktivitätsvorschläge mit Voting, Anwesenheit und
ein vollständiger Admin-Bereich pro Gruppe.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — minimalistisches, warmes Design (kein AI-Slop-Look)
- **PostgreSQL** + **Drizzle ORM**
- **Server Actions** für alle Mutationen (kein separates REST/GraphQL-API-Layer)

Die App braucht eine echte PostgreSQL-Datenbank, sowohl lokal als auch in
Produktion — es gibt keinen Datei-basierten Fallback. Das vollständige,
gegen echtes PostgreSQL 16 getestete Setup-Skript liegt in `database/`.

---

## App live als Website aufrufen (Deployment)

Kurz gesagt: **Next.js-App bei Vercel deployen + eine PostgreSQL-Datenbank
dranhängen.** Schritt für Schritt:

### 1. PostgreSQL-Datenbank anlegen

Egal welcher Anbieter — du brauchst am Ende nur eine `DATABASE_URL`
(Connection String). Einfache, kostenlose Optionen:

- **Neon** (neon.tech) — Postgres, großzügiger Free Tier, sehr einfach
- **Supabase** (supabase.com) — Postgres + Free Tier
- **Vercel Postgres** (direkt im Vercel-Dashboard unter "Storage")
- **Railway** (railway.app)

Nach dem Anlegen bekommst du einen Connection String, der so aussieht:

```
postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

### 2. Schema + Seed-Daten einspielen

Mit einem beliebigen Postgres-Client (z. B. der `psql`-Kommandozeile, oder
die Web-Konsole deines Anbieters — Neon/Supabase haben beide einen
SQL-Editor im Browser):

```bash
psql "postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" -f database/schema.sql
psql "postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" -f database/seed.sql   # optional, Demo-Daten
```

Alternativ: Inhalt von `database/schema.sql` (und optional `database/seed.sql`)
einfach in den SQL-Editor von Neon/Supabase einfügen und ausführen.

### 3. Bei Vercel deployen

1. Auf [vercel.com](https://vercel.com) mit deinem GitHub-Account anmelden.
2. "Add New… → Project" → das GitHub-Repo mit diesem Code auswählen und
   importieren. Vercel erkennt Next.js automatisch, keine Konfiguration nötig.
3. Bei **Environment Variables** eine Variable hinzufügen:
   - Name: `DATABASE_URL`
   - Wert: dein Connection String aus Schritt 1
4. "Deploy" klicken.

Nach ein bis zwei Minuten bekommst du eine echte URL
(`https://dein-projekt.vercel.app`), unter der die App live erreichbar ist.
Jeder weitere `git push` auf den Hauptbranch deployed automatisch neu.

### 4. Testen

- App-URL öffnen → Onboarding → Name eingeben → "Jugendgruppe 1" wählen →
  die Demo-Termine, Anliegen und Vorschläge sollten erscheinen (falls du
  `seed.sql` ausgeführt hast).
- `/admin/login` öffnen → Gruppe wählen → Zugangscode `gruppe2026` (Demo).
  **Wichtig:** Für den echten Einsatz die Passcode-Hashes in der Datenbank
  ändern (siehe "Admin-Zugangscodes ändern" unten) — `gruppe2026` ist nur
  der Demo-Code aus `seed.sql`.

### Eigene Domain

Im Vercel-Dashboard unter "Settings → Domains" kannst du eine eigene Domain
(z. B. `jugendgruppe.eurekirchengemeinde.de`) hinzufügen und die DNS-Einträge
setzen, die Vercel dir anzeigt.

### Andere Hosting-Optionen

Vercel ist am einfachsten, weil es von denselben Machern wie Next.js kommt
und ohne Server-Konfiguration auskommt. Alternativen, die ebenfalls
funktionieren, aber mehr Handarbeit brauchen: Railway, Render, Fly.io, oder
ein eigener Server (`npm run build && npm run start`, dahinter z. B. Nginx
und ein Prozess-Manager wie `pm2`).

---

## Projektstruktur

```
src/
  app/
    onboarding/            Name + Gruppe wählen (kein Login)
    (member)/               Mitglieder-Bereich mit Bottom-Nav
      neues/                Startseite: "Was steht als Nächstes an?"
      anliegen/              Nöte, Danksagungen, Vorschläge + Voting
      einstellungen/         Profil, eigene Anwesenheit, Gruppe wechseln
    admin/
      login/                 Passcode-Login pro Gruppe
      (Dashboard, Termine, Anwesenheit, Anliegen, Vorschläge, Mitglieder)
  components/                Geteilte UI-Bausteine
  lib/
    db/                      Drizzle-Schema (PostgreSQL) + DB-Client
    actions/                 Server Actions (Member + Admin)
    session.ts               Mitglieds-Identität (Cookie, serverseitig validiert)
    admin-session.ts          Admin-Auth (Passcode → serverseitiges Session-Token)
    format.ts                 Datum/Zeit-Formatierung (deutsch)
database/
  schema.sql                 Vollständiges, eigenständiges PostgreSQL-Setup
  seed.sql                   Optionale Demo-Daten (13 Gruppen, Gruppe 1 voll befüllt)
```

## Lokale Entwicklung

Voraussetzung: eine lokal laufende oder erreichbare PostgreSQL-Datenbank
(z. B. `brew install postgresql` / Docker / eine kostenlose Cloud-DB wie
oben beschrieben — auch lokal völlig in Ordnung, dann einfach die
Cloud-`DATABASE_URL` in `.env` eintragen).

```bash
cp .env.example .env        # DATABASE_URL eintragen
npm install
npm run db:setup            # führt database/schema.sql aus
npm run db:seed             # optional: Demo-Daten (database/seed.sql)
npm run dev
```

Danach [http://localhost:3000](http://localhost:3000) öffnen.

## Identität ohne klassischen Account

Beim ersten Start gibt die Person ihren Namen ein und wählt ihre Gruppe.
Daraufhin wird ein `Member`-Datensatz angelegt und dessen UUID in einem
`httpOnly`-Cookie gespeichert. Bei jedem Request wird diese ID **serverseitig
gegen die Datenbank geprüft** (aktiv? gehört zur richtigen Gruppe?) — das
Cookie selbst wird nie blind vertraut.

Admins melden sich getrennt über `/admin/login` mit einem **Zugangscode pro
Gruppe** an (bcrypt-Hash in `groups.admin_passcode_hash`). Ein erfolgreicher
Login erzeugt eine serverseitige Session (`admin_sessions`-Tabelle) und ein
Token-Cookie. Jede Admin-Aktion prüft serverseitig erneut, dass die
bearbeitete Gruppe zur eingeloggten Admin-Session gehört.

### Admin-Zugangscodes ändern

Die Demo-Zugangscodes (`gruppe2026` für alle 13 Seed-Gruppen) solltest du vor
echtem Einsatz ändern. Einen neuen bcrypt-Hash erzeugen (z. B. lokal mit
Node):

```bash
node -e "console.log(require('bcryptjs').hashSync('DEIN-NEUER-CODE', 10))"
```

und dann in der Datenbank aktualisieren:

```sql
UPDATE groups SET admin_passcode_hash = '<neuer-hash>' WHERE slug = 'gruppe-1';
```

## Sicherheit — was serverseitig durchgesetzt wird

- Gruppentrennung: jede gruppen-gebundene Tabelle trägt `group_id`; jede
  Query filtert danach; jede Mutation prüft, dass die Ziel-Entität zur
  Gruppe der aktuellen Session gehört (Member **und** Admin).
- Keine reine Client-Side-Berechtigungsprüfung: Middleware prüft nur die
  *Existenz* eines Cookies (schnelle erste Hürde); jede Seite/Aktion prüft
  zusätzlich serverseitig gegen die Datenbank.
- Formularvalidierung serverseitig über `zod` in jeder Server Action.
- Eindeutigkeit von Stimmen (`suggestion_votes`), Anmeldungen
  (`event_responses`) und Anwesenheit (`attendances`) wird zusätzlich zur
  Anwendungslogik durch **Unique Constraints auf Datenbankebene** erzwungen.
- Admin-Zugangscodes werden nie im Klartext gespeichert (bcrypt-Hash).

## Was getestet wurde

Dieses Projekt wurde gegen einen laufenden Next.js-Produktionsserver **und**
eine echte PostgreSQL-16-Instanz geprüft (nicht nur gebaut):

- `next build` läuft fehlerfrei durch (16 Routen, volle TypeScript-Prüfung
  gegen das echte PostgreSQL-Schema).
- Onboarding, Startseite, Anliegen und Einstellungen rendern echte
  Daten aus PostgreSQL korrekt (inkl. korrekt berechneter
  Anwesenheits-Prozentzahl).
- Admin-Login (richtiger/falscher Zugangscode) und das Admin-Dashboard
  wurden gegen echtes PostgreSQL durchgespielt.
- Ein Mitglied aus Gruppe 2 kann sich nachweislich **nicht** für einen
  Termin aus Gruppe 1 anmelden (Server Action lehnt mit Fehlermeldung ab).
- Ein Admin aus Gruppe 1 kann nachweislich **keinen** Termin aus Gruppe 2
  bearbeiten (Server Action lehnt ab, Datensatz bleibt unverändert).
- `database/schema.sql` und `database/seed.sql` wurden mehrfach hintereinander
  gegen eine leere PostgreSQL-16-Datenbank ausgeführt und sind vollständig
  idempotent (keine Fehler, keine doppelten Zeilen).
- Der `events_end_after_start`-Check-Constraint und der
  `suggestion_votes`-Unique-Constraint wurden mit absichtlich ungültigen
  `INSERT`s gegen echtes PostgreSQL provoziert und schlagen korrekt fehl.

Nicht in der Sandbox testbar war ein echter Browser-Durchlauf (Playwright
ließ sich wegen der Netzwerk-Policy der Build-Sandbox nicht installieren) —
die UI-Seiten wurden stattdessen über echte HTTP-Requests mit gültigen
Session-Cookies gegen den produktiv gebauten Server geprüft.
