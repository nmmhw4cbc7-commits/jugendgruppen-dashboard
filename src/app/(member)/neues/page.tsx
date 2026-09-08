import { getCurrentMember } from "@/lib/session";
import { getUpcomingEventsForGroup } from "@/lib/actions/home";
import { redirect } from "next/navigation";
import { EVENT_TYPE_LABEL, formatDateRange, greeting } from "@/lib/format";
import { EventTypeIcon, FireIcon } from "@/components/icons";
import RsvpButtons from "@/components/RsvpButtons";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";

export default async function NeuesPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/onboarding");

  const upcoming = await getUpcomingEventsForGroup(member.groupId, member.id);
  const [next, ...rest] = upcoming;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-subtle text-[14.5px]">
          {greeting()}, {member.name}
        </p>
      </div>

      {!next && (
        <EmptyState
          title="Keine kommenden Termine"
          description="Aktuell steht nichts an. Sobald ein neuer Termin geplant wird, erscheint er hier."
        />
      )}

      {next && (
        <section>
          <p className="text-[13px] font-medium text-subtle mb-2.5">Diese Woche</p>
          <div className="card p-5">
            <p className="text-[13.5px] text-subtle">
              {formatDateRange(next.startDate, next.endDate)}
            </p>
            <p className="text-[21px] font-semibold text-ink mt-1.5 leading-snug flex items-center gap-2">
              <EventTypeIcon type={next.type} className="h-5 w-5 shrink-0" />
              {next.title}
            </p>
            <p className="text-subtle text-[14.5px] mt-1">
              {next.startTime && `${next.startTime} Uhr`}
              {next.startTime && next.location && " · "}
              {next.location}
            </p>
            {next.topic && (
              <p className="text-[14.5px] text-ink mt-2.5">
                Thema: <span className="font-medium">{next.topic}</span>
              </p>
            )}
            {next.description && (
              <p className="text-[14px] text-subtle mt-2 leading-relaxed">{next.description}</p>
            )}

            {next.afterActivity && (
              <div className="mt-4 pt-4 border-t border-line">
                <p className="text-[12.5px] font-medium text-subtle mb-0.5">Danach</p>
                <p className="text-[14.5px] text-ink flex items-center gap-1.5">
                  <FireIcon />
                  {next.afterActivity}
                </p>
              </div>
            )}

            {next.requiresRegistration && (
              <RsvpButtons eventId={next.id} currentStatus={next.myStatus} />
            )}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <p className="text-[13px] font-medium text-subtle mb-2.5">Was kommt demnächst?</p>
          <div className="space-y-3">
            {rest.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
