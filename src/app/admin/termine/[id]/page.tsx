import { getAdminGroup } from "@/lib/admin-session";
import { redirect, notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EventForm from "../event-form";
import { updateEvent, getEventWithResponses } from "@/lib/actions/admin-events";

const STATUS_LABEL: Record<string, string> = {
  attending: "Dabei",
  maybe: "Vielleicht",
  not_attending: "Nicht dabei",
};

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const data = await getEventWithResponses(params.id, group.id);
  if (!data) notFound();

  const { event, responses } = data;
  const counts = {
    attending: responses.filter((r) => r.status === "attending").length,
    maybe: responses.filter((r) => r.status === "maybe").length,
    not_attending: responses.filter((r) => r.status === "not_attending").length,
  };

  const boundUpdate = updateEvent.bind(null, event.id);

  return (
    <AdminShell active="termine">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">Termin bearbeiten</h1>
      <EventForm action={boundUpdate} initial={event} submitLabel="Änderungen speichern" />

      {event.requiresRegistration && (
        <div className="mt-10 max-w-lg">
          <p className="text-[13px] font-medium text-subtle mb-2.5">Anmeldungen</p>
          <div className="card p-4 mb-3 flex gap-4 text-[14px]">
            <span>{counts.attending} dabei</span>
            <span>{counts.maybe} vielleicht</span>
            <span>{counts.not_attending} nicht dabei</span>
          </div>
          {responses.length === 0 ? (
            <p className="text-[14px] text-subtle">Noch keine Anmeldungen.</p>
          ) : (
            <div className="card divide-y divide-line">
              {responses.map((r) => (
                <div key={r.id} className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[14.5px] text-ink">{r.memberName}</span>
                  <span
                    className={`pill ${
                      r.status === "attending"
                        ? "bg-accent-soft text-accent-dark"
                        : r.status === "maybe"
                        ? "bg-black/[0.05] text-subtle"
                        : "bg-warn/10 text-warn"
                    }`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
