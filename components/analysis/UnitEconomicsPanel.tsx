"use client";

import { useScenario } from "@/lib/store";
import { computeUnitEconomics } from "@/lib/analysis/unitEconomics";
import { formatEuro } from "@/components/charts/format";
import { colors } from "@/lib/theme";
import type { SalesChannel } from "@/lib/types";

const CHANNELS: SalesChannel[] = ["DTC Online", "Retail/Grocery", "Gym & Office"];
const CHANNEL_COLORS: Record<SalesChannel, string> = {
  "DTC Online": colors.accent,
  "Retail/Grocery": colors.cfo,
  "Gym & Office": colors.cmo,
};

function Waterfall({ priceEur, channel }: { priceEur: number; channel: SalesChannel }) {
  const econ = computeUnitEconomics(priceEur, channel);
  const max = priceEur;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-foreground">{channel}</p>
        <p className="font-data text-sm font-semibold" style={{ color: CHANNEL_COLORS[channel] }}>
          {formatEuro(econ.unitContributionEur, 2)}
        </p>
      </div>
      <div className="mt-2 space-y-1.5">
        {econ.steps.map((step, i) => {
          const width = Math.max(2, (Math.abs(step.runningEur) / max) * 100);
          const isResult = step.kind === "result";
          return (
            <div key={`${step.label}-${i}`}>
              <div className="flex items-baseline justify-between gap-2 text-[11px]">
                <span className={isResult ? "font-medium text-foreground" : "text-foreground-soft"}>
                  {step.label}
                  {step.kind === "deduction" && (
                    <span className="text-foreground-faint"> −{formatEuro(Math.abs(step.amountEur), 2)}</span>
                  )}
                </span>
                <span className="font-data text-foreground-soft">
                  {formatEuro(step.runningEur, 2)}
                </span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-line">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: isResult
                      ? CHANNEL_COLORS[channel]
                      : `${CHANNEL_COLORS[channel]}55`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-foreground-faint">
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
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        Where every euro of the shelf price goes
      </p>
      <p className="mt-0.5 text-xs text-foreground-faint">
        At your current €{inputs.priceEur.toFixed(2)}, traced from what the
        shopper pays down to what LUMEN keeps — the cuts come from
        channel_economics.csv, COGS from cost_breakdown.csv.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
        {CHANNELS.map((channel) => (
          <Waterfall key={channel} priceEur={inputs.priceEur} channel={channel} />
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-foreground-soft">
        <strong className="text-foreground">The channel gap is {formatEuro(gap, 2)} per can.</strong>{" "}
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
