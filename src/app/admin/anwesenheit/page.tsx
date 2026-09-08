import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getGroupMeetingsForAttendance } from "@/lib/actions/admin-attendance";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { formatDateRange } from "@/lib/format";
import { BookIcon } from "@/components/icons";

export default async function AdminAnwesenheitPage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const meetings = await getGroupMeetingsForAttendance(group.id);

  return (
    <AdminShell active="anwesenheit">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">Anwesenheit</h1>

      {meetings.length === 0 ? (
        <EmptyState
          title="Noch keine Gruppenstunden"
          description="Sobald du eine Gruppenstunde anlegst, kannst du hier die Anwesenheit eintragen."
        />
      ) : (
        <div className="space-y-2.5">
          {meetings.map((m) => (
            <Link
              key={m.id}
              href={`/admin/anwesenheit/${m.id}`}
              className="card p-4 flex items-center justify-between block hover:bg-black/[0.02] transition"
            >
              <div>
                <p className="text-[13px] text-subtle">{formatDateRange(m.startDate, m.endDate)}</p>
                <p className="text-[15px] font-medium text-ink mt-0.5 flex items-center gap-1.5">
                  <BookIcon />
                  {m.title}
                </p>
                {m.topic && <p className="text-[13.5px] text-subtle mt-0.5">Thema: {m.topic}</p>}
              </div>
              <span className="text-subtle text-[13px]">Eintragen →</span>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
