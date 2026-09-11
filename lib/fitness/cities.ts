// City-level config for the Fitness Opportunity signal. Population figures
// are approximate city-proper populations (Statistisches Bundesamt /
// destatis, most recent published figures) — an absolute headcount, not the
// `population_share_of_market` ratios in data/market_context.csv, so the two
// don't collide even though they describe the same five cities.
//
// `radiusMeters` is a single search circle centered on each city's core,
// sized roughly to its built-up area. It is a sampling radius for the
// Places API call, not a claim about municipal boundaries.

export type SupportedFitnessCity = "Berlin" | "Munich" | "Hamburg" | "Cologne" | "Frankfurt";

export const SUPPORTED_FITNESS_CITIES: SupportedFitnessCity[] = [
  "Berlin",
  "Munich",
  "Hamburg",
  "Cologne",
  "Frankfurt",
];

export interface FitnessCityConfig {
  lat: number;
  lng: number;
  population: number;
  radiusMeters: number;
}

export const FITNESS_CITY_CONFIG: Record<SupportedFitnessCity, FitnessCityConfig> = {
  Berlin: { lat: 52.520008, lng: 13.404954, population: 3850809, radiusMeters: 15000 },
  Munich: { lat: 48.137154, lng: 11.576124, population: 1512491, radiusMeters: 10000 },
  Hamburg: { lat: 53.551086, lng: 9.993682, population: 1945532, radiusMeters: 13000 },
  Cologne: { lat: 50.937531, lng: 6.960279, population: 1073096, radiusMeters: 10000 },
  Frankfurt: { lat: 50.110924, lng: 8.682127, population: 773068, radiusMeters: 8000 },
};

export function isSupportedFitnessCity(value: string): value is SupportedFitnessCity {
  return (SUPPORTED_FITNESS_CITIES as string[]).includes(value);
}
