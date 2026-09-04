import { EVENT_TYPE_EMOJI, EVENT_TYPE_LABEL, formatDateRange } from "@/lib/format";
import RsvpButtons from "./RsvpButtons";

type EventLike = {
  id: string;
  type: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  location: string | null;
  topic: string | null;
  afterActivity: string | null;
  requiresRegistration: boolean;
  myStatus: string | null;
};

export default function EventCard({ event }: { event: EventLike }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] text-subtle mb-1">
            {formatDateRange(event.startDate, event.endDate)}
            {event.startTime && ` · ${event.startTime} Uhr`}
          </p>
          <p className="font-medium text-ink text-[15.5px] leading-snug">
            {EVENT_TYPE_EMOJI[event.type]} {event.title}
          </p>
          {event.topic && (
            <p className="text-subtle text-[13.5px] mt-0.5">Thema: {event.topic}</p>
          )}
          {event.location && (
            <p className="text-subtle text-[13px] mt-0.5">{event.location}</p>
          )}
        </div>
        <span className="pill bg-accent-soft text-accent-dark whitespace-nowrap shrink-0">
          {EVENT_TYPE_LABEL[event.type]}
        </span>
      </div>

      {event.afterActivity && (
        <p className="text-[13.5px] text-subtle mt-2.5 pt-2.5 border-t border-line">
          Danach: {event.afterActivity}
        </p>
      )}

      {event.requiresRegistration && (
        <RsvpButtons eventId={event.id} currentStatus={event.myStatus} />
      )}
    </div>
  );
}
