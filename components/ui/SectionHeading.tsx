// The one recurring signpost for the guided decision journey: a numbered
// step, a short title, and an optional one-line "why am I seeing this"
// question — reused for every 01–07 section so the page reads as a
// narrative instead of a stack of unrelated cards.
export function SectionHeading({
  number,
  title,
  question,
}: {
  number: string;
  title: string;
  question?: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-3 px-1">
      <span
        aria-hidden
        className="mt-0.5 text-sm font-bold tabular-nums text-accent-ink"
      >
        {number}
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-[-0.01em] text-foreground sm:text-xl">
          {title}
        </h2>
        {question && (
          <p className="mt-0.5 text-sm italic text-foreground-faint">{question}</p>
        )}
      </div>
    </div>
  );
}
