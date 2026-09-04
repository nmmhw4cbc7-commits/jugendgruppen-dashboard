"use client";

import { useState, useTransition } from "react";
import { updateMemberName } from "@/lib/actions/settings";
import { switchGroupReset } from "@/lib/actions/onboarding";

export default function SettingsView({
  name,
  groupName,
  stats,
}: {
  name: string;
  groupName: string;
  stats: { total: number; present: number; percentage: number | null };
}) {
  const [nameInput, setNameInput] = useState(name);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const fd = new FormData();
    fd.set("name", nameInput);
    startTransition(async () => {
      const res = await updateMemberName(fd);
      if (res?.error) setError(res.error);
      else {
        setError(null);
        setSaved(true);
      }
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight">Einstellungen</h1>

      {stats.total > 0 && (
        <section className="card p-5">
          <p className="text-[13px] font-medium text-subtle mb-1">Meine Anwesenheit</p>
          <p className="text-[15px] text-ink">
            {stats.present} von {stats.total} Treffen
          </p>
          <p className="text-[32px] font-semibold text-accent-dark mt-1">{stats.percentage}%</p>
        </section>
      )}

      <section>
        <p className="text-[13px] font-medium text-subtle mb-2.5">Profil</p>
        <form onSubmit={submit} className="card p-5 space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setSaved(false);
              }}
              className="field"
              maxLength={60}
            />
          </div>
          <div>
            <p className="label mb-1">Gruppe</p>
            <p className="text-[15px] text-ink">{groupName}</p>
          </div>
          {error && <p className="text-sm text-warn">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="btn-secondary">
              {pending ? "Speichern …" : "Speichern"}
            </button>
            {saved && <span className="text-[13.5px] text-accent-dark">Gespeichert.</span>}
          </div>
        </form>
      </section>

      <section>
        <p className="text-[13px] font-medium text-subtle mb-2.5">Gruppe wechseln</p>
        <div className="card p-5">
          <p className="text-[14px] text-subtle leading-relaxed mb-3">
            Du gehörst aktuell zu <span className="font-medium text-ink">{groupName}</span>. Beim
            Wechseln startest du das Onboarding neu und wählst deine Gruppe erneut.
          </p>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="btn-secondary">
              Gruppe wechseln
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => switchGroupReset()} className="btn-danger">
                Ja, Gruppe wechseln
              </button>
              <button onClick={() => setConfirmReset(false)} className="btn-ghost">
                Abbrechen
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
