import type {
  Region,
  ScenarioInputs,
  ScenarioOutputs,
  SalesChannel,
} from "@/lib/types";
import {
  dataset as defaultDataset,
  SALES_CHANNELS,
  MARKETING_CHANNELS,
  type LumenDataset,
} from "@/lib/engine/dataset";

const PRICE_MIN = 1.29;
const PRICE_MAX = 3.29;
const TESTED_PRICE_MIN = 1.79;
const TESTED_PRICE_MAX = 2.59;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeMix(
  mix: Record<SalesChannel, number>
): Record<SalesChannel, number> {
  const sum = SALES_CHANNELS.reduce((s, c) => s + (mix[c] ?? 0), 0);
  if (sum <= 0) {
    return Object.fromEntries(
      SALES_CHANNELS.map((c) => [c, 1 / SALES_CHANNELS.length])
    ) as Record<SalesChannel, number>;
  }
  return Object.fromEntries(
    SALES_CHANNELS.map((c) => [c, (mix[c] ?? 0) / sum])
  ) as Record<SalesChannel, number>;
}

// Piecewise-linear interpolation of acceptance % and unit contribution
// across the 3 tested prices (€1.79 / €2.19 / €2.59) per channel, from
// data/price_test_results.csv. Extrapolates linearly outside that range
// using the nearest segment's slope, and flags it — the model has no
// direct evidence there.
export function interpolatePriceAcceptance(
  priceEur: number,
  channel: SalesChannel,
  dataset: LumenDataset = defaultDataset
): { acceptancePct: number; unitContributionEur: number; extrapolated: boolean } {
  const anchors = dataset.priceTestResults
    .filter((r) => r.channel === channel)
    .sort((a, b) => a.priceEur - b.priceEur);

  if (anchors.length === 0) {
    return { acceptancePct: 0, unitContributionEur: 0, extrapolated: true };
  }

  const extrapolated = priceEur < TESTED_PRICE_MIN || priceEur > TESTED_PRICE_MAX;

  const interp = (
    p: number,
    a: (typeof anchors)[number],
    b: (typeof anchors)[number],
    key: "estimatedAcceptancePctOfSurvey" | "unitContributionEur"
  ) => {
    const t = (p - a.priceEur) / (b.priceEur - a.priceEur);
    return a[key] + t * (b[key] - a[key]);
  };

  let segStart = anchors[0];
  let segEnd = anchors[anchors.length - 1];
  if (priceEur <= anchors[0].priceEur) {
    segStart = anchors[0];
    segEnd = anchors[1] ?? anchors[0];
  } else if (priceEur >= anchors[anchors.length - 1].priceEur) {
    segStart = anchors[anchors.length - 2] ?? anchors[anchors.length - 1];
    segEnd = anchors[anchors.length - 1];
  } else {
    for (let i = 0; i < anchors.length - 1; i++) {
      if (priceEur >= anchors[i].priceEur && priceEur <= anchors[i + 1].priceEur) {
        segStart = anchors[i];
        segEnd = anchors[i + 1];
        break;
      }
    }
  }

  const acceptancePct = segStart === segEnd
    ? segStart.estimatedAcceptancePctOfSurvey
    : interp(priceEur, segStart, segEnd, "estimatedAcceptancePctOfSurvey");
  const unitContributionEur = segStart === segEnd
    ? segStart.unitContributionEur
    : interp(priceEur, segStart, segEnd, "unitContributionEur");

  return {
    acceptancePct: Math.max(0, acceptancePct),
    unitContributionEur,
    extrapolated,
  };
}

