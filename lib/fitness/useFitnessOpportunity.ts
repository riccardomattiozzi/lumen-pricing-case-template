"use client";

import { useEffect, useState } from "react";
import type { SupportedFitnessCity } from "@/lib/fitness/cities";
import type { FitnessOpportunityResponse } from "@/lib/fitness/types";

const CLIENT_CACHE_TTL_MS = 30 * 60 * 1000;

interface CacheEntry {
  promise: Promise<FitnessOpportunityResponse>;
  fetchedAt: number;
}

// Module-scoped, so it survives across every component instance in the tab
// and is shared by every consumer of the hook below. Keyed by city only —
// this is the whole caching contract: nothing in the scenario (price,
// channel mix, marketing budget, launch month, market share) can trigger a
// new Google Places request, because nothing in the scenario ever appears
// as a cache key or a hook dependency here.
const cache = new Map<SupportedFitnessCity, CacheEntry>();

function loadCity(city: SupportedFitnessCity): Promise<FitnessOpportunityResponse> {
  const cached = cache.get(city);
  if (cached && Date.now() - cached.fetchedAt < CLIENT_CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = fetch(`/api/fitness-opportunity?city=${encodeURIComponent(city)}`)
    .then((res) => res.json() as Promise<FitnessOpportunityResponse>)
    .catch(() => ({ available: false, reason: "api_error" }) as FitnessOpportunityResponse);

  cache.set(city, { promise, fetchedAt: Date.now() });
  return promise;
}

interface FetchState {
  city: SupportedFitnessCity;
  result: FitnessOpportunityResponse;
}

export function useFitnessOpportunity(city: SupportedFitnessCity | null) {
  const [state, setState] = useState<FetchState | null>(null);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    // Only setState from the resolved callback, never synchronously in the
    // effect body — "loading" below is derived from state/city being out of
    // sync, not from a separate flag this effect would otherwise have to
    // set eagerly.
    loadCity(city).then((data) => {
      if (!cancelled) setState({ city, result: data });
    });
    return () => {
      cancelled = true;
    };
  }, [city]);

  if (!city) return { result: null, loading: false };
  // A previous city's state (or none yet) while this effect's fetch is in
  // flight — treat it as loading rather than flashing a stale result.
  if (!state || state.city !== city) return { result: null, loading: true };
  return { result: state.result, loading: false };
}
