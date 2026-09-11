import { describe, expect, it } from "vitest";
import {
  computeCfoScore,
  computeCmoScore,
  computeTradeoff,
  recommendLaunchMonth,
  stressTestAssumption,
} from "./recommendationEngine";
import { computeScenario } from "./engine/pricingEngine";
import { DEFAULT_SCENARIO_INPUTS } from "@/lib/types";
import { PRESET_INPUTS } from "./store";

// Same DTC/Gym-heavy channel mix for both — isolates price as the one
// real axis of CFO-vs-CMO tension in this model (see lib/store.ts for why
// a naive "low price + mass retail" reading of "CFO-friendly" is wrong:
// Retail/Grocery has the worst per-unit contribution of the three
// channels at every tested price, so it loses on both scores at once).
const SHARED_MIX = { "DTC Online": 0.45, "Retail/Grocery": 0.1, "Gym & Office": 0.45 };
const CFO_LEANING = {
  ...DEFAULT_SCENARIO_INPUTS,
  priceEur: 2.19, // total monthly profit peaks here, not at the price extremes
  salesChannelMix: SHARED_MIX,
};
const CMO_LEANING = {
  ...DEFAULT_SCENARIO_INPUTS,
  priceEur: 2.59, // most premium tested price, closest to VoltFit/Root & Rise
  salesChannelMix: SHARED_MIX,
};

describe("computeCfoScore / computeCmoScore", () => {
  it("scores the CFO-leaning scenario higher on CFO than the CMO-leaning one", () => {
    const cfoOutputs = computeScenario(CFO_LEANING);
    const cmoOutputs = computeScenario(CMO_LEANING);
    expect(computeCfoScore(cfoOutputs)).toBeGreaterThan(computeCfoScore(cmoOutputs));
  });

  it("scores the CMO-leaning scenario higher on CMO than the CFO-leaning one", () => {
    expect(computeCmoScore(CMO_LEANING)).toBeGreaterThan(computeCmoScore(CFO_LEANING));
  });

  it("keeps both scores within [0, 100]", () => {
    for (const inputs of [CFO_LEANING, CMO_LEANING, DEFAULT_SCENARIO_INPUTS]) {
      const outputs = computeScenario(inputs);
      expect(computeCfoScore(outputs)).toBeGreaterThanOrEqual(0);
      expect(computeCfoScore(outputs)).toBeLessThanOrEqual(100);
      expect(computeCmoScore(inputs)).toBeGreaterThanOrEqual(0);
      expect(computeCmoScore(inputs)).toBeLessThanOrEqual(100);
    }
  });
});

describe("computeTradeoff", () => {
  it("compromiseScore is never higher than the arithmetic mean (harmonic mean property)", () => {
    for (const inputs of [CFO_LEANING, CMO_LEANING, DEFAULT_SCENARIO_INPUTS]) {
      const outputs = computeScenario(inputs);
      const result = computeTradeoff(inputs, outputs);
      const arithmeticMean = (result.cfoScore + result.cmoScore) / 2;
      expect(result.compromiseScore).toBeLessThanOrEqual(arithmeticMean + 1); // +1 rounding slack
    }
  });

  it("tradeoffGapPts is the absolute difference between the two scores", () => {
    const outputs = computeScenario(DEFAULT_SCENARIO_INPUTS);
    const result = computeTradeoff(DEFAULT_SCENARIO_INPUTS, outputs);
    expect(result.tradeoffGapPts).toBe(Math.abs(result.cfoScore - result.cmoScore));
  });

  it("recommendation names a real price, channel and month", () => {
    const outputs = computeScenario(DEFAULT_SCENARIO_INPUTS);
    const result = computeTradeoff(DEFAULT_SCENARIO_INPUTS, outputs);
    expect(result.recommendation.priceEur).toBe(DEFAULT_SCENARIO_INPUTS.priceEur);
    expect(result.recommendation.launchMonth).toBeGreaterThanOrEqual(1);
    expect(result.recommendation.launchMonth).toBeLessThanOrEqual(12);
    expect(result.recommendation.rationale.length).toBeGreaterThan(20);
  });
});

describe("recommendLaunchMonth", () => {
  it("returns a valid month with a non-empty rationale", () => {
    const { month, rationale } = recommendLaunchMonth();
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(rationale.length).toBeGreaterThan(10);
  });
});

describe("stressTestAssumption", () => {
  it("returns one result per multiplier, each a full TradeoffResult", () => {
    const results = stressTestAssumption(DEFAULT_SCENARIO_INPUTS, undefined, [0.5, 1, 2]);
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.result.cfoScore).toBeGreaterThanOrEqual(0);
      expect(r.result.cmoScore).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("scenario presets", () => {
  // A preset called "Compromise" has to actually sit between the two sides.
  // It once kept 25% on Retail/Grocery and ended up beaten by the CFO preset
  // on both scores at once — the lowest compromise score of the three.
  const score = (preset: keyof typeof PRESET_INPUTS) =>
    computeTradeoff(PRESET_INPUTS[preset], computeScenario(PRESET_INPUTS[preset]));

  it("keeps the Compromise preset between the CFO and CMO presets on both scores", () => {
    const cfo = score("CFO");
    const cmo = score("CMO");
    const mid = score("Compromise");
    expect(mid.cfoScore).toBeLessThanOrEqual(cfo.cfoScore);
    expect(mid.cfoScore).toBeGreaterThanOrEqual(cmo.cfoScore);
    expect(mid.cmoScore).toBeGreaterThanOrEqual(cfo.cmoScore);
    expect(mid.cmoScore).toBeLessThanOrEqual(cmo.cmoScore);
  });

  it("never lets another preset beat the Compromise on both scores", () => {
    const mid = score("Compromise");
    for (const other of ["CFO", "CMO"] as const) {
      const o = score(other);
      const dominates =
        o.cfoScore >= mid.cfoScore &&
        o.cmoScore >= mid.cmoScore &&
        (o.cfoScore > mid.cfoScore || o.cmoScore > mid.cmoScore);
      expect(dominates).toBe(false);
    }
  });
});
