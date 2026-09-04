"use client";

import { useState, useTransition } from "react";

type EventFormValues = {
  type: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  location: string | null;
  topic: string | null;
  bibleVerse: string | null;
  afterActivity: string | null;
  requiresRegistration: boolean;
};

const TYPES = [
  { value: "group_meeting", label: "Gruppenstunde" },
  { value: "activity", label: "Aktivität" },
  { value: "action", label: "Aktion" },
  { value: "trip", label: "Ausflug" },
];

function toDateInputValue(d?: Date | null) {
  if (!d) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export default function EventForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  initial?: Partial<Omit<EventFormValues, "startDate" | "endDate">> & {
    startDate?: Date | null;
    endDate?: Date | null;
  };
  submitLabel: string;
}) {
  const [type, setType] = useState(initial?.type ?? "group_meeting");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await action(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-lg">
      <div>
        <p className="label">Art des Termins</p>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium border transition ${
                type === t.value
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-subtle border-line"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      <div>
        <label className="label" htmlFor="title">
          Titel
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          className="field"
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="startDate">
            Datum
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={toDateInputValue(initial?.startDate)}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="startTime">
            Zeit
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={initial?.startTime ?? ""}
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="endDate">
          Enddatum (für mehrtägige Termine)
        </label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={toDateInputValue(initial?.endDate)}
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="location">
          Ort
        </label>
        <input
          id="location"
          name="location"
          defaultValue={initial?.location ?? ""}
          className="field"
          maxLength={200}
        />
      </div>

      {type === "group_meeting" && (
        <>
          <div>
            <label className="label" htmlFor="topic">
              Thema
            </label>
            <input
              id="topic"
              name="topic"
              defaultValue={initial?.topic ?? ""}
              className="field"
              maxLength={200}
            />
          </div>
          <div>
            <label className="label" htmlFor="bibleVerse">
              Bibelstelle
            </label>
            <input
              id="bibleVerse"
              name="bibleVerse"
              defaultValue={initial?.bibleVerse ?? ""}
              className="field"
              maxLength={200}
            />
          </div>
          <div>
            <label className="label" htmlFor="afterActivity">
              Danach (z. B. Lagerfeuer)
            </label>
            <input
              id="afterActivity"
              name="afterActivity"
              defaultValue={initial?.afterActivity ?? ""}
              className="field"
              maxLength={200}
            />
          </div>
        </>
      )}

      <div>
        <label className="label" htmlFor="description">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="field resize-none"
          maxLength={2000}
        />
      </div>

      <label className="flex items-center gap-2 text-[14px] text-ink">
        <input
          type="checkbox"
          name="requiresRegistration"
          defaultChecked={initial?.requiresRegistration ?? false}
          className="h-4 w-4 rounded border-line accent-accent"
        />
        Anmeldung erforderlich
      </label>

      {error && <p className="text-sm text-warn">{error}</p>}

      <button type="submit" disabled={pending} className="btn-accent px-5 py-2.5">
        {pending ? "Speichern …" : submitLabel}
      </button>
    </form>
  );
}
