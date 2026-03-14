import { Request, Response } from "express";
import {
  isYahooRateLimitError,
  runYahooRequest,
  yahooFinance,
} from "../utils/yahooRequest";
import type { SearchResult } from "../types/yahoo";

const NEWS_CACHE_TTL_MS = 3 * 60_000;
const newsCache = new Map<
  string,
  { timestamp: number; data: SearchResult["news"] }
>();

export const getStockNews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const cacheKey = symbol.toUpperCase();
  const now = Date.now();
  const cached = newsCache.get(cacheKey);
  if (cached && now - cached.timestamp < NEWS_CACHE_TTL_MS) {
    res.status(200).json(cached.data ?? []);
    return;
  }

  try {
    const data: SearchResult = await runYahooRequest(
      () => yahooFinance.search(symbol),
      0,
    );

    if (!data || !data.news) {
      res.status(200).json([]);
      return;
    }

    newsCache.set(cacheKey, { timestamp: now, data: data.news });
    res.status(200).json(data.news);
  } catch (error: unknown) {
    console.error(
      `Error fetching news for ${symbol}:`,
      (error as Error).message,
    );
    if (isYahooRateLimitError(error)) {
      if (cached) {
        res.status(200).json(cached.data ?? []);
        return;
      }
      res.status(200).json([]);
      return;
    }
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
};
