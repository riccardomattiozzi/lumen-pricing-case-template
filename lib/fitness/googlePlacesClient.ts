import { FITNESS_CITY_CONFIG, type SupportedFitnessCity } from "@/lib/fitness/cities";
import { FITNESS_PLACE_TYPES } from "@/lib/fitness/opportunity";

// Places API (New) — Nearby Search. Field mask restricted to `places.id`
// only: we only need place IDs to count and deduplicate locations, and
// requesting the ID-only field mask keeps each call on the cheapest Places
// API (New) SKU rather than pulling name/address/rating data we never use.
const NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby";

async function searchNearbyPlaceIds(
  type: string,
  center: { lat: number; lng: number },
  radiusMeters: number,
  apiKey: string
): Promise<string[]> {
  const res = await fetch(NEARBY_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({
      includedTypes: [type],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: radiusMeters,
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Places API request failed for type "${type}" (${res.status})`);
  }

  const data: { places?: Array<{ id?: string }> } = await res.json();
  return (data.places ?? []).map((p) => p.id).filter((id): id is string => Boolean(id));
}

// Counts unique fitness-related locations near a city's centroid, deduped
// by place ID across every configured place type. Nearby Search (New) caps
// each call at 20 results, so this is a bounded sample within the search
// radius, not an exhaustive census of every gym in the city — see the
// methodology note surfaced alongside the feature in the UI.
export async function fetchFitnessLocationCount(
  city: SupportedFitnessCity,
  apiKey: string
): Promise<number> {
  const config = FITNESS_CITY_CONFIG[city];
  const center = { lat: config.lat, lng: config.lng };

  const settled = await Promise.allSettled(
    FITNESS_PLACE_TYPES.map((type) => searchNearbyPlaceIds(type, center, config.radiusMeters, apiKey))
  );

  const allFailed = settled.every((s) => s.status === "rejected");
  if (allFailed) {
    throw new Error(`All Places API requests failed for ${city}`);
  }

  const uniqueIds = new Set<string>();
  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      for (const id of outcome.value) uniqueIds.add(id);
    }
  }
  return uniqueIds.size;
}
