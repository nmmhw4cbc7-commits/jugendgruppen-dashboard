"use server";

import { db } from "@/lib/db";
import { events, eventResponses, members } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { requireAdminGroup } from "@/lib/admin-session";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const eventSchema = z.object({
  type: z.enum(["group_meeting", "activity", "action", "trip"]),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  startDate: z.string().min(1, "Bitte gib ein Datum an."),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  location: z.string().trim().max(200).optional(),
  topic: z.string().trim().max(200).optional(),
  bibleVerse: z.string().trim().max(200).optional(),
  afterActivity: z.string().trim().max(200).optional(),
  requiresRegistration: z.boolean(),
});

function emptyToUndefined(v: FormDataEntryValue | null) {
  const s = (v as string | null) ?? "";
  return s.trim() === "" ? undefined : s;
}

export async function createEvent(formData: FormData) {
  const group = await requireAdminGroup();
  const parsed = eventSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: emptyToUndefined(formData.get("description")),
    startDate: formData.get("startDate"),
    endDate: emptyToUndefined(formData.get("endDate")),
    startTime: emptyToUndefined(formData.get("startTime")),
    location: emptyToUndefined(formData.get("location")),
    topic: emptyToUndefined(formData.get("topic")),
    bibleVerse: emptyToUndefined(formData.get("bibleVerse")),
    afterActivity: emptyToUndefined(formData.get("afterActivity")),
    requiresRegistration: formData.get("requiresRegistration") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await db.insert(events).values({
    id: newId(),
    groupId: group.id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    startDate: new Date(parsed.data.startDate),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    startTime: parsed.data.startTime ?? null,
    location: parsed.data.location ?? null,
    topic: parsed.data.topic ?? null,
    bibleVerse: parsed.data.bibleVerse ?? null,
    afterActivity: parsed.data.afterActivity ?? null,
    requiresRegistration: parsed.data.requiresRegistration,
  });

  revalidatePath("/admin/termine");
  revalidatePath("/neues");
  redirect("/admin/termine");
}

export async function updateEvent(eventId: string, formData: FormData) {
  const group = await requireAdminGroup();
  const existing = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!existing || existing.groupId !== group.id) throw new Error("Termin nicht gefunden.");

  const parsed = eventSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: emptyToUndefined(formData.get("description")),
    startDate: formData.get("startDate"),
    endDate: emptyToUndefined(formData.get("endDate")),
    startTime: emptyToUndefined(formData.get("startTime")),
    location: emptyToUndefined(formData.get("location")),
    topic: emptyToUndefined(formData.get("topic")),
    bibleVerse: emptyToUndefined(formData.get("bibleVerse")),
    afterActivity: emptyToUndefined(formData.get("afterActivity")),
    requiresRegistration: formData.get("requiresRegistration") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await db
    .update(events)
    .set({
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      startTime: parsed.data.startTime ?? null,
      location: parsed.data.location ?? null,
      topic: parsed.data.topic ?? null,
      bibleVerse: parsed.data.bibleVerse ?? null,
      afterActivity: parsed.data.afterActivity ?? null,
      requiresRegistration: parsed.data.requiresRegistration,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId));

  revalidatePath("/admin/termine");
  revalidatePath("/neues");
  redirect("/admin/termine");
}

export async function deleteEvent(eventId: string) {
  const group = await requireAdminGroup();
  const existing = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!existing || existing.groupId !== group.id) throw new Error("Termin nicht gefunden.");

  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/admin/termine");
  revalidatePath("/neues");
}

export async function duplicateEvent(eventId: string) {
  const group = await requireAdminGroup();
  const existing = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!existing || existing.groupId !== group.id) throw new Error("Termin nicht gefunden.");

  await db.insert(events).values({
    id: newId(),
    groupId: group.id,
    type: existing.type,
    title: `${existing.title} (Kopie)`,
    description: existing.description,
    startDate: existing.startDate,
    endDate: existing.endDate,
    startTime: existing.startTime,
    location: existing.location,
    topic: existing.topic,
    bibleVerse: existing.bibleVerse,
    afterActivity: existing.afterActivity,
    requiresRegistration: existing.requiresRegistration,
  });

  revalidatePath("/admin/termine");
}

export async function getAdminEvents(groupId: string) {
  return db.select().from(events).where(eq(events.groupId, groupId)).orderBy(desc(events.startDate));
}

export async function getEventWithResponses(eventId: string, groupId: string) {
  const event = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!event || event.groupId !== groupId) return null;

  const responses = await db
    .select({
      id: eventResponses.id,
      status: eventResponses.status,
      memberName: members.name,
    })
    .from(eventResponses)
    .innerJoin(members, eq(eventResponses.memberId, members.id))
    .where(eq(eventResponses.eventId, eventId))
    .orderBy(asc(members.name));

  return { event, responses };
}
