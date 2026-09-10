"use client";

import { useScenarioStore } from "@/lib/store";
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
    <div>
      <p className="text-sm font-medium text-foreground">Target regions</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Target regions">
        {REGIONS.map((region) => {
          const selected = targetRegions.includes(region);
          return (
            <button
              key={region}
              type="button"
              onClick={() => toggle(region)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-foreground-soft hover:border-foreground-faint"
              }`}
            >
              {region}
            </button>
          );
        })}
      </div>
      {targetRegions.length === 0 && (
        <p className="mt-1.5 text-xs text-cmo">
          No region selected — estimated demand will be zero.
        </p>
      )}
    </div>
  );
}
