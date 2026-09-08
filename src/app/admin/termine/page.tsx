import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import { getAdminEvents } from "@/lib/actions/admin-events";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { EVENT_TYPE_LABEL, formatDateRange } from "@/lib/format";
import { EventTypeIcon } from "@/components/icons";
import EventRowActions from "./event-row-actions";

export default async function AdminTerminePage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const allEvents = await getAdminEvents(group.id);

  return (
    <AdminShell active="termine">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[21px] font-semibold text-ink tracking-tight">Termine</h1>
        <Link href="/admin/termine/neu" className="btn-accent text-[13.5px] px-3.5 py-2">
          + Termin erstellen
        </Link>
      </div>

      {allEvents.length === 0 ? (
        <EmptyState
          title="Noch keine Termine"
          description="Erstelle den ersten Termin für deine Gruppe."
        />
      ) : (
        <div className="space-y-2.5">
          {allEvents.map((e) => (
            <div key={e.id} className="card p-4 flex items-start justify-between gap-3">
              <Link href={`/admin/termine/${e.id}`} className="min-w-0 flex-1">
                <p className="text-[13px] text-subtle">
                  {formatDateRange(e.startDate, e.endDate)}
                  {e.startTime && ` · ${e.startTime}`}
                </p>
                <p className="text-[15px] font-medium text-ink mt-0.5 flex items-center gap-1.5">
                  <EventTypeIcon type={e.type} />
                  {e.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="pill bg-accent-soft text-accent-dark">
                    {EVENT_TYPE_LABEL[e.type]}
                  </span>
                  {e.requiresRegistration && (
                    <span className="pill bg-black/[0.04] text-subtle">Anmeldung</span>
                  )}
                </div>
              </Link>
              <EventRowActions eventId={e.id} />
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
