"use server";

import { db } from "@/lib/db";
import { suggestions, suggestionVotes, members } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { requireMember } from "@/lib/session";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["topic", "activity"]),
  title: z.string().trim().min(3, "Bitte gib einen kurzen Titel ein.").max(200),
  description: z.string().trim().max(1000).optional(),
});

export async function createSuggestion(formData: FormData) {
  const member = await requireMember();
  const parsed = schema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await db.insert(suggestions).values({
    id: newId(),
    groupId: member.groupId,
    memberId: member.id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
  });

  revalidatePath("/anliegen");
  return { ok: true };
}

export async function toggleVote(suggestionId: string) {
  const member = await requireMember();

  const suggestion = await db.query.suggestions.findFirst({
    where: (s, { eq }) => eq(s.id, suggestionId),
  });
  if (!suggestion || suggestion.groupId !== member.groupId) {
    throw new Error("Dieser Vorschlag gehört nicht zu deiner Gruppe.");
  }

  const existing = await db
    .select()
    .from(suggestionVotes)
    .where(and(eq(suggestionVotes.suggestionId, suggestionId), eq(suggestionVotes.memberId, member.id)))
    .limit(1);

  if (existing[0]) {
    await db.delete(suggestionVotes).where(eq(suggestionVotes.id, existing[0].id));
  } else {
    await db.insert(suggestionVotes).values({
      id: newId(),
      suggestionId,
      memberId: member.id,
    });
  }

  revalidatePath("/anliegen");
}

export async function getSuggestionsForGroup(groupId: string, currentMemberId: string) {
  const rows = await db
    .select({
      id: suggestions.id,
      type: suggestions.type,
      title: suggestions.title,
      description: suggestions.description,
      createdAt: suggestions.createdAt,
      memberName: members.name,
      voteCount: sql<number>`(select count(*) from suggestion_votes sv where sv.suggestion_id = ${suggestions.id})`,
      votedByMe: sql<number>`(select count(*) from suggestion_votes sv where sv.suggestion_id = ${suggestions.id} and sv.member_id = ${currentMemberId})`,
    })
    .from(suggestions)
    .innerJoin(members, eq(suggestions.memberId, members.id))
    .where(eq(suggestions.groupId, groupId))
    .orderBy(desc(suggestions.createdAt));

  return rows.map((r) => ({ ...r, votedByMe: r.votedByMe > 0 }));
}
