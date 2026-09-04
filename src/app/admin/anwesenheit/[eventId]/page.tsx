import { getAdminGroup } from "@/lib/admin-session";
import { redirect, notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAttendanceForEvent } from "@/lib/actions/admin-attendance";
import { formatDateRange } from "@/lib/format";
import AttendanceRow from "./attendance-row";

export default async function AdminAttendanceEventPage({ params }: { params: { eventId: string } }) {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const data = await getAttendanceForEvent(params.eventId, group.id);
  if (!data) notFound();

  return (
    <AdminShell active="anwesenheit">
      <p className="text-[13px] text-subtle mb-1">{formatDateRange(data.event.startDate, data.event.endDate)}</p>
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">{data.event.title}</h1>

      <div className="card divide-y divide-line">
        {data.members.map((m) => (
          <AttendanceRow key={m.id} eventId={data.event.id} memberId={m.id} name={m.name} status={m.status} />
        ))}
      </div>
    </AdminShell>
  );
}
