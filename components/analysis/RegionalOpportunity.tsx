"use client";

import { useScenario, useScenarioStore } from "@/lib/store";
import { dataset, REGIONS } from "@/lib/engine/dataset";
import { formatEuro } from "@/components/charts/format";
import { CheckIcon } from "@/components/ui/icons";
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
    <div className="card p-5">
      <h3 className="card-title">Where the German category value sits</h3>
      <p className="card-subtitle">
        2026 category value split by region, with each region&apos;s own growth
        rate. Click a row to add or remove it from the launch footprint.
      </p>

      {/* Selectable rows with a selection circle, as in a list in edit mode. */}
      <div className="-mx-2 mt-4 space-y-0.5">
        {rows.map((row) => (
          <button
            key={row.region}
            type="button"
            onClick={() => toggle(row.region)}
            aria-pressed={row.selected}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2 active:bg-fill"
          >
            <span
              aria-hidden
              className={`flex h-5 w-5 flex-none items-center justify-center rounded-full transition-colors ${
                row.selected
                  ? "bg-accent text-white"
                  : "border-[1.5px] border-foreground-faint/50"
              }`}
            >
              {row.selected && <CheckIcon className="h-3 w-3" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2 text-xs">
                <span
                  className={`text-sm ${
                    row.selected ? "font-medium text-foreground" : "text-foreground-soft"
                  }`}
                >
                  {row.region}
                </span>
                <span className="tabular-nums text-foreground-faint">
                  {formatEuro(row.valueEur)} · {(row.cagr * 100).toFixed(0)}% CAGR
                </span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-fill">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(row.valueEur / maxValue) * 100}%`,
                    backgroundColor: row.selected ? "var(--accent)" : "var(--chart-neutral)",
                  }}
                />
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="callout mt-4">
        Selected footprint covers{" "}
        <strong>{formatEuro(selectedValue)}</strong> of
        2026 category value ({((selectedValue / (categoryEur || 1)) * 100).toFixed(0)}%
        of the country). Berlin and Munich carry the faster 9% growth rate; the
        &quot;Other Germany&quot; block is 40% of the value but the hardest to
        service from a standing start.
      </p>
    </div>
  );
}
