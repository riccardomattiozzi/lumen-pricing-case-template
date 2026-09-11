// Small line/solid glyphs drawn for this app (16×16 grid, currentColor), so
// status is never carried by color alone: every warning, verdict and
// selection state pairs its tint with a shape.

type IconProps = { className?: string };

export function CheckIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.75"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WarningIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.04 2.2a1.2 1.2 0 0 0-2.08 0L.9 12.7A1.2 1.2 0 0 0 1.94 14.5h12.12a1.2 1.2 0 0 0 1.04-1.8L9.04 2.2ZM7.2 5.9a.8.8 0 0 1 1.6 0v3.6a.8.8 0 0 1-1.6 0V5.9Zm.8 5.6a.95.95 0 1 0 0 1.9.95.95 0 0 0 0-1.9Z"
      />
    </svg>
  );
}

export function ChevronUpDownIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M4.75 6.25 8 3l3.25 3.25M4.75 9.75 8 13l3.25-3.25"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowCounterclockwiseIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M3.25 7.75a4.75 4.75 0 1 0 1.4-3.36M3.25 2.5v2.4h2.4"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InfoIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm.8-9.4a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM7.2 7.3a.8.8 0 0 1 1.6 0v3.6a.8.8 0 0 1-1.6 0V7.3Z"
      />
    </svg>
  );
}
