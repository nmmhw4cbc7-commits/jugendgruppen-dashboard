"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";

type Group = { id: string; name: string };

export default function OnboardingForm({ groups }: { groups: Group[] }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function goToGroupStep(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Bitte gib deinen Namen ein.");
      return;
    }
    setError(null);
    setStep(2);
  }

  function submit() {
    if (!groupId) {
      setError("Bitte wähle deine Gruppe.");
      return;
    }
    const fd = new FormData();
    fd.set("name", name);
    fd.set("groupId", groupId);
    startTransition(async () => {
      const res = await completeOnboarding(fd);
      if (res?.error) setError(res.error);
    });
  }

  if (step === 1) {
    return (
      <form onSubmit={goToGroupStep} className="space-y-5">
        <div>
          <label htmlFor="name" className="label">
            Wie heißt du?
          </label>
          <input
            id="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            className="field text-[17px]"
            maxLength={60}
          />
        </div>
        {error && <p className="text-sm text-warn">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3 text-base">
          Weiter
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Welche Gruppe?</p>
        <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroupId(g.id)}
              className={`w-full text-left rounded-md border px-4 py-3 text-[15px] transition ${
                groupId === g.id
                  ? "border-accent bg-accent-soft text-accent-dark font-medium"
                  : "border-line bg-white hover:bg-black/[0.02]"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-warn">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setStep(1)} className="btn-secondary">
          Zurück
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn-primary flex-1 py-3 text-base"
        >
          {pending ? "Einen Moment …" : "App öffnen"}
        </button>
      </div>
    </div>
  );
}
