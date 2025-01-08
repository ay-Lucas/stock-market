import yahooFinance from "yahoo-finance2";

export interface StockData {
  symbol: string;
  name?: string;
  price?: number;
  currency?: string;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  quoteTime?: string;
  delay?: number;
}

export default async function fetchStockData(
  symbol: string,
): Promise<StockData> {
  try {
    const quote = await yahooFinance.quote(symbol);
    quote.nameChangeDate;

    if (!quote) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol: quote.symbol,
      name: quote.shortName,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketCap: quote.marketCap,
      quoteTime: new Date(quote.regularMarketTime ?? 0 * 1000).toISOString(), // Convert timestamp to ISO string
      delay: quote.exchangeDataDelayedBy,
    };
  } catch (error: unknown) {
    console.error(
      `Error fetching stock data for ${symbol}:`,
      (error as Error).message,
    );
    throw new Error("Failed to fetch stock data");
  }
}
