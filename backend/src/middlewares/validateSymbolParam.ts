import { NextFunction } from "express";
import { Request, Response } from "express";

/**
 * Middleware to ensure the `symbol` parameter is in uppercase.
 */
export const validateSymbolParam = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { symbol } = req.params;

  const uppercaseSymbol = symbol.toUpperCase();

  // Check if stock symbol is uppercase
  if (symbol !== uppercaseSymbol) {
    res.status(400).json({ error: "Symbol stock ticker must be uppercase" });
    return;
  }
  next();
};

function isAlphabetic(str: string) {
  return /^[a-zA-Z]+$/.test(str);
}
