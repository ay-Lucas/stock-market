import { Request, Response } from "express";
import {
  isYahooRateLimitError,
  runYahooRequest,
  yahooFinance,
} from "../utils/yahooRequest";
import { isYahooScreenerId, validScrIds } from "../utils/screenerUtils";
import { YahooScreenerId } from "@shared/types/yahoo";
import type { ScreenerResult } from "../types/yahoo";

const SCREENER_CACHE_TTL_MS = 2 * 60_000;
const screenerCache = new Map<
  string,
  { timestamp: number; data: ScreenerResult }
>();

const getFallbackScrId = (scrId: YahooScreenerId): YahooScreenerId | null => {
  if (scrId === "day_gainers" || scrId === "day_losers") {
    return "most_actives";
  }
  return null;
};

const fetchScreener = async (
  scrId: YahooScreenerId,
  count: number,
  lang: string,
  region: string,
): Promise<ScreenerResult> =>
  runYahooRequest(
    () =>
      yahooFinance.screener(
        {
          scrIds: scrId,
          count,
          lang,
          region,
        },
        undefined,
        { validateResult: false },
      ) as Promise<ScreenerResult>,
    0,
  );

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

  const cacheKey = `${String(scrId)}:${String(count)}:${String(lang)}:${String(region)}`;
  const now = Date.now();
  const cached = screenerCache.get(cacheKey);
  if (cached && now - cached.timestamp < SCREENER_CACHE_TTL_MS) {
    res.status(200).json(cached.data);
    return;
  }

  try {
    const requestedScrId = scrId as YahooScreenerId;
    const numericCount = Number(count);
    const resolvedLang = lang as string;
    const resolvedRegion = region as string;

    let data: ScreenerResult = await fetchScreener(
      requestedScrId,
      numericCount,
      resolvedLang,
      resolvedRegion,
    );

    if (!data || (Array.isArray(data.quotes) && data.quotes.length === 0)) {
      const fallbackScrId = getFallbackScrId(requestedScrId);
      if (fallbackScrId) {
        try {
          const fallbackData = await fetchScreener(
            fallbackScrId,
            numericCount,
            resolvedLang,
            resolvedRegion,
          );
          if (fallbackData && Array.isArray(fallbackData.quotes) && fallbackData.quotes.length > 0) {
            data = {
              ...fallbackData,
              id: requestedScrId,
            };
          }
        } catch (fallbackError: unknown) {
          console.error(
            `Fallback screener fetch failed for ${requestedScrId} -> ${fallbackScrId}:`,
            (fallbackError as Error).message,
          );
        }
      }
    }

    screenerCache.set(cacheKey, { timestamp: now, data });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching screener results for ${scrId}:`,
      (error as Error).message,
    );
    if (cached && isYahooRateLimitError(error)) {
      res.status(200).json(cached.data);
      return;
    }
    if (cached) {
      res.status(200).json(cached.data);
      return;
    }
    res.status(200).json({ id: String(scrId), quotes: [] });
  }
};
