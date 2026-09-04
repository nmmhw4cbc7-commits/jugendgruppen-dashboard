import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import EventForm from "../event-form";
import { createEvent } from "@/lib/actions/admin-events";

export default async function NewEventPage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  return (
    <AdminShell active="termine">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">Termin erstellen</h1>
      <EventForm action={createEvent} submitLabel="Termin erstellen" />
    </AdminShell>
  );
}
