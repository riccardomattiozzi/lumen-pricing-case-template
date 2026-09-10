import { create } from "zustand";
import {
  DEFAULT_SCENARIO_INPUTS,
  type PresetName,
  type Region,
  type SalesChannel,
  type ScenarioInputs,
} from "@/lib/types";
import { computeScenario } from "@/lib/engine/pricingEngine";

// The three illustrative points from the case brief's own trade-off:
// CFO favors the acceptance-heavy low end with a Retail-weighted mix (best
// margin/acceptance balance per price_test_results.csv); CMO favors the
// premium end with brand-building channels (DTC + Gym & Office); Compromise
// sits at the middle tested price with a blended mix. Exported so
// components/layout/ScenarioPanel.tsx can display real computed numbers
// next to each preset, not just apply them.
export const PRESET_INPUTS: Record<PresetName, ScenarioInputs> = {
  CFO: {
    ...DEFAULT_SCENARIO_INPUTS,
    priceEur: 1.79,
    salesChannelMix: {
      "DTC Online": 0.2,
      "Retail/Grocery": 0.6,
      "Gym & Office": 0.2,
    },
  },
  CMO: {
    ...DEFAULT_SCENARIO_INPUTS,
    priceEur: 2.59,
    salesChannelMix: {
      "DTC Online": 0.45,
      "Retail/Grocery": 0.15,
      "Gym & Office": 0.4,
    },
  },
  Compromise: {
    ...DEFAULT_SCENARIO_INPUTS,
    priceEur: 2.19,
  },
};

interface ScenarioStore {
  inputs: ScenarioInputs;
  activePreset: PresetName | "Custom";
  setPriceEur: (priceEur: number) => void;
  setSalesChannelMix: (mix: Record<SalesChannel, number>) => void;
  setMonthlyMarketingBudgetEur: (value: number) => void;
  setTargetRegions: (regions: Region[]) => void;
  setLaunchMonth: (month: number) => void;
  setMarketShareCapturePct: (pct: number) => void;
  setIncludeAdaptogenicCategory: (value: boolean) => void;
  applyPreset: (preset: PresetName) => void;
  resetToDefault: () => void;
}

export const useScenarioStore = create<ScenarioStore>((set) => ({
  inputs: DEFAULT_SCENARIO_INPUTS,
  activePreset: "Compromise",
  setPriceEur: (priceEur) =>
    set((s) => ({ inputs: { ...s.inputs, priceEur }, activePreset: "Custom" })),
  setSalesChannelMix: (salesChannelMix) =>
    set((s) => ({
      inputs: { ...s.inputs, salesChannelMix },
      activePreset: "Custom",
    })),
  setMonthlyMarketingBudgetEur: (monthlyMarketingBudgetEur) =>
    set((s) => ({
      inputs: { ...s.inputs, monthlyMarketingBudgetEur },
      activePreset: "Custom",
    })),
  setTargetRegions: (targetRegions) =>
    set((s) => ({
      inputs: { ...s.inputs, targetRegions },
      activePreset: "Custom",
    })),
  setLaunchMonth: (launchMonth) =>
    set((s) => ({ inputs: { ...s.inputs, launchMonth }, activePreset: "Custom" })),
  setMarketShareCapturePct: (marketShareCapturePct) =>
    set((s) => ({
      inputs: { ...s.inputs, marketShareCapturePct },
      activePreset: "Custom",
    })),
  setIncludeAdaptogenicCategory: (includeAdaptogenicCategory) =>
    set((s) => ({
      inputs: { ...s.inputs, includeAdaptogenicCategory },
      activePreset: "Custom",
    })),
  applyPreset: (preset) =>
    set({ inputs: PRESET_INPUTS[preset], activePreset: preset }),
  resetToDefault: () =>
    set({ inputs: DEFAULT_SCENARIO_INPUTS, activePreset: "Compromise" }),
}));

export function useScenario() {
  const inputs = useScenarioStore((s) => s.inputs);
  const activePreset = useScenarioStore((s) => s.activePreset);
  const outputs = computeScenario(inputs);
  return { inputs, outputs, activePreset, store: useScenarioStore };
}
