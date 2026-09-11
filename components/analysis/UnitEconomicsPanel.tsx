"use client";

import { useScenario } from "@/lib/store";
import { computeUnitEconomics } from "@/lib/analysis/unitEconomics";
import { formatEuro } from "@/components/charts/format";
import { CHANNEL_COLORS } from "@/lib/theme";
import type { SalesChannel } from "@/lib/types";

const CHANNELS: SalesChannel[] = ["DTC Online", "Retail/Grocery", "Gym & Office"];

function Waterfall({ priceEur, channel }: { priceEur: number; channel: SalesChannel }) {
  const econ = computeUnitEconomics(priceEur, channel);
  const max = priceEur;
  const color = CHANNEL_COLORS[channel];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {channel}
        </p>
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {formatEuro(econ.unitContributionEur, 2)}
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {econ.steps.map((step, i) => {
          const scale = Math.max(0.02, Math.abs(step.runningEur) / max);
          const isResult = step.kind === "result";
          return (
            <div key={`${step.label}-${i}`}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className={isResult ? "font-semibold text-foreground" : "text-foreground-soft"}>
                  {step.label}
                  {step.kind === "deduction" && (
                    <span className="tabular-nums text-foreground-faint">
                      {" "}−{formatEuro(Math.abs(step.amountEur), 2)}
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-foreground-soft">
                  {formatEuro(step.runningEur, 2)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fill">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${scale * 100}%`,
                    backgroundColor: color,
                    opacity: isResult ? 1 : 0.4,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-foreground-faint">
        {econ.contributionMarginPct.toFixed(0)}% of shelf price stays with LUMEN.
      </p>
    </div>
  );
}

export function UnitEconomicsPanel() {
  const { inputs } = useScenario();
  const byChannel = CHANNELS.map((c) => computeUnitEconomics(inputs.priceEur, c));
  const best = byChannel.reduce((a, b) =>
    b.unitContributionEur > a.unitContributionEur ? b : a
  );
  const worst = byChannel.reduce((a, b) =>
    b.unitContributionEur < a.unitContributionEur ? b : a
  );
  const gap = best.unitContributionEur - worst.unitContributionEur;

  return (
    <div className="card p-5">
      <h3 className="card-title">Where every euro of the shelf price goes</h3>
      <p className="card-subtitle">
        At your current €{inputs.priceEur.toFixed(2)}, traced from what the
        shopper pays down to what LUMEN keeps — the cuts come from
        channel_economics.csv, COGS from cost_breakdown.csv.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-6 @3xl:grid-cols-3">
        {CHANNELS.map((channel) => (
          <Waterfall key={channel} priceEur={inputs.priceEur} channel={channel} />
        ))}
      </div>

      <div className="callout mt-5">
        <strong>The channel gap is {formatEuro(gap, 2)} per can.</strong>{" "}
        {worst.channel} keeps {formatEuro(worst.unitContributionEur, 2)} against{" "}
        {best.channel}&apos;s {formatEuro(best.unitContributionEur, 2)}, because the
        retailer margin and distributor cut come off the top before LUMEN sees
        anything. That gap is why the finance-first and brand-first readings of
        this case agree on channels even when they disagree on price — and why
        buying reach through {worst.channel} is a deliberate cost, not a free
        distribution win.
      </div>
    </div>
  );
}
