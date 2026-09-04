import { pgTable, uuid, text, boolean, timestamp, date, time, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// This is the production schema (PostgreSQL). It is a 1:1 TypeScript mirror
// of database/schema.sql — that SQL file is the authoritative source that
// actually creates the tables (run it once against your database). This
// file only teaches Drizzle the shape of what's already there, so the
// server actions get full type safety and a query builder.

export const eventTypeEnum = pgEnum("event_type", ["group_meeting", "activity", "action", "trip"]);
export const rsvpStatusEnum = pgEnum("rsvp_status", ["attending", "maybe", "not_attending"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "excused"]);
export const prayerRequestTypeEnum = pgEnum("prayer_request_type", ["need", "thanks"]);
export const suggestionTypeEnum = pgEnum("suggestion_type", ["topic", "activity"]);

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  adminPasscodeHash: text("admin_passcode_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    groupIdx: index("members_group_idx").on(t.groupId),
  })
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    type: eventTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    startDate: date("start_date", { mode: "date" }).notNull(),
    endDate: date("end_date", { mode: "date" }),
    startTime: time("start_time"),
    location: text("location"),
    topic: text("topic"),
    bibleVerse: text("bible_verse"),
    afterActivity: text("after_activity"),
    requiresRegistration: boolean("requires_registration").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    groupDateIdx: index("events_group_start_idx").on(t.groupId, t.startDate),
  })
);

export const eventResponses = pgTable(
  "event_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    status: rsvpStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("event_responses_event_member_unique").on(t.eventId, t.memberId),
  })
);

export const attendances = pgTable(
  "attendances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("attendances_event_member_unique").on(t.eventId, t.memberId),
  })
);

export const prayerRequests = pgTable(
  "prayer_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    type: prayerRequestTypeEnum("type").notNull(),
    content: text("content").notNull(),
    anonymous: boolean("anonymous").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    groupTypeIdx: index("prayer_requests_group_type_idx").on(t.groupId, t.type),
  })
);

export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    type: suggestionTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    groupTypeIdx: index("suggestions_group_type_idx").on(t.groupId, t.type),
  })
);

export const suggestionVotes = pgTable(
  "suggestion_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    suggestionId: uuid("suggestion_id").notNull().references(() => suggestions.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("suggestion_votes_suggestion_member_unique").on(t.suggestionId, t.memberId),
  })
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tokenIdx: index("admin_sessions_token_idx").on(t.token),
  })
);

// ---- relations (for query convenience / db.query.*) ----

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(members),
  events: many(events),
  prayerRequests: many(prayerRequests),
  suggestions: many(suggestions),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  group: one(groups, { fields: [members.groupId], references: [groups.id] }),
  eventResponses: many(eventResponses),
  attendances: many(attendances),
  prayerRequests: many(prayerRequests),
  suggestions: many(suggestions),
  suggestionVotes: many(suggestionVotes),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  group: one(groups, { fields: [events.groupId], references: [groups.id] }),
  responses: many(eventResponses),
  attendances: many(attendances),
}));

export const eventResponsesRelations = relations(eventResponses, ({ one }) => ({
  event: one(events, { fields: [eventResponses.eventId], references: [events.id] }),
  member: one(members, { fields: [eventResponses.memberId], references: [members.id] }),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  event: one(events, { fields: [attendances.eventId], references: [events.id] }),
  member: one(members, { fields: [attendances.memberId], references: [members.id] }),
}));

export const suggestionsRelations = relations(suggestions, ({ one, many }) => ({
  group: one(groups, { fields: [suggestions.groupId], references: [groups.id] }),
  member: one(members, { fields: [suggestions.memberId], references: [members.id] }),
  votes: many(suggestionVotes),
}));

export const suggestionVotesRelations = relations(suggestionVotes, ({ one }) => ({
  suggestion: one(suggestions, { fields: [suggestionVotes.suggestionId], references: [suggestions.id] }),
  member: one(members, { fields: [suggestionVotes.memberId], references: [members.id] }),
}));
