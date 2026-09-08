import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminAnliegen } from "@/lib/actions/admin-moderation";
import EmptyState from "@/components/EmptyState";
import DeleteAnliegenButton from "./delete-button";
import { HeartIcon, PrayingHandsIcon } from "@/components/icons";

export default async function AdminAnliegenPage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const items = await getAdminAnliegen(group.id);

  return (
    <AdminShell active="anliegen">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">Anliegen</h1>

      {items.length === 0 ? (
        <EmptyState title="Noch keine Anliegen" description="Hier erscheinen Nöte und Danksagungen der Gruppe." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] text-ink leading-relaxed flex items-start gap-1.5">
                  {a.type === "need" ? (
                    <PrayingHandsIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <HeartIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>{a.content}</span>
                </p>
                <DeleteAnliegenButton id={a.id} />
              </div>
              <p className="text-[13px] text-subtle mt-2.5">
                {a.memberName}
                {a.anonymous && <span className="ml-1.5 pill bg-black/[0.05] text-subtle">anonym gepostet</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
