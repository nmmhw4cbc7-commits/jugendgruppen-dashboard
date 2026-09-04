"use server";

import { db } from "@/lib/db";
import { events, attendances, members } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { requireAdminGroup } from "@/lib/admin-session";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getGroupMeetingsForAttendance(groupId: string) {
  return db
    .select()
    .from(events)
    .where(and(eq(events.groupId, groupId), eq(events.type, "group_meeting")))
    .orderBy(desc(events.startDate));
}

export async function getAttendanceForEvent(eventId: string, groupId: string) {
  const event = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!event || event.groupId !== groupId) return null;

  const groupMembers = await db
    .select()
    .from(members)
    .where(and(eq(members.groupId, groupId), eq(members.active, true)))
    .orderBy(asc(members.name));

  const existingAttendance = await db.select().from(attendances).where(eq(attendances.eventId, eventId));
  const byMember = new Map(existingAttendance.map((a) => [a.memberId, a.status]));

  return {
    event,
    members: groupMembers.map((m) => ({ ...m, status: byMember.get(m.id) ?? null })),
  };
}

const statusSchema = z.enum(["present", "absent", "excused"]);

export async function setAttendance(eventId: string, memberId: string, status: string) {
  const group = await requireAdminGroup();
  const event = await db.query.events.findFirst({ where: (e, { eq }) => eq(e.id, eventId) });
  if (!event || event.groupId !== group.id) throw new Error("Termin nicht gefunden.");

  const member = await db.query.members.findFirst({ where: (m, { eq }) => eq(m.id, memberId) });
  if (!member || member.groupId !== group.id) throw new Error("Mitglied nicht gefunden.");

  const parsedStatus = statusSchema.parse(status);

  const existing = await db
    .select()
    .from(attendances)
    .where(and(eq(attendances.eventId, eventId), eq(attendances.memberId, memberId)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(attendances)
      .set({ status: parsedStatus, updatedAt: new Date() })
      .where(eq(attendances.id, existing[0].id));
  } else {
    await db.insert(attendances).values({
      id: newId(),
      eventId,
      memberId,
      status: parsedStatus,
    });
  }

  revalidatePath(`/admin/anwesenheit/${eventId}`);
  revalidatePath("/einstellungen");
}

export async function getMemberAttendanceStats(memberId: string) {
  const rows = await db.select().from(attendances).where(eq(attendances.memberId, memberId));
  const total = rows.length;
  const present = rows.filter((r) => r.status === "present").length;
  const percentage = total === 0 ? null : Math.round((present / total) * 100);
  return { total, present, percentage };
}
