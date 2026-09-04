-- ============================================================================
-- COMPLETE DATABASE SETUP
-- Jugendgruppen Dashboard — PostgreSQL Schema
-- ============================================================================
--
-- This script sets up the entire database schema from scratch on an empty
-- PostgreSQL database. It is fully self-contained and idempotent: it can be
-- run repeatedly (existing objects are skipped, not duplicated).
--
-- It matches 1:1 the data model actually used by the application (see
-- src/lib/db/schema.ts for the Drizzle/SQLite mirror used in local
-- development). If the application's data model changes, this file is the
-- authoritative reference and must be updated alongside it.
--
-- Contents:
--   1. Extensions
--   2. Enum types
--   3. Tables, primary keys, foreign keys, constraints, indexes
--   4. updated_at triggers
--
-- Seed / demo data is intentionally NOT included here — see seed.sql.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------

-- Provides gen_random_uuid() for UUID primary keys on PostgreSQL < 16.
-- (PostgreSQL 16+ ships gen_random_uuid() built in, but creating the
-- extension is harmless and keeps this script portable across versions.)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ----------------------------------------------------------------------------
-- Using real Postgres enums (rather than plain text + CHECK) gives us
-- self-documenting, storage-efficient, and strongly-typed status/type
-- columns throughout the schema.

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('group_meeting', 'activity', 'action', 'trip');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rsvp_status AS ENUM ('attending', 'maybe', 'not_attending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE prayer_request_type AS ENUM ('need', 'thanks');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE suggestion_type AS ENUM ('topic', 'activity');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 3. HELPER FUNCTION: auto-update `updated_at` columns
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. TABLE: groups
-- ----------------------------------------------------------------------------
-- The tenant boundary. Every group-owned table below carries a group_id
-- foreign key with ON DELETE CASCADE, so deleting a group cleanly removes
-- everything that belongs to it and nothing that belongs to another group.

CREATE TABLE IF NOT EXISTS groups (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL,
  admin_passcode_hash  TEXT NOT NULL,             -- bcrypt hash; never store the plaintext passcode
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT groups_slug_unique UNIQUE (slug),
  CONSTRAINT groups_name_not_blank CHECK (btrim(name) <> '')
);

COMMENT ON TABLE groups IS 'Tenant boundary: one row per independent youth group.';

-- ----------------------------------------------------------------------------
-- 5. TABLE: members
-- ----------------------------------------------------------------------------
-- No classic accounts: a member is created on first onboarding (name +
-- group choice) and identified afterwards by this row's id via an opaque
-- cookie. `active = false` lets an admin deactivate a member without
-- destroying their history (attendance, RSVPs, Anliegen, Vorschläge).

CREATE TABLE IF NOT EXISTS members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
  name        TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT members_name_not_blank CHECK (btrim(name) <> '')
);

CREATE INDEX IF NOT EXISTS members_group_idx ON members (group_id);
CREATE INDEX IF NOT EXISTS members_group_active_idx ON members (group_id, active);

COMMENT ON TABLE members IS 'A person in a group. Identity is a random UUID carried in an httpOnly cookie — no password.';

-- ----------------------------------------------------------------------------
-- 6. TABLE: events
-- ----------------------------------------------------------------------------
-- Covers Gruppenstunde, Aktivität, Aktion and Ausflug (multi-day, via
-- end_date). requires_registration toggles whether members may RSVP.

CREATE TABLE IF NOT EXISTS events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id                UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type                    event_type NOT NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  start_date              DATE NOT NULL,
  end_date                DATE,                    -- multi-day events (e.g. Bulgarien-Fahrt); NULL for single-day
  start_time              TIME,                     -- e.g. 19:00, display-only, kept separate from the date
  location                TEXT,
  topic                   TEXT,                     -- Gruppenstunden: "Thema"
  bible_verse             TEXT,                     -- Gruppenstunden: optional Bibelstelle
  after_activity          TEXT,                     -- e.g. "Lagerfeuer" directly following a Gruppenstunde
  requires_registration   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT events_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT events_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS events_group_start_idx ON events (group_id, start_date);
CREATE INDEX IF NOT EXISTS events_group_type_idx ON events (group_id, type);

DROP TRIGGER IF EXISTS events_set_updated_at ON events;
CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE events IS 'Gruppenstunden, Aktivitäten, Aktionen und Ausflüge (multi-day via end_date).';

-- ----------------------------------------------------------------------------
-- 7. TABLE: event_responses (Termin-Anmeldungen / RSVP)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE ON UPDATE CASCADE,
  status      rsvp_status NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT event_responses_event_member_unique UNIQUE (event_id, member_id)
);

CREATE INDEX IF NOT EXISTS event_responses_event_idx ON event_responses (event_id);
CREATE INDEX IF NOT EXISTS event_responses_member_idx ON event_responses (member_id);

