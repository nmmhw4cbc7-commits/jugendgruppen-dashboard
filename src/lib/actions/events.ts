"use server";

import { db } from "@/lib/db";
import { eventResponses, events } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { requireMember } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const statusSchema = z.enum(["attending", "maybe", "not_attending"]);

export async function respondToEvent(eventId: string, status: string) {
  const member = await requireMember();
  const parsedStatus = statusSchema.parse(status);

  // Server-side group check: the event must belong to the member's own group.
  const event = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!event || event.groupId !== member.groupId) {
    throw new Error("Dieser Termin gehört nicht zu deiner Gruppe.");
  }

  const existing = await db
    .select()
    .from(eventResponses)
    .where(and(eq(eventResponses.eventId, eventId), eq(eventResponses.memberId, member.id)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(eventResponses)
      .set({ status: parsedStatus, updatedAt: new Date() })
      .where(eq(eventResponses.id, existing[0].id));
  } else {
    await db.insert(eventResponses).values({
      id: newId(),
      eventId,
      memberId: member.id,
      status: parsedStatus,
    });
  }

  revalidatePath("/neues");
}
