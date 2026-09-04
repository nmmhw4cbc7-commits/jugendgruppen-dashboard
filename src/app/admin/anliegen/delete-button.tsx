"use client";

import { useState, useTransition } from "react";
import { deleteAnliegen } from "@/lib/actions/admin-moderation";

export default function DeleteAnliegenButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteAnliegen(id))}
        className="shrink-0 text-[12.5px] text-warn font-medium whitespace-nowrap"
      >
        Wirklich?
      </button>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="shrink-0 text-[12.5px] text-subtle hover:text-warn">
      Löschen
    </button>
  );
}
