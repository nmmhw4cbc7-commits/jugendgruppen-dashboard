"use client";

import { useTransition } from "react";
import { setAttendance } from "@/lib/actions/admin-attendance";

const OPTIONS = [
  { value: "present", label: "✅", title: "Anwesend" },
  { value: "excused", label: "🟡", title: "Entschuldigt" },
  { value: "absent", label: "❌", title: "Abwesend" },
];

export default function AttendanceRow({
  eventId,
  memberId,
  name,
  status,
}: {
  eventId: string;
  memberId: string;
  name: string;
  status: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="text-[14.5px] text-ink">{name}</span>
      <div className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            title={opt.title}
            disabled={pending}
            onClick={() => startTransition(() => setAttendance(eventId, memberId, opt.value))}
            className={`h-9 w-9 rounded-md text-[16px] flex items-center justify-center border transition disabled:opacity-60 ${
              status === opt.value ? "border-ink bg-black/[0.04]" : "border-line bg-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