// Germany has no real sales history — this is the estimation chain, each
// judgment call named and adjustable rather than a hidden constant:
//
//   addressable €  = sum(market_size_eur) for the relevant subcategories,
//                    2026 (Energy / focus, +Plant-based/adaptogenic if the
//                    includeAdaptogenicCategory toggle is on)
//   regional €     = addressable € × sum(population_share_of_market) for
//                    the selected targetRegions
//   SOM €          = regional € × marketShareCapturePct (EXPLICIT input,
//                    not a fact — the UI must label it as an assumption)
//   → units/year   = SOM € ÷ avg. competitor single-can price
//   → units/month  = (units/year ÷ 12) × seasonality index for launchMonth
//   → final units  = units/month × blended acceptance % at this price
//
// The low/high band flexes marketShareCapturePct by roughly ±50% around
// its current value — a confidence range, not a promise.
export function estimateAddressableDemand(
  inputs: ScenarioInputs,
  dataset: LumenDataset = defaultDataset
): { units: number; low: number; high: number } {
  const relevantSubcategories = ["Energy / focus"].concat(
    inputs.includeAdaptogenicCategory ? ["Plant-based / adaptogenic"] : []
  );

  const addressableEur = dataset.marketContext
    .filter(
      (r) =>
        r.dimensionType === "subcategory" &&
        r.metric === "market_size_eur" &&
        r.year === 2026 &&
        relevantSubcategories.includes(r.name)
    )
    .reduce((sum, r) => sum + r.value, 0);

  const regionShareSum = dataset.marketContext
    .filter(
      (r) =>
        r.dimensionType === "region" &&
        r.metric === "population_share_of_market" &&
        inputs.targetRegions.includes(r.name as Region)
    )
    .reduce((sum, r) => sum + r.value, 0);

  const regionalMarketEur = addressableEur * regionShareSum;

  const singleCanRows = dataset.competitorPricesByChannel.filter(
    (r) => r.format === "Single can (330ml)"
  );
  const avgCanPriceEur =
    singleCanRows.length > 0
      ? singleCanRows.reduce((s, r) => s + r.priceEur, 0) / singleCanRows.length
      : 1.5;

  const seasonalityRow = dataset.seasonalityAndWeather.find(
    (r) => r.month === inputs.launchMonth
  );
  const seasonalityIndex = seasonalityRow?.seasonalityIndex ?? 100;

  const mix = normalizeMix(inputs.salesChannelMix);
  const blendedAcceptancePct = SALES_CHANNELS.reduce(
    (sum, channel) =>
      sum +
      mix[channel] *
        interpolatePriceAcceptance(inputs.priceEur, channel, dataset)
          .acceptancePct,
    0
  );

  const unitsFor = (capturePct: number) => {
    const somEur = regionalMarketEur * capturePct;
    const unitsPerYear = somEur / avgCanPriceEur;
    const unitsPerMonthPreAcceptance =
      (unitsPerYear / 12) * (seasonalityIndex / 100);
    return unitsPerMonthPreAcceptance * (blendedAcceptancePct / 100);
  };

  return {
    units: Math.round(unitsFor(inputs.marketShareCapturePct)),
    low: Math.round(unitsFor(inputs.marketShareCapturePct * 0.5)),
    high: Math.round(unitsFor(inputs.marketShareCapturePct * 1.5)),
  };
}

function trailingAverage(
  rows: { month: string; value: number }[],
  months = 3
): number {
  const sorted = [...rows].sort((a, b) => (a.month < b.month ? 1 : -1));
  const recent = sorted.slice(0, months);
  if (recent.length === 0) return 0;
  return recent.reduce((s, r) => s + r.value, 0) / recent.length;
}

// Blended CAC and LTV: trailing-3-month average per marketing channel,
// weighted by that channel's historical average spend share (computed
// once in the build pipeline as data/processed/defaultMarketingChannelMix.json
// — not assumed to be an even split).
export function computeBlendedCacAndLtv(dataset: LumenDataset = defaultDataset) {
  let blendedCacEur = 0;
  let blendedLtvEur = 0;
  for (const channel of MARKETING_CHANNELS) {
    const weight = dataset.defaultMarketingChannelMix[channel] ?? 0;
    const rows = dataset.marketingFunnelMonthly.filter(
      (r) => r.channel === channel
    );
    const cac = trailingAverage(
      rows.map((r) => ({ month: r.month, value: r.cacEur }))
    );
    const ltv = trailingAverage(
      rows.map((r) => ({ month: r.month, value: r.ltvEstimateEur }))
    );
    blendedCacEur += weight * cac;
    blendedLtvEur += weight * ltv;
  }
  return { blendedCacEur, blendedLtvEur };
}

