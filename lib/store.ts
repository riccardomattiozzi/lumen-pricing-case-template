import { create } from "zustand";
import {
  DEFAULT_SCENARIO_INPUTS,
  type PresetName,
  type Region,
  type SalesChannel,
  type ScenarioInputs,
} from "@/lib/types";
import { computeScenario } from "@/lib/engine/pricingEngine";

// The three illustrative points from the case brief's trade-off — recalibrated
// against the real engine, not assumed. An earlier version put CFO at the
// low tested price (€1.79) with a Retail-heavy mix on the intuition that
// "cheap + mass channel = fast payback." Running the actual numbers showed
// the opposite: Retail/Grocery has the WORST per-unit contribution of the
// three channels at every tested price (retailer margin + distributor cut),
// and total monthly profit peaks near €2.19, not at the price extremes —
// €1.79 undershoots the peak on volume-thin margin, €2.59 overshoots it by
// sacrificing too much acceptance. So the real CFO-vs-CMO tension here
// isn't "cheap vs. premium" — both sides prefer DTC Online/Gym & Office
// over Retail/Grocery — it's specifically about price: CFO wants the
// profit-maximizing €2.19, CMO wants to push toward the most premium
// tested price (€2.59) for positioning even though that costs total
// profit. Compromise keeps a meaningful Retail/Grocery share for the
// market reach neither pure-margin scenario provides. Exported so
// components/layout/ScenarioPanel.tsx can display real computed numbers
// next to each preset, not just apply them.
export const PRESET_INPUTS: Record<PresetName, ScenarioInputs> = {
  CFO: {
    ...DEFAULT_SCENARIO_INPUTS,
    priceEur: 2.19,
    salesChannelMix: {
      "DTC Online": 0.45,
      "Retail/Grocery": 0.1,
      "Gym & Office": 0.45,
    },
  },
  CMO: {
    ...DEFAULT_SCENARIO_INPUTS,
    priceEur: 2.59,
    salesChannelMix: {
      "DTC Online": 0.5,
      "Retail/Grocery": 0.05,
      "Gym & Office": 0.45,
    },
  },
  Compromise: {
    ...DEFAULT_SCENARIO_INPUTS,
    priceEur: 2.39,
    salesChannelMix: {
      "DTC Online": 0.35,
      "Retail/Grocery": 0.25,
      "Gym & Office": 0.4,
    },
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
  // "Default" IS the Compromise preset — keeps the active-preset label
  // honest on first load instead of claiming "Compromise" while showing
  // different numbers than clicking that button would actually set.
  inputs: PRESET_INPUTS.Compromise,
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
    set({ inputs: PRESET_INPUTS.Compromise, activePreset: "Compromise" }),
}));

export function useScenario() {
  const inputs = useScenarioStore((s) => s.inputs);
  const activePreset = useScenarioStore((s) => s.activePreset);
  const outputs = computeScenario(inputs);
  return { inputs, outputs, activePreset, store: useScenarioStore };
}
