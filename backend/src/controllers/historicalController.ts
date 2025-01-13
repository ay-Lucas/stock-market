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
  const { from, to, interval, multiplier } = req.query;

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
        from as string,
        to as string,
        interval as string,
      );

    res.status(200).json(historicalData);
  } catch (error: unknown) {
    console.error(
      `Error fetching historical data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};
