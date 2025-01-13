import { PolygonAggregateBarResponse } from "@shared/types/polygon";
import { StockData } from "@shared/types/stock";

export const fetchPolygonQuote = async (symbol: string): Promise<StockData> => {
  const API_KEY = process.env.POLYGON_API_KEY;
  if (!API_KEY) {
    throw new Error("Polygon API key is missing");
  }

  const url = `https://api.polygon.io/v1/quote/${symbol}?apiKey=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    currentPrice: data.c,
    highPrice: data.h,
    lowPrice: data.l,
    openPrice: data.o,
    previousClose: data.pc,
    timestamp: new Date(data.t * 1000).toISOString(),
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
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${interval}/${from}/${to}?apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || "Unknown error from Polygon API";
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
