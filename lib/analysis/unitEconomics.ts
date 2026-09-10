import { dataset as defaultDataset, type LumenDataset } from "@/lib/engine/dataset";
import type { SalesChannel } from "@/lib/types";

// Rebuilds the per-unit P&L for any price, from the shelf price down to what
// LUMEN actually keeps. The percentages come from data/channel_economics.csv
// and COGS from data/cost_breakdown.csv — reproducing that file's own
// net-price and contribution figures exactly at its illustrative prices,
// then generalizing to any price the user picks.
//
// This is what explains, in one view, why Retail/Grocery is the weakest
// channel: the retailer margin and distributor cut come off the top before
// LUMEN sees anything.

export interface UnitEconomicsStep {
  label: string;
  /** Signed: positive for the starting price, negative for each deduction. */
  amountEur: number;
  /** Running total after this step. */
  runningEur: number;
  kind: "start" | "deduction" | "result";
  note?: string;
}

export interface UnitEconomics {
  channel: SalesChannel;
  priceEur: number;
  netPriceToLumenEur: number;
  cogsPerUnitEur: number;
  unitContributionEur: number;
  contributionMarginPct: number;
  steps: UnitEconomicsStep[];
}

export function computeUnitEconomics(
  priceEur: number,
  channel: SalesChannel,
  dataset: LumenDataset = defaultDataset
): UnitEconomics {
  const econ = dataset.channelEconomics.find((r) => r.channel === channel);
  const cogs = dataset.costBreakdown.totalCogsPerUnitEur;

  const retailerPct = econ?.retailerMarginPct ?? 0;
  const distributorPct = econ?.distributorCutPct ?? 0;
  const paymentPct = econ?.paymentProcessingPct ?? 0;
  const fulfillment = econ?.fulfillmentCostEur ?? 0;

  const retailerCut = priceEur * retailerPct;
  const distributorCut = priceEur * distributorPct;
  const paymentCut = priceEur * paymentPct;

  const steps: UnitEconomicsStep[] = [];
  let running = priceEur;
  steps.push({
    label: "Shelf price",
    amountEur: priceEur,
    runningEur: running,
    kind: "start",
    note: "What the shopper pays",
  });

  const push = (label: string, amount: number, note?: string) => {
    if (amount <= 0) return;
    running -= amount;
    steps.push({
      label,
      amountEur: -amount,
      runningEur: running,
      kind: "deduction",
      note,
    });
  };

  push("Retailer margin", retailerCut, `${(retailerPct * 100).toFixed(0)}% of shelf price`);
  push("Distributor cut", distributorCut, `${(distributorPct * 100).toFixed(0)}% of shelf price`);
  push("Payment processing", paymentCut, `${(paymentPct * 100).toFixed(1)}% of shelf price`);
  push("Fulfilment", fulfillment, "Fixed per unit shipped");

  const netPriceToLumenEur = running;
  steps.push({
    label: "Net to LUMEN",
    amountEur: netPriceToLumenEur,
    runningEur: netPriceToLumenEur,
    kind: "result",
    note: "Revenue LUMEN actually books",
  });

  push("COGS", cogs, "Ingredients, can, co-packing, freight, duty");

  const unitContributionEur = running;
  steps.push({
    label: "Unit contribution",
    amountEur: unitContributionEur,
    runningEur: unitContributionEur,
    kind: "result",
    note: "What's left to fund marketing and overhead",
  });

  return {
    channel,
    priceEur,
    netPriceToLumenEur,
    cogsPerUnitEur: cogs,
    unitContributionEur,
    contributionMarginPct:
      priceEur > 0 ? (unitContributionEur / priceEur) * 100 : 0,
    steps,
  };
}
