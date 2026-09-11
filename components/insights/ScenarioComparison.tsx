"use client";

import { useState } from "react";
import { useScenario } from "@/lib/store";
import { computeScenario } from "@/lib/engine/pricingEngine";
import { computeTradeoff } from "@/lib/recommendationEngine";
import { formatEuro, formatUnits } from "@/components/charts/format";
import { ArrowCounterclockwiseIcon } from "@/components/ui/icons";
import type { ScenarioInputs } from "@/lib/types";

function Row({
  label,
  current,
  baseline,
  format,
  unit = "",
}: {
  label: string;
  current: number;
  baseline: number;
  format: (v: number) => string;
  unit?: string;
}) {
  const diff = current - baseline;
  const flat = Math.abs(diff) < 1e-9;
  const sign = diff > 0 ? "+" : "";
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-foreground-soft">{label}</span>
      <span className="flex items-baseline gap-2 text-sm tabular-nums">
        <span className="font-semibold text-foreground">{format(current)}</span>
        {!flat && (
          <span className="text-foreground-faint">
            {diff > 0 ? "▲" : "▼"} {sign}
            {format(diff).replace("-", "")}
            {unit}
          </span>
        )}
        {flat && <span className="text-foreground-faint">no change</span>}
      </span>
    </div>
  );
}

// A lightweight before/after: baseline is a local snapshot of the inputs
// captured the first time this scenario loaded (or last time someone
// pressed "Set as baseline"), never the engine's own state — recomputed
// here with the same pure functions the rest of the app uses, so nothing
// about the calculations changes.
export function ScenarioComparison() {
  const { inputs, outputs } = useScenario();
  const [baselineInputs, setBaselineInputs] = useState<ScenarioInputs>(() => inputs);

  const baselineOutputs = computeScenario(baselineInputs);
  const baselineTradeoff = computeTradeoff(baselineInputs, baselineOutputs);
  const currentTradeoff = computeTradeoff(inputs, outputs);

  const unchanged = JSON.stringify(baselineInputs) === JSON.stringify(inputs);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="card-title">What changed?</h3>
          <p className="card-subtitle">
            This scenario compared against the baseline you last set.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBaselineInputs(inputs)}
          disabled={unchanged}
          className="pressable inline-flex flex-none items-center gap-1 rounded-full bg-fill px-2.5 py-1 text-footnote font-medium text-foreground-soft hover:bg-fill-strong disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowCounterclockwiseIcon className="h-3 w-3" />
          Set as baseline
        </button>
      </div>

      {unchanged ? (
        <p className="mt-4 text-sm text-foreground-faint">
          No changes from the current baseline yet — move a control, then
          come back here.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-line-soft">
          <Row
            label="Monthly revenue"
            current={outputs.estimatedMonthlyRevenueEur}
            baseline={baselineOutputs.estimatedMonthlyRevenueEur}
            format={(v) => formatEuro(v)}
          />
          <Row
            label="Monthly units"
            current={outputs.estimatedMonthlyUnits}
            baseline={baselineOutputs.estimatedMonthlyUnits}
            format={(v) => formatUnits(v)}
          />
          <Row
            label="Contribution margin"
            current={outputs.contributionMarginPct}
            baseline={baselineOutputs.contributionMarginPct}
            format={(v) => `${v.toFixed(1)}`}
            unit=" pp"
          />
          <Row
            label="CAC payback"
            current={outputs.cacPaybackMonths}
            baseline={baselineOutputs.cacPaybackMonths}
            format={(v) => `${v.toFixed(1)}`}
            unit=" mo"
          />
          <Row
            label="CFO score"
            current={currentTradeoff.cfoScore}
            baseline={baselineTradeoff.cfoScore}
            format={(v) => `${v}`}
            unit=" pts"
          />
          <Row
            label="CMO score"
            current={currentTradeoff.cmoScore}
            baseline={baselineTradeoff.cmoScore}
            format={(v) => `${v}`}
            unit=" pts"
          />
        </div>
      )}
    </div>
  );
}
