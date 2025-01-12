import { StockData } from "@shared/types/stock";

/**
 * Fetch real-time stock data for a given symbol from Finnhub API.
 * @param symbol - The stock symbol (e.g., AAPL, TSLA).
 * @returns A promise that resolves to stock data.
 */
export default async function fetchFinnhubQuote(
  symbol: string,
): Promise<StockData> {
  try {
    const API_KEY = process.env.FINNHUB_API_KEY;
    if (!API_KEY) {
      throw new Error("Finnhub API key is missing");
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching stock data: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.c) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      currentPrice: data.c,
      highPrice: data.h,
      lowPrice: data.l,
      openPrice: data.o,
      previousClose: data.pc,
      timestamp: new Date(data.t * 1000).toISOString(),
    };
  } catch (error: unknown) {
    console.error(
      `Error fetching stock data for ${symbol}:`,
      (error as Error).message,
    );
    throw new Error("Failed to fetch stock data");
  }
}
