import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// IMPORTANT: this file is imported by every route (including during
// Vercel's build-time "Collecting page data" step, which imports route
// modules to analyze them even though nothing actually renders yet). If we
// throw here synchronously when DATABASE_URL is missing, the *build itself*
// fails — even for a project that will have DATABASE_URL set correctly at
// runtime. So we only warn at import time, and let an actual missing/invalid
// connection string surface as a normal, catchable error the first time a
// request really tries to talk to the database.
if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL ist nicht gesetzt. Die App baut trotzdem, aber jede " +
      "Seite, die Daten lädt, schlägt zur Laufzeit fehl, bis du DATABASE_URL " +
      "in den Umgebungsvariablen (z. B. bei Vercel unter Settings → " +
      "Environment Variables) hinterlegst und neu deployst."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __pgClient__: ReturnType<typeof postgres> | undefined;
}

// Falls DATABASE_URL fehlt, verwenden wir einen offensichtlich ungültigen
// Platzhalter-String, damit `postgres()` selbst nicht synchron wirft — der
// Fehler entsteht dann sauber bei der ersten echten Anfrage, nicht beim Import.
const connectionString = process.env.DATABASE_URL || "postgres://unset:unset@localhost:5432/unset";

const client =
  global.__pgClient__ ??
  postgres(connectionString, {
    max: 10,
    // Supabase's connection pooler (port 6543, PgBouncer in "transaction"
    // mode) does not support prepared statements — postgres.js uses them by
    // default, which causes runtime errors against that pooler. This is
    // harmless against a direct Postgres connection (port 5432) too, so it's
    // safe to always disable.
    prepare: false,
    // Most managed Postgres providers (Supabase, Neon, Railway, ...) require
    // TLS, while a plain local Postgres usually has none configured at all.
    // "prefer" tries TLS first and transparently falls back if the server
    // doesn't offer it, so the same setting works in both situations.
    ssl: "prefer",
  });
if (process.env.NODE_ENV !== "production") global.__pgClient__ = client;

export const db = drizzle(client, { schema });
