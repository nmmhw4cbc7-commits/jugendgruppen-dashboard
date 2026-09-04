"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/lib/actions/admin-auth";

export default function AdminLoginForm({ groups }: { groups: { id: string; name: string }[] }) {
  const [groupId, setGroupId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("groupId", groupId);
    fd.set("passcode", passcode);
    startTransition(async () => {
      const res = await adminLogin(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="group">
          Gruppe
        </label>
        <select
          id="group"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="field"
        >
          <option value="">Gruppe wählen …</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="passcode">
          Zugangscode
        </label>
        <input
          id="passcode"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="field"
        />
      </div>
      {error && <p className="text-sm text-warn">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
        {pending ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
