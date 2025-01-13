import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { QuoteSummaryResult } from "yahoo-finance2/dist/esm/src/modules/quoteSummary-iface";

export const getEarningsData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    const data: QuoteSummaryResult = await yahooFinance.quoteSummary(symbol, {
      modules: ["earnings"],
    });

    if (!data) {
      res
        .status(404)
        .json({ error: `No earnings data found for symbol: ${symbol}` });
      return;
    }

    res.status(200).json(data.earnings);
  } catch (error: unknown) {
    console.error(
      `Error fetching earnings data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch earnings data" });
  }
};
