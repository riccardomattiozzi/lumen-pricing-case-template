// Typed access to the processed exhibits — the only place in the codebase
// that imports data/processed/*.json directly. Everything else (engine,
// charts, insights) should get data through this module or through
// useScenario(), never by importing the JSON files themselves.

import marketContext from "@/data/processed/marketContext.json";
import competitorPricesByChannel from "@/data/processed/competitorPricesByChannel.json";
import competitorPriceHistory from "@/data/processed/competitorPriceHistory.json";
import customerSurvey from "@/data/processed/customerSurvey.json";
import customerQuotes from "@/data/processed/customerQuotes.json";
import historicalSalesWeekly from "@/data/processed/historicalSalesWeekly.json";
import marketingFunnelMonthly from "@/data/processed/marketingFunnelMonthly.json";
import costBreakdown from "@/data/processed/costBreakdown.json";
import channelEconomics from "@/data/processed/channelEconomics.json";
import priceSensitivitySurvey from "@/data/processed/priceSensitivitySurvey.json";
import priceTestResults from "@/data/processed/priceTestResults.json";
import seasonalityAndWeather from "@/data/processed/seasonalityAndWeather.json";
import segmentProfiles from "@/data/processed/segmentProfiles.json";
import defaultMarketingChannelMix from "@/data/processed/defaultMarketingChannelMix.json";

import type {
  Competitor,
  MarketingChannel,
  Region,
  SalesChannel,
  Segment,
} from "@/lib/types";

export const dataset = {
  marketContext,
  competitorPricesByChannel,
  competitorPriceHistory,
  customerSurvey,
  customerQuotes,
  historicalSalesWeekly,
  marketingFunnelMonthly,
  costBreakdown,
  channelEconomics,
  priceSensitivitySurvey,
  priceTestResults,
  seasonalityAndWeather,
  segmentProfiles,
  defaultMarketingChannelMix: defaultMarketingChannelMix as Record<
    MarketingChannel,
    number
  >,
};

export type LumenDataset = typeof dataset;

export const SALES_CHANNELS: SalesChannel[] = [
  "DTC Online",
  "Retail/Grocery",
  "Gym & Office",
];

export const MARKETING_CHANNELS: MarketingChannel[] = [
  "Paid Social",
  "Influencer / Content",
  "Retail Sampling",
  "Referral / Subscription",
];

export const REGIONS: Region[] = [
  "Berlin",
  "Hamburg",
  "Munich",
  "Cologne",
  "Frankfurt",
  "Other Germany",
];

export const COMPETITORS: Competitor[] = [
  "PulsUp",
  "Mate Libre",
  "VoltFit",
  "Root & Rise",
];

export const SEGMENTS: Segment[] = [
  "Students & Budget-Conscious",
  "Fitness & Gym-Goers",
  "Urban Wellness Professionals",
  "On-the-go Commuters",
];
