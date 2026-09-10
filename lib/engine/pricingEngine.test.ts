import { describe, expect, it } from "vitest";
import {
  computeScenario,
  interpolatePriceAcceptance,
  estimateAddressableDemand,
  computeBlendedCacAndLtv,
} from "./pricingEngine";
import { dataset } from "./dataset";
import { DEFAULT_SCENARIO_INPUTS } from "@/lib/types";

describe("interpolatePriceAcceptance", () => {
  it("returns the exact CSV value at each tested anchor price", () => {
    for (const row of dataset.priceTestResults) {
      const result = interpolatePriceAcceptance(row.priceEur, row.channel as never);
      expect(result.acceptancePct).toBeCloseTo(row.estimatedAcceptancePctOfSurvey, 5);
      expect(result.unitContributionEur).toBeCloseTo(row.unitContributionEur, 5);
      expect(result.extrapolated).toBe(false);
    }
  });

  it("interpolates between anchors", () => {
    // Halfway between €1.79 and €2.19 on DTC Online should land between
    // their two acceptance percentages.
    const low = dataset.priceTestResults.find(
      (r) => r.channel === "DTC Online" && r.priceEur === 1.79
    )!;
    const high = dataset.priceTestResults.find(
      (r) => r.channel === "DTC Online" && r.priceEur === 2.19
    )!;
    const mid = interpolatePriceAcceptance(1.99, "DTC Online");
    const lo = Math.min(low.estimatedAcceptancePctOfSurvey, high.estimatedAcceptancePctOfSurvey);
    const hi = Math.max(low.estimatedAcceptancePctOfSurvey, high.estimatedAcceptancePctOfSurvey);
    expect(mid.acceptancePct).toBeGreaterThanOrEqual(lo);
    expect(mid.acceptancePct).toBeLessThanOrEqual(hi);
  });

  it("flags extrapolation outside the tested range, not inside it", () => {
    expect(interpolatePriceAcceptance(1.29, "DTC Online").extrapolated).toBe(true);
    expect(interpolatePriceAcceptance(3.29, "DTC Online").extrapolated).toBe(true);
    expect(interpolatePriceAcceptance(2.19, "DTC Online").extrapolated).toBe(false);
  });
});

describe("estimateAddressableDemand", () => {
  it("returns zero demand (not NaN) when no regions are targeted", () => {
    const result = estimateAddressableDemand({
      ...DEFAULT_SCENARIO_INPUTS,
      targetRegions: [],
    });
    expect(result.units).toBe(0);
    expect(Number.isNaN(result.units)).toBe(false);
  });

  it("keeps low <= units <= high", () => {
    const result = estimateAddressableDemand(DEFAULT_SCENARIO_INPUTS);
    expect(result.low).toBeLessThanOrEqual(result.units);
    expect(result.units).toBeLessThanOrEqual(result.high);
  });

  it("more regions never decreases demand", () => {
    const berlinOnly = estimateAddressableDemand({
      ...DEFAULT_SCENARIO_INPUTS,
      targetRegions: ["Berlin"],
    });
    const all = estimateAddressableDemand(DEFAULT_SCENARIO_INPUTS);
    expect(all.units).toBeGreaterThanOrEqual(berlinOnly.units);
  });
});

describe("computeBlendedCacAndLtv", () => {
  it("returns positive, finite CAC and LTV", () => {
    const { blendedCacEur, blendedLtvEur } = computeBlendedCacAndLtv();
    expect(blendedCacEur).toBeGreaterThan(0);
    expect(blendedLtvEur).toBeGreaterThan(0);
    expect(Number.isFinite(blendedCacEur)).toBe(true);
  });
});

describe("computeScenario", () => {
  it("returns the full ScenarioOutputs shape with sane values", () => {
    const outputs = computeScenario(DEFAULT_SCENARIO_INPUTS);
    expect(outputs.estimatedMonthlyUnits).toBeGreaterThanOrEqual(0);
    expect(outputs.demandConfidence.lowUnits).toBeLessThanOrEqual(
      outputs.demandConfidence.highUnits
    );
    expect(outputs.byChannel["DTC Online"]).toBeDefined();
    expect(Number.isFinite(outputs.contributionMarginPct)).toBe(true);
  });

  it("clamps price to [1.29, 3.29] instead of producing nonsense", () => {
    const tooHigh = computeScenario({ ...DEFAULT_SCENARIO_INPUTS, priceEur: 99 });
    const tooLow = computeScenario({ ...DEFAULT_SCENARIO_INPUTS, priceEur: -5 });
    expect(tooHigh.estimatedMonthlyRevenueEur).toBeLessThan(99 * 1_000_000);
    expect(tooLow.estimatedMonthlyRevenueEur).toBeGreaterThanOrEqual(0);
  });

  it("normalizes a channel mix that doesn't sum to 1, rather than rejecting it", () => {
    const outputs = computeScenario({
      ...DEFAULT_SCENARIO_INPUTS,
      salesChannelMix: { "DTC Online": 2, "Retail/Grocery": 2, "Gym & Office": 2 },
    });
    const shares = Object.values(outputs.byChannel).map((c) => c.unitsShare);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });

  it("handles an all-zero channel mix without producing NaN", () => {
    const outputs = computeScenario({
      ...DEFAULT_SCENARIO_INPUTS,
      salesChannelMix: { "DTC Online": 0, "Retail/Grocery": 0, "Gym & Office": 0 },
    });
    expect(Number.isNaN(outputs.estimatedMonthlyUnits)).toBe(false);
  });

  it("does not divide by zero when marketing budget is zero", () => {
    const outputs = computeScenario({
      ...DEFAULT_SCENARIO_INPUTS,
      monthlyMarketingBudgetEur: 0,
    });
    expect(Number.isNaN(outputs.cacPaybackMonths)).toBe(false);
  });
});
