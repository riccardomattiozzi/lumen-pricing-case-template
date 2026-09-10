import type { ScenarioInputs, ScenarioOutputs, SalesChannel } from "@/lib/types";

// STUB — PR #1 scope only. Returns placeholder numbers of the correct shape
// so Members 2-4 can build against the real contract immediately.
// PR #2 (same branch, feature/core-engine) replaces this with the real
// CSV-driven pipeline: piecewise-linear price/acceptance interpolation,
// the Germany demand estimate, blended CAC/LTV, anomaly handling, and a
// Vitest suite. Nothing below should be treated as a real number yet.

const SALES_CHANNELS: SalesChannel[] = [
  "DTC Online",
  "Retail/Grocery",
  "Gym & Office",
];

export function computeScenario(inputs: ScenarioInputs): ScenarioOutputs {
  const priceEur = inputs.priceEur;
  const extrapolated = priceEur < 1.79 || priceEur > 2.59;

  // Placeholder acceptance curve: linearly decreasing with price. Real
  // version interpolates data/price_test_results.csv anchor points.
  const blendedAcceptancePct = Math.max(
    5,
    Math.min(70, 75 - (priceEur - 1.79) * 40)
  );

  const byChannel = Object.fromEntries(
    SALES_CHANNELS.map((channel) => [
      channel,
      {
        acceptancePct: blendedAcceptancePct,
        unitContributionEur: priceEur * 0.45,
        unitsShare: inputs.salesChannelMix[channel] ?? 0,
      },
    ])
  ) as ScenarioOutputs["byChannel"];

  const estimatedMonthlyUnits = Math.round(
    50000 * (blendedAcceptancePct / 100) * inputs.marketShareCapturePct * 100
  );

  const blendedUnitContributionEur = priceEur * 0.45;
  const estimatedMonthlyRevenueEur = estimatedMonthlyUnits * priceEur;
  const estimatedMonthlyContributionEur =
    estimatedMonthlyUnits * blendedUnitContributionEur;

  const blendedCacEur = 44; // placeholder — case brief headline number
  const cacPaybackMonths =
    blendedUnitContributionEur > 0
      ? blendedCacEur / blendedUnitContributionEur
      : Infinity;
  const ltvToCacRatio = 3; // placeholder — case brief target

  return {
    blendedAcceptancePct,
    extrapolated,
    estimatedMonthlyUnits,
    demandConfidence: {
      lowUnits: Math.round(estimatedMonthlyUnits * 0.5),
      highUnits: Math.round(estimatedMonthlyUnits * 1.5),
    },
    estimatedMonthlyRevenueEur,
    blendedUnitContributionEur,
    estimatedMonthlyContributionEur,
    blendedCacEur,
    cacPaybackMonths,
    ltvToCacRatio,
    contributionMarginPct:
      priceEur > 0 ? (blendedUnitContributionEur / priceEur) * 100 : 0,
    seasonalityIndex: 100,
    byChannel,
  };
}
