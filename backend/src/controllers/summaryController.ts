import { Request, Response } from "express";
import { QuoteSummaryResult } from "src/types/yahoo";
import yahooFinance from "yahoo-finance2";

export const getStockSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    const data: QuoteSummaryResult = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryProfile", "summaryDetail"],
    });

    if (!data) {
      res
        .status(404)
        .json({ error: `No summary data found for symbol: ${symbol}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching summary data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch stock summary data" });
  }
};
