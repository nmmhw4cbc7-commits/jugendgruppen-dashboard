"use server";

import { db } from "@/lib/db";
import { groups, members } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { setMemberCookie, clearMemberCookie } from "@/lib/session";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function listGroups() {
  return db.select({ id: groups.id, name: groups.name }).from(groups).orderBy(asc(groups.name));
}

const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen ein.").max(60),
  groupId: z.string().min(1, "Bitte wähle deine Gruppe."),
});

export async function completeOnboarding(formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    groupId: formData.get("groupId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const group = await db.query.groups.findFirst({ where: (g, { eq }) => eq(g.id, parsed.data.groupId) });
  if (!group) {
    return { error: "Diese Gruppe gibt es nicht." };
  }

  const memberId = newId();
  await db.insert(members).values({
    id: memberId,
    groupId: group.id,
    name: parsed.data.name,
  });

  setMemberCookie(memberId);
  redirect("/neues");
}

export async function switchGroupReset() {
  clearMemberCookie();
  redirect("/onboarding");
}
