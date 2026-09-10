import { Fragment } from "react";
import { dataset } from "@/lib/engine/dataset";

const LINEAGE: { exhibit: string; file: string; drives: string }[] = [
  { exhibit: "1", file: "market_context.csv", drives: "Category size and the regional split behind every volume estimate" },
  { exhibit: "2", file: "competitor_prices_by_channel.csv", drives: "Competitor price bands, and the average can price that converts € to units" },
  { exhibit: "3", file: "competitor_price_history.csv", drives: "Promo cadence, which penalises noisy launch months" },
  { exhibit: "4", file: "customer_survey.csv", drives: "Segment sizes, purchase intent, purchase frequency (PII stripped at build time)" },
  { exhibit: "5", file: "customer_quotes.csv", drives: "The verbatims on the Customers tab, and the qual/quant tension flags" },
  { exhibit: "6", file: "historical_sales_weekly.csv", drives: "The home-market benchmark that sanity-checks the German projection" },
  { exhibit: "7", file: "marketing_funnel_monthly.csv", drives: "Blended CAC and LTV, weighted by historical spend share" },
  { exhibit: "8", file: "cost_breakdown.csv", drives: "COGS in the unit-economics waterfall" },
  { exhibit: "9", file: "channel_economics.csv", drives: "Retailer margin, distributor cut, payment and fulfilment deductions" },
  { exhibit: "10", file: "price_sensitivity_survey.csv", drives: "The Van Westendorp curves and per-segment acceptance thresholds" },
  { exhibit: "11", file: "price_test_results.csv", drives: "The acceptance/contribution anchors the price slider interpolates between" },
  { exhibit: "12", file: "seasonality_and_weather.csv", drives: "The demand index applied to the launch month" },
];

const LIMITATIONS = [
  "No German sales data exists. Every volume figure is an estimate from comparable markets, German survey responses and competitor benchmarks — not a measurement.",
  "The demand model doesn't cap volume by what the marketing budget can actually acquire at the blended CAC. Budget and demand are modelled separately.",
  "LTV:CAC comes from the marketing funnel alone, so it doesn't move with price or channel mix — read it as a fixed reference against the ≈3:1 target, not a lever.",
  "Stated willingness-to-pay (Van Westendorp) skews low versus real purchase behaviour. It's shown because it disagrees with the profit-optimal price, not because either one is automatically right.",
  "The CFO/CMO scoring weights are a judgment call, written as named constants in lib/recommendationEngine.ts so they're easy to find and argue with.",
];

// Long file names may wrap, but only after an underscore — never mid-word.
function breakable(file: string) {
  const parts = file.split("_");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          _<wbr />
        </>
      )}
    </Fragment>
  ));
}

export function DataProvenance() {
  const surveyRows = dataset.customerSurvey.length;
  const sensitivityRows = dataset.priceSensitivitySurvey.length;
  const salesRows = dataset.historicalSalesWeekly.length;

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="card-title">Every number here traces to a file</h3>
        <p className="card-subtitle">
          All twelve exhibits from the data room are in use. Nothing in this
          tool is a placeholder or a round number someone liked.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line-soft text-xs text-foreground-faint">
                <th scope="col" className="py-2 pr-3 font-medium">
                  <span aria-hidden>#</span>
                  <span className="sr-only">Exhibit</span>
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">File</th>
                <th scope="col" className="py-2 font-medium">What it drives</th>
              </tr>
            </thead>
            <tbody>
              {LINEAGE.map((row) => (
                <tr key={row.file} className="border-b border-line-soft last:border-0">
                  <td className="py-2.5 pr-3 align-top">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-fill px-1 text-2xs font-semibold tabular-nums text-foreground-soft">
                      {row.exhibit}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 align-top font-mono text-xs text-foreground">
                    {breakable(row.file)}
                  </td>
                  <td className="py-2.5 align-top text-foreground-soft">{row.drives}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="card-title">What we changed in the data, and why</h3>
        <ul className="mt-3 space-y-3 text-sm text-foreground-soft">
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">PII removed at build time.</strong>{" "}
            customer_survey.csv ships with name and email columns. The build
            script drops all three before writing anything to data/processed/,
            so the {surveyRows} rows the browser receives carry segment, city
            and numbers only — never an identity.
          </li>
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">4 duplicate rows dropped.</strong>{" "}
            historical_sales_weekly.csv contained four exact-duplicate rows
            (same week, country, channel, units, revenue). Almost certainly a
            duplicated export rather than two identical weeks, so they were
            removed before the {salesRows} remaining rows were used.
          </li>
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">One demand spike winsorized.</strong>{" "}
            The week of 2025-07-28 was the top statistical outlier in three of
            nine country × channel series at once — too synchronized to be
            noise. Rather than delete the week, its units were capped at
            mean + 2.5 standard deviations for each series, with revenue
            recomputed at that row&apos;s own implied unit price so the two stay
            consistent. Full detail is in data/processed/DATA_QUALITY.md.
          </li>
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">Nothing else was touched.</strong>{" "}
            The {sensitivityRows} price-sensitivity responses and all
            competitor, cost and market-context figures are used exactly as
            supplied.
          </li>
        </ul>
      </div>

      <div className="card p-5">
        <h3 className="card-title">What this model can&apos;t tell you</h3>
        <ul className="mt-3 space-y-2 text-sm text-foreground-soft">
          {LIMITATIONS.map((item) => (
            <li key={item} className="flex gap-2.5 text-pretty">
              <span aria-hidden className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-foreground-faint" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
