import { Request, Response } from "express";
import type { QuoteSummaryResult } from "../types/yahoo";
import { isYahooRateLimitError, runYahooRequest } from "../utils/yahooRequest";
import { yahooFinance } from "../utils/yahooRequest";

const SUMMARY_CACHE_TTL_MS = 5 * 60_000;
const summaryCache = new Map<string, { timestamp: number; data: QuoteSummaryResult }>();

export const getStockSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const cacheKey = symbol.toUpperCase();
  const now = Date.now();
  const cached = summaryCache.get(cacheKey);
  if (cached && now - cached.timestamp < SUMMARY_CACHE_TTL_MS) {
    res.status(200).json(cached.data);
    return;
  }

  try {
    const data: QuoteSummaryResult = await runYahooRequest(
      () =>
        yahooFinance.quoteSummary(symbol, {
          modules: [
            "summaryProfile",
            "summaryDetail",
            "defaultKeyStatistics", // includes trailingEps (EPS TTM) and other key stats
          ],
        }),
      0,
    );

    if (!data) {
      res
        .status(404)
        .json({ error: `No summary data found for symbol: ${symbol}` });
      return;
    }

    summaryCache.set(cacheKey, { timestamp: now, data });
    res.status(200).json(data);
  } catch (error: unknown) {
    if (isYahooRateLimitError(error)) {
      console.warn(
        `Yahoo rate limit while fetching summary data for ${symbol}:`,
        (error as Error).message,
      );
      if (cached) {
        res.status(200).json(cached.data);
        return;
      }
      res.status(200).json({});
      return;
    }
    console.error(
      `Error fetching summary data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch stock summary data" });
  }
};
