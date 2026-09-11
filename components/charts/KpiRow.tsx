"use client";

import { useScenario } from "@/lib/store";
import { WarningIcon } from "@/components/ui/icons";
import { InfoTip } from "@/components/ui/InfoTip";
import { formatEuro, formatUnits, formatPct } from "./format";

function KpiTile({
  label,
  info,
  value,
  unit,
  sub,
  warn,
  size = "primary",
  className = "",
}: {
  label: string;
  info?: React.ReactNode;
  value: string;
  unit?: string;
  sub?: string;
  warn?: boolean;
  size?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <div className={`bg-surface px-4 py-3.5 @3xl:px-5 @3xl:py-4 ${className}`}>
      <p className="flex items-center gap-1 text-footnote text-foreground-faint">
        {label}
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </p>
      {/* Tabular figures: these values change while a slider is dragged,
          and equal-width digits keep them from jittering sideways. */}
      <p
        className={`mt-1 tabular-nums text-foreground ${
          size === "primary" ? "text-2xl font-semibold" : "text-lg font-semibold"
        }`}
      >
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-foreground-faint">{unit}</span>}
      </p>
      {sub && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs tabular-nums ${
            warn ? "font-medium text-warning-ink" : "text-foreground-faint"
          }`}
        >
          {warn && <WarningIcon className="h-3 w-3 flex-none text-warning" />}
          {sub}
        </p>
      )}
    </div>
  );
}

// Two tiers, both real model outputs — never inputs. Primary is what a
// viewer several meters away needs to read at a glance (size, revenue,
// margin); secondary is the customer-economics detail a CFO or CMO would
// ask about next. Nothing here is automatically colored green or red —
// warn only marks a figure against an explicit target (LTV:CAC ≈3:1).
export function KpiRow() {
  const { outputs } = useScenario();

  return (
    <div className="space-y-3">
      {outputs.extrapolated && (
        <p className="callout callout-warning flex gap-2">
          <WarningIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-warning" />
          <span>
            Current price is outside the €1.79–€2.59 range LUMEN actually
            tested — the numbers below are extrapolated, not measured.
          </span>
        </p>
      )}

      <div>
        <p className="eyebrow px-0.5">Primary</p>
        <div className="card mt-1.5 grid grid-cols-1 gap-px overflow-hidden bg-line-soft @lg:grid-cols-3">
          <KpiTile
            label="Est. monthly revenue"
            value={formatEuro(outputs.estimatedMonthlyRevenueEur)}
          />
          <KpiTile
            label="Est. monthly units"
            value={formatUnits(outputs.estimatedMonthlyUnits)}
            sub={`range ${formatUnits(outputs.demandConfidence.lowUnits)}–${formatUnits(
              outputs.demandConfidence.highUnits
            )}`}
          />
          <KpiTile
            label="Contribution margin"
            info={
              <>
                The share of revenue left after variable costs (COGS,
                retailer/distributor cuts) — before marketing and fixed
                costs. Higher generally means more room to fund growth.
              </>
            }
            value={formatPct(outputs.contributionMarginPct)}
            sub={`≈ ${formatEuro(outputs.estimatedMonthlyContributionEur)} total contribution/mo`}
          />
        </div>
      </div>

      <div>
        <p className="eyebrow px-0.5">Customer economics</p>
        <div className="card mt-1.5 grid grid-cols-1 gap-px overflow-hidden bg-line-soft @lg:grid-cols-3">
          <KpiTile
            size="secondary"
            label="Contribution / unit"
            info={
              <>
                What one can earns after variable costs, blended across the
                selected channel mix. Higher is better — it is what funds
                marketing and profit.
              </>
            }
            value={formatEuro(outputs.blendedUnitContributionEur, 2)}
          />
          <KpiTile
            size="secondary"
            label="CAC payback"
            info={
              <>
                Months of contribution profit needed to recover the cost of
                acquiring one customer (CAC ≈{" "}
                {formatEuro(outputs.blendedCacEur)}). Shorter is better —
                it&apos;s cash back in the business sooner.
              </>
            }
            value={outputs.cacPaybackMonths.toFixed(1)}
            unit="mo"
          />
          <KpiTile
            size="secondary"
            label="LTV:CAC"
            info={
              <>
                Lifetime value of a customer divided by the cost to acquire
                them. A widely used rule of thumb targets roughly 3:1 —
                well below that means acquisition may not be paying for
                itself.
              </>
            }
            value={outputs.ltvToCacRatio.toFixed(2)}
            sub="target ≈3:1"
            warn={outputs.ltvToCacRatio < 3}
          />
        </div>
      </div>
    </div>
  );
}
