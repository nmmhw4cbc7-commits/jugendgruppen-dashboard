import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminSessions, groups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/ids";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE = "yg_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

export async function verifyAdminPasscode(groupId: string, passcode: string) {
  const rows = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  const group = rows[0];
  if (!group) return false;
  return bcrypt.compare(passcode, group.adminPasscodeHash);
}

export async function createAdminSession(groupId: string) {
  const token = newId("adm");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessions).values({
    id: newId(),
    groupId,
    token,
    expiresAt,
  });
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/**
 * Resolves the current admin session strictly server-side. Returns the
 * group the token is bound to, or null. Admin-only mutations must always
 * scope their queries to this groupId — never to a groupId supplied by the
 * client — so an admin can never act outside their own group.
 */
export async function getAdminGroup() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      groupId: adminSessions.groupId,
      expiresAt: adminSessions.expiresAt,
      groupName: groups.name,
      groupSlug: groups.slug,
    })
    .from(adminSessions)
    .innerJoin(groups, eq(adminSessions.groupId, groups.id))
    .where(eq(adminSessions.token, token))
    .limit(1);

  const session = rows[0];
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;
  return { id: session.groupId, name: session.groupName, slug: session.groupSlug };
}

export async function requireAdminGroup() {
  const group = await getAdminGroup();
  if (!group) throw new Error("Nicht als Admin angemeldet");
  return group;
}

export async function clearAdminSession() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }
  cookies().delete(ADMIN_COOKIE);
}
