import { Request, Response } from "express";
import { yahooFinance } from "../utils/yahooRequest";
import type { TrendingSymbolsResult } from "../types/yahoo";
import {
  isYahooRateLimitError,
  runYahooRequest,
} from "../utils/yahooRequest";
import type { ScreenerResult } from "../types/yahoo";

const TRENDING_CACHE_TTL_MS = 3 * 60_000;
const trendingCache = new Map<
  string,
  { timestamp: number; data: TrendingSymbolsResult }
>();

type TrendingMeta = {
  source: "yahoo_trending" | "cache" | "most_actives_fallback";
  stale: boolean;
  updatedAt: string;
};

type TrendingResponseWithMeta = TrendingSymbolsResult & {
  _meta?: TrendingMeta;
};

export const getTrendingData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { count, region, lang, iso2 } = req.query; // iso2 -> country code (2 letter abbreviation) e.g. US, GB
  const cacheKey = `${String(iso2 ?? "US").toUpperCase()}:${String(count ?? "10")}`;
  const now = Date.now();
  const cached = trendingCache.get(cacheKey);
  if (cached && now - cached.timestamp < TRENDING_CACHE_TTL_MS) {
    const payload: TrendingResponseWithMeta = {
      ...cached.data,
      _meta: {
        source: "cache",
        stale: false,
        updatedAt: new Date(cached.timestamp).toISOString(),
      },
    };
    res.status(200).json(payload);
    return;
  }

  const queryOptions = {
    count: Number(count) || 10,
    lang: (lang as string) ?? "en-US",
    // region: region as string,
  };

  const buildFallbackFromMostActives = async (): Promise<TrendingResponseWithMeta> => {
    const screenerData: ScreenerResult = await runYahooRequest(
      () =>
        yahooFinance.screener({
          scrIds: "most_actives",
          count: Number(count) || 10,
          lang: (lang as string) ?? "en-US",
          region: (region as string) ?? String(iso2 ?? "US"),
        }),
      0,
    );
    const fallbackPayload = {
      finance: {
        result: [
          {
            count: screenerData?.quotes?.length ?? 0,
            quotes: screenerData?.quotes ?? [],
          },
        ],
      },
      _meta: {
        source: "most_actives_fallback",
        stale: true,
        updatedAt: new Date().toISOString(),
      },
    } as unknown as TrendingResponseWithMeta;
    return fallbackPayload;
  };

  try {
    const data: TrendingSymbolsResult = await runYahooRequest(
      () => yahooFinance.trendingSymbols((iso2 as string) ?? "US", queryOptions),
      0,
    );

    const quotes =
      (
        (data as unknown as {
          finance?: { result?: Array<{ quotes?: unknown[] }> };
        })?.finance?.result?.[0]?.quotes
      ) ?? [];
    if (!data || quotes.length === 0) {
      const fallback = await buildFallbackFromMostActives();
      res.status(200).json(fallback);
      return;
    }

    trendingCache.set(cacheKey, { timestamp: now, data });
    const payload: TrendingResponseWithMeta = {
      ...data,
      _meta: {
        source: "yahoo_trending",
        stale: false,
        updatedAt: new Date(now).toISOString(),
      },
    };
    res.status(200).json(payload);
  } catch (error: unknown) {
    if (isYahooRateLimitError(error) && cached) {
      const payload: TrendingResponseWithMeta = {
        ...cached.data,
        _meta: {
          source: "cache",
          stale: true,
          updatedAt: new Date(cached.timestamp).toISOString(),
        },
      };
      res.status(200).json(payload);
      return;
    }

    try {
      const fallback = await buildFallbackFromMostActives();
      res.status(200).json(fallback);
    } catch (fallbackError: unknown) {
      console.error(
        `Error fetching trending data for ${region}:`,
        (error as Error).message,
      );
      console.error(
        `Error fetching fallback most actives for ${region}:`,
        (fallbackError as Error).message,
      );
      res
        .status(500)
        .json({ error: `Error fetching trending data for ${region}:` });
    }
  }
};
