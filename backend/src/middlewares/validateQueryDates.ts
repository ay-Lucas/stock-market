import { Request, Response, NextFunction } from "express";
import { isYahooInterval } from "../utils/intervalUtils";

/**
 * Validates 'from' and 'to' query parameters as valid dates or Unix timestamps,
 * and ensures 'from' is not after 'to'.
 */
export const validateQueryDates = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let period1: string | number;
  let period2: string | number;

  const { from, to, interval } = req.query;

  if (!from || !to) {
    res
      .status(400)
      .json({ error: "'from' and 'to' query parameters are required" });
    return;
  }

  let fromDate, toDate;
  if (/^\d+$/.test(from as string) && /^\d+$/.test(to as string)) {
    fromDate = new Date(Number(from));
    toDate = new Date(Number(to));
  } else {
    fromDate = new Date(from as string);
    toDate = new Date(to as string);
  }

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    res.status(400).json({
      error: "'from' and 'to' must be valid Unix timestamps or date strings",
    });
    return;
  }

  if (isYahooInterval(interval as string)) {
    period1 = fromDate.toISOString();
    period2 = toDate.toISOString();
  } else {
    period1 = fromDate.getTime();
    period2 = toDate.getTime();
  }

  if (period1 > period2) {
    res.status(400).json({ error: "'from' date cannot be after 'to' date" });
    return;
  }

  // Attach validated and transformed periods to the request object
  req.query.period1 = period1.toString();
  req.query.period2 = period2.toString();

  next();
};
