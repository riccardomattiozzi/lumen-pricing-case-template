// Shared contract between all four modules.
// Categories below are taken verbatim from the CSVs in data/ — nothing invented.
// Changing this file after the first PR merges breaks three other branches —
// flag it to the team before editing.

export type SalesChannel = "DTC Online" | "Retail/Grocery" | "Gym & Office";

export type MarketingChannel =
  | "Paid Social"
  | "Influencer / Content"
  | "Retail Sampling"
  | "Referral / Subscription";

export type Segment =
  | "Students & Budget-Conscious"
  | "Fitness & Gym-Goers"
  | "Urban Wellness Professionals"
  | "On-the-go Commuters";

export type Competitor = "PulsUp" | "Mate Libre" | "VoltFit" | "Root & Rise";

export type Region =
  | "Berlin"
  | "Hamburg"
  | "Munich"
  | "Cologne"
  | "Frankfurt"
  | "Other Germany";

// ---- Inputs the dashboard controls (Member 2 writes these) ----
export interface ScenarioInputs {
  priceEur: number; // slider, clamped to [1.29, 3.29]
  salesChannelMix: Record<SalesChannel, number>; // shares, must sum to 1
  monthlyMarketingBudgetEur: number; // single aggregate slider
  targetRegions: Region[]; // multi-select, default: all 6
  launchMonth: number; // 1-12, feeds seasonality
  marketShareCapturePct: number; // EXPLICIT assumption, adjustable in the UI
  includeAdaptogenicCategory: boolean; // toggle: Energy-only vs +Plant-based
}

// ---- Outputs the engine computes (Members 3 & 4 read these) ----
export interface ScenarioOutputs {
  blendedAcceptancePct: number;
  extrapolated: boolean; // true if priceEur outside [1.79, 2.59]
  estimatedMonthlyUnits: number;
  demandConfidence: { lowUnits: number; highUnits: number }; // capture-rate sensitivity band
  estimatedMonthlyRevenueEur: number;
  blendedUnitContributionEur: number;
  estimatedMonthlyContributionEur: number;
  blendedCacEur: number;
  cacPaybackMonths: number;
  ltvToCacRatio: number;
  contributionMarginPct: number;
  seasonalityIndex: number; // 100 = year-average month
  byChannel: Record<
    SalesChannel,
    { acceptancePct: number; unitContributionEur: number; unitsShare: number }
  >;
}

export type PresetName = "CMO" | "CFO" | "Compromise";

export interface Scenario {
  id: string;
  label: PresetName | "Custom";
  inputs: ScenarioInputs;
  outputs: ScenarioOutputs;
}

// ---- Trade-off layer (Member 4 writes the values, everyone can read the shape) ----
export interface TradeoffResult {
  cfoScore: number; // 0-100
  cmoScore: number; // 0-100
  compromiseScore: number; // harmonic mean of the two
  tradeoffGapPts: number; // |cfoScore - cmoScore|
  recommendation: {
    priceEur: number;
    primaryChannel: SalesChannel;
    launchMonth: number;
    whatWereNotOptimizingFor: string; // answers the brief's closing question
    rationale: string; // generated from real ScenarioOutputs numbers
  };
}

export const DEFAULT_SCENARIO_INPUTS: ScenarioInputs = {
  priceEur: 2.19,
  salesChannelMix: {
    "DTC Online": 0.34,
    "Retail/Grocery": 0.34,
    "Gym & Office": 0.32,
  },
  monthlyMarketingBudgetEur: 15000,
  targetRegions: [
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
    "Other Germany",
  ],
  launchMonth: 5,
  marketShareCapturePct: 0.01,
  includeAdaptogenicCategory: false,
};
