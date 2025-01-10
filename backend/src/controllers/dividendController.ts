import yahooFinance from "yahoo-finance2";
import { Request, Response } from "express";

/**
 * Controller to fetch dividend history for a given stock symbol.
 */
export const getDividendHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const { period1, period2 } = req.query;

  try {
    const data = await yahooFinance.historical(symbol, {
      period1: Number(period1),
      period2: Number(period2),
      events: "dividends",
    });

    if (!data || data.length === 0) {
      res
        .status(404)
        .json({ error: `No dividend history found for symbol: ${symbol}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching dividend history for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch dividend history" });
  }
};
