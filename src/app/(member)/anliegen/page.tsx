import { getCurrentMember } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAnliegenForGroup } from "@/lib/actions/anliegen";
import { getSuggestionsForGroup } from "@/lib/actions/suggestions";
import AnliegenView from "./anliegen-view";

export default async function AnliegenPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/onboarding");

  const [anliegen, suggestions] = await Promise.all([
    getAnliegenForGroup(member.groupId),
    getSuggestionsForGroup(member.groupId, member.id),
  ]);

  return (
    <AnliegenView
      anliegen={anliegen.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      suggestions={suggestions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
    />
  );
}
