import { Request, Response, NextFunction } from "express";
import {
  yahooIntervals,
  polygonIntervals,
  isPolygonInterval,
  isYahooInterval,
} from "../utils/intervalUtils";

export const validateHistoricalQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { symbol } = req.params;
  const { from, to, interval, multiplier } = req.query;

  // Ensure the symbol is provided in the URL
  if (!symbol) {
    return res.status(400).json({
      error: "Missing required parameter: symbol",
    });
  }

  // Ensure required query parameters are present
  if (!from || !to || !interval) {
    return res.status(400).json({
      error: "Missing required query parameters: from, to, interval",
    });
  }
  // Validate `from` and `to` as dates
  const startDate = new Date(from as string);
  const endDate = new Date(to as string);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res
      .status(400)
      .json({ error: "`from` and `to` must be valid dates" });
  }

  if (startDate > endDate) {
    return res
      .status(400)
      .json({ error: "`from` date cannot be after `to` date" });
  }

  // Validate `interval`
  if (
    !isYahooInterval(interval as string) &&
    !isPolygonInterval(interval as string)
  ) {
    return res.status(400).json({
      error: `Invalid interval. Allowed values are: ${[
        ...yahooIntervals,
        ...polygonIntervals,
      ].join(", ")}`,
    });
  }

  // Validate multiplier if the interval is a Polygon interval
  if (isPolygonInterval(interval as string)) {
    if (!multiplier) {
      return res.status(400).json({
        error: "Multiplier is required for Polygon intervals",
      });
    }

    const multiplierNumber = parseInt(multiplier as string);
    if (isNaN(multiplierNumber) || multiplierNumber <= 0) {
      return res.status(400).json({
        error: "`multiplier` must be a positive integer",
      });
    }
  }

  next();
};
