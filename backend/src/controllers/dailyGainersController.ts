import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";

// Only working on weekend when count = 0 or 1
// Use the screener route instead with param scrId="daily_gainers"
export const getDailyGainersData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { count } = req.query;

  const queryOptions = { count: Number(count) };

  try {
    const data = await yahooFinance.dailyGainers(queryOptions);

    if (!data) {
      res.status(404).json({ error: `No daily gainers` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    const errorString = `Error fetching daily gainers`;

    console.error(errorString, (error as Error).message);
    res.status(500).json({
      error: errorString,
    });
  }
};
