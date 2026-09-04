"use server";

import { db } from "@/lib/db";
import { members, attendances, eventResponses } from "@/lib/db/schema";
import { requireAdminGroup } from "@/lib/admin-session";
import { eq, and, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMembersOverview(groupId: string) {
  const rows = await db
    .select({
      id: members.id,
      name: members.name,
      active: members.active,
      createdAt: members.createdAt,
      totalAttendance: sql<number>`(select count(*) from attendances a where a.member_id = ${members.id})`,
      presentAttendance: sql<number>`(select count(*) from attendances a where a.member_id = ${members.id} and a.status = 'present')`,
      confirmedRsvps: sql<number>`(select count(*) from event_responses er where er.member_id = ${members.id} and er.status = 'attending')`,
    })
    .from(members)
    .where(eq(members.groupId, groupId))
    .orderBy(asc(members.name));

  return rows.map((r) => ({
    ...r,
    attendancePercentage: r.totalAttendance === 0 ? null : Math.round((r.presentAttendance / r.totalAttendance) * 100),
  }));
}

export async function toggleMemberActive(memberId: string) {
  const group = await requireAdminGroup();
  const member = await db.query.members.findFirst({ where: (m, { eq }) => eq(m.id, memberId) });
  if (!member || member.groupId !== group.id) throw new Error("Mitglied nicht gefunden.");

  await db.update(members).set({ active: !member.active }).where(eq(members.id, memberId));
  revalidatePath("/admin/mitglieder");
}
