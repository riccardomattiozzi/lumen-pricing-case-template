"use client";

import { useScenario } from "@/lib/store";
import { computeTradeoff, stressTestAssumption } from "@/lib/recommendationEngine";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPct } from "@/components/charts/format";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Step 07, the close of the guided journey: the same recommendation shown
// up front in step 03 (so a viewer who only reads the top of the page
// still gets it), restated here with the full context — trade-off and
// risk — now that the reader has seen the economics, the CFO/CMO framing
// and the stress test. Every figure is read from computeTradeoff() and
// stressTestAssumption(); nothing is a new conclusion.
export function RecommendationRecap() {
  const { inputs, outputs } = useScenario();
  const { recommendation, cfoScore, cmoScore } = computeTradeoff(inputs, outputs);
  const stress = stressTestAssumption(inputs);
  const downside = stress.find((s) => s.multiplier === 0.5)!.result;
  const upside = stress.find((s) => s.multiplier === 2)!.result;

  return (
    <section
      aria-labelledby="recap-heading"
      className="card relative overflow-hidden p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 62%)",
        }}
      />
      <div className="relative">
        <SectionHeading number="07" title="Make the recommendation" />
        <h2
          id="recap-heading"
          className="max-w-2xl text-xl font-semibold text-foreground text-balance sm:text-2xl"
        >
          Based on this scenario, LUMEN should launch at{" "}
          <span className="text-accent-ink">{`€${recommendation.priceEur.toFixed(2)}`}</span>,
          leading with{" "}
          <span className="text-accent-ink">{recommendation.primaryChannel}</span>,
          in{" "}
          <span className="text-accent-ink">
            {MONTH_NAMES[recommendation.launchMonth - 1]}
          </span>
          .
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="eyebrow">Why</p>
            <p className="mt-1.5 text-sm text-foreground-soft text-pretty">
              {formatPct(outputs.contributionMarginPct)} contribution margin
              and a {outputs.cacPaybackMonths.toFixed(1)}-month CAC payback at
              CFO {cfoScore}/100 vs. CMO {cmoScore}/100 — {timingSummary(recommendation.launchMonth)}.
            </p>
          </div>
          <div>
            <p className="eyebrow">Main trade-off</p>
            <p className="mt-1.5 text-sm text-foreground-soft text-pretty">
              {recommendation.whatWereNotOptimizingFor}
            </p>
          </div>
          <div>
            <p className="eyebrow">Risk to monitor</p>
            <p className="mt-1.5 text-sm text-foreground-soft text-pretty">
              Year-1 market share is an assumption, not a measurement. At
              half the assumption the CFO score drops to {downside.cfoScore}
              /100; at double it, {upside.cfoScore}/100 — the single input
              most worth revisiting if early sales disagree with it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function timingSummary(month: number): string {
  return `launching into ${MONTH_NAMES[month - 1]}'s seasonal demand keeps the mix favorable`;
}
