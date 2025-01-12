import { YahooScreenerId } from "@shared/types/yahoo";

export const validScrIds: YahooScreenerId[] = [
  "aggressive_small_caps",
  "conservative_foreign_funds",
  "day_gainers",
  "day_losers",
  "growth_technology_stocks",
  "high_yield_bond",
  "most_actives",
  "most_shorted_stocks",
  "portfolio_anchors",
  "small_cap_gainers",
  "solid_large_growth_funds",
  "solid_midcap_growth_funds",
  "top_mutual_funds",
  "undervalued_growth_stocks",
  "undervalued_large_caps",
];

export const isYahooScreenerId = (value: string): value is YahooScreenerId => {
  return validScrIds.includes(value as YahooScreenerId);
};
