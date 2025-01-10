import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";

export const getStockNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;

  try {
    const data = await yahooFinance.search(symbol);

    if (!data || !data.news) {
      res.status(404).json({ error: `No news found for symbol: ${symbol}` });
      return;
    }

    res.status(200).json(data.news);
  } catch (error: unknown) {
    console.error(
      `Error fetching news for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
};
