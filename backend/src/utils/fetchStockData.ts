import yahooFinance from "yahoo-finance2";
export interface StockData {
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: string;
}

export interface HistoricalData {
  time: string; // ISO date
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Fetch real-time stock data for a given symbol.
 * @param symbol - The stock symbol (e.g., AAPL, TSLA).
 * @returns A promise that resolves to stock data.
 */
export default async function fetchStockData(
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

/**
 * Fetch historical stock data for a given symbol.
 * @param symbol - The stock symbol (e.g., AAPL, TSLA).
 * @param startDate - Start date in YYYY-MM-DD format.
 * @param endDate - End date in YYYY-MM-DD format.
 * @returns A promise that resolves to an array of historical data points.
 */

export async function fetchHistoricalData(
  symbol: string,
  startDate: string,
  endDate: string,
): Promise<HistoricalData[]> {
  try {
    const historical = await yahooFinance.historical(symbol, {
      period1: new Date(startDate).toISOString(),
      period2: new Date(endDate).toISOString(),
    });

    if (!historical || historical.length === 0) {
      throw new Error(`No historical data found for symbol: ${symbol}`);
    }

    return historical.map((entry) => ({
      time: entry.date.toISOString(),
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume,
    }));
  } catch (error: unknown) {
    console.error(
      `Error fetching historical data from yahoo-finance for symbol: ${symbol}:`,
      (error as Error).message,
    );
    throw new Error("Failed to fetch stock data");
  }
}
