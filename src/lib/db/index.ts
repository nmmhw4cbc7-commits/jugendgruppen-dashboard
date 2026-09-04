import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL ist nicht gesetzt. Lege eine PostgreSQL-Datenbank an, führe " +
      "database/schema.sql (und optional database/seed.sql) aus, und setze " +
      "DATABASE_URL in .env bzw. in den Umgebungsvariablen deines Hosting-Anbieters."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __pgClient__: ReturnType<typeof postgres> | undefined;
}

const client = global.__pgClient__ ?? postgres(process.env.DATABASE_URL, { max: 10 });
if (process.env.NODE_ENV !== "production") global.__pgClient__ = client;

export const db = drizzle(client, { schema });
