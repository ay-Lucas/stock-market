import { Request, Response } from "express";
import { fetchStockQuote } from "../services/quoteService";
import { StockData } from "@shared/types/stock";
import { isYahooRateLimitError } from "../utils/yahooRequest";

export const getStockQuote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    const stockData: StockData = await fetchStockQuote(symbol);

    res.status(200).json(stockData);
  } catch (error: unknown) {
    const message = (error as Error).message ?? "";
    const normalized = message.toLowerCase();
    if (
      isYahooRateLimitError(error) ||
      normalized.includes("not_authorized") ||
      normalized.includes("not entitled") ||
      normalized.includes("403")
    ) {
      console.warn(`Provider-limited quote fallback for ${symbol}:`, message);
      res.status(200).json({});
      return;
    }
    console.error(`Error fetching stock quote for ${symbol}:`, message);
    res.status(500).json({ error: "Failed to fetch stock quote" });
  }
};
