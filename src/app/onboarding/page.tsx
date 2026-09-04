import { listGroups } from "@/lib/actions/onboarding";
import { getCurrentMember } from "@/lib/session";
import { redirect } from "next/navigation";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const member = await getCurrentMember();
  if (member) redirect("/neues");

  const groups = await listGroups();

  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 py-12 max-w-md mx-auto">
      <div className="mb-10">
        <p className="text-3xl mb-3">👋</p>
        <h1 className="text-[26px] font-semibold tracking-tight text-ink leading-snug">
          Willkommen
        </h1>
        <p className="text-subtle mt-2 text-[15px]">
          Deine Jugendgruppe an einem Ort — Termine, Aktivitäten und Anliegen.
        </p>
      </div>

      <OnboardingForm groups={groups} />
    </main>
  );
}
