"use server";

import { db } from "@/lib/db";
import { groups } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { createAdminSession, verifyAdminPasscode, clearAdminSession } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function listGroupsForAdminLogin() {
  return db.select({ id: groups.id, name: groups.name }).from(groups).orderBy(asc(groups.name));
}

const schema = z.object({
  groupId: z.string().min(1, "Bitte wähle eine Gruppe."),
  passcode: z.string().min(1, "Bitte gib den Zugangscode ein."),
});

export async function adminLogin(formData: FormData) {
  const parsed = schema.safeParse({
    groupId: formData.get("groupId"),
    passcode: formData.get("passcode"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const ok = await verifyAdminPasscode(parsed.data.groupId, parsed.data.passcode);
  if (!ok) {
    return { error: "Falscher Zugangscode für diese Gruppe." };
  }

  await createAdminSession(parsed.data.groupId);
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}
