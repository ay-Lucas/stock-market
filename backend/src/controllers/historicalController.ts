import { Request, Response } from "express";
import { fetchHistoricalData } from "../services/historicalService";

export const getHistoricalData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const { from, to, interval } = req.query;

  try {
    if (!symbol) {
      res.status(400).json({ error: "Symbol parameter is required" });
    }
    if (!from || !to || !interval) {
      res.status(400).json({
        error: "Query parameters 'from', 'to', and 'interval' are required",
      });
    }

    const uppercaseSymbol = symbol.toUpperCase(); // Ensure symbol is uppercase
    const historicalData = await fetchHistoricalData(
      uppercaseSymbol,
      from as string,
      to as string,
      interval as string,
    );

    res.status(200).json(historicalData);
  } catch (error: unknown) {
    console.error(
      `Error fetching historical data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};
