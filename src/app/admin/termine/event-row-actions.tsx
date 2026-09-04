"use client";

import { useState, useTransition } from "react";
import { deleteEvent, duplicateEvent } from "@/lib/actions/admin-events";

export default function EventRowActions({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          disabled={pending}
          onClick={() => startTransition(() => deleteEvent(eventId))}
          className="text-[12.5px] text-warn font-medium"
        >
          Wirklich löschen?
        </button>
        <button onClick={() => setConfirming(false)} className="text-[12.5px] text-subtle">
          Abbrechen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0 items-end">
      <button
        disabled={pending}
        onClick={() => startTransition(() => duplicateEvent(eventId))}
        className="text-[12.5px] text-subtle hover:text-ink"
      >
        Duplizieren
      </button>
      <button onClick={() => setConfirming(true)} className="text-[12.5px] text-warn">
        Löschen
      </button>
    </div>
  );
}
