import { Request, Response } from "express";
import { fetchHistoricalData } from "../services/historicalService";
import {
  isPolygonInterval,
  isYahooInterval,
  polygonIntervals,
  yahooIntervals,
} from "../utils/intervalUtils";
import { HistoricalData } from "@shared/types/stock";

export const getHistoricalData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  // period1 & period2 added and validated by middleware
  const { period1, period2, interval, multiplier } = req.query;

  // Validate `interval`
  if (
    !isYahooInterval(interval as string) &&
    !isPolygonInterval(interval as string)
  ) {
    res.status(400).json({
      error: `Invalid interval. Allowed values are: ${[
        ...yahooIntervals,
        ...polygonIntervals,
      ].join(", ")}`,
    });
    return;
  }

  // Validate multiplier if the interval is a Polygon interval
  if (isPolygonInterval(interval as string)) {
    if (!multiplier) {
      res.status(400).json({
        error: "Multiplier is required for Polygon intervals",
      });
      return;
    }

    const multiplierNumber = parseInt(multiplier as string);
    if (isNaN(multiplierNumber) || multiplierNumber <= 0) {
      res.status(400).json({
        error: "`multiplier` must be a positive integer",
      });
      return;
    }
  }

  try {
    const uppercaseSymbol = symbol.toUpperCase(); // Ensure symbol is uppercase
    const historicalData: HistoricalData | undefined =
      await fetchHistoricalData(
        uppercaseSymbol,
        period1 as string,
        period2 as string,
        interval as string,
        multiplier ? parseInt(multiplier as string, 10) : undefined,
      );

    if (!historicalData) {
      res.status(200).json({
        meta: { symbol: uppercaseSymbol },
        results: [],
        errors: ["Historical data unavailable from upstream providers"],
      } satisfies HistoricalData);
      return;
    }

    res.status(200).json(historicalData);
  } catch (error: unknown) {
    console.error(
      `Error fetching historical data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};
