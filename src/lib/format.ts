const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export function weekday(d: Date): string {
  return WEEKDAYS[d.getDay()];
}

export function formatDateLong(d: Date): string {
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

export function formatDateShort(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function formatDateRange(start: Date, end: Date | null): string {
  if (!end || sameDay(start, end)) {
    return `${weekday(start)} · ${formatDateLong(start)}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}.–${end.getDate()}. ${MONTHS[start.getMonth()]}`;
  }
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isUpcoming(d: Date, referenceEnd?: Date | null): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const compareDate = referenceEnd ?? d;
  return compareDate >= now;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Hallo";
  return "Guten Abend";
}

export const EVENT_TYPE_LABEL: Record<string, string> = {
  group_meeting: "Gruppenstunde",
  activity: "Aktivität",
  action: "Aktion",
  trip: "Ausflug",
};
