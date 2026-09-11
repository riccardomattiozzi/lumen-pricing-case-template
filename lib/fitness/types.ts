import type { SupportedFitnessCity } from "@/lib/fitness/cities";

export type FitnessTier = "HIGH" | "MEDIUM" | "LOW";

export interface FitnessOpportunityData {
  city: SupportedFitnessCity;
  locationCount: number;
  population: number;
  densityPer100k: number;
  benchmarkDensityPer100k: number;
  opportunityIndex: number;
  tier: FitnessTier;
  benchmarkCityCount: number; // how many of the 5 cities fed the benchmark
}

export type FitnessUnavailableReason =
  | "unsupported_city"
  | "missing_api_key"
  | "api_error"
  | "empty_result";

export type FitnessOpportunityResponse =
  | ({ available: true } & FitnessOpportunityData)
  | { available: false; reason: FitnessUnavailableReason };
