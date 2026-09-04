import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { members, groups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MEMBER_COOKIE = "yg_member_id";

/**
 * Returns the current member, validated server-side against the database.
 * The cookie only ever carries an opaque member id — never a name or group,
 * and never a trust decision by itself. Every request re-checks that the id
 * still exists and belongs to an active member before it is used for any
 * group-scoped query, so a tampered or stale cookie can't leak another
 * group's data.
 */
export async function getCurrentMember() {
  const store = cookies();
  const memberId = store.get(MEMBER_COOKIE)?.value;
  if (!memberId) return null;

  const rows = await db
    .select({
      id: members.id,
      name: members.name,
      active: members.active,
      groupId: members.groupId,
      groupName: groups.name,
    })
    .from(members)
    .innerJoin(groups, eq(members.groupId, groups.id))
    .where(eq(members.id, memberId))
    .limit(1);

  const member = rows[0];
  if (!member || !member.active) return null;
  return member;
}

export function setMemberCookie(memberId: string) {
  cookies().set(MEMBER_COOKIE, memberId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
}

export function clearMemberCookie() {
  cookies().delete(MEMBER_COOKIE);
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) throw new Error("Nicht angemeldet");
  return member;
}
