import { fetchPolygonHistoricalData } from "../providers/polygonProvider";
import { fetchYahooHistoricalData } from "../providers/yahooProvider";
import { YahooInterval } from "@shared/types/yahoo";
import { isYahooInterval } from "../utils/intervalUtils";

export const fetchHistoricalData = async (
  symbol: string,
  from: string,
  to: string,
  interval: string,
  multiplier?: number,
): Promise<any> => {
  // Use Yahoo Finance if interval matches
  if (isYahooInterval(interval as string)) {
    try {
      return await fetchYahooHistoricalData(
        symbol,
        from,
        to,
        interval as YahooInterval,
      );
    } catch (yahooError) {
      console.error(
        `Error fetching historical data from Yahoo Finance: ${(yahooError as Error).message}`,
      );
    }
  }
  // else use Polygon
  try {
    return await fetchPolygonHistoricalData(
      symbol,
      from,
      to,
      interval,
      multiplier ?? 1,
    );
  } catch (polygonError) {
    console.error(
      `Error fetching historical data from Polygon: ${(polygonError as Error).message}`,
    );
  }
};
