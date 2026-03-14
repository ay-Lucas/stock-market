export type { SearchResult } from "yahoo-finance2/script/src/modules/search";
export type { ScreenerResult } from "yahoo-finance2/script/src/modules/screener";
export type { RecommendationsBySymbolResponseArray } from "yahoo-finance2/script/src/modules/recommendationsBySymbol";
export type { HistoricalDividendsResult } from "yahoo-finance2/script/src/modules/historical";
export type { QuoteSummaryResult } from "yahoo-finance2/script/src/modules/quoteSummary-iface";
export type { InsightsResult } from "yahoo-finance2/script/src/modules/insights";
export type { OptionsResult } from "yahoo-finance2/script/src/modules/options";
export type { TrendingSymbolsResult } from "yahoo-finance2/script/src/modules/trendingSymbols";
export type { ChartResultArray } from "yahoo-finance2/script/src/modules/chart";

// dailyGainers is deprecated in yahoo-finance2 v3; use screener(day_gainers).
export type DailyGainersResult = import("yahoo-finance2/script/src/modules/screener").ScreenerResult;
