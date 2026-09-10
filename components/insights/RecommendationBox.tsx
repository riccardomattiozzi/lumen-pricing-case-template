"use client";

import { useScenario } from "@/lib/store";
import { computeTradeoff } from "@/lib/recommendationEngine";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function RecommendationBox() {
  const { inputs, outputs } = useScenario();
  const { recommendation } = computeTradeoff(inputs, outputs);

  return (
    <div className="rounded-lg border border-accent bg-accent-soft p-5">
      <p className="text-xs font-mono uppercase tracking-wide text-accent">
        For this scenario
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">
        Launch at {`€${recommendation.priceEur.toFixed(2)}`}, leading with{" "}
        {recommendation.primaryChannel}, targeting{" "}
        {MONTH_NAMES[recommendation.launchMonth - 1]}.
      </p>
      <p className="mt-3 text-sm text-foreground-soft">{recommendation.rationale}</p>
      <div className="mt-3 border-t border-accent/20 pt-3">
        <p className="text-xs font-medium text-foreground">
          What this deliberately doesn&apos;t optimize for
        </p>
        <p className="mt-1 text-xs text-foreground-soft">
          {recommendation.whatWereNotOptimizingFor}
        </p>
      </div>
    </div>
  );
}
