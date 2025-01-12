import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { isYahooScreenerId, validScrIds } from "../utils/screenerUtils";
import { YahooScreenerId } from "@shared/types/yahoo";
import { ScreenerResult } from "yahoo-finance2/dist/esm/src/modules/screener";

export const getScreenerData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    scrId = "day_gainers",
    count = 5,
    lang = "en-US",
    region = "US",
  } = req.query;

  if (!isYahooScreenerId(scrId as string)) {
    res.status(400).json({
      error: `Invalid scrId. Allowed values are: ${validScrIds.join(", ")}`,
    });
    return;
  }

  try {
    const data: ScreenerResult = await yahooFinance.screener({
      scrIds: scrId as YahooScreenerId,
      count: Number(count),
      lang: lang as string,
      region: region as string,
    });
    if (!data) {
      res
        .status(404)
        .json({ error: `No screener results found for: ${scrId}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching screener results for ${scrId}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch search results" });
  }
};
