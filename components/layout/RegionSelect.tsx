"use client";

import { useScenarioStore } from "@/lib/store";
import { CheckIcon, PlusIcon, WarningIcon } from "@/components/ui/icons";
import type { Region } from "@/lib/types";

const REGIONS: Region[] = [
  "Berlin",
  "Hamburg",
  "Munich",
  "Cologne",
  "Frankfurt",
  "Other Germany",
];

export function RegionSelect() {
  const targetRegions = useScenarioStore((s) => s.inputs.targetRegions);
  const setTargetRegions = useScenarioStore((s) => s.setTargetRegions);

  function toggle(region: Region) {
    const selected = targetRegions.includes(region);
    setTargetRegions(
      selected
        ? targetRegions.filter((r) => r !== region)
        : [...targetRegions, region]
    );
  }

  return (
    <section className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="regions-heading" className="eyebrow">
          Target regions
        </h2>
        <span className="text-2xs tabular-nums text-foreground-faint">
          {targetRegions.length} of {REGIONS.length}
        </span>
      </div>
      <div
        className="mt-3 flex flex-wrap gap-1.5"
        role="group"
        aria-labelledby="regions-heading"
      >
        {REGIONS.map((region) => {
          const selected = targetRegions.includes(region);
          // Same width in both states (a + becomes a ✓), so toggling a
          // chip never reflows the ones around it under the pointer.
          return (
            <button
              key={region}
              type="button"
              onClick={() => toggle(region)}
              aria-pressed={selected}
              className={`pressable inline-flex items-center gap-1 rounded-full py-1.5 pl-2 pr-3 text-footnote font-medium ${
                selected
                  ? "bg-accent-soft text-accent-ink"
                  : "bg-fill text-foreground-soft hover:bg-fill-strong"
              }`}
            >
              {selected ? <CheckIcon className="h-3 w-3" /> : <PlusIcon className="h-3 w-3" />}
              {region}
            </button>
          );
        })}
      </div>
      {targetRegions.length === 0 && (
        <p className="mt-2 flex gap-1.5 text-xs text-warning-ink">
          <WarningIcon className="mt-px h-3.5 w-3.5 flex-none text-warning" />
          No region selected — estimated demand will be zero.
        </p>
      )}
    </section>
  );
}
