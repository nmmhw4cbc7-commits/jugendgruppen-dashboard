import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getMembersOverview } from "@/lib/actions/admin-members";
import EmptyState from "@/components/EmptyState";
import MemberActiveToggle from "./member-toggle";

export default async function AdminMembersPage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const members = await getMembersOverview(group.id);

  return (
    <AdminShell active="mitglieder">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">Mitglieder</h1>

      {members.length === 0 ? (
        <EmptyState title="Noch keine Mitglieder" description="Mitglieder erscheinen hier, sobald sie beitreten." />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-2.5 sm:hidden">
            {members.map((m) => (
              <div key={m.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className={`text-[15px] font-medium ${m.active ? "text-ink" : "text-subtle line-through"}`}>
                    {m.name}
                  </p>
                  <MemberActiveToggle id={m.id} active={m.active} />
                </div>
                <div className="flex gap-4 mt-2 text-[13px] text-subtle">
                  <span>{m.attendancePercentage !== null ? `${m.attendancePercentage}% Anwesenheit` : "keine Daten"}</span>
                  <span>{m.confirmedRsvps} Zusagen</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block card overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left text-subtle border-b border-line">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Anwesenheit</th>
                  <th className="px-4 py-3 font-medium">Zusagen</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className={`px-4 py-3 ${m.active ? "text-ink" : "text-subtle line-through"}`}>{m.name}</td>
                    <td className="px-4 py-3 text-subtle">
                      {m.attendancePercentage !== null ? `${m.attendancePercentage}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-subtle">{m.confirmedRsvps}</td>
                    <td className="px-4 py-3">
                      <MemberActiveToggle id={m.id} active={m.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}
