import { Request, Response } from "express";
import { fetchStockQuote } from "../services/quoteService";

export const getStockQuote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    if (!symbol) {
      res.status(400).json({ error: "Symbol parameter is required" });
    }

    const uppercaseSymbol = symbol.toUpperCase(); // Ensure symbol is uppercase
    const stockData = await fetchStockQuote(uppercaseSymbol);

    res.status(200).json(stockData);
  } catch (error: unknown) {
    console.error(
      `Error fetching stock quote for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch stock quote" });
  }
};
