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
    <div
      className="card-shadow relative overflow-hidden rounded-2xl p-6 text-white sm:p-7"
      style={{
        background:
          "linear-gradient(135deg, var(--accent-ink) 0%, var(--accent) 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)" }}
      />
      <p className="font-data text-[11px] uppercase tracking-[0.14em] text-white/70">
        For this scenario
      </p>
      <p className="mt-2 max-w-2xl text-2xl font-semibold leading-snug sm:text-[1.75rem]">
        Launch at {`€${recommendation.priceEur.toFixed(2)}`}, leading with{" "}
        {recommendation.primaryChannel}, targeting{" "}
        {MONTH_NAMES[recommendation.launchMonth - 1]}.
      </p>
      <p className="relative mt-4 max-w-2xl text-sm text-white/85">
        {recommendation.rationale}
      </p>
      <div className="relative mt-4 border-t border-white/20 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70">
          What this deliberately doesn&apos;t optimize for
        </p>
        <p className="mt-1 max-w-2xl text-sm text-white/85">
          {recommendation.whatWereNotOptimizingFor}
        </p>
      </div>
    </div>
  );
}
