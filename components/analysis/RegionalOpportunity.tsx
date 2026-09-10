"use client";

import { useScenario, useScenarioStore } from "@/lib/store";
import { dataset, REGIONS } from "@/lib/engine/dataset";
import { formatEuro } from "@/components/charts/format";
import type { Region } from "@/lib/types";

export function RegionalOpportunity() {
  const { inputs } = useScenario();
  const setTargetRegions = useScenarioStore((s) => s.setTargetRegions);

  const categoryEur = dataset.marketContext
    .filter(
      (r) =>
        r.dimensionType === "subcategory" &&
        r.metric === "market_size_eur" &&
        r.year === 2026 &&
        (r.name === "Energy / focus" ||
          (inputs.includeAdaptogenicCategory && r.name === "Plant-based / adaptogenic"))
    )
    .reduce((s, r) => s + r.value, 0);

  const rows = REGIONS.map((region) => {
    const share =
      dataset.marketContext.find(
        (r) =>
          r.dimensionType === "region" &&
          r.name === region &&
          r.metric === "population_share_of_market"
      )?.value ?? 0;
    const cagr =
      dataset.marketContext.find(
        (r) =>
          r.dimensionType === "region" &&
          r.name === region &&
          r.metric === "regional_cagr"
      )?.value ?? 0;
    return {
      region,
      share,
      cagr,
      valueEur: categoryEur * share,
      selected: inputs.targetRegions.includes(region),
    };
  }).sort((a, b) => b.valueEur - a.valueEur);

  const maxValue = Math.max(...rows.map((r) => r.valueEur), 1);
  const selectedValue = rows
    .filter((r) => r.selected)
    .reduce((s, r) => s + r.valueEur, 0);

  function toggle(region: Region) {
    setTargetRegions(
      inputs.targetRegions.includes(region)
        ? inputs.targetRegions.filter((r) => r !== region)
        : [...inputs.targetRegions, region]
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface card-shadow p-4">
      <p className="text-sm font-medium text-foreground">
        Where the German category value sits
      </p>
      <p className="mt-0.5 text-xs text-foreground-faint">
        2026 category value split by region, with each region&apos;s own growth
        rate. Click a row to add or remove it from the launch footprint.
      </p>

      <div className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <button
            key={row.region}
            type="button"
            onClick={() => toggle(row.region)}
            aria-pressed={row.selected}
            className="w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
          >
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span
                className={row.selected ? "font-medium text-foreground" : "text-foreground-faint"}
              >
                {row.selected ? "● " : "○ "}
                {row.region}
              </span>
              <span className="font-data text-foreground-soft">
                {formatEuro(row.valueEur)} · {(row.cagr * 100).toFixed(0)}% CAGR
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-line">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${(row.valueEur / maxValue) * 100}%`,
                  backgroundColor: row.selected ? "var(--accent)" : "var(--line-soft)",
                }}
              />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-foreground-soft">
        Selected footprint covers{" "}
        <strong className="text-foreground">{formatEuro(selectedValue)}</strong> of
        2026 category value ({((selectedValue / (categoryEur || 1)) * 100).toFixed(0)}%
        of the country). Berlin and Munich carry the faster 9% growth rate; the
        &quot;Other Germany&quot; block is 40% of the value but the hardest to
        service from a standing start.
      </p>
    </div>
  );
}
