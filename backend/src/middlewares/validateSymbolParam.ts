import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate the 'symbol' parameter in the route.
 * Ensures it is a non-empty string and converts it to uppercase.
 */
export const validateSymbolParam = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== "string") {
    res
      .status(400)
      .json({ error: "Symbol parameter is required and must be a string" });
    return;
  }

  // Ensure the symbol is uppercase
  req.params.symbol = symbol.toUpperCase();

  next();
};
