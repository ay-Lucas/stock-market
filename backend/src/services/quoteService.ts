import { PolygonAggregateBar } from "@shared/types/polygon";
import { StockData } from "@shared/types/stock";
import {
  fetchPolygonHistoricalData,
  fetchPolygonQuote,
} from "../providers/polygonProvider";
import { fetchYahooStockQuote } from "../providers/yahooProvider";
import { isYahooRateLimitError } from "../utils/yahooRequest";

const QUOTE_CACHE_TTL_MS = 2 * 60_000;
const quoteCache = new Map<string, { timestamp: number; data: StockData }>();

const buildQuoteFromPolygonBars = (
  symbol: string,
  bars: PolygonAggregateBar[] = [],
): StockData => {
  if (!bars.length) {
    throw new Error(`No aggregate bars returned for ${symbol}`);
  }

  const sorted = [...bars].sort((a, b) => a.t - b.t);
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : undefined;

  return {
    currentPrice: latest.c ?? 0,
    highPrice: latest.h ?? 0,
    lowPrice: latest.l ?? 0,
    openPrice: latest.o ?? 0,
    previousClose: previous?.c ?? latest.o ?? 0,
    timestamp: new Date(latest.t).toISOString(),
  };
};

export const fetchStockQuote = async (symbol: string): Promise<StockData> => {
  const uppercaseSymbol = symbol.toUpperCase();
  const now = Date.now();
  const cached = quoteCache.get(uppercaseSymbol);
  let polygonSnapshotUnauthorized = false;
  if (cached && now - cached.timestamp < QUOTE_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const quote = await fetchPolygonQuote(uppercaseSymbol); // Primary provider
    quoteCache.set(uppercaseSymbol, { timestamp: now, data: quote });
    return quote;
  } catch (polygonError) {
    const polygonMessage = (polygonError as Error).message ?? "";
    console.error(
      `Error fetching quote from Polygon snapshot: ${polygonMessage}`,
    );
    if (
      polygonMessage.toLowerCase().includes("not_authorized") ||
      polygonMessage.toLowerCase().includes("not entitled")
    ) {
      polygonSnapshotUnauthorized = true;
    }
  }

  try {
    const quote = await fetchYahooStockQuote(uppercaseSymbol); // Fallback provider
    quoteCache.set(uppercaseSymbol, { timestamp: now, data: quote });
    return quote;
  } catch (yahooError) {
    const level = isYahooRateLimitError(yahooError) ? "warn" : "error";
    console[level](
      `Error fetching quote from Yahoo: ${(yahooError as Error).message}`,
    );
  }

  if (!polygonSnapshotUnauthorized) {
    try {
      const to = new Date();
      const from = new Date(to);
      from.setDate(to.getDate() - 10);
      const aggregateResponse = await fetchPolygonHistoricalData(
        uppercaseSymbol,
        from.toISOString(),
        to.toISOString(),
        "day",
        1,
      );
      const quote = buildQuoteFromPolygonBars(
        uppercaseSymbol,
        aggregateResponse.results,
      );
      quoteCache.set(uppercaseSymbol, { timestamp: now, data: quote });
      return quote;
    } catch (aggregateError) {
      console.error(
        `Error fetching quote from Polygon aggregates: ${(aggregateError as Error).message}`,
      );
    }
  }

  if (cached) {
    return cached.data;
  }

  throw new Error(`Failed to fetch quote for ${uppercaseSymbol}`);
};
