import { dataset as defaultDataset, type LumenDataset } from "@/lib/engine/dataset";
import type { Segment } from "@/lib/types";

// Combines three exhibits the dashboard otherwise leaves on the table:
// the German survey (Exhibit 4), the Van Westendorp thresholds (Exhibit 10)
// and the qualitative verbatims (Exhibit 5) — including where the last two
// disagree, which the brief explicitly calls out as worth reconciling.

export type PriceVerdict = "comfortable" | "acceptable" | "stretch" | "rejected";

export interface SegmentReading {
  segment: Segment;
  respondentCount: number;
  sharePct: number;
  avgIntent: number;
  avgPriceSensitivity: number;
  avgMonthlySpendEur: number;
  preferredChannel: string;
  thresholds: {
    cheapEur: number;
    expensiveEur: number;
    tooExpensiveEur: number;
  } | null;
  /** Share of this segment's own respondents still within their personal
   *  "expensive" threshold at the current price — a per-respondent rate,
   *  not a verdict read off segment averages. */
  acceptancePct: number;
  verdict: PriceVerdict;
  quotes: { sentiment: "positive" | "negative" | "mixed"; quote: string }[];
  /** Set when the verbatims lean more negative than the survey score does. */
  qualQuantTension: string | null;
}

function verdictFor(
  priceEur: number,
  t: { cheapEur: number; expensiveEur: number; tooExpensiveEur: number } | null
): PriceVerdict {
  if (!t) return "acceptable";
  if (priceEur <= t.cheapEur) return "comfortable";
  if (priceEur <= t.expensiveEur) return "acceptable";
  if (priceEur <= t.tooExpensiveEur) return "stretch";
  return "rejected";
}

export function readSegments(
  priceEur: number,
  dataset: LumenDataset = defaultDataset
): SegmentReading[] {
  const totalRespondents = dataset.segmentProfiles.reduce(
    (s, p) => s + p.respondentCount,
    0
  );

  return dataset.segmentProfiles.map((profile) => {
    const segment = profile.segment as Segment;
    const vw = profile.avgVanWestendorp;
    const thresholds = vw
      ? {
          cheapEur: vw.cheapEur,
          expensiveEur: vw.expensiveEur,
          tooExpensiveEur: vw.tooExpensiveEur,
        }
      : null;

    const segmentRows = dataset.priceSensitivitySurvey.filter(
      (r) => r.segment === segment
    );
    const acceptancePct =
      segmentRows.length > 0
        ? (segmentRows.filter((r) => priceEur <= r.expensiveEur).length /
            segmentRows.length) *
          100
        : 0;

    const quotes = dataset.customerQuotes
      .filter((q) => q.segment === segment)
      .map((q) => ({
        sentiment: q.sentiment as "positive" | "negative" | "mixed",
        quote: q.quote,
      }));

    // The reconciliation the brief asks for: a mid-to-high survey intent
    // score sitting next to verbatims that are mostly negative or
    // conditional is a signal the quantitative number is flattering.
    const negativeish = quotes.filter(
      (q) => q.sentiment === "negative" || q.sentiment === "mixed"
    ).length;
    const qualQuantTension =
      quotes.length > 0 && negativeish / quotes.length >= 0.6 && profile.avgLumenPurchaseIntent1To10 >= 5
        ? `Survey intent reads ${profile.avgLumenPurchaseIntent1To10.toFixed(1)}/10, but ${negativeish} of ${quotes.length} verbatims from this segment are negative or conditional — treat the score as the optimistic end of the range.`
        : null;

    const preferredChannel =
      Object.entries(profile.preferredChannelShare).sort(
        (a, b) => (b[1] as number) - (a[1] as number)
      )[0]?.[0] ?? "—";

    return {
      segment,
      respondentCount: profile.respondentCount,
      sharePct:
        totalRespondents > 0
          ? (profile.respondentCount / totalRespondents) * 100
          : 0,
      avgIntent: profile.avgLumenPurchaseIntent1To10,
      avgPriceSensitivity: profile.avgPriceSensitivity1To10,
      avgMonthlySpendEur: profile.avgMonthlyBeverageSpendEur,
      preferredChannel,
      thresholds,
      acceptancePct,
      verdict: verdictFor(priceEur, thresholds),
      quotes,
      qualQuantTension,
    };
  });
}
