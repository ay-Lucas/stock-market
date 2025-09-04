import { HistoricalData } from "@shared/types/stock";
import type { QuoteSummaryMinimal } from "@shared/types/yahoo";
import type { StockData } from "@shared/types/stock";

// Default to Yahoo daily candles over the last ~6 months and proxy via Next.js
export const fetchStockData = async (
  ticker: string,
  from?: Date,
  to?: Date,
  interval: string = "1d",
  multiplier?: number,
) => {
  try {
    const fromDate = from ?? new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const toDate = to ?? new Date();

    const params = new URLSearchParams({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      interval,
    });

    // If using Polygon intervals, include a multiplier (default 1)
    const polygonIntervals = [
      "second",
      "minute",
      "hour",
      "day",
      "week",
      "month",
      "quarter",
      "year",
    ];
    if (polygonIntervals.includes(interval)) {
      params.set("multiplier", String(multiplier ?? 1));
    }

    const isServer = typeof window === "undefined";
    const base = isServer
      ? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"
      : ""; // use relative URL in the browser to hit Next.js rewrite

    const response = await fetch(
      `${base}/api/stocks/${ticker}/historical?${params.toString()}`,
      { cache: "no-store" },
    );
    const result: HistoricalData = await response.json();
    return result;
  } catch (error) {
    console.error(`There was an error fetching: ${error}`);
  }
};

export const fetchQuote = async (ticker: string) => {
  try {
    const isServer = typeof window === "undefined";
    const base = isServer
      ? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"
      : "";
    const res = await fetch(`${base}/api/stocks/${ticker}/quote`, {
      cache: "no-store",
    });
    const result: StockData = await res.json();
    return result;
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
  }
};

export const fetchSummary = async (ticker: string): Promise<QuoteSummaryMinimal | undefined> => {
  try {
    const isServer = typeof window === "undefined";
    const base = isServer
      ? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"
      : "";
    const res = await fetch(`${base}/api/stocks/${ticker}/summary`, {
      cache: "no-store",
    });
    const result: QuoteSummaryMinimal = await res.json();
    return result;
  } catch (error) {
    console.error(`Error fetching summary for ${ticker}:`, error);
  }
};