function averagePurchaseFrequency(dataset: LumenDataset = defaultDataset) {
  const totalRespondents = dataset.segmentProfiles.reduce(
    (s, p) => s + p.respondentCount,
    0
  );
  if (totalRespondents === 0) return 1;
  return (
    dataset.segmentProfiles.reduce(
      (s, p) => s + p.avgPurchaseFrequencyPerMonth * p.respondentCount,
      0
    ) / totalRespondents
  );
}

export function computeScenario(
  rawInputs: ScenarioInputs,
  dataset: LumenDataset = defaultDataset
): ScenarioOutputs {
  const inputs: ScenarioInputs = {
    ...rawInputs,
    priceEur: clamp(rawInputs.priceEur, PRICE_MIN, PRICE_MAX),
    salesChannelMix: normalizeMix(rawInputs.salesChannelMix),
  };

  const extrapolated =
    inputs.priceEur < TESTED_PRICE_MIN || inputs.priceEur > TESTED_PRICE_MAX;

  const byChannel = Object.fromEntries(
    SALES_CHANNELS.map((channel) => {
      const { acceptancePct, unitContributionEur } = interpolatePriceAcceptance(
        inputs.priceEur,
        channel,
        dataset
      );
      return [
        channel,
        {
          acceptancePct,
          unitContributionEur,
          unitsShare: inputs.salesChannelMix[channel],
        },
      ];
    })
  ) as ScenarioOutputs["byChannel"];

  const blendedAcceptancePct = SALES_CHANNELS.reduce(
    (sum, c) => sum + inputs.salesChannelMix[c] * byChannel[c].acceptancePct,
    0
  );
  const blendedUnitContributionEur = SALES_CHANNELS.reduce(
    (sum, c) =>
      sum + inputs.salesChannelMix[c] * byChannel[c].unitContributionEur,
    0
  );

  const demand = estimateAddressableDemand(inputs, dataset);
  const estimatedMonthlyUnits = demand.units;
  const estimatedMonthlyRevenueEur = estimatedMonthlyUnits * inputs.priceEur;
  const estimatedMonthlyContributionEur =
    estimatedMonthlyUnits * blendedUnitContributionEur;

  const { blendedCacEur, blendedLtvEur } = computeBlendedCacAndLtv(dataset);
  const avgPurchaseFrequency = averagePurchaseFrequency(dataset);
  const monthlyContributionPerCustomer =
    blendedUnitContributionEur * avgPurchaseFrequency;
  const cacPaybackMonths =
    monthlyContributionPerCustomer > 0
      ? blendedCacEur / monthlyContributionPerCustomer
      : Infinity;
  const ltvToCacRatio = blendedCacEur > 0 ? blendedLtvEur / blendedCacEur : 0;

  const contributionMarginPct =
    inputs.priceEur > 0
      ? (blendedUnitContributionEur / inputs.priceEur) * 100
      : 0;

  const seasonalityIndex =
    dataset.seasonalityAndWeather.find((r) => r.month === inputs.launchMonth)
      ?.seasonalityIndex ?? 100;

  return {
    blendedAcceptancePct,
    extrapolated,
    estimatedMonthlyUnits,
    demandConfidence: { lowUnits: demand.low, highUnits: demand.high },
    estimatedMonthlyRevenueEur,
    blendedUnitContributionEur,
    estimatedMonthlyContributionEur,
    blendedCacEur,
    cacPaybackMonths,
    ltvToCacRatio,
    contributionMarginPct,
    seasonalityIndex,
    byChannel,
  };
}
