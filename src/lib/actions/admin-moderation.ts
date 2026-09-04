"use server";

import { db } from "@/lib/db";
import { prayerRequests, suggestions, members, suggestionVotes } from "@/lib/db/schema";
import { requireAdminGroup } from "@/lib/admin-session";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminAnliegen(groupId: string) {
  return db
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
}

export async function deleteAnliegen(id: string) {
  const group = await requireAdminGroup();
  const item = await db.query.prayerRequests.findFirst({ where: (p, { eq }) => eq(p.id, id) });
  if (!item || item.groupId !== group.id) throw new Error("Nicht gefunden.");
  await db.delete(prayerRequests).where(eq(prayerRequests.id, id));
  revalidatePath("/admin/anliegen");
  revalidatePath("/anliegen");
}

export async function getAdminSuggestions(groupId: string) {
  const rows = await db
    .select({
      id: suggestions.id,
      type: suggestions.type,
      title: suggestions.title,
      description: suggestions.description,
      createdAt: suggestions.createdAt,
      memberName: members.name,
      voteCount: sql<number>`(select count(*) from suggestion_votes sv where sv.suggestion_id = ${suggestions.id})`,
    })
    .from(suggestions)
    .innerJoin(members, eq(suggestions.memberId, members.id))
    .where(eq(suggestions.groupId, groupId))
    .orderBy(desc(sql`voteCount`));

  return rows;
}

export async function deleteSuggestion(id: string) {
  const group = await requireAdminGroup();
  const item = await db.query.suggestions.findFirst({ where: (s, { eq }) => eq(s.id, id) });
  if (!item || item.groupId !== group.id) throw new Error("Nicht gefunden.");
  await db.delete(suggestions).where(eq(suggestions.id, id));
  revalidatePath("/admin/vorschlaege");
  revalidatePath("/anliegen");
}
