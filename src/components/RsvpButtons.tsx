"use client";

import { useTransition } from "react";
import { respondToEvent } from "@/lib/actions/events";

const OPTIONS: { value: string; label: string }[] = [
  { value: "attending", label: "Dabei" },
  { value: "maybe", label: "Vielleicht" },
  { value: "not_attending", label: "Nicht dabei" },
];

export default function RsvpButtons({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick(status: string) {
    startTransition(() => {
      respondToEvent(eventId, status);
    });
  }

  return (
    <div className="flex gap-2 mt-3">
      {OPTIONS.map((opt) => {
        const active = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={pending}
            onClick={() => handleClick(opt.value)}
            className={`flex-1 rounded-md py-2 text-[13.5px] font-medium border transition disabled:opacity-60 ${
              active
                ? "bg-accent text-white border-accent"
                : "bg-white text-ink border-line hover:bg-black/[0.02]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
