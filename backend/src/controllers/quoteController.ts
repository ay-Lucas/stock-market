import { Request, Response } from "express";
import { fetchStockQuote } from "../services/quoteService";
import { StockData } from "@shared/types/stock";

export const getStockQuote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    const stockData: StockData = await fetchStockQuote(symbol);

    res.status(200).json(stockData);
  } catch (error: unknown) {
    console.error(
      `Error fetching stock quote for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch stock quote" });
  }
};
