"use client";

import { useScenario } from "@/lib/store";
import { formatEuro, formatUnits, formatPct } from "./format";

function KpiTile({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-xs text-foreground-faint">{label}</p>
      <p className="font-data mt-1 text-xl font-semibold text-foreground">
        {value}
      </p>
      {sub && (
        <p className={`mt-1 text-xs ${warn ? "font-medium text-cmo" : "text-foreground-faint"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function KpiRow() {
  const { outputs } = useScenario();

  return (
    <div>
      {outputs.extrapolated && (
        <p className="mb-3 rounded-md bg-cmo-soft px-3 py-2 text-xs text-foreground">
          Current price is outside the €1.79–€2.59 range LUMEN actually
          tested — the numbers below are extrapolated, not measured.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiTile
          label="Est. monthly units"
          value={formatUnits(outputs.estimatedMonthlyUnits)}
          sub={`range ${formatUnits(outputs.demandConfidence.lowUnits)}–${formatUnits(
            outputs.demandConfidence.highUnits
          )}`}
        />
        <KpiTile
          label="Est. monthly revenue"
          value={formatEuro(outputs.estimatedMonthlyRevenueEur)}
        />
        <KpiTile
          label="Unit contribution"
          value={formatEuro(outputs.blendedUnitContributionEur, 2)}
          sub={`${formatPct(outputs.contributionMarginPct)} margin`}
        />
        <KpiTile
          label="CAC payback"
          value={`${outputs.cacPaybackMonths.toFixed(1)} mo`}
        />
        <KpiTile
          label="LTV:CAC"
          value={outputs.ltvToCacRatio.toFixed(2)}
          sub="target ≈3:1"
          warn={outputs.ltvToCacRatio < 3}
        />
      </div>
    </div>
  );
}
