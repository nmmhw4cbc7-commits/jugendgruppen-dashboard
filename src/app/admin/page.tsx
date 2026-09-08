import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import { getAdminDashboard } from "@/lib/actions/admin-dashboard";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { EVENT_TYPE_LABEL, formatDateRange } from "@/lib/format";
import { EventTypeIcon } from "@/components/icons";

export default async function AdminDashboardPage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const data = await getAdminDashboard(group.id);

  return (
    <AdminShell active="dashboard">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">{group.name}</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-[13px] font-medium text-subtle mb-2">Nächstes Treffen</p>
          {data.nextEvent ? (
            <>
              <p className="text-[15.5px] font-medium text-ink">
                {formatDateRange(data.nextEvent.startDate, data.nextEvent.endDate)}
                {data.nextEvent.startTime && ` · ${data.nextEvent.startTime}`}
              </p>
              <p className="text-[14px] text-subtle mt-0.5 flex items-center gap-1.5">
                <EventTypeIcon type={data.nextEvent.type} />
                {data.nextEvent.title}
              </p>
              {data.nextEvent.requiresRegistration && (
                <div className="flex gap-3 mt-3 text-[13.5px] text-subtle">
                  <span>{data.rsvpCounts.attending} zugesagt</span>
                  <span>{data.rsvpCounts.maybe} vielleicht</span>
                  <span>{data.rsvpCounts.not_attending} abgesagt</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-[14.5px] text-subtle">Kein Termin geplant.</p>
          )}
        </div>

        <div className="card p-5">
          <p className="text-[13px] font-medium text-subtle mb-2">Mitglieder</p>
          <p className="text-[28px] font-semibold text-ink">{data.memberCount}</p>
        </div>

        <div className="card p-5">
          <p className="text-[13px] font-medium text-subtle mb-2">Neue Anliegen</p>
          <p className="text-[28px] font-semibold text-ink">{data.newAnliegenCount}</p>
          <p className="text-[12.5px] text-subtle mt-0.5">letzte 7 Tage</p>
        </div>

        <div className="card p-5">
          <p className="text-[13px] font-medium text-subtle mb-2">Neue Vorschläge</p>
          <p className="text-[28px] font-semibold text-ink">{data.newSuggestionsCount}</p>
          <p className="text-[12.5px] text-subtle mt-0.5">letzte 7 Tage</p>
        </div>
      </div>

      <p className="text-[13px] font-medium text-subtle mb-2.5">Schnelle Aktionen</p>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/admin/termine/neu" className="btn-secondary text-[13.5px]">
          Termin erstellen
        </Link>
        <Link href="/admin/anwesenheit" className="btn-secondary text-[13.5px]">
          Anwesenheit eintragen
        </Link>
        <Link href="/admin/anliegen" className="btn-secondary text-[13.5px]">
          Anliegen verwalten
        </Link>
        <Link href="/admin/vorschlaege" className="btn-secondary text-[13.5px]">
          Vorschläge ansehen
        </Link>
      </div>

      {data.upcomingEvents.length > 0 && (
        <>
          <p className="text-[13px] font-medium text-subtle mb-2.5">Kommende Termine</p>
          <div className="space-y-2.5">
            {data.upcomingEvents.map((e) => (
              <Link
                key={e.id}
                href="/admin/termine"
                className="card p-4 flex items-center justify-between block hover:bg-black/[0.02] transition"
              >
                <div>
                  <p className="text-[13px] text-subtle">
                    {formatDateRange(e.startDate, e.endDate)}
                    {e.startTime && ` · ${e.startTime}`}
                  </p>
                  <p className="text-[14.5px] font-medium text-ink mt-0.5 flex items-center gap-1.5">
                    <EventTypeIcon type={e.type} />
                    {e.title}
                  </p>
                </div>
                <span className="pill bg-accent-soft text-accent-dark">
                  {EVENT_TYPE_LABEL[e.type]}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}
