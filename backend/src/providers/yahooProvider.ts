import yahooFinance from "yahoo-finance2";
import { StockData } from "@shared/types/stock";
import { YahooInterval } from "@shared/types/yahoo";
import { ChartResultArray } from "yahoo-finance2/dist/esm/src/modules/chart";

export const fetchYahooStockQuote = async (
  symbol: string,
): Promise<StockData> => {
  const data = await yahooFinance.quote(symbol);

  if (!data) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  return {
    currentPrice: data.regularMarketPrice ?? 0,
    highPrice: data.regularMarketDayHigh ?? 0,
    lowPrice: data.regularMarketDayLow ?? 0,
    openPrice: data.regularMarketOpen ?? 0,
    previousClose: data.regularMarketPreviousClose ?? 0,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Fetch historical stock data from Yahoo Finance.
 * @param symbol - The stock symbol (e.g., AAPL, TSLA).
 * @param startDate - Start date in YYYY-MM-DD format.
 * @param endDate - End date in YYYY-MM-DD format.
 * @param interval - Interval for the historical data.
 * @returns A promise that resolves to an array of historical data points.
 */
export const fetchYahooHistoricalData = async (
  symbol: string,
  from: string,
  to: string,
  interval: YahooInterval,
): Promise<ChartResultArray> => {
  return yahooFinance.chart(symbol, {
    period1: from,
    period2: to,
    interval,
  });
};
