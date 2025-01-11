import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { InsightsResult } from "yahoo-finance2/dist/esm/src/modules/insights";

export const getInsightsData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  try {
    const data: InsightsResult = await yahooFinance.insights(symbol);

    if (!data) {
      res.status(404).json({ error: `No insights for: ${symbol}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    const errorString = `Error fetching insights for ${symbol}:`;

    console.error(errorString, (error as Error).message);

    res.status(500).json({
      error: errorString,
    });
  }
};
