import { getWeeklyWeather, type Region } from "./weather";

export interface WeatherDemandParams {
  /** Temperature (°C) at which weather has ~no effect on demand. */
  baselineTempC: number;
  /** Extra demand, as a fraction, per °C above baseline. */
  upliftPerDegree: number;
  /** Cap on upside from heat (fraction, e.g. 0.35 = +35% max). */
  maxUpliftPct: number;
  /** Floor on downside from cold (fraction, e.g. -0.15 = -15% max). */
  minDropPct: number;
  /** Weekly rainfall (mm) below which rain has ~no effect on demand. */
  precipThresholdMm: number;
  /** Demand lost, as a fraction, per mm of weekly rain above the threshold. */
  dropPerMmPrecip: number;
  /** Floor on downside from rain (fraction, e.g. -0.20 = -20% max). */
  maxPrecipDropPct: number;
}

// NOT calibrated to real LUMEN sales — there's no historical POS data to fit against yet.
// Temperature values are placeholders in line with general beverage temperature-response
// patterns (demand accelerating above ~18-20°C). Precipitation values assume rain mainly
// hurts occasions tied to being outdoors/commuting (DTC impulse buys, gym foot traffic)
// more than planned retail restocking — a guess, not a fitted effect. Replace both with a
// regression fit once real weekly sales + weather history exists; until then, treat
// forecastWeeklyUnits() output as illustrative, not a number to put in front of the CFO/CMO.
export const DEFAULT_PARAMS: WeatherDemandParams = {
  baselineTempC: 15,
  upliftPerDegree: 0.02,
  maxUpliftPct: 0.35,
  minDropPct: -0.15,
  precipThresholdMm: 10,
  dropPerMmPrecip: 0.004,
  maxPrecipDropPct: -0.2,
};

export function temperatureMultiplier(
  avgTempC: number,
  params: WeatherDemandParams = DEFAULT_PARAMS
): number {
  const delta = avgTempC - params.baselineTempC;
  const raw = delta * params.upliftPerDegree;
  const clamped = Math.min(params.maxUpliftPct, Math.max(params.minDropPct, raw));
  return 1 + clamped;
}

export function precipitationMultiplier(
  totalPrecipMm: number,
  params: WeatherDemandParams = DEFAULT_PARAMS
): number {
  const excess = Math.max(0, totalPrecipMm - params.precipThresholdMm);
  const raw = -excess * params.dropPerMmPrecip;
  const clamped = Math.max(params.maxPrecipDropPct, raw);
  return 1 + clamped;
}

/** Combined temperature x rain multiplier for a week's average weather. */
export function weatherDemandMultiplier(
  avgTempC: number,
  totalPrecipMm: number,
  params: WeatherDemandParams = DEFAULT_PARAMS
): number {
  return temperatureMultiplier(avgTempC, params) * precipitationMultiplier(totalPrecipMm, params);
}

export interface WeatherForecast {
  region: Region;
  weekStartISO: string;
  avgTempC: number;
  totalPrecipMm: number;
  multiplier: number;
  forecastUnits: number;
}

/**
 * Adjusts a baseline weekly unit forecast (e.g. the pricing simulator's
 * monthly estimate / ~4.33) using the region's forecast/historical average temperature
 * and total rainfall.
 */
export async function forecastWeeklyUnits(
  baseWeeklyUnits: number,
  region: Region,
  weekStartISO: string,
  params: WeatherDemandParams = DEFAULT_PARAMS
): Promise<WeatherForecast> {
  const { avgTempC, totalPrecipMm } = await getWeeklyWeather(region, weekStartISO);
  const multiplier = weatherDemandMultiplier(avgTempC, totalPrecipMm, params);
  return {
    region,
    weekStartISO,
    avgTempC,
    totalPrecipMm,
    multiplier,
    forecastUnits: Math.round(baseWeeklyUnits * multiplier),
  };
}
