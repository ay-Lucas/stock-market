import { PolygonAggregateBarResponse } from "@shared/types/polygon";
import { StockData } from "@shared/types/stock";

const normalizePolygonRangeDate = (value: string): string => {
  if (/^\d+$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value;
};

export const fetchPolygonQuote = async (symbol: string): Promise<StockData> => {
  const API_KEY = process.env.POLYGON_API_KEY;
  if (!API_KEY) {
    throw new Error("Polygon API key is missing");
  }

  const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Polygon API error: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
    );
  }

  const data = await response.json();
  const day = data?.ticker?.day;
  const prevDay = data?.ticker?.prevDay;
  const updated = data?.ticker?.updated;

  if (!day || !prevDay) {
    throw new Error(`Polygon API returned no quote data for ${symbol}`);
  }

  return {
    currentPrice: day.c ?? 0,
    highPrice: day.h ?? 0,
    lowPrice: day.l ?? 0,
    openPrice: day.o ?? 0,
    previousClose: prevDay.c ?? 0,
    timestamp: updated ? new Date(updated).toISOString() : new Date().toISOString(),
  };
};

/**
 * Fetch intraday historical data from Polygon.io.
 * @param symbol - Stock ticker symbol (e.g., AAPL).
 * @param multiplier - Number of units (e.g., 1).
 * @param timespan - Time unit (e.g., 'second', 'minute').
 * @param startDate - Start date in YYYY-MM-DD format OR Unix MS Timestamps.
 * @param endDate - End date in YYYY-MM-DD format OR Unix MS Timestamps.
 * @returns A promise that resolves to an array of intraday data.
 */
export const fetchPolygonHistoricalData = async (
  symbol: string,
  from: string,
  to: string,
  interval: string,
  multiplier: number,
): Promise<PolygonAggregateBarResponse> => {
  const API_KEY = process.env.POLYGON_API_KEY;
  const normalizedFrom = normalizePolygonRangeDate(from);
  const normalizedTo = normalizePolygonRangeDate(to);
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${interval}/${normalizedFrom}/${normalizedTo}?apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const raw = await response.text();
      let errorMessage = raw || "Unknown error from Polygon API";
      try {
        const errorData = JSON.parse(raw) as { error?: string; message?: string };
        errorMessage =
          errorData.error ?? errorData.message ?? errorMessage;
      } catch {
        // Polygon sometimes responds with plain text for 4xx/5xx.
      }
      console.error(
        `Polygon API error (status ${response.status}): ${errorMessage}`,
      );
      throw new Error(`Polygon API error: ${errorMessage}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error(
      `Error fetching historical data for ${symbol}:`,
      (error as Error).message,
    );
    throw error;
  }
};
