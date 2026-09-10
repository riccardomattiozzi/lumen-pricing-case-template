// Converts the 12 raw CSVs in data/ into clean, typed, PII-free JSON under
// data/processed/, and writes data/processed/DATA_QUALITY.md documenting
// every anomaly found and exactly how it was handled — run via `npm run
// build-data`. Re-run whenever a CSV in data/ changes.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

const DATA_DIR = join(__dirname, "..", "data");
const OUT_DIR = join(DATA_DIR, "processed");
mkdirSync(OUT_DIR, { recursive: true });

function loadCsv(filename: string): Record<string, string>[] {
  const raw = readFileSync(join(DATA_DIR, filename), "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

function writeJson(filename: string, data: unknown) {
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(data, null, 2) + "\n");
}

const num = (v: string) => Number(v);
const bool = (v: string) => v.trim().toLowerCase() === "true";
const round = (v: number, decimals = 2) => {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
};

// ---------------------------------------------------------------------------
// Anomaly handling — dedupe exact-duplicate rows, log what was removed.
// ---------------------------------------------------------------------------
function dedupe<T>(rows: T[]): { clean: T[]; removed: T[] } {
  const seen = new Set<string>();
  const clean: T[] = [];
  const removed: T[] = [];
  for (const row of rows) {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      removed.push(row);
    } else {
      seen.add(key);
      clean.push(row);
    }
  }
  return { clean, removed };
}

interface SpikeCap {
  weekStartDate: string;
  country: string;
  channel: string;
  originalUnits: number;
  cappedUnits: number;
  originalRevenueEur: number;
  cappedRevenueEur: number;
  zScore: number;
}

const Z_SCORE_CAP_THRESHOLD = 2.5;

