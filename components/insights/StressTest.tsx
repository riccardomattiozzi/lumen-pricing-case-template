"use client";

import { useScenario } from "@/lib/store";
import { stressTestAssumption } from "@/lib/recommendationEngine";
import { InfoTip } from "@/components/ui/InfoTip";

// Only reachable after the base scenario and the CFO/CMO trade-off are
// already understood — uncertainty is supporting evidence for a decision,
// not the decision itself. Reruns the exact same pure functions the rest
// of the app uses at half and double the market-share assumption; nothing
// here is a new calculation.
export function StressTest() {
  const { inputs } = useScenario();
  const stress = stressTestAssumption(inputs);

  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-1.5 card-title">
        Does this hold up?
        <InfoTip label="Market share stress test">
          Year-1 market share is an assumption, not a measurement — there
          is no German sales history yet. This reruns the scenario at half
          and double the current assumption to show whether the scores
          survive a more conservative or more optimistic guess.
        </InfoTip>
      </h3>
      <p className="card-subtitle">
        This is the base recommendation. Now let&apos;s see how robust it is
        if the one genuinely uncertain assumption — Year-1 market share
        ({(inputs.marketShareCapturePct * 100).toFixed(2)}% today) — turns
        out to be wrong.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {stress.map(({ multiplier, result: r }) => (
          <div
            key={multiplier}
            className={`rounded-xl px-3 py-3 ${
              multiplier === 1 ? "bg-surface-2 ring-1 ring-inset ring-line" : "bg-surface-2"
            }`}
          >
            <p className="text-xs font-medium text-foreground-faint">
              {multiplier}× {multiplier === 0.5 ? "downside" : multiplier === 2 ? "upside" : "(base)"}
            </p>
            <p className="mt-1.5 flex flex-wrap gap-x-3 text-sm tabular-nums">
              <span>
                <span className="text-xs text-foreground-faint">CFO </span>
                <span className="font-semibold text-foreground">{r.cfoScore}</span>
              </span>
              <span>
                <span className="text-xs text-foreground-faint">CMO </span>
                <span className="font-semibold text-foreground">{r.cmoScore}</span>
              </span>
            </p>
          </div>
        ))}
      </div>

      <p className="callout mt-4">
        Market share is a modeling assumption LUMEN has not yet observed in
        Germany — treat every figure above as directionally useful, not as
        a guarantee.
      </p>
    </div>
  );
}
