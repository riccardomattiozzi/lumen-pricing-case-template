import { describe, expect, it } from "vitest";
import {
  DEFAULT_PARAMS,
  precipitationMultiplier,
  temperatureMultiplier,
  weatherDemandMultiplier,
} from "./weatherSalesModel";

describe("temperatureMultiplier", () => {
  it("is neutral at the baseline temperature", () => {
    expect(temperatureMultiplier(DEFAULT_PARAMS.baselineTempC)).toBe(1);
  });

  it("rises with heat, capped at maxUpliftPct", () => {
    expect(temperatureMultiplier(DEFAULT_PARAMS.baselineTempC + 5)).toBeGreaterThan(1);
    expect(temperatureMultiplier(100)).toBeCloseTo(1 + DEFAULT_PARAMS.maxUpliftPct);
  });

  it("falls with cold, floored at minDropPct", () => {
    expect(temperatureMultiplier(DEFAULT_PARAMS.baselineTempC - 5)).toBeLessThan(1);
    expect(temperatureMultiplier(-100)).toBeCloseTo(1 + DEFAULT_PARAMS.minDropPct);
  });
});

describe("precipitationMultiplier", () => {
  it("is neutral at or below the threshold", () => {
    expect(precipitationMultiplier(0)).toBe(1);
    expect(precipitationMultiplier(DEFAULT_PARAMS.precipThresholdMm)).toBe(1);
  });

  it("falls with rain above the threshold, floored at maxPrecipDropPct", () => {
    expect(precipitationMultiplier(DEFAULT_PARAMS.precipThresholdMm + 5)).toBeLessThan(1);
    expect(precipitationMultiplier(1000)).toBeCloseTo(1 + DEFAULT_PARAMS.maxPrecipDropPct);
  });
});

describe("weatherDemandMultiplier", () => {
  it("combines temperature and rain as a product of the two multipliers", () => {
    const avgTempC = DEFAULT_PARAMS.baselineTempC + 5;
    const totalPrecipMm = DEFAULT_PARAMS.precipThresholdMm + 5;
    expect(weatherDemandMultiplier(avgTempC, totalPrecipMm)).toBeCloseTo(
      temperatureMultiplier(avgTempC) * precipitationMultiplier(totalPrecipMm)
    );
  });
});
