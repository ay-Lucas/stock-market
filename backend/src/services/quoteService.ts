import { fetchPolygonQuote } from "../providers/polygonProvider";
import { fetchYahooStockQuote } from "../providers/yahooProvider";
import { StockData } from "../types/stock";

export const fetchStockQuote = async (symbol: string): Promise<StockData> => {
  try {
    return await fetchPolygonQuote(symbol); // Primary provider
  } catch (polygonError) {
    console.error(
      `Error fetching quote from Polygon: ${(polygonError as Error).message}`,
    );
    return await fetchYahooStockQuote(symbol); // Fallback provider
  }
};
