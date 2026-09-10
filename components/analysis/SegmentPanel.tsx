"use client";

import type { ReactNode } from "react";
import { useScenario } from "@/lib/store";
import { readSegments, type PriceVerdict } from "@/lib/analysis/segments";
import { formatEuro } from "@/components/charts/format";
import { CheckIcon, WarningIcon, XIcon } from "@/components/ui/icons";

// Verdicts are status, so each one pairs its tint with a glyph and a word —
// never color alone.
const VERDICT_STYLE: Record<
  PriceVerdict,
  { label: string; className: string; icon: ReactNode }
> = {
  comfortable: {
    label: "Comfortable",
    className: "bg-accent-soft text-accent-ink",
    icon: <CheckIcon className="h-3 w-3" />,
  },
  acceptable: {
    label: "Acceptable",
    className: "bg-accent-soft text-accent-ink",
    icon: <CheckIcon className="h-3 w-3" />,
  },
  stretch: {
    label: "A stretch",
    className: "bg-warning-soft text-warning-ink",
    icon: <WarningIcon className="h-3 w-3" />,
  },
  rejected: {
    label: "Priced out",
    className: "bg-danger-soft text-danger-ink",
    icon: <XIcon className="h-3 w-3" />,
  },
};

const SENTIMENT: Record<"positive" | "negative" | "mixed", { label: string; color: string }> = {
  positive: { label: "Positive", color: "var(--accent)" },
  negative: { label: "Negative", color: "var(--danger)" },
  mixed: { label: "Mixed", color: "var(--chart-neutral)" },
};

export function SegmentPanel() {
  const { inputs } = useScenario();
  const segments = readSegments(inputs.priceEur);
  const pricedOut = segments.filter(
    (s) => s.verdict === "rejected" || s.verdict === "stretch"
  );
  const pricedOutShare = pricedOut.reduce((sum, s) => sum + s.sharePct, 0);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="card-title">
          Who&apos;s still in at €{inputs.priceEur.toFixed(2)}
        </h3>
        <p className="card-subtitle">
          Each respondent&apos;s own &quot;expensive&quot; threshold, not a segment
          average — the share below is people, not opinions about people.
        </p>

        {/* An inset grouped list: one row per segment, hairlines between. */}
        <ul className="mt-4 overflow-hidden rounded-2xl bg-surface-2">
          {segments.map((s, i) => {
            const style = VERDICT_STYLE[s.verdict];
            return (
              <li key={s.segment} className="relative px-4 py-3.5">
                {i > 0 && (
                  <span aria-hidden className="absolute left-4 right-0 top-0 h-px bg-line-soft" />
                )}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{s.segment}</p>
                    <p className="mt-0.5 text-xs text-foreground-faint">
                      {s.respondentCount} respondents · {s.sharePct.toFixed(0)}% of
                      the sample · prefers {s.preferredChannel}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}
                  >
                    {style.icon}
                    {style.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${s.acceptancePct}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs font-medium tabular-nums text-foreground-soft">
                    {s.acceptancePct.toFixed(0)}% accept
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 gap-1 text-xs text-foreground-faint @md:grid-cols-3 @md:gap-2">
                  <span>Intent {s.avgIntent.toFixed(1)}/10</span>
                  <span>Sensitivity {s.avgPriceSensitivity.toFixed(1)}/10</span>
                  <span>
                    Spends {formatEuro(s.avgMonthlySpendEur, 0)}/mo on drinks
                  </span>
                </div>

                {s.thresholds && (
                  <p className="mt-1.5 text-2xs tabular-nums text-foreground-faint">
                    cheap {formatEuro(s.thresholds.cheapEur, 2)} · expensive{" "}
                    {formatEuro(s.thresholds.expensiveEur, 2)} · too expensive{" "}
                    {formatEuro(s.thresholds.tooExpensiveEur, 2)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {pricedOut.length > 0 && (
          <div className="callout mt-4">
            <strong>
              This price gives up {pricedOutShare.toFixed(0)}% of the surveyed
              market.
            </strong>{" "}
            {pricedOut.map((s) => s.segment).join(" and ")}{" "}
            {pricedOut.length === 1 ? "is" : "are"} priced out or stretched at €
            {inputs.priceEur.toFixed(2)}. That&apos;s the concrete cost of the
            premium position — worth stating out loud rather than leaving inside
            an acceptance percentage.
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="card-title">What they actually said</h3>
        <p className="card-subtitle">
          The verbatims next to the survey scores — including where the two
          disagree, which the brief flags as worth reconciling.
        </p>

        <div className="mt-4 space-y-5">
          {segments.map((s) => (
            <div key={s.segment}>
              <p className="eyebrow">{s.segment}</p>
              <div className="mt-2 space-y-2">
                {s.quotes.map((q, i) => (
                  <blockquote
                    key={i}
                    className="relative pl-3.5 text-sm text-foreground-soft text-pretty"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0.5 left-0 w-[3px] rounded-full"
                      style={{ backgroundColor: SENTIMENT[q.sentiment].color }}
                    />
                    <span className="sr-only">{SENTIMENT[q.sentiment].label}: </span>
                    &ldquo;{q.quote}&rdquo;
                  </blockquote>
                ))}
              </div>
              {s.qualQuantTension && (
                <p className="callout callout-warning mt-2.5 flex gap-2 text-xs">
                  <WarningIcon className="mt-px h-3.5 w-3.5 flex-none text-warning" />
                  <span>{s.qualQuantTension}</span>
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground-soft">
          {(["positive", "mixed", "negative"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-3 w-[3px] rounded-full"
                style={{ backgroundColor: SENTIMENT[k].color }}
              />
              {SENTIMENT[k].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
