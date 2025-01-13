import yahooFinance from "yahoo-finance2";
import { Request, Response } from "express";
import { HistoricalDividendsResult } from "yahoo-finance2/dist/esm/src/modules/historical";

/**
 * Controller to fetch dividend history for a given stock symbol.
 */
export const getDividendHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const { from, to } = req.query;

  try {
    const period1 = Math.floor(new Date(from as string).getTime() / 1000);
    const period2 = Math.floor(new Date(to as string).getTime() / 1000);

    const data: HistoricalDividendsResult = await yahooFinance.historical(
      symbol,
      {
        period1: period1,
        period2: period2,
        events: "dividends",
      },
    );

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
