// Shared formatting for every chart and KPI — one locale, one set of
// conventions, so numbers read consistently across the whole dashboard.
// Always pass an explicit locale to toLocaleString: relying on the
// runtime default causes server/client hydration mismatches in Next.js.

export function formatEuro(value: number, decimals = 0): string {
  return `€${value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatUnits(value: number): string {
  return value.toLocaleString("de-DE");
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
