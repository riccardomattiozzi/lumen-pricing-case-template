import {
  DEFAULT_SCENARIO_INPUTS,
  type ScenarioInputs,
  type ScenarioOutputs,
  type SalesChannel,
  type TradeoffResult,
} from "@/lib/types";
import {
  dataset as defaultDataset,
  type LumenDataset,
} from "@/lib/engine/dataset";
import { computeScenario } from "@/lib/engine/pricingEngine";

// ---------------------------------------------------------------------------
// CFO score — total profit efficiency, payback speed, LTV:CAC vs. the
// brief's ~3:1 target. Weights are named constants, not magic numbers.
//
// Earlier version of this score used contribution-margin % directly, which
// turned out to reward price increases with no ceiling — the model showed
// that per-unit margin and per-customer payback both keep improving with
// price even past the point where total monthly profit collapses (a real
// finding: estimated total contribution actually PEAKS near €2.19 at the
// default mix — €1.79 and €2.59 both leave money on the table, ~€49k and
// ~€42k/month respectively, vs. ~€61k at the peak). A margin-ratio score
// alone can't see that a price is "too high," because ratios don't fall
// even as volume evaporates. Total profit relative to what's achievable
// fixes that: it rewards picking a genuinely profit-smart price, not
// just any high one.
// ---------------------------------------------------------------------------
const CFO_WEIGHTS = { profitEfficiency: 0.45, payback: 0.3, ltv: 0.25 };

// Observed range of blended CAC payback across the tested price band at a
// realistic channel mix (~5.9mo @ €2.59 to ~11.5mo @ €1.79); widened
// slightly so a mix at the edges doesn't clip to exactly 0 or 100.
const PAYBACK_MONTHS_BEST = 5;
const PAYBACK_MONTHS_WORST = 14;

const LTV_CAC_TARGET = 3;

const PRICE_SWEEP_MIN = 1.29;
const PRICE_SWEEP_MAX = 3.29;
const PRICE_SWEEP_STEP = 0.05;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// The best total monthly contribution profit achievable at all, across a
// price sweep at each single-channel mix — computed once from the real
// data, not assumed, and cached. Used as the denominator for "how close to
// optimal is this scenario's profit," so the CFO score rewards the actual
// profit-maximizing price rather than just the highest margin ratio.
let cachedGlobalMaxContributionEur: number | null = null;
function globalMaxContributionEur(dataset: LumenDataset): number {
  if (cachedGlobalMaxContributionEur !== null) return cachedGlobalMaxContributionEur;
  const channels: SalesChannel[] = ["DTC Online", "Retail/Grocery", "Gym & Office"];
  let max = 0;
  for (const channel of channels) {
    const mix = { "DTC Online": 0, "Retail/Grocery": 0, "Gym & Office": 0 } as Record<
      SalesChannel,
      number
    >;
    mix[channel] = 1;
    for (let p = PRICE_SWEEP_MIN; p <= PRICE_SWEEP_MAX; p += PRICE_SWEEP_STEP) {
      const outputs = computeScenario(
        { ...DEFAULT_SCENARIO_INPUTS, priceEur: p, salesChannelMix: mix },
        dataset
      );
      max = Math.max(max, outputs.estimatedMonthlyContributionEur);
    }
  }
  cachedGlobalMaxContributionEur = max;
  return max;
}

export function computeCfoScore(
  outputs: ScenarioOutputs,
  dataset: LumenDataset = defaultDataset
): number {
  const ceiling = globalMaxContributionEur(dataset);
  const profitEfficiencyScore = clamp01(
    outputs.estimatedMonthlyContributionEur / ceiling
  );
  const paybackScore = clamp01(
    (PAYBACK_MONTHS_WORST - outputs.cacPaybackMonths) /
      (PAYBACK_MONTHS_WORST - PAYBACK_MONTHS_BEST)
  );
  const ltvScore = clamp01(outputs.ltvToCacRatio / LTV_CAC_TARGET);

  return Math.round(
    100 *
      (CFO_WEIGHTS.profitEfficiency * profitEfficiencyScore +
        CFO_WEIGHTS.payback * paybackScore +
        CFO_WEIGHTS.ltv * ltvScore)
  );
}

// ---------------------------------------------------------------------------
// CMO score — price positioning vs. competitors, brand-channel share,
// purchase intent.
// ---------------------------------------------------------------------------
const CMO_WEIGHTS = { positioning: 0.4, channelPrestige: 0.3, intent: 0.3 };
const BRAND_CHANNELS: SalesChannel[] = ["DTC Online", "Gym & Office"];

export function computeCmoScore(
  inputs: ScenarioInputs,
  dataset: LumenDataset = defaultDataset
): number {
  const allPrices = dataset.competitorPricesByChannel.map((r) => r.priceEur);
  const priceFloor = Math.min(...allPrices);
  const priceCeil = Math.max(...allPrices);
  const positioningScore = clamp01(
    (inputs.priceEur - priceFloor) / (priceCeil - priceFloor)
  );

  const channelPrestigeScore = clamp01(
    BRAND_CHANNELS.reduce((s, c) => s + (inputs.salesChannelMix[c] ?? 0), 0)
  );

  const totalRespondents = dataset.segmentProfiles.reduce(
    (s, p) => s + p.respondentCount,
    0
  );
  const avgIntent =
    totalRespondents > 0
      ? dataset.segmentProfiles.reduce(
          (s, p) => s + p.avgLumenPurchaseIntent1To10 * p.respondentCount,
          0
        ) / totalRespondents
      : 5;
  const intentScore = clamp01((avgIntent - 1) / 9);

  return Math.round(
    100 *
      (CMO_WEIGHTS.positioning * positioningScore +
        CMO_WEIGHTS.channelPrestige * channelPrestigeScore +
        CMO_WEIGHTS.intent * intentScore)
  );
}

