"use client";

import { useScenario } from "@/lib/store";
import { WarningIcon } from "@/components/ui/icons";
import { formatEuro, formatUnits, formatPct } from "./format";

function KpiTile({
  label,
  value,
  sub,
  warn,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-surface px-4 py-3.5 @3xl:px-5 @3xl:py-4 ${className}`}>
      <p className="text-footnote text-foreground-faint">{label}</p>
      {/* Tabular figures: these values change while a slider is dragged,
          and equal-width digits keep them from jittering sideways. */}
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
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

// Five figures in one grouped surface, split by hairlines (the gaps show the
// separator color underneath). The spans keep every row full at each width:
// 2 + 2 + 1 on a phone, 3 + 2 at medium widths, 5 across on wide screens.
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
      <div className="card grid grid-cols-2 gap-px overflow-hidden bg-line-soft @lg:grid-cols-6 @3xl:grid-cols-5">
        <KpiTile
          className="@lg:col-span-2 @3xl:col-span-1"
          label="Est. monthly units"
          value={formatUnits(outputs.estimatedMonthlyUnits)}
          sub={`range ${formatUnits(outputs.demandConfidence.lowUnits)}–${formatUnits(
            outputs.demandConfidence.highUnits
          )}`}
        />
        <KpiTile
          className="@lg:col-span-2 @3xl:col-span-1"
          label="Est. monthly revenue"
          value={formatEuro(outputs.estimatedMonthlyRevenueEur)}
        />
        <KpiTile
          className="@lg:col-span-2 @3xl:col-span-1"
          label="Unit contribution"
          value={formatEuro(outputs.blendedUnitContributionEur, 2)}
          sub={`${formatPct(outputs.contributionMarginPct)} margin`}
        />
        <KpiTile
          className="@lg:col-span-3 @3xl:col-span-1"
          label="CAC payback"
          value={`${outputs.cacPaybackMonths.toFixed(1)} mo`}
        />
        <KpiTile
          className="col-span-2 @lg:col-span-3 @3xl:col-span-1"
          label="LTV:CAC"
          value={outputs.ltvToCacRatio.toFixed(2)}
          sub="target ≈3:1"
          warn={outputs.ltvToCacRatio < 3}
        />
      </div>
    </div>
  );
}
