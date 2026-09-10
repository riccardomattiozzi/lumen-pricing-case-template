import { describe, expect, it } from "vitest";
import { computeVanWestendorp } from "./vanWestendorp";
import { computeUnitEconomics } from "./unitEconomics";
import { readSegments } from "./segments";
import { dataset } from "@/lib/engine/dataset";
import type { SalesChannel } from "@/lib/types";

describe("computeVanWestendorp", () => {
  it("uses every price-sensitivity respondent", () => {
    expect(computeVanWestendorp().respondentCount).toBe(
      dataset.priceSensitivitySurvey.length
    );
  });

  it("produces monotonic curves in the expected directions", () => {
    const { curve } = computeVanWestendorp();
    for (let i = 1; i < curve.length; i++) {
      // "Too cheap" / "cheap" fall as price rises; "expensive" / "too
      // expensive" rise. If any of these inverts, the cumulative logic is
      // the wrong way round.
      expect(curve[i].tooCheapPct).toBeLessThanOrEqual(curve[i - 1].tooCheapPct);
      expect(curve[i].cheapPct).toBeLessThanOrEqual(curve[i - 1].cheapPct);
      expect(curve[i].expensivePct).toBeGreaterThanOrEqual(curve[i - 1].expensivePct);
      expect(curve[i].tooExpensivePct).toBeGreaterThanOrEqual(
        curve[i - 1].tooExpensivePct
      );
    }
  });

  it("orders the acceptable range floor below its ceiling", () => {
    const { acceptableRangeEur } = computeVanWestendorp();
    expect(acceptableRangeEur).not.toBeNull();
    expect(acceptableRangeEur![0]).toBeLessThan(acceptableRangeEur![1]);
  });

  it("places the optimal price inside the acceptable range", () => {
    const { optimalPriceEur, acceptableRangeEur } = computeVanWestendorp();
    expect(optimalPriceEur).not.toBeNull();
    expect(optimalPriceEur!).toBeGreaterThanOrEqual(acceptableRangeEur![0]);
    expect(optimalPriceEur!).toBeLessThanOrEqual(acceptableRangeEur![1]);
  });
});

describe("computeUnitEconomics", () => {
  // The strongest check available: rebuild the waterfall at exactly the
  // prices channel_economics.csv reports, and confirm we land on its own
  // net-price and contribution figures.
  it("reproduces channel_economics.csv at its own illustrative prices", () => {
    for (const row of dataset.channelEconomics) {
      const econ = computeUnitEconomics(
        row.illustrativeRetailPriceEur,
        row.channel as SalesChannel
      );
      expect(econ.netPriceToLumenEur).toBeCloseTo(row.netPriceToLumenEur, 1);
      expect(econ.unitContributionEur).toBeCloseTo(row.unitContributionEur, 1);
    }
  });

  it("leaves less per unit in Retail/Grocery than in DTC Online at the same price", () => {
    const retail = computeUnitEconomics(2.19, "Retail/Grocery");
    const dtc = computeUnitEconomics(2.19, "DTC Online");
    expect(retail.unitContributionEur).toBeLessThan(dtc.unitContributionEur);
  });

  it("always ends on the unit contribution it reports", () => {
    const econ = computeUnitEconomics(2.39, "Gym & Office");
    const last = econ.steps[econ.steps.length - 1];
    expect(last.label).toBe("Unit contribution");
    expect(last.runningEur).toBeCloseTo(econ.unitContributionEur, 6);
  });
});

describe("readSegments", () => {
  it("covers every segment in the survey", () => {
    expect(readSegments(2.19)).toHaveLength(dataset.segmentProfiles.length);
  });

  it("never increases acceptance as price rises", () => {
    const cheap = readSegments(1.49);
    const dear = readSegments(2.99);
    for (let i = 0; i < cheap.length; i++) {
      expect(dear[i].acceptancePct).toBeLessThanOrEqual(cheap[i].acceptancePct);
    }
  });

  it("prices the most price-sensitive segment out before the least", () => {
    const readings = readSegments(2.59);
    const sorted = [...readings].sort(
      (a, b) => b.avgPriceSensitivity - a.avgPriceSensitivity
    );
    const mostSensitive = sorted[0];
    const leastSensitive = sorted[sorted.length - 1];
    expect(mostSensitive.acceptancePct).toBeLessThan(leastSensitive.acceptancePct);
  });
});
