import { Request, Response, NextFunction } from "express";

/**
 * Ensures they are valid dates and 'from' is not after 'to'.
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

  const period1 = Math.floor(new Date(from as string).getTime() / 1000);
  const period2 = Math.floor(new Date(to as string).getTime() / 1000);

  if (isNaN(period1) || isNaN(period2)) {
    res.status(400).json({ error: "'from' and 'to' must be valid dates" });
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