function harmonicMean(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  return Math.round((2 * a * b) / (a + b));
}

function primaryChannel(mix: Record<SalesChannel, number>): SalesChannel {
  return (Object.keys(mix) as SalesChannel[]).reduce((best, c) =>
    mix[c] > mix[best] ? c : best
  );
}

// Ranks calendar months by seasonal demand (data/seasonality_and_weather.csv)
// minus a competitive-noise penalty (how often competitors ran promos in
// that calendar month, aggregated across the 12-month history) — launching
// into a quiet month during peak season beats launching into one crowded
// with rival discounting.
export function recommendLaunchMonth(dataset: LumenDataset = defaultDataset): {
  month: number;
  rationale: string;
} {
  const promoCountByMonth = new Map<number, number>();
  for (const row of dataset.competitorPriceHistory) {
    if (!row.promoActive) continue;
    const calendarMonth = Number(row.month.slice(5, 7));
    promoCountByMonth.set(
      calendarMonth,
      (promoCountByMonth.get(calendarMonth) ?? 0) + 1
    );
  }
  const maxPromoCount = Math.max(1, ...promoCountByMonth.values());

  let bestMonth = 1;
  let bestScore = -Infinity;
  for (const row of dataset.seasonalityAndWeather) {
    const noisePenalty =
      ((promoCountByMonth.get(row.month) ?? 0) / maxPromoCount) * 30;
    const score = row.seasonalityIndex - noisePenalty;
    if (score > bestScore) {
      bestScore = score;
      bestMonth = row.month;
    }
  }

  const seasonality = dataset.seasonalityAndWeather.find(
    (r) => r.month === bestMonth
  );
  const promos = promoCountByMonth.get(bestMonth) ?? 0;
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return {
    month: bestMonth,
    rationale: `${MONTH_NAMES[bestMonth - 1]} pairs a seasonality index of ${seasonality?.seasonalityIndex} (100 = year average) with comparatively little competitor promo activity (${promos} promo-month instances observed here vs. up to ${maxPromoCount} elsewhere) — real demand tailwind, less pricing noise to launch into.`,
  };
}

export function computeTradeoff(
  inputs: ScenarioInputs,
  outputs: ScenarioOutputs,
  dataset: LumenDataset = defaultDataset
): TradeoffResult {
  const cfoScore = computeCfoScore(outputs);
  const cmoScore = computeCmoScore(inputs, dataset);
  const compromiseScore = harmonicMean(cfoScore, cmoScore);
  const tradeoffGapPts = Math.abs(cfoScore - cmoScore);
  const { month: launchMonth, rationale: timingRationale } =
    recommendLaunchMonth(dataset);
  const channel = primaryChannel(inputs.salesChannelMix);

  const leaning = cfoScore > cmoScore ? "CFO" : cmoScore > cfoScore ? "CMO" : "balanced";
  const whatWereNotOptimizingFor =
    leaning === "CFO"
      ? "Brand-building and premium positioning — this scenario prioritizes fast payback and margin over the clean-label, premium shelf presence Jonas (CMO) is asking for."
      : leaning === "CMO"
      ? "Speed of payback — this scenario prioritizes premium positioning and brand-building channels over the fast return Elena (CFO) is watching runway for."
      : "Neither side fully — this is a deliberate middle point, not a win for either.";

  const rationale =
    `At €${inputs.priceEur.toFixed(2)} through ${channel} (leading the current ${(inputs.salesChannelMix[channel] * 100).toFixed(0)}% mix), ` +
    `the model estimates ${outputs.estimatedMonthlyUnits.toLocaleString("de-DE")} units/month ` +
    `(range ${outputs.demandConfidence.lowUnits.toLocaleString("de-DE")}–${outputs.demandConfidence.highUnits.toLocaleString("de-DE")}), ` +
    `${outputs.contributionMarginPct.toFixed(0)}% contribution margin, and a ${outputs.cacPaybackMonths.toFixed(1)}-month CAC payback ` +
    `(LTV:CAC ${outputs.ltvToCacRatio.toFixed(2)}, vs. the brief's ≈3:1 target). ` +
    `CFO score ${cfoScore}/100, CMO score ${cmoScore}/100 — a ${tradeoffGapPts}-point gap. ${timingRationale}`;

  return {
    cfoScore,
    cmoScore,
    compromiseScore,
    tradeoffGapPts,
    recommendation: {
      priceEur: inputs.priceEur,
      primaryChannel: channel,
      launchMonth,
      whatWereNotOptimizingFor,
      rationale,
    },
  };
}

// Reruns the recommendation at a scaled market-share-capture assumption —
// exposes whether the call holds up, or only works at the default guess.
export function stressTestAssumption(
  inputs: ScenarioInputs,
  dataset: LumenDataset = defaultDataset,
  multipliers: number[] = [0.5, 1, 2]
): { multiplier: number; result: TradeoffResult }[] {
  return multipliers.map((multiplier) => {
    const stressedInputs = {
      ...inputs,
      marketShareCapturePct: inputs.marketShareCapturePct * multiplier,
    };
    const outputs = computeScenario(stressedInputs, dataset);
    return {
      multiplier,
      result: computeTradeoff(stressedInputs, outputs, dataset),
    };
  });
}
