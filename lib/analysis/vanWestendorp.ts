import { dataset as defaultDataset, type LumenDataset } from "@/lib/engine/dataset";
import type { Segment } from "@/lib/types";

// Van Westendorp Price Sensitivity Meter, computed from the ~300 raw
// responses in data/price_sensitivity_survey.csv. Each respondent gave four
// thresholds; the four cumulative curves below are the standard reading of
// them, and where those curves cross gives the classic price points.
//
// This is the one piece of pricing methodology the data room hands over in
// raw form rather than pre-chewed, so it's worth doing properly rather than
// taking price_test_results.csv's three tested prices as the whole story.

export interface VanWestendorpPoint {
  priceEur: number;
  tooCheapPct: number;
  cheapPct: number;
  expensivePct: number;
  tooExpensivePct: number;
}

export interface VanWestendorpResult {
  curve: VanWestendorpPoint[];
  respondentCount: number;
  /** Too cheap × too expensive — the price fewest people reject outright. */
  optimalPriceEur: number | null;
  /** Cheap × expensive — where as many call it cheap as call it expensive. */
  indifferencePriceEur: number | null;
  /** Below this, quality doubts start to dominate. */
  marginalCheapnessEur: number | null;
  /** Above this, price resistance starts to dominate. */
  marginalExpensivenessEur: number | null;
  acceptableRangeEur: [number, number] | null;
}

const STEP = 0.05;

function crossing(
  curve: VanWestendorpPoint[],
  a: keyof VanWestendorpPoint,
  b: keyof VanWestendorpPoint
): number | null {
  for (let i = 1; i < curve.length; i++) {
    const prevDiff = (curve[i - 1][a] as number) - (curve[i - 1][b] as number);
    const diff = (curve[i][a] as number) - (curve[i][b] as number);
    if (prevDiff === 0) return curve[i - 1].priceEur;
    if (prevDiff > 0 !== diff > 0) {
      // Linear interpolation between the two straddling price steps.
      const t = prevDiff / (prevDiff - diff);
      const p =
        curve[i - 1].priceEur + t * (curve[i].priceEur - curve[i - 1].priceEur);
      return Math.round(p * 100) / 100;
    }
  }
  return null;
}

export function computeVanWestendorp(
  segment?: Segment,
  dataset: LumenDataset = defaultDataset
): VanWestendorpResult {
  const rows = segment
    ? dataset.priceSensitivitySurvey.filter((r) => r.segment === segment)
    : dataset.priceSensitivitySurvey;

  const n = rows.length;
  if (n === 0) {
    return {
      curve: [],
      respondentCount: 0,
      optimalPriceEur: null,
      indifferencePriceEur: null,
      marginalCheapnessEur: null,
      marginalExpensivenessEur: null,
      acceptableRangeEur: null,
    };
  }

  const allValues = rows.flatMap((r) => [
    r.tooCheapEur,
    r.cheapEur,
    r.expensiveEur,
    r.tooExpensiveEur,
  ]);
  const min = Math.floor(Math.min(...allValues) * 10) / 10;
  const max = Math.ceil(Math.max(...allValues) * 10) / 10;

  const curve: VanWestendorpPoint[] = [];
  for (let p = min; p <= max + 1e-9; p += STEP) {
    const price = Math.round(p * 100) / 100;
    curve.push({
      priceEur: price,
      // Descending: how many would still call this price (or lower) too cheap.
      tooCheapPct: (rows.filter((r) => r.tooCheapEur >= price).length / n) * 100,
      cheapPct: (rows.filter((r) => r.cheapEur >= price).length / n) * 100,
      // Ascending: how many already consider this price (or higher) expensive.
      expensivePct: (rows.filter((r) => r.expensiveEur <= price).length / n) * 100,
      tooExpensivePct:
        (rows.filter((r) => r.tooExpensiveEur <= price).length / n) * 100,
    });
  }

  const optimalPriceEur = crossing(curve, "tooCheapPct", "tooExpensivePct");
  const indifferencePriceEur = crossing(curve, "cheapPct", "expensivePct");
  const marginalCheapnessEur = crossing(curve, "tooCheapPct", "expensivePct");
  const marginalExpensivenessEur = crossing(curve, "cheapPct", "tooExpensivePct");

  return {
    curve,
    respondentCount: n,
    optimalPriceEur,
    indifferencePriceEur,
    marginalCheapnessEur,
    marginalExpensivenessEur,
    acceptableRangeEur:
      marginalCheapnessEur !== null && marginalExpensivenessEur !== null
        ? [marginalCheapnessEur, marginalExpensivenessEur]
        : null,
  };
}
