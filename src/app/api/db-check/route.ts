import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groups } from "@/lib/db/schema";

// Temporäre Diagnose-Route: einfach im Browser aufrufen (z. B.
// https://dein-projekt.vercel.app/api/db-check), um den echten
// Datenbank-Fehler zu sehen statt nur "Application error". Nach dem
// Debuggen kann dieser Ordner (src/app/api/db-check) wieder gelöscht werden.
export async function GET() {
  const hasUrl = !!process.env.DATABASE_URL;
  const urlPreview = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@") // Passwort ausblenden
    : null;

  try {
    const rows = await db.select({ id: groups.id, name: groups.name }).from(groups).limit(3);
    return NextResponse.json({
      ok: true,
      message: "Datenbankverbindung erfolgreich.",
      databaseUrlSet: hasUrl,
      databaseUrlPreview: urlPreview,
      sampleGroups: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlSet: hasUrl,
        databaseUrlPreview: urlPreview,
        errorName: error?.name ?? null,
        errorMessage: error?.message ?? String(error),
        errorCode: error?.code ?? null,
      },
      { status: 500 }
    );
  }
}
