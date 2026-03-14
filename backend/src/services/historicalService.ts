import { fetchPolygonHistoricalData } from "../providers/polygonProvider";
import { fetchYahooHistoricalData } from "../providers/yahooProvider";
import { YahooInterval } from "@shared/types/yahoo";
import { isYahooInterval } from "../utils/intervalUtils";
import { HistoricalData } from "@shared/types/stock";
import { ChartResultArray } from "yahoo-finance2/script/src/modules/chart";
import { PolygonAggregateBarResponse } from "@shared/types/polygon";
import { PolygonInterval } from "@shared/types/polygon";

const mapYahooToPolygon = (
  interval: YahooInterval,
): { interval: PolygonInterval; multiplier: number } => {
  switch (interval) {
    case "60m":
    case "1h":
      return { interval: "hour", multiplier: 1 };
    case "90m":
      return { interval: "minute", multiplier: 90 };
    case "1d":
      return { interval: "day", multiplier: 1 };
    case "5d":
      return { interval: "day", multiplier: 5 };
    case "1wk":
      return { interval: "week", multiplier: 1 };
    case "1mo":
      return { interval: "month", multiplier: 1 };
    case "3mo":
      return { interval: "month", multiplier: 3 };
    default:
      return { interval: "day", multiplier: 1 };
  }
};

export const fetchHistoricalData = async (
  symbol: string,
  from: string,
  to: string,
  interval: string,
  multiplier?: number,
): Promise<HistoricalData | undefined> => {
  let fallbackPolygonInterval: string = interval;
  let fallbackPolygonMultiplier = multiplier ?? 1;

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
          close: quote.close ?? 0,
          high: quote.high ?? 0,
          low: quote.low ?? 0,
          open: quote.open ?? 0,
          timestamp: new Date(quote.date).getTime() ?? 0,
          volume: quote.volume ?? 0,
        })),
      };
    } catch (yahooError) {
      console.error(
        `Error fetching historical data from Yahoo Finance: ${(yahooError as Error).message}`,
      );
      const mapped = mapYahooToPolygon(interval as YahooInterval);
      fallbackPolygonInterval = mapped.interval;
      fallbackPolygonMultiplier = mapped.multiplier;
    }
  }

  // Use Polygon for other intervals
  try {
    const polygonData: PolygonAggregateBarResponse =
      await fetchPolygonHistoricalData(
        symbol,
        from,
        to,
        fallbackPolygonInterval,
        fallbackPolygonMultiplier,
      );

    // Transform Polygon response into UnifiedHistoricalData format
    return {
      ticker: polygonData.ticker,
      results: polygonData.results.map((result) => ({
        close: result.c,
        high: result.h,
        low: result.l,
        open: result.o,
        timestamp: result.t,
        volume: result.v,
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
