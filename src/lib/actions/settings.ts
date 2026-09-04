"use server";

import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { requireMember } from "@/lib/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen ein.").max(60),
});

export async function updateMemberName(formData: FormData) {
  const member = await requireMember();
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await db.update(members).set({ name: parsed.data.name }).where(eq(members.id, member.id));
  revalidatePath("/einstellungen");
  revalidatePath("/neues");
  return { ok: true };
}
