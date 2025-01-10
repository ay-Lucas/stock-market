import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";

export const getFinancialData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    const data = await yahooFinance.quoteSummary(symbol, {
      modules: ["financialData"],
    });

    if (!data) {
      res
        .status(404)
        .json({ error: `No financial data found for symbol: ${symbol}` });
      return;
    }

    res.status(200).json(data.financialData);
  } catch (error: unknown) {
    console.error(
      `Error fetching financial data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch financial data" });
  }
};
