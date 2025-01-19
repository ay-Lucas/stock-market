import { Request, Response, NextFunction } from "express";

/**
 * Ensures 'from' and 'to' are valid dates or Unix MS timestamps,
 * and 'from' is not after 'to'.
 */
export const validateQueryDates = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { from, to } = req.query;

  if (!from || !to) {
    res
      .status(400)
      .json({ error: "'from' and 'to' query parameters are required" });
    return;
  }

  const toUnixSeconds = (value: string): number => {
    const timestamp = /^\d+$/.test(value) ? Number(value) : Date.parse(value);
    return Math.floor(timestamp / 1000);
  };

  const period1 = toUnixSeconds(from as string);
  const period2 = toUnixSeconds(to as string);

  if (isNaN(period1) || isNaN(period2)) {
    res.status(400).json({
      error: "'from' and 'to' must be valid dates or Unix timestamps",
    });
    return;
  }

  if (period1 > period2) {
    res.status(400).json({ error: "'from' date cannot be after 'to' date" });
    return;
  }

  // Attach validated dates to the request object
  req.query.period1 = period1.toString();
  req.query.period2 = period2.toString();

  next();
};
