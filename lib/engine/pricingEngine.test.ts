import { describe, expect, it } from "vitest";
import { computeScenario } from "./pricingEngine";
import { DEFAULT_SCENARIO_INPUTS } from "@/lib/types";

// PR #1 scope: just proves the wiring and the test runner work end to end.
// PR #2 replaces this with the real coverage described in the build plan
// (anchor-price interpolation, extrapolation flag, mix normalization,
// zero-budget CAC, empty-region demand).

describe("computeScenario (stub)", () => {
  it("returns the full ScenarioOutputs shape", () => {
    const outputs = computeScenario(DEFAULT_SCENARIO_INPUTS);
    expect(outputs.estimatedMonthlyUnits).toBeGreaterThanOrEqual(0);
    expect(outputs.demandConfidence.lowUnits).toBeLessThanOrEqual(
      outputs.demandConfidence.highUnits
    );
    expect(outputs.byChannel["DTC Online"]).toBeDefined();
  });

  it("flags extrapolated outside the tested price range", () => {
    expect(
      computeScenario({ ...DEFAULT_SCENARIO_INPUTS, priceEur: 2.99 })
        .extrapolated
    ).toBe(true);
    expect(
      computeScenario({ ...DEFAULT_SCENARIO_INPUTS, priceEur: 2.19 })
        .extrapolated
    ).toBe(false);
  });
});