DROP TRIGGER IF EXISTS event_responses_set_updated_at ON event_responses;
CREATE TRIGGER event_responses_set_updated_at
  BEFORE UPDATE ON event_responses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE event_responses IS 'A member''s Dabei/Vielleicht/Nicht-dabei answer for one event. One response per member per event.';

-- ----------------------------------------------------------------------------
-- 8. TABLE: attendances (Anwesenheit)
-- ----------------------------------------------------------------------------
-- Maintained exclusively by admins (never member-writable). One row per
-- member per Gruppenstunde/event actually attended, absent, or excused.

CREATE TABLE IF NOT EXISTS attendances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE ON UPDATE CASCADE,
  status      attendance_status NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT attendances_event_member_unique UNIQUE (event_id, member_id)
);

CREATE INDEX IF NOT EXISTS attendances_event_idx ON attendances (event_id);
CREATE INDEX IF NOT EXISTS attendances_member_idx ON attendances (member_id);

DROP TRIGGER IF EXISTS attendances_set_updated_at ON attendances;
CREATE TRIGGER attendances_set_updated_at
  BEFORE UPDATE ON attendances
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE attendances IS 'Admin-maintained attendance record per member per Gruppenstunde/event.';

-- ----------------------------------------------------------------------------
-- 9. TABLE: prayer_requests (Anliegen: Nöte & Danksagungen)
-- ----------------------------------------------------------------------------
-- `anonymous = true` hides the author's name from other members in the app
-- layer; the row still always carries the real member_id so admins can
-- moderate it and so it can be cleaned up if the member is removed. This is
-- an application-layer visibility rule, not a database-layer anonymization —
-- the app's queries must not surface member_id/name to non-admin members
-- when anonymous = true.

CREATE TABLE IF NOT EXISTS prayer_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type        prayer_request_type NOT NULL,
  content     TEXT NOT NULL,
  anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT prayer_requests_content_not_blank CHECK (btrim(content) <> '')
);

CREATE INDEX IF NOT EXISTS prayer_requests_group_type_idx ON prayer_requests (group_id, type);
CREATE INDEX IF NOT EXISTS prayer_requests_member_idx ON prayer_requests (member_id);

COMMENT ON TABLE prayer_requests IS 'Nöte (need) und Danksagungen (thanks). anonymous=true hides the author in member-facing views only.';

-- ----------------------------------------------------------------------------
-- 10. TABLE: suggestions (Themen-/Aktivitätsvorschläge)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type         suggestion_type NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT suggestions_title_not_blank CHECK (btrim(title) <> '')
);

CREATE INDEX IF NOT EXISTS suggestions_group_type_idx ON suggestions (group_id, type);
CREATE INDEX IF NOT EXISTS suggestions_member_idx ON suggestions (member_id);

COMMENT ON TABLE suggestions IS 'Themenvorschläge (topic) und Aktivitätsvorschläge (activity) von Mitgliedern.';

-- ----------------------------------------------------------------------------
-- 11. TABLE: suggestion_votes (👍 voting, one vote per member per suggestion)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS suggestion_votes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id  UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- This is what guarantees a member can only vote once per suggestion.
  CONSTRAINT suggestion_votes_suggestion_member_unique UNIQUE (suggestion_id, member_id)
);

CREATE INDEX IF NOT EXISTS suggestion_votes_suggestion_idx ON suggestion_votes (suggestion_id);
CREATE INDEX IF NOT EXISTS suggestion_votes_member_idx ON suggestion_votes (member_id);

COMMENT ON TABLE suggestion_votes IS 'One 👍 per member per suggestion; enforced by a unique constraint, not just application logic.';

-- ----------------------------------------------------------------------------
-- 12. TABLE: admin_sessions
-- ----------------------------------------------------------------------------
-- Admins authenticate with a per-group passcode (bcrypt-hashed on `groups`).
-- A successful login creates a server-side session row and an opaque token
-- cookie — never a client-trusted "isAdmin" flag. Every admin action must
-- resolve back to this table and scope its query to session.group_id.

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
  token       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,

  CONSTRAINT admin_sessions_token_unique UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS admin_sessions_token_idx ON admin_sessions (token);
CREATE INDEX IF NOT EXISTS admin_sessions_group_idx ON admin_sessions (group_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions (expires_at);

COMMENT ON TABLE admin_sessions IS 'Server-issued admin session tokens, scoped to exactly one group. Expired rows can be purged periodically.';

COMMIT;

-- ============================================================================
-- End of schema setup. Run seed.sql next if you want demo data
-- (Gruppe 1 fully populated, Gruppe 2–13 created but empty).
-- ============================================================================
