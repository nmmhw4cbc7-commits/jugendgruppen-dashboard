import "server-only";
import { db } from "@/lib/db";
import { events, eventResponses } from "@/lib/db/schema";
import { and, eq, gte, asc } from "drizzle-orm";

export async function getUpcomingEventsForGroup(groupId: string, memberId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcoming = await db
    .select()
    .from(events)
    .where(and(eq(events.groupId, groupId), gte(events.startDate, startOfToday)))
    .orderBy(asc(events.startDate));

  // Also include multi-day events that started before today but end today or later
  const all = await db.select().from(events).where(eq(events.groupId, groupId));
  const stillRunning = all.filter(
    (e) => e.endDate && e.endDate >= startOfToday && e.startDate < startOfToday
  );

  const combined = [...stillRunning, ...upcoming].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  const myResponses = await db.select().from(eventResponses).where(eq(eventResponses.memberId, memberId));
  const responseByEvent = new Map(myResponses.map((r) => [r.eventId, r.status]));

  return combined.map((e) => ({ ...e, myStatus: responseByEvent.get(e.id) ?? null }));
}
