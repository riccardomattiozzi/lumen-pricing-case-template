"use client";

import { useScenarioStore, PRESET_INPUTS } from "@/lib/store";
import { computeScenario } from "@/lib/engine/pricingEngine";
import { PRESET_COLORS, PRESET_SOFT_COLORS } from "@/lib/theme";
import type { PresetName } from "@/lib/types";

const PRESETS: PresetName[] = ["CFO", "Compromise", "CMO"];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function ScenarioPanel() {
  const activePreset = useScenarioStore((s) => s.activePreset);
  const applyPreset = useScenarioStore((s) => s.applyPreset);
  const resetToDefault = useScenarioStore((s) => s.resetToDefault);
  const marketShareCapturePct = useScenarioStore(
    (s) => s.inputs.marketShareCapturePct
  );
  const setMarketShareCapturePct = useScenarioStore(
    (s) => s.setMarketShareCapturePct
  );
  const monthlyMarketingBudgetEur = useScenarioStore(
    (s) => s.inputs.monthlyMarketingBudgetEur
  );
  const setMonthlyMarketingBudgetEur = useScenarioStore(
    (s) => s.setMonthlyMarketingBudgetEur
  );
  const launchMonth = useScenarioStore((s) => s.inputs.launchMonth);
  const setLaunchMonth = useScenarioStore((s) => s.setLaunchMonth);
  const includeAdaptogenicCategory = useScenarioStore(
    (s) => s.inputs.includeAdaptogenicCategory
  );
  const setIncludeAdaptogenicCategory = useScenarioStore(
    (s) => s.setIncludeAdaptogenicCategory
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-foreground">Scenario preset</p>
          <button
            type="button"
            onClick={resetToDefault}
            className="text-xs text-foreground-faint underline underline-offset-2 hover:text-foreground-soft"
          >
            Reset
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => {
            const outputs = computeScenario(PRESET_INPUTS[preset]);
            const active = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-label={`${preset} preset: €${PRESET_INPUTS[preset].priceEur.toFixed(2)}, ${outputs.blendedAcceptancePct.toFixed(0)} percent acceptance`}
                aria-pressed={active}
                style={
                  active
                    ? {
                        borderColor: PRESET_COLORS[preset],
                        backgroundColor: PRESET_SOFT_COLORS[preset],
                        boxShadow: `0 2px 10px -4px ${PRESET_COLORS[preset]}66`,
                      }
                    : undefined
                }
                className={`rounded-lg border px-3 py-2 text-left transition-all ${
                  active ? "" : "border-line hover:border-foreground-faint"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PRESET_COLORS[preset] }}
                  />
                  <span className="text-sm font-semibold">{preset}</span>
                </div>
                <p className="font-data mt-1 text-[11px] text-foreground-faint">
                  {`€${PRESET_INPUTS[preset].priceEur.toFixed(2)} · ${outputs.blendedAcceptancePct.toFixed(0)}% acc.`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="capture-slider" className="text-sm font-medium text-foreground">
            Year-1 market share assumption
          </label>
          <span className="font-data text-sm">
            {(marketShareCapturePct * 100).toFixed(2)}%
          </span>
        </div>
        <input
          id="capture-slider"
          type="range"
          min={0.0002}
          max={0.005}
          step={0.0001}
          value={marketShareCapturePct}
          onChange={(e) => setMarketShareCapturePct(Number(e.target.value))}
          aria-valuetext={`${(marketShareCapturePct * 100).toFixed(2)} percent`}
          className="mt-2"
        />
        <p className="mt-1.5 text-xs text-foreground-faint">
          This is an adjustable assumption, not a measured fact — the % of
          the addressable German category LUMEN could realistically win in
          Year 1. Every number below depends on it; stress-test it before
          trusting a recommendation built on the default.
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="budget-slider" className="text-sm font-medium text-foreground">
            Monthly marketing budget
          </label>
          <span className="font-data text-sm">
            {`€${monthlyMarketingBudgetEur.toLocaleString("de-DE")}`}
          </span>
        </div>
        <input
          id="budget-slider"
          type="range"
          min={2000}
          max={60000}
          step={1000}
          value={monthlyMarketingBudgetEur}
          onChange={(e) => setMonthlyMarketingBudgetEur(Number(e.target.value))}
          aria-valuetext={`€${monthlyMarketingBudgetEur.toLocaleString("de-DE")}`}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="month-select" className="text-sm font-medium text-foreground">
          Launch month
        </label>
        <select
          id="month-select"
          value={launchMonth}
          onChange={(e) => setLaunchMonth(Number(e.target.value))}
          className="mt-2 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5 text-sm"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground-soft">
        <input
          type="checkbox"
          checked={includeAdaptogenicCategory}
          onChange={(e) => setIncludeAdaptogenicCategory(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-accent"
        />
        Include Plant-based / adaptogenic category in market sizing
      </label>
    </div>
  );
}
