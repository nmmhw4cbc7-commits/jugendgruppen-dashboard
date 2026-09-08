import { getAdminGroup } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSuggestions } from "@/lib/actions/admin-moderation";
import EmptyState from "@/components/EmptyState";
import DeleteSuggestionButton from "./delete-button";
import { LightbulbIcon, TargetIcon, ThumbsUpIcon } from "@/components/icons";

const TYPE_LABEL: Record<string, { Icon: typeof LightbulbIcon; text: string }> = {
  topic: { Icon: LightbulbIcon, text: "Thema" },
  activity: { Icon: TargetIcon, text: "Aktivität" },
};

export default async function AdminSuggestionsPage() {
  const group = await getAdminGroup();
  if (!group) redirect("/admin/login");

  const items = await getAdminSuggestions(group.id);

  return (
    <AdminShell active="vorschlaege">
      <h1 className="text-[21px] font-semibold text-ink tracking-tight mb-6">Vorschläge</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Noch keine Vorschläge"
          description="Themen- und Aktivitätsvorschläge der Gruppe erscheinen hier, sortiert nach Stimmen."
        />
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const TypeIcon = TYPE_LABEL[s.type].Icon;
            return (
            <div key={s.id} className="card p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="pill bg-accent-soft text-accent-dark mb-1.5 inline-flex items-center gap-1">
                  <TypeIcon className="h-3.5 w-3.5" />
                  {TYPE_LABEL[s.type].text}
                </span>
                <p className="text-[15px] font-medium text-ink">{s.title}</p>
                {s.description && (
                  <p className="text-[13.5px] text-subtle mt-1 leading-relaxed">{s.description}</p>
                )}
                <p className="text-[12.5px] text-subtle mt-2">{s.memberName}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[13.5px] font-medium text-ink flex items-center gap-1">
                  <ThumbsUpIcon className="h-3.5 w-3.5" />
                  {s.voteCount}
                </span>
                <DeleteSuggestionButton id={s.id} />
              </div>
            </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