function handleWeeklySalesAnomalies(
  rows: {
    weekStartDate: string;
    country: string;
    channel: string;
    unitsSold: number;
    revenueEur: number;
    promoActive: boolean;
  }[]
): { clean: typeof rows; caps: SpikeCap[] } {
  // Group by (country, channel) — a demand spike shared across several
  // series in the same week reads as a real, synchronized event; an
  // outlier isolated to one series alone is more likely just noise, so we
  // only cap weeks that are top-outliers in more than one series.
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${r.country}|${r.channel}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const topOutlierWeek = new Map<string, number>();
  const zByRow = new Map<(typeof rows)[number], number>();

  for (const series of groups.values()) {
    const values = series.map((r) => r.unitsSold);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(
      values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
    );
    let bestWeek = "";
    let bestZ = -Infinity;
    for (const r of series) {
      const z = sd > 0 ? (r.unitsSold - mean) / sd : 0;
      zByRow.set(r, z);
      if (z > bestZ) {
        bestZ = z;
        bestWeek = r.weekStartDate;
      }
    }
    topOutlierWeek.set(bestWeek, (topOutlierWeek.get(bestWeek) ?? 0) + 1);
  }

  // The spike week: the single week that is the top-outlier in more than
  // one (country, channel) series at once.
  const spikeWeek = [...topOutlierWeek.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const caps: SpikeCap[] = [];
  const clean = rows.map((r) => {
    const z = zByRow.get(r) ?? 0;
    if (r.weekStartDate === spikeWeek && z > Z_SCORE_CAP_THRESHOLD) {
      const series = groups.get(`${r.country}|${r.channel}`)!;
      const values = series.map((s) => s.unitsSold);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const sd = Math.sqrt(
        values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
      );
      const cappedUnits = Math.round(mean + Z_SCORE_CAP_THRESHOLD * sd);
      const unitPrice = r.revenueEur / r.unitsSold;
      const cappedRevenue = Math.round(cappedUnits * unitPrice * 100) / 100;
      caps.push({
        weekStartDate: r.weekStartDate,
        country: r.country,
        channel: r.channel,
        originalUnits: r.unitsSold,
        cappedUnits,
        originalRevenueEur: r.revenueEur,
        cappedRevenueEur: cappedRevenue,
        zScore: Math.round(z * 100) / 100,
      });
      return { ...r, unitsSold: cappedUnits, revenueEur: cappedRevenue };
    }
    return r;
  });

  return { clean, caps };
}

// ---------------------------------------------------------------------------
// 1. market_context.csv
// ---------------------------------------------------------------------------
const marketContext = loadCsv("market_context.csv").map((r) => ({
  dimensionType: r.dimension_type as "subcategory" | "region",
  name: r.name,
  metric: r.metric,
  value: num(r.value),
  unit: r.unit,
  year: num(r.year),
  notes: r.notes,
}));
writeJson("marketContext.json", marketContext);

// ---------------------------------------------------------------------------
// 2. competitor_prices_by_channel.csv
// ---------------------------------------------------------------------------
const competitorPricesByChannel = loadCsv(
  "competitor_prices_by_channel.csv"
).map((r) => ({
  competitor: r.competitor,
  positioning: r.positioning,
  channel: r.channel,
  format: r.format,
  priceEur: num(r.price_eur),
  marketingSpendIndex: num(r.marketing_spend_index_0_100),
}));
writeJson("competitorPricesByChannel.json", competitorPricesByChannel);

// ---------------------------------------------------------------------------
// 3. competitor_price_history.csv
// ---------------------------------------------------------------------------
const competitorPriceHistory = loadCsv("competitor_price_history.csv").map(
  (r) => ({
    competitor: r.competitor,
    month: r.month,
    listPriceEur: num(r.list_price_eur),
    promoActive: bool(r.promo_active),
    promoDiscountPct: num(r.promo_discount_pct),
    shelfPriceEur: num(r.shelf_price_eur),
  })
);
writeJson("competitorPriceHistory.json", competitorPriceHistory);

// ---------------------------------------------------------------------------
// 4. customer_survey.csv — PII STRIPPED (first_name, last_name, email dropped)
// ---------------------------------------------------------------------------
const rawSurvey = loadCsv("customer_survey.csv");
const customerSurvey = rawSurvey.map((r) => ({
  respondentId: num(r.respondent_id),
  segment: r.segment,
  age: num(r.age),
  city: r.city,
  purchaseFrequencyPerMonth: num(r.purchase_frequency_per_month),
  monthlyBeverageSpendEur: num(r.monthly_beverage_spend_eur),
  priceSensitivity1To10: num(r.price_sensitivity_1_10),
  preferredChannel: r.preferred_channel,
  awarePulsup: r.aware_pulsup === "1",
  awareMatelibre: r.aware_matelibre === "1",
  awareVoltfit: r.aware_voltfit === "1",
  awareRootandrise: r.aware_rootandrise === "1",
  lumenPurchaseIntent1To10: num(r.lumen_purchase_intent_1_10),
}));
writeJson("customerSurvey.json", customerSurvey);
const piiFieldsPresent = rawSurvey.some(
  (r) => "first_name" in r || "last_name" in r || "email" in r
);

// ---------------------------------------------------------------------------
// 5. customer_quotes.csv
// ---------------------------------------------------------------------------
const customerQuotes = loadCsv("customer_quotes.csv").map((r) => ({
  segment: r.segment,
  sentiment: r.sentiment as "positive" | "negative" | "mixed",
  quote: r.quote,
}));
writeJson("customerQuotes.json", customerQuotes);

// ---------------------------------------------------------------------------
// 6. historical_sales_weekly.csv — dedupe + spike-week capping
// ---------------------------------------------------------------------------
const rawWeeklySales = loadCsv("historical_sales_weekly.csv").map((r) => ({
  weekStartDate: r.week_start_date,
  country: r.country,
  channel: r.channel,
  unitsSold: num(r.units_sold),
  revenueEur: num(r.revenue_eur),
  promoActive: bool(r.promo_active),
}));
const { clean: dedupedSales, removed: removedDuplicates } =
  dedupe(rawWeeklySales);
const { clean: historicalSalesWeekly, caps: spikeCaps } =
  handleWeeklySalesAnomalies(dedupedSales);
writeJson("historicalSalesWeekly.json", historicalSalesWeekly);

// ---------------------------------------------------------------------------
// 7. marketing_funnel_monthly.csv
// ---------------------------------------------------------------------------
const marketingFunnelMonthly = loadCsv("marketing_funnel_monthly.csv").map(
  (r) => ({
    month: r.month,
    channel: r.channel,
    reach: num(r.reach),
    engagements: num(r.engagements),
    conversions: num(r.conversions_customers_acquired),
    spendEur: num(r.spend_eur),
    cacEur: num(r.cac_eur),
    ltvEstimateEur: num(r.ltv_estimate_eur),
  })
);
writeJson("marketingFunnelMonthly.json", marketingFunnelMonthly);

// ---------------------------------------------------------------------------
// 8. cost_breakdown.csv — last row is a KPI annotation, not a cost line
// ---------------------------------------------------------------------------
const rawCostBreakdown = loadCsv("cost_breakdown.csv");
const costComponents = rawCostBreakdown
  .filter((r) => !r.cost_component.startsWith("["))
  .map((r) => ({
    component: r.cost_component,
    costPerUnitEur: num(r.cost_per_unit_eur),
    pctOfTotal: num(r.pct_of_total),
  }));
const totalRow = costComponents.find((c) =>
  c.component.toUpperCase().startsWith("TOTAL")
);
const kpiRow = rawCostBreakdown.find((r) => r.cost_component.startsWith("["));
writeJson("costBreakdown.json", {
  components: costComponents.filter((c) => c !== totalRow),
  totalCogsPerUnitEur: totalRow?.costPerUnitEur ?? 0,
  blendedGrossMarginPctHomeMarkets: kpiRow ? num(kpiRow.cost_per_unit_eur) : 0,
});

// ---------------------------------------------------------------------------
// 9. channel_economics.csv
// ---------------------------------------------------------------------------
const channelEconomics = loadCsv("channel_economics.csv").map((r) => ({
  channel: r.channel,
  illustrativeRetailPriceEur: num(r.illustrative_retail_price_eur),
  retailerMarginPct: num(r.retailer_margin_pct),
  distributorCutPct: num(r.distributor_cut_pct),
  paymentProcessingPct: num(r.payment_processing_pct),
  fulfillmentCostEur: num(r.fulfillment_cost_eur),
  netPriceToLumenEur: num(r.net_price_to_lumen_eur),
  unitContributionEur: num(r.unit_contribution_eur),
}));
writeJson("channelEconomics.json", channelEconomics);

// ---------------------------------------------------------------------------
// 10. price_sensitivity_survey.csv
// ---------------------------------------------------------------------------
const priceSensitivitySurvey = loadCsv("price_sensitivity_survey.csv").map(
  (r) => ({
    respondentId: num(r.respondent_id),
    segment: r.segment,
    tooCheapEur: num(r.too_cheap_eur),
    cheapEur: num(r.cheap_eur),
    expensiveEur: num(r.expensive_eur),
    tooExpensiveEur: num(r.too_expensive_eur),
  })
);
writeJson("priceSensitivitySurvey.json", priceSensitivitySurvey);

// ---------------------------------------------------------------------------
// 11. price_test_results.csv
// ---------------------------------------------------------------------------
const priceTestResults = loadCsv("price_test_results.csv").map((r) => ({
  priceEur: num(r.price_eur),
  channel: r.channel,
  estimatedAcceptancePctOfSurvey: num(r.estimated_acceptance_pct_of_survey),
  netPriceToLumenEur: num(r.net_price_to_lumen_eur),
  unitContributionEur: num(r.unit_contribution_eur),
  contributionMarginPct: num(r.contribution_margin_pct),
}));
writeJson("priceTestResults.json", priceTestResults);

// ---------------------------------------------------------------------------
// 12. seasonality_and_weather.csv
// ---------------------------------------------------------------------------
const seasonalityAndWeather = loadCsv("seasonality_and_weather.csv").map(
  (r) => ({
    month: num(r.month),
    seasonalityIndex: num(r.seasonality_index_100_avg),
    avgTempCelsius: num(r.avg_temp_germany_celsius),
  })
);
writeJson("seasonalityAndWeather.json", seasonalityAndWeather);

// ---------------------------------------------------------------------------
// Derived: per-segment profile, combining customer_survey + price_sensitivity
// ---------------------------------------------------------------------------
const SEGMENTS = [...new Set(customerSurvey.map((r) => r.segment))];
const CHANNELS = ["DTC Online", "Retail/Grocery", "Gym & Office"];
const COMPETITORS = ["PulsUp", "Mate Libre", "VoltFit", "Root & Rise"];

const segmentProfiles = SEGMENTS.map((segment) => {
  const respondents = customerSurvey.filter((r) => r.segment === segment);
  const n = respondents.length;
  const avg = (f: (r: (typeof respondents)[number]) => number) =>
    respondents.reduce((sum, r) => sum + f(r), 0) / n;

  const preferredChannelShare = Object.fromEntries(
    CHANNELS.map((c) => [
      c,
      round(respondents.filter((r) => r.preferredChannel === c).length / n, 4),
    ])
  );
  const brandAwareness = {
    PulsUp: round(respondents.filter((r) => r.awarePulsup).length / n, 4),
    "Mate Libre": round(
      respondents.filter((r) => r.awareMatelibre).length / n,
      4
    ),
    VoltFit: round(respondents.filter((r) => r.awareVoltfit).length / n, 4),
    "Root & Rise": round(
      respondents.filter((r) => r.awareRootandrise).length / n,
      4
    ),
  };

  const sensitivityRows = priceSensitivitySurvey.filter(
    (r) => r.segment === segment
  );
  const avgVanWestendorp =
    sensitivityRows.length > 0
      ? {
          tooCheapEur: round(
            sensitivityRows.reduce((s, r) => s + r.tooCheapEur, 0) /
              sensitivityRows.length
          ),
          cheapEur: round(
            sensitivityRows.reduce((s, r) => s + r.cheapEur, 0) /
              sensitivityRows.length
          ),
          expensiveEur: round(
            sensitivityRows.reduce((s, r) => s + r.expensiveEur, 0) /
              sensitivityRows.length
          ),
          tooExpensiveEur: round(
            sensitivityRows.reduce((s, r) => s + r.tooExpensiveEur, 0) /
              sensitivityRows.length
          ),
        }
      : null;

  return {
    segment,
    respondentCount: n,
    avgAge: round(avg((r) => r.age), 1),
    avgPurchaseFrequencyPerMonth: round(avg((r) => r.purchaseFrequencyPerMonth)),
    avgMonthlyBeverageSpendEur: round(avg((r) => r.monthlyBeverageSpendEur)),
    avgPriceSensitivity1To10: round(avg((r) => r.priceSensitivity1To10), 1),
    preferredChannelShare,
    brandAwareness,
    avgLumenPurchaseIntent1To10: round(
      avg((r) => r.lumenPurchaseIntent1To10),
      1
    ),
    avgVanWestendorp,
  };
});
writeJson("segmentProfiles.json", segmentProfiles);
void COMPETITORS;

// ---------------------------------------------------------------------------
// Derived: default marketing-channel mix, weighted by historical avg spend
// share per channel — used by the engine's blended-CAC calculation so the
// UI doesn't need 4 more sliders for it.
// ---------------------------------------------------------------------------
const marketingChannels = [
  ...new Set(marketingFunnelMonthly.map((r) => r.channel)),
];
const totalSpendByChannel = Object.fromEntries(
  marketingChannels.map((c) => [
    c,
    marketingFunnelMonthly
      .filter((r) => r.channel === c)
      .reduce((s, r) => s + r.spendEur, 0),
  ])
);
const totalSpend = Object.values(totalSpendByChannel).reduce(
  (a, b) => a + b,
  0
);
const defaultMarketingChannelMix = Object.fromEntries(
  marketingChannels.map((c) => [c, round(totalSpendByChannel[c] / totalSpend, 4)])
);
writeJson("defaultMarketingChannelMix.json", defaultMarketingChannelMix);

// ---------------------------------------------------------------------------
// DATA_QUALITY.md — human-readable audit trail
// ---------------------------------------------------------------------------
const md = `# Data quality report

Generated by \`scripts/build-data.ts\`. Re-generate by running \`npm run build-data\`.

## PII

\`data/customer_survey.csv\` contains \`first_name\`, \`last_name\`, \`email\`.
${piiFieldsPresent ? "Confirmed present in the raw CSV" : "Not found in the raw CSV"} —
all three are dropped before writing \`customerSurvey.json\`. None of the
processed files under \`data/processed/\` contain any of those three fields.

## Exact-duplicate rows

\`historical_sales_weekly.csv\` contained **${removedDuplicates.length}** exact
duplicate rows (same week, country, channel, units, revenue, promo flag —
almost certainly a duplicate export, not two genuinely identical weeks).
Dropped before use:

${removedDuplicates
  .map(
    (r) =>
      `- ${r.weekStartDate} · ${r.country} · ${r.channel} · ${r.unitsSold} units`
  )
  .join("\n")}

## Demand spike week

Method: grouped weekly \`units_sold\` by (country, channel), computed a
z-score for every week within its own series, then looked for a week that
is the *top* outlier in more than one series at once — a spike isolated to
a single series reads as noise, but ${spikeCaps.length > 0 ? spikeCaps[0].weekStartDate : "n/a"}
was the top-outlier week in **${
  spikeCaps.length > 0
    ? [...new Set(spikeCaps.map((c) => `${c.country}|${c.channel}`))].length
    : 0
} of 9** country×channel series simultaneously — too synchronized to be
ordinary noise.

Decision: **winsorized, not dropped** — capped at \`mean + ${Z_SCORE_CAP_THRESHOLD}×SD\`
for that series (keeps the row and the week's other columns usable, removes
just the extreme, and revenue is recomputed at the row's own implied unit
price so the two stay internally consistent):

${spikeCaps
  .map(
    (c) =>
      `- ${c.weekStartDate} · ${c.country} · ${c.channel}: ${c.originalUnits} → ${c.cappedUnits} units ` +
      `(z=${c.zScore}), revenue €${c.originalRevenueEur} → €${c.cappedRevenueEur}`
  )
  .join("\n")}
`;
writeFileSync(join(OUT_DIR, "DATA_QUALITY.md"), md);

console.log("Data pipeline complete.");
console.log(`- Deduplicated: ${removedDuplicates.length} row(s)`);
console.log(`- Spike-capped: ${spikeCaps.length} row(s)`);
console.log(`- Segments: ${SEGMENTS.length}`);
console.log(`- PII fields stripped from customerSurvey.json`);
