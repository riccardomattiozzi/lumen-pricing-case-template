import type { FitnessTier } from "@/lib/fitness/types";

// Google Places API (New) place types treated as "fitness locations" for
// this signal. Kept as a flat list (not per-type weighting) so the
// methodology stays simple and transparent, per the case brief.
export const FITNESS_PLACE_TYPES = [
  "gym",
  "fitness_center",
  "sports_club",
  "sports_activity_location",
] as const;

export function computeDensityPer100k(locationCount: number, population: number): number {
  if (population <= 0) return 0;
  return (locationCount / population) * 100_000;
}

// Benchmark = the plain average density across whichever supported cities
// currently have valid data. Simple and transparent by construction: no
// weighting, no external reference values.
export function computeBenchmarkDensity(densities: number[]): number {
  if (densities.length === 0) return 0;
  return densities.reduce((sum, d) => sum + d, 0) / densities.length;
}

export function computeOpportunityIndex(density: number, benchmarkDensity: number): number {
  if (benchmarkDensity <= 0) return 0;
  return density / benchmarkDensity;
}

export function classifyFitnessTier(opportunityIndex: number): FitnessTier {
  if (opportunityIndex >= 1.15) return "HIGH";
  if (opportunityIndex >= 0.95) return "MEDIUM";
  return "LOW";
}
