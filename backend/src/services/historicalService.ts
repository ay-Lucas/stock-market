import { fetchPolygonHistoricalData } from "../providers/polygonProvider";
import { fetchYahooHistoricalData } from "../providers/yahooProvider";
import { YahooInterval } from "@shared/types/yahoo";
import { isYahooInterval } from "../utils/intervalUtils";
import { HistoricalData } from "@shared/types/stock";
import { ChartResultArray } from "yahoo-finance2/dist/esm/src/modules/chart";
import { PolygonAggregateBarResponse } from "@shared/types/polygon";

export const fetchHistoricalData = async (
  symbol: string,
  from: string,
  to: string,
  interval: string,
  multiplier?: number,
): Promise<HistoricalData | undefined> => {
  // Use Yahoo Finance if interval matches
  if (isYahooInterval(interval)) {
    try {
      const yahooData: ChartResultArray = await fetchYahooHistoricalData(
        symbol,
        from,
        to,
        interval as YahooInterval,
      );

      // Transform Yahoo Finance response into UnifiedHistoricalData format
      return {
        meta: {
          symbol: yahooData.meta.symbol,
          currency: yahooData.meta.currency,
          exchangeName: yahooData.meta.exchangeName,
        },
        results: yahooData.quotes?.map((quote) => ({
          c: quote.close ?? 0,
          h: quote.high ?? 0,
          l: quote.low ?? 0,
          o: quote.open ?? 0,
          t: new Date(quote.date).getTime() ?? 0,
          v: quote.volume ?? 0,
        })),
      };
    } catch (yahooError) {
      console.error(
        `Error fetching historical data from Yahoo Finance: ${(yahooError as Error).message}`,
      );
    }
  }

  // Use Polygon for other intervals
  try {
    const polygonData: PolygonAggregateBarResponse =
      await fetchPolygonHistoricalData(
        symbol,
        from,
        to,
        interval,
        multiplier ?? 1,
      );

    // Transform Polygon response into UnifiedHistoricalData format
    return {
      ticker: polygonData.ticker,
      results: polygonData.results.map((result) => ({
        c: result.c,
        h: result.h,
        l: result.l,
        o: result.o,
        t: result.t,
        v: result.v,
      })),
      status: polygonData.status,
    };
  } catch (polygonError) {
    console.error(
      `Error fetching historical data from Polygon: ${(polygonError as Error).message}`,
    );
  }

  // Return undefined if both calls fail
  return undefined;
};
