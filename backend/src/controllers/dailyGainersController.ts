import { Request, Response } from "express";
import { yahooFinance } from "../utils/yahooRequest";
import type { DailyGainersResult } from "../types/yahoo";

// Only working on weekend when count = 0 or 1
// Use the screener route instead with param scrId="daily_gainers"
export const getDailyGainersData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { count } = req.query;
  const maxCount = Number(count) > 0 ? Number(count) : undefined;

  try {
    const data: DailyGainersResult = await yahooFinance.screener({
      scrIds: "day_gainers",
      count: maxCount ?? 5,
      region: "US",
      lang: "en-US",
    });

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
