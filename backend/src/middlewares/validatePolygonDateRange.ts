import { Request, Response, NextFunction } from "express";

export const validatePolygonDateRange = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res
      .status(400)
      .json({ error: 'Both "from" and "to" dates are required' });
  }

  const startDate = new Date(from as string);
  const endDate = new Date(to as string);
  const today = new Date();

  // Calculate the cutoff date (2 years ago)
  const twoYearsAgo = new Date(today.setFullYear(today.getFullYear() - 2));

  // Check if the dates are valid
  if (startDate > endDate) {
    return res
      .status(400)
      .json({ error: '"from" date cannot be after "to" date' });
  }

  if (startDate < twoYearsAgo) {
    return res.status(400).json({
      error: `"from" date must be within the last 2 years. Earliest allowed date is ${twoYearsAgo.toISOString().split("T")[0]}`,
    });
  }

  if (endDate < twoYearsAgo) {
    return res.status(400).json({
      error: `"to" date must be within the last 2 years. Earliest allowed date is ${twoYearsAgo.toISOString().split("T")[0]}`,
    });
  }

  next();
};
