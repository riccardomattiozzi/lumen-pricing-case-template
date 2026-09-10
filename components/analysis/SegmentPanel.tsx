"use client";

import { useScenario } from "@/lib/store";
import { readSegments, type PriceVerdict } from "@/lib/analysis/segments";
import { formatEuro } from "@/components/charts/format";

const VERDICT_STYLE: Record<PriceVerdict, { label: string; className: string }> = {
  comfortable: { label: "Comfortable", className: "bg-accent-soft text-accent-ink" },
  acceptable: { label: "Acceptable", className: "bg-accent-soft text-accent-ink" },
  stretch: { label: "A stretch", className: "bg-cmo-soft text-foreground" },
  rejected: { label: "Priced out", className: "bg-[#fde2e2] text-[#8a1c1c]" },
};

export function SegmentPanel() {
  const { inputs } = useScenario();
  const segments = readSegments(inputs.priceEur);
  const pricedOut = segments.filter(
    (s) => s.verdict === "rejected" || s.verdict === "stretch"
  );
  const pricedOutShare = pricedOut.reduce((sum, s) => sum + s.sharePct, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface card-shadow p-4">
        <p className="text-sm font-medium text-foreground">
          Who&apos;s still in at €{inputs.priceEur.toFixed(2)}
        </p>
        <p className="mt-0.5 text-xs text-foreground-faint">
          Each respondent&apos;s own &quot;expensive&quot; threshold, not a segment
          average — the share below is people, not opinions about people.
        </p>

        <div className="mt-3 space-y-3">
          {segments.map((s) => {
            const style = VERDICT_STYLE[s.verdict];
            return (
              <div key={s.segment} className="rounded-lg border border-line-soft p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.segment}</p>
                    <p className="text-[11px] text-foreground-faint">
                      {s.respondentCount} respondents · {s.sharePct.toFixed(0)}% of
                      the sample · prefers {s.preferredChannel}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-line">
                    <div
                      className="h-2 rounded-full bg-accent transition-all"
                      style={{ width: `${s.acceptancePct}%` }}
                    />
                  </div>
                  <span className="font-data w-24 text-right text-xs text-foreground-soft">
                    {s.acceptancePct.toFixed(0)}% accept
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-foreground-faint">
                  <span>Intent {s.avgIntent.toFixed(1)}/10</span>
                  <span>Sensitivity {s.avgPriceSensitivity.toFixed(1)}/10</span>
                  <span>
                    Spends {formatEuro(s.avgMonthlySpendEur, 0)}/mo on drinks
                  </span>
                </div>

                {s.thresholds && (
                  <p className="font-data mt-1.5 text-[10px] text-foreground-faint">
                    cheap {formatEuro(s.thresholds.cheapEur, 2)} · expensive{" "}
                    {formatEuro(s.thresholds.expensiveEur, 2)} · too expensive{" "}
                    {formatEuro(s.thresholds.tooExpensiveEur, 2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {pricedOut.length > 0 && (
          <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-foreground-soft">
            <strong className="text-foreground">
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

      <div className="rounded-xl border border-line bg-surface card-shadow p-4">
        <p className="text-sm font-medium text-foreground">
          What they actually said
        </p>
        <p className="mt-0.5 text-xs text-foreground-faint">
          The verbatims next to the survey scores — including where the two
          disagree, which the brief flags as worth reconciling.
        </p>

        <div className="mt-3 space-y-4">
          {segments.map((s) => (
            <div key={s.segment}>
              <p className="text-xs font-medium text-foreground">{s.segment}</p>
              <div className="mt-1.5 space-y-1.5">
                {s.quotes.map((q, i) => (
                  <p
                    key={i}
                    className="border-l-2 pl-2.5 text-xs italic text-foreground-soft"
                    style={{
                      borderColor:
                        q.sentiment === "positive"
                          ? "var(--accent)"
                          : q.sentiment === "negative"
                          ? "#b91c1c"
                          : "var(--cmo)",
                    }}
                  >
                    &ldquo;{q.quote}&rdquo;
                  </p>
                ))}
              </div>
              {s.qualQuantTension && (
                <p className="mt-1.5 rounded-md bg-cmo-soft px-2.5 py-1.5 text-[11px] text-foreground">
                  {s.qualQuantTension}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
