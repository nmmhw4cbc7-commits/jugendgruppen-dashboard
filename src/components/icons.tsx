type IconProps = { className?: string };

const base = "h-4 w-4 shrink-0";

export function BookIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5c2-1 5-1 8 1 3-2 6-2 8-1v13c-2-1-5-1-8 1-3-2-6-2-8-1V5.5Z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

export function TargetIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BroomIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3 5 19" />
      <path d="M14 3c1.7.1 3.1 1.2 3.5 2.8L11.5 16.5" />
      <path d="M5 19c-.9.6-1.5 1.4-1.8 2.4" />
      <path d="M8.3 13.7c-1.6.4-2.7 1.6-3.1 3.2" />
    </svg>
  );
}

export function SuitcaseIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="8" width="17" height="11.5" rx="2" />
      <path d="M9 8V6.3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V8" />
      <path d="M3.5 13.2h17" />
    </svg>
  );
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function XIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function DotIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ThumbsUpIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10.2V20H4.3a1 1 0 0 1-1-1v-7.8a1 1 0 0 1 1-1H7Z" />
      <path d="M7 10.2l4.3-6.7a1.9 1.9 0 0 1 3.3.4l-1.2 4.1h4.3a2 2 0 0 1 1.95 2.4l-1.4 7a2 2 0 0 1-1.95 1.6H10a3 3 0 0 1-3-2.8" />
    </svg>
  );
}

export function LightbulbIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.15 1 1.9V17h5v-1.2c0-.75.4-1.45 1-1.9A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function HeartIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.2s-7.5-4.6-9.7-9.2C.9 7.8 2.3 4.5 5.6 3.6c2-.5 3.9.3 5 1.9a5.6 5.6 0 0 1 1.4-1.4c1.6-1.1 3.6-1.2 5.2-.2 2.6 1.6 3.2 5.1 1.5 8.1-2.2 4-9.7 8.2-9.7 8.2Z" />
    </svg>
  );
}

export function PrayingHandsIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v14" />
      <path d="M9.3 5c0 5-1.8 7.2-3.8 8.7 1 2.7 3.3 3.7 4.7 1.8" />
      <path d="M14.7 5c0 5 1.8 7.2 3.8 8.7-1 2.7-3.3 3.7-4.7 1.8" />
    </svg>
  );
}

export function FireIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-4 0-7-2.5-7-6.5 0-3 2-5 3-7 .3 1.5 1.2 2.5 2 3-.3-3 1-5.5 3.5-7 0 2.5.8 4 2.5 5.5 2 1.8 3 3.5 3 5.5 0 4-3 6.5-7 6.5Z" />
    </svg>
  );
}

export function WaveIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M11 12V5a1.5 1.5 0 0 1 3 0v7" />
      <path d="M14 12V6.5a1.5 1.5 0 0 1 3 0V13" />
      <path d="M17 9.8a1.5 1.5 0 0 1 3 0V15c0 3.5-2.5 6-6 6h-1.5c-2 0-3.3-.7-4.5-2.2L5 15.3c-.6-.8-.4-1.9.4-2.4.7-.4 1.6-.3 2.1.3L9 14.8" />
    </svg>
  );
}

const EVENT_TYPE_ICON: Record<string, (p: IconProps) => JSX.Element> = {
  group_meeting: BookIcon,
  activity: TargetIcon,
  action: BroomIcon,
  trip: SuitcaseIcon,
};

export function EventTypeIcon({ type, className }: IconProps & { type: string }) {
  const Icon = EVENT_TYPE_ICON[type] ?? BookIcon;
  return <Icon className={className} />;
}
