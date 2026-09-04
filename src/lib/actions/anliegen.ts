"use server";

import { db } from "@/lib/db";
import { prayerRequests, members } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { requireMember } from "@/lib/session";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["need", "thanks"]),
  content: z.string().trim().min(3, "Bitte schreib etwas mehr.").max(1000),
  anonymous: z.boolean(),
});

export async function createAnliegen(formData: FormData) {
  const member = await requireMember();
  const parsed = schema.safeParse({
    type: formData.get("type"),
    content: formData.get("content"),
    anonymous: formData.get("anonymous") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await db.insert(prayerRequests).values({
    id: newId(),
    groupId: member.groupId,
    memberId: member.id,
    type: parsed.data.type,
    content: parsed.data.content,
    anonymous: parsed.data.anonymous,
  });

  revalidatePath("/anliegen");
  return { ok: true };
}

export async function getAnliegenForGroup(groupId: string) {
  const rows = await db
    .select({
      id: prayerRequests.id,
      type: prayerRequests.type,
      content: prayerRequests.content,
      anonymous: prayerRequests.anonymous,
      createdAt: prayerRequests.createdAt,
      memberName: members.name,
    })
    .from(prayerRequests)
    .innerJoin(members, eq(prayerRequests.memberId, members.id))
    .where(eq(prayerRequests.groupId, groupId))
    .orderBy(desc(prayerRequests.createdAt));

  return rows.map((r) => ({
    ...r,
    displayName: r.anonymous ? "Anonym" : r.memberName,
  }));
}
