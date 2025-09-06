import { HistoricalData } from "@shared/types/stock";
import type { QuoteSummaryMinimal } from "@shared/types/yahoo";
import type { StockData } from "@shared/types/stock";

// Options for ISR/caching; on the server we use Next fetch revalidate, on the client cache.
export type FetchISROptions = {
  revalidate?: number; // seconds for ISR when on server
  tags?: string[];
  cache?: RequestCache; // browser override: 'no-store' | 'force-cache'
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
  const res = await fetch(`${base}${pathWithQuery}`, requestInit);
  return (await res.json()) as T;
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
      opts,
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
      opts,
    );
  } catch (error) {
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
      opts,
    );
  } catch (error) {
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
      opts,
    );
  } catch (error) {
    console.error(`Error fetching news for ${ticker}:`, error);
  }
}
