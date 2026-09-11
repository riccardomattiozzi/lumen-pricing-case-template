import { NextRequest, NextResponse } from "next/server";
import {
  FITNESS_CITY_CONFIG,
  SUPPORTED_FITNESS_CITIES,
  isSupportedFitnessCity,
  type SupportedFitnessCity,
} from "@/lib/fitness/cities";
import { fetchFitnessLocationCount } from "@/lib/fitness/googlePlacesClient";
import {
  classifyFitnessTier,
  computeBenchmarkDensity,
  computeDensityPer100k,
  computeOpportunityIndex,
} from "@/lib/fitness/opportunity";
import type { FitnessOpportunityResponse } from "@/lib/fitness/types";

export const dynamic = "force-dynamic";

// Server-side, in-memory, per-instance cache. The Fitness Opportunity Index
// needs a benchmark across all five supported cities, so a request for any
// one city warms (or reuses) the whole set — a city's own Google Places
// data is fetched at most once per TTL window, regardless of how many
// scenario changes or visitors hit the route in that window. This is best
// effort (a fresh serverless instance starts cold), not a persistent cache,
// which is a known limitation of this simple approach.
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

type CacheEntry = { count: number; error: false; fetchedAt: number } | { error: true; fetchedAt: number };
const cityCache = new Map<SupportedFitnessCity, CacheEntry>();

async function getCityCount(city: SupportedFitnessCity, apiKey: string): Promise<number | null> {
  const cached = cityCache.get(city);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.error ? null : cached.count;
  }
  try {
    const count = await fetchFitnessLocationCount(city, apiKey);
    cityCache.set(city, { count, error: false, fetchedAt: Date.now() });
    return count;
  } catch {
    cityCache.set(city, { error: true, fetchedAt: Date.now() });
    return null;
  }
}

export async function GET(request: NextRequest) {
  const cityParam = request.nextUrl.searchParams.get("city") ?? "";

  if (!isSupportedFitnessCity(cityParam)) {
    return NextResponse.json<FitnessOpportunityResponse>({
      available: false,
      reason: "unsupported_city",
    });
  }
  const city = cityParam;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json<FitnessOpportunityResponse>({
      available: false,
      reason: "missing_api_key",
    });
  }

  const entries = await Promise.all(
    SUPPORTED_FITNESS_CITIES.map(async (c) => ({ city: c, count: await getCityCount(c, apiKey) }))
  );

  const requested = entries.find((e) => e.city === city);
  if (!requested || requested.count === null) {
    return NextResponse.json<FitnessOpportunityResponse>({
      available: false,
      reason: "api_error",
    });
  }
  if (requested.count === 0) {
    return NextResponse.json<FitnessOpportunityResponse>({
      available: false,
      reason: "empty_result",
    });
  }

  const densityByCity = entries
    .filter((e): e is { city: SupportedFitnessCity; count: number } => e.count !== null)
    .map((e) => ({
      city: e.city,
      density: computeDensityPer100k(e.count, FITNESS_CITY_CONFIG[e.city].population),
    }));

  const benchmarkDensityPer100k = computeBenchmarkDensity(densityByCity.map((d) => d.density));
  const densityPer100k = densityByCity.find((d) => d.city === city)!.density;
  const opportunityIndex = computeOpportunityIndex(densityPer100k, benchmarkDensityPer100k);

  return NextResponse.json<FitnessOpportunityResponse>({
    available: true,
    city,
    locationCount: requested.count,
    population: FITNESS_CITY_CONFIG[city].population,
    densityPer100k,
    benchmarkDensityPer100k,
    opportunityIndex,
    tier: classifyFitnessTier(opportunityIndex),
    benchmarkCityCount: densityByCity.length,
  });
}
