"use client";

import { useTransition } from "react";
import { toggleMemberActive } from "@/lib/actions/admin-members";

export default function MemberActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleMemberActive(id))}
      className={`text-[12.5px] font-medium px-2.5 py-1 rounded-full border transition disabled:opacity-60 ${
        active ? "border-line text-subtle" : "border-warn/30 text-warn bg-warn/5"
      }`}
    >
      {active ? "Aktiv" : "Deaktiviert"}
    </button>
  );
}
