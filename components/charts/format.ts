// Shared formatting for every chart, KPI and panel — one locale, one set of
// conventions, so numbers read the same everywhere.
//
// en-GB, not de-DE: the interface and the case brief are both in English and
// the brief writes its own figures with dot decimals (€1.79, €9.1bn, 61.7%).
// Mixing German separators into English copy produced genuinely ambiguous
// numbers — "47.701 units" reads as forty-seven point seven to an English
// reader. Always pass an explicit locale: relying on the runtime default
// causes server/client hydration mismatches in Next.js.

const LOCALE = "en-GB";

export function formatEuro(value: number, decimals = 0): string {
  return `€${value.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatUnits(value: number): string {
  return value.toLocaleString(LOCALE);
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Month keys in the data are "YYYY-MM". Spelled out from a fixed table, not
// toLocaleString, for the same hydration reason as above.
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatMonth(yearMonth: string, style: "short" | "long" = "short"): string {
  const [year, month] = yearMonth.split("-");
  const name = MONTHS[Number(month) - 1];
  if (!name || !year) return yearMonth;
  return style === "short" ? `${name} ’${year.slice(2)}` : `${name} ${year}`;
}
