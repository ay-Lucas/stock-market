export type YahooInterval =
  | "1m" // (requires premium)
  | "2m" // (requires premium)
  | "5m" // (requires premium)
  | "15m" // (requires premium)
  | "30m" // (requires premium)
  | "60m"
  | "90m"
  | "1h"
  | "1d"
  | "5d"
  | "1wk"
  | "1mo"
  | "3mo";

export type YahooScreenerId =
  | "aggressive_small_caps"
  | "conservative_foreign_funds"
  | "day_gainers"
  | "day_losers"
  | "growth_technology_stocks"
  | "high_yield_bond"
  | "most_actives"
  | "most_shorted_stocks"
  | "portfolio_anchors"
  | "small_cap_gainers"
  | "solid_large_growth_funds"
  | "solid_midcap_growth_funds"
  | "top_mutual_funds"
  | "undervalued_growth_stocks"
  | "undervalued_large_caps";

// Re-export the type from Yahoo Finance
export {
  SearchResult,
  ScreenerResult,
  DailyGainersResult,
  RecommendationsBySymbolResponseArray,
  HistoricalDividendsResult,
  QuoteSummaryResult,
  InsightsResult,
  OptionsResult,
  TrendingSymbolsResult,
} from "../../backend/src/types/yahoo";
