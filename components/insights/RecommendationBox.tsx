"use client";

import { useScenario } from "@/lib/store";
import { computeTradeoff } from "@/lib/recommendationEngine";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// The page's one headline. It leads by type size alone — the largest text
// in the column — with the three decisions (price, channel, month) picked
// out in the tint, and a faint wash of the tint behind it.
export function RecommendationBox() {
  const { inputs, outputs } = useScenario();
  const { recommendation } = computeTradeoff(inputs, outputs);

  return (
    <section
      aria-labelledby="recommendation-heading"
      className="card relative overflow-hidden p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--accent) 11%, transparent), transparent 62%)",
        }}
      />
      <div className="relative">
        <p className="flex items-center gap-2 text-footnote font-semibold text-accent-ink">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
          Recommendation for this scenario
        </p>
        <h2
          id="recommendation-heading"
          className="mt-3 max-w-3xl text-2xl font-semibold text-foreground text-balance @xl:text-3xl"
        >
          Launch at{" "}
          <span className="text-accent-ink">{`€${recommendation.priceEur.toFixed(2)}`}</span>,
          leading with{" "}
          <span className="text-accent-ink">{recommendation.primaryChannel}</span>,
          targeting{" "}
          <span className="text-accent-ink">
            {MONTH_NAMES[recommendation.launchMonth - 1]}
          </span>
          .
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-foreground-soft text-pretty @xl:text-base">
          {recommendation.rationale}
        </p>
        <div className="mt-6 max-w-3xl border-t border-line-soft pt-5">
          <h3 className="eyebrow">What this deliberately doesn&apos;t optimize for</h3>
          <p className="mt-1.5 text-sm text-foreground-soft text-pretty">
            {recommendation.whatWereNotOptimizingFor}
          </p>
        </div>
      </div>
    </section>
  );
}
