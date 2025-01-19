import { Request, Response, NextFunction } from "express";
import {
  isPolygonInterval,
  isYahooInterval,
  polygonIntervals,
  yahooIntervals,
} from "../utils/intervalUtils";

export const validateHistoricalQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { interval, multiplier } = req.query;
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
  next();
};
