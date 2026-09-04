"use server";

import { db } from "@/lib/db";
import { events, members, prayerRequests, suggestions, eventResponses } from "@/lib/db/schema";
import { eq, and, gte, asc, sql } from "drizzle-orm";

export async function getAdminDashboard(groupId: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const nextEvent = await db
    .select()
    .from(events)
    .where(and(eq(events.groupId, groupId), gte(events.startDate, now)))
    .orderBy(asc(events.startDate))
    .limit(1);

  const memberCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(members)
    .where(and(eq(members.groupId, groupId), eq(members.active, true)));

  let rsvpCounts = { attending: 0, maybe: 0, not_attending: 0 };
  if (nextEvent[0]) {
    const responses = await db
      .select({ status: eventResponses.status, count: sql<number>`count(*)` })
      .from(eventResponses)
      .where(eq(eventResponses.eventId, nextEvent[0].id))
      .groupBy(eventResponses.status);

    for (const r of responses) {
      if (r.status === "attending") rsvpCounts.attending = r.count;
      if (r.status === "maybe") rsvpCounts.maybe = r.count;
      if (r.status === "not_attending") rsvpCounts.not_attending = r.count;
    }
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const newAnliegen = await db
    .select({ count: sql<number>`count(*)` })
    .from(prayerRequests)
    .where(and(eq(prayerRequests.groupId, groupId), gte(prayerRequests.createdAt, sevenDaysAgo)));

  const newSuggestions = await db
    .select({ count: sql<number>`count(*)` })
    .from(suggestions)
    .where(and(eq(suggestions.groupId, groupId), gte(suggestions.createdAt, sevenDaysAgo)));

  const upcomingEvents = await db
    .select()
    .from(events)
    .where(and(eq(events.groupId, groupId), gte(events.startDate, now)))
    .orderBy(asc(events.startDate))
    .limit(5);

  return {
    nextEvent: nextEvent[0] ?? null,
    memberCount: memberCount[0]?.count ?? 0,
    rsvpCounts,
    newAnliegenCount: newAnliegen[0]?.count ?? 0,
    newSuggestionsCount: newSuggestions[0]?.count ?? 0,
    upcomingEvents,
  };
}
