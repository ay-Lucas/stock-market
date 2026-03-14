import { Request, Response } from "express";
import { runYahooRequest, yahooFinance } from "../utils/yahooRequest";
import { SearchQuote } from "@shared/types/yahoo";
import type { SearchResult } from "../types/yahoo";

const SEARCH_CACHE_TTL_MS = 60_000;
const SEARCH_TIMEOUT_MS = 1_200;
const searchCache = new Map<string, { timestamp: number; data: SearchResult }>();

const fallbackQuotes: SearchQuote[] = [
  { symbol: "AAPL", shortname: "Apple Inc." },
  { symbol: "MSFT", shortname: "Microsoft Corporation" },
  { symbol: "GOOGL", shortname: "Alphabet Inc. Class A" },
  { symbol: "AMZN", shortname: "Amazon.com, Inc." },
  { symbol: "META", shortname: "Meta Platforms, Inc." },
  { symbol: "NVDA", shortname: "NVIDIA Corporation" },
  { symbol: "TSLA", shortname: "Tesla, Inc." },
  { symbol: "BRK.B", shortname: "Berkshire Hathaway Inc. Class B" },
  { symbol: "JPM", shortname: "JPMorgan Chase & Co." },
  { symbol: "V", shortname: "Visa Inc." },
  { symbol: "MA", shortname: "Mastercard Incorporated" },
  { symbol: "NFLX", shortname: "Netflix, Inc." },
  { symbol: "AMD", shortname: "Advanced Micro Devices, Inc." },
  { symbol: "INTC", shortname: "Intel Corporation" },
  { symbol: "ORCL", shortname: "Oracle Corporation" },
  { symbol: "PLTR", shortname: "Palantir Technologies Inc." },
  { symbol: "COIN", shortname: "Coinbase Global, Inc." },
  { symbol: "SPY", shortname: "SPDR S&P 500 ETF Trust" },
  { symbol: "QQQ", shortname: "Invesco QQQ Trust" },
  { symbol: "IWM", shortname: "iShares Russell 2000 ETF" },
];

const getFallbackResults = (query: string): SearchResult => {
  const q = query.trim().toUpperCase();
  const quotes = fallbackQuotes
    .filter((item) => {
      const symbol = item.symbol?.toUpperCase() ?? "";
      const name = (item.shortname ?? item.longname ?? "").toUpperCase();
      return symbol.includes(q) || name.includes(q);
    })
    .slice(0, 8);

  return {
    quotes: quotes as unknown as SearchResult["quotes"],
  } as unknown as SearchResult;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Search request timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
};

export const getSearchResults = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  const cacheKey = q.toUpperCase();
  const now = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.timestamp < SEARCH_CACHE_TTL_MS) {
    res.status(200).json(cached.data);
    return;
  }

  try {
    const data = (await withTimeout(
      runYahooRequest(() => yahooFinance.search(q), 0),
      SEARCH_TIMEOUT_MS,
    )) as unknown as SearchResult;

    if (!data) {
      const fallback = getFallbackResults(q);
      searchCache.set(cacheKey, { timestamp: now, data: fallback });
      res.status(200).json(fallback);
      return;
    }

    searchCache.set(cacheKey, { timestamp: now, data });
    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching search results for ${q}:`,
      (error as Error).message,
    );
    const fallback = getFallbackResults(q);
    searchCache.set(cacheKey, { timestamp: now, data: fallback });
    res.status(200).json(fallback);
  }
};
