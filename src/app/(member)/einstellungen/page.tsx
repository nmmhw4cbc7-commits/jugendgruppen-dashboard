import { getCurrentMember } from "@/lib/session";
import { redirect } from "next/navigation";
import { getMemberAttendanceStats } from "@/lib/actions/admin-attendance";
import SettingsView from "./settings-view";

export default async function EinstellungenPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/onboarding");

  const stats = await getMemberAttendanceStats(member.id);

  return (
    <SettingsView
      name={member.name}
      groupName={member.groupName}
      stats={stats}
    />
  );
}
