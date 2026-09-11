// Weather data source: Open-Meteo (https://open-meteo.com)
// Free, no API key, no signup. Fair-use limit ~10,000 calls/day for non-commercial use.
// Open-Meteo aggregates official national weather services (incl. Germany's DWD) rather than
// running its own sensors, which is why it's used here instead of a paid provider.

export type Region =
  | "Berlin"
  | "Hamburg"
  | "Munich"
  | "Cologne"
  | "Frankfurt"
  | "OtherGermany";

// Kassel sits near Germany's geographic center — used as a stand-in coordinate for
// "OtherGermany" (everything outside the five named cities in the pricing tool).
const REGION_COORDS: Record<Region, { lat: number; lon: number }> = {
  Berlin: { lat: 52.52, lon: 13.405 },
  Hamburg: { lat: 53.5511, lon: 9.9937 },
  Munich: { lat: 48.1351, lon: 11.582 },
  Cologne: { lat: 50.9375, lon: 6.9603 },
  Frankfurt: { lat: 50.1109, lon: 8.6821 },
  OtherGermany: { lat: 51.3127, lon: 9.4797 },
};

const HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
// The archive API typically lags ~5 days behind today; anything more recent must come from
// the forecast API instead.
const ARCHIVE_LAG_DAYS = 5;

export interface DailyWeather {
  date: string; // YYYY-MM-DD
  meanC: number;
  precipMm: number;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

async function fetchDailyWeather(
  baseUrl: string,
  region: Region,
  startDate: string,
  endDate: string,
  extraParams: Record<string, string> = {}
): Promise<DailyWeather[]> {
  const { lat, lon } = REGION_COORDS[region];
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "temperature_2m_mean,precipitation_sum",
    timezone: "Europe/Berlin",
    start_date: startDate,
    end_date: endDate,
    ...extraParams,
  });

  const res = await fetch(`${baseUrl}?${params}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed (${res.status} ${res.statusText}) for ${region}`);
  }
  const json = (await res.json()) as {
    daily: {
      time: string[];
      temperature_2m_mean: (number | null)[];
      precipitation_sum: (number | null)[];
    };
  };

  return json.daily.time.map((date, i) => ({
    date,
    meanC: json.daily.temperature_2m_mean[i] as number,
    precipMm: json.daily.precipitation_sum[i] as number,
  }));
}

/**
 * Daily mean temperature and total precipitation for a region over [startDate, endDate]
 * (inclusive, YYYY-MM-DD). Automatically splits the range across the historical (archive)
 * and forecast endpoints when it straddles "today - ARCHIVE_LAG_DAYS".
 */
export async function getDailyWeather(
  region: Region,
  startDate: string,
  endDate: string
): Promise<DailyWeather[]> {
  const archiveCutoff = toISODate(addDays(new Date(), -ARCHIVE_LAG_DAYS));

  if (endDate <= archiveCutoff) {
    return fetchDailyWeather(HISTORICAL_URL, region, startDate, endDate);
  }
  if (startDate > archiveCutoff) {
    return fetchDailyWeather(FORECAST_URL, region, startDate, endDate);
  }

  // Range straddles the cutoff: fetch each half from the endpoint that actually has it.
  const [historical, forecast] = await Promise.all([
    fetchDailyWeather(HISTORICAL_URL, region, startDate, archiveCutoff),
    fetchDailyWeather(FORECAST_URL, region, toISODate(addDays(new Date(archiveCutoff), 1)), endDate),
  ]);
  return [...historical, ...forecast];
}

export interface WeeklyWeather {
  avgTempC: number;
  totalPrecipMm: number;
}

/** Average temperature and total precipitation for the 7 days starting on weekStartISO. */
export async function getWeeklyWeather(region: Region, weekStartISO: string): Promise<WeeklyWeather> {
  const start = new Date(weekStartISO);
  const end = addDays(start, 6);
  const daily = await getDailyWeather(region, toISODate(start), toISODate(end));
  if (daily.length === 0) throw new Error(`No weather data returned for ${region} week of ${weekStartISO}`);
  return {
    avgTempC: daily.reduce((sum, d) => sum + d.meanC, 0) / daily.length,
    totalPrecipMm: daily.reduce((sum, d) => sum + d.precipMm, 0),
  };
}
