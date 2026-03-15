import { HistoricalData } from "@shared/types/stock";
import type { QuoteSummaryMinimal } from "@shared/types/yahoo";
import type { StockData } from "@shared/types/stock";

// Options for ISR/caching; on the server we use Next fetch revalidate, on the client cache.
export type FetchISROptions = {
  revalidate?: number; // seconds for ISR when on server
  tags?: string[];
  cache?: RequestCache; // browser override: 'no-store' | 'force-cache'
  timeoutMs?: number;
};

const isServerSide = () => typeof window === "undefined";

const getApiBase = () =>
  isServerSide()
    ? (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000")
    : "";

async function fetchJSON<T>(
  pathWithQuery: string,
  defaultRevalidate: number,
  opts: FetchISROptions = {},
): Promise<T> {
  const base = getApiBase();
  const server = isServerSide();
  const requestInit: RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  } = server
    ? {
        next: {
          revalidate: opts.revalidate ?? defaultRevalidate,
          tags: opts.tags,
        },
      }
    : { cache: opts.cache ?? "no-store" };
  const timeoutMs = opts.timeoutMs ?? 9000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${base}${pathWithQuery}`, {
      ...requestInit,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms for ${pathWithQuery}`);
    }
    throw error;
  }
  clearTimeout(timeoutId);
  const contentType = res.headers.get("content-type") ?? "";
  const isJSON = contentType.includes("application/json");
  const bodyText = await res.text();

  if (!res.ok) {
    const body = bodyText.slice(0, 200);
    throw new Error(
      `Request failed (${res.status}) for ${pathWithQuery}: ${body}`,
    );
  }

  if (!isJSON) {
    throw new Error(
      `Expected JSON for ${pathWithQuery}, got '${contentType || "unknown"}': ${bodyText.slice(0, 200)}`,
    );
  }

  if (!bodyText.trim()) {
    throw new Error(`Empty JSON response for ${pathWithQuery}`);
  }

  return JSON.parse(bodyText) as T;
}

const POLYGON_INTERVALS: readonly string[] = [
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
];

// Historical OHLCV
export async function fetchStockData(
  ticker: string,
  from?: Date,
  to?: Date,
  interval: string = "1d",
  multiplier?: number,
  opts: FetchISROptions = {},
) {
  try {
    const fromDate = from ?? new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const toDate = to ?? new Date();

    const params = new URLSearchParams({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      interval,
    });
    if (POLYGON_INTERVALS.includes(interval)) {
      params.set("multiplier", String(multiplier ?? 1));
    }

    return await fetchJSON<HistoricalData>(
      `/api/stocks/${ticker}/historical?${params.toString()}`,
      opts.revalidate ?? 60,
      { timeoutMs: 10000, ...opts },
    );
  } catch (error) {
    console.error(`There was an error fetching: ${error}`);
  }
}

// Quote
export async function fetchQuote(ticker: string, opts: FetchISROptions = {}) {
  try {
    return await fetchJSON<StockData>(
      `/api/stocks/${ticker}/quote`,
      opts.revalidate ?? 30,
      { timeoutMs: 7000, ...opts },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("timed out")) {
      console.warn(`Quote request timed out for ${ticker}`);
      return;
    }
    console.error(`Error fetching quote for ${ticker}:`, error);
  }
}

// Summary (profile/detail/statistics)
export async function fetchSummary(
  ticker: string,
  opts: FetchISROptions = {},
): Promise<QuoteSummaryMinimal | undefined> {
  try {
    return await fetchJSON<QuoteSummaryMinimal>(
      `/api/stocks/${ticker}/summary`,
      opts.revalidate ?? 300,
      { timeoutMs: 7000, ...opts },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("timed out")) {
      console.warn(`Summary request timed out for ${ticker}`);
      return;
    }
    console.error(`Error fetching summary for ${ticker}:`, error);
  }
}

// News
export type NewsItem = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: Date | number | string;
  type: string;
  thumbnail?: {
    resolutions: Array<{
      url: string;
      width: number;
      height: number;
      tag: string;
    }>;
  };
  relatedTickers?: string[];
};
export type NewsResponse = NewsItem[];

export async function fetchNews(
  ticker: string,
  opts: FetchISROptions = {},
): Promise<NewsResponse | undefined> {
  try {
    return await fetchJSON<NewsResponse>(
      `/api/stocks/${ticker}/news`,
      opts.revalidate ?? 300,
      { timeoutMs: 7000, ...opts },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("timed out")) {
      console.warn(`News request timed out for ${ticker}`);
      return;
    }
    console.error(`Error fetching news for ${ticker}:`, error);
  }
}

export type ScreenerQuote = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
};

export type ScreenerResponse = {
  id?: string;
  quotes?: ScreenerQuote[];
};

export type TrendingResponse = {
  finance?: {
    result?: Array<{
      count?: number;
      quotes?: ScreenerQuote[];
    }>;
  };
  _meta?: {
    source?: "yahoo_trending" | "cache" | "most_actives_fallback";
    stale?: boolean;
    updatedAt?: string;
  };
};

export async function fetchScreener(
  scrId: string,
  count: number = 8,
  opts: FetchISROptions = {},
): Promise<ScreenerResponse | undefined> {
  try {
    const params = new URLSearchParams({
      scrId,
      count: String(count),
    });
    return await fetchJSON<ScreenerResponse>(
      `/api/stocks/screener?${params.toString()}`,
      opts.revalidate ?? 120,
      { timeoutMs: 7000, ...opts },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("timed out")) {
      console.warn(`Screener request timed out for ${scrId}`);
      return;
    }
    console.error(`Error fetching screener for ${scrId}:`, error);
  }
}

export async function fetchTrending(
  iso2: string = "US",
  count: number = 10,
  opts: FetchISROptions = {},
): Promise<TrendingResponse | undefined> {
  try {
    const params = new URLSearchParams({
      iso2,
      count: String(count),
    });
    return await fetchJSON<TrendingResponse>(
      `/api/stocks/trending?${params.toString()}`,
      opts.revalidate ?? 120,
      { timeoutMs: 7000, ...opts },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("timed out")) {
      console.warn(`Trending request timed out`);
      return;
    }
    console.error(`Error fetching trending symbols:`, error);
  }
}
