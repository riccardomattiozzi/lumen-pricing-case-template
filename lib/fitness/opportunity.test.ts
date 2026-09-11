import { describe, expect, it } from "vitest";
import {
  classifyFitnessTier,
  computeBenchmarkDensity,
  computeDensityPer100k,
  computeOpportunityIndex,
} from "@/lib/fitness/opportunity";

describe("computeDensityPer100k", () => {
  it("scales location count to a per-100k-inhabitants rate", () => {
    expect(computeDensityPer100k(200, 1_000_000)).toBeCloseTo(20, 5);
  });

  it("returns 0 for non-positive population instead of dividing by zero", () => {
    expect(computeDensityPer100k(50, 0)).toBe(0);
    expect(computeDensityPer100k(50, -1)).toBe(0);
  });
});

describe("computeBenchmarkDensity", () => {
  it("averages densities across cities", () => {
    expect(computeBenchmarkDensity([10, 20, 30])).toBeCloseTo(20, 5);
  });

  it("returns 0 for an empty benchmark set", () => {
    expect(computeBenchmarkDensity([])).toBe(0);
  });
});

describe("computeOpportunityIndex", () => {
  it("is 1 when a city sits exactly at the benchmark", () => {
    expect(computeOpportunityIndex(20, 20)).toBeCloseTo(1, 5);
  });

  it("returns 0 when the benchmark is not positive, instead of dividing by zero", () => {
    expect(computeOpportunityIndex(20, 0)).toBe(0);
  });
});

describe("classifyFitnessTier", () => {
  it("classifies HIGH at and above 1.15", () => {
    expect(classifyFitnessTier(1.15)).toBe("HIGH");
    expect(classifyFitnessTier(1.4)).toBe("HIGH");
  });

  it("classifies MEDIUM between 0.95 and 1.149", () => {
    expect(classifyFitnessTier(0.95)).toBe("MEDIUM");
    expect(classifyFitnessTier(1.0)).toBe("MEDIUM");
    expect(classifyFitnessTier(1.149)).toBe("MEDIUM");
  });

  it("classifies LOW below 0.95", () => {
    expect(classifyFitnessTier(0.94)).toBe("LOW");
    expect(classifyFitnessTier(0)).toBe("LOW");
  });
});
