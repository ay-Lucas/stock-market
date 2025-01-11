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
  const symbolArray = symbol.split(","); //  Some routes allow an array of symbols
  const onlyAlphabetic = symbolArray.every((str) => isAlphabetic(str));
  if (!onlyAlphabetic) {
    res.status(400).json({
      error: "Symbol param must only contain uppercase alphabetic characters",
    });
    return;
  }
  next();
};

function isAlphabetic(str: string) {
  return /^[a-zA-Z]+$/.test(str);
}
