import Link from "next/link";
import NewsList from "@/components/stocks/NewsList";
import SectorHeatmap, {
  type SectorHeatmapItem,
} from "@/components/stocks/SectorHeatmap";
import {
  fetchNews,
  fetchQuote,
  fetchStockData,
  fetchScreener,
  fetchTrending,
  type NewsItem,
  type ScreenerQuote,
} from "@/lib/stockData";

export const revalidate = 60;

const INDEX_PROXIES = ["SPY", "QQQ", "DIA", "IWM"];
const SECTOR_ETFS: Array<{
  symbol: string;
  name: string;
  category: "defensive" | "cyclical";
  sizeWeight: number;
}> = [
  { symbol: "XLB", name: "Materials", category: "cyclical", sizeWeight: 2.5 },
  { symbol: "XLC", name: "Communication Services", category: "cyclical", sizeWeight: 8.5 },
  { symbol: "XLE", name: "Energy", category: "cyclical", sizeWeight: 4 },
  { symbol: "XLF", name: "Financials", category: "cyclical", sizeWeight: 10.5 },
  { symbol: "XLI", name: "Industrials", category: "cyclical", sizeWeight: 8.5 },
  { symbol: "XLK", name: "Technology", category: "cyclical", sizeWeight: 30 },
  { symbol: "XLP", name: "Consumer Staples", category: "defensive", sizeWeight: 5.5 },
  { symbol: "XLRE", name: "Real Estate", category: "defensive", sizeWeight: 2.5 },
  { symbol: "XLU", name: "Utilities", category: "defensive", sizeWeight: 2.5 },
  { symbol: "XLV", name: "Health Care", category: "defensive", sizeWeight: 11 },
  { symbol: "XLY", name: "Consumer Discretionary", category: "cyclical", sizeWeight: 10 },
];

const formatCurrency = (value?: number) =>
  value == null
    ? "–"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);

const formatPct = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(2)}%` : "–";

const formatCompact = (value?: number) =>
  value == null
    ? "–"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value);

const computeChangePct = (current?: number, prevClose?: number) => {
  if (
    typeof current !== "number" ||
    !Number.isFinite(current) ||
    typeof prevClose !== "number" ||
    !Number.isFinite(prevClose) ||
    prevClose === 0
  ) {
    return undefined;
  }
  return ((current - prevClose) / prevClose) * 100;
};

function MoversList({
  title,
  items,
}: {
  title: string;
  items: ScreenerQuote[];
}) {
  return (
    <section className="rounded-xl border border-indigo-200/70 dark:border-indigo-500/30 bg-gradient-to-br from-white via-indigo-50/50 to-sky-50/50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-slate-900 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-indigo-950 dark:text-indigo-100">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">No data available.</div>
        )}
        {items.slice(0, 8).map((item) => {
          const symbol = item.symbol ?? "";
          const pct = item.regularMarketChangePercent;
          const up = typeof pct === "number" && pct >= 0;
          return (
            <Link
              key={`${title}-${symbol}`}
              href={`/${encodeURIComponent(symbol)}`}
              className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-white/80 dark:hover:bg-indigo-900/20"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">
                  {item.shortName ?? item.longName ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="price-nums text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(item.regularMarketPrice)}
                </div>
                <div className={`price-nums text-xs ${up ? "text-green-600" : "text-red-600"}`}>
                  {typeof pct === "number" ? `${up ? "+" : ""}${pct.toFixed(2)}%` : "–"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function Home() {
  const [indexQuotes, sectorSnapshots, gainers, losers, trending, news] = await Promise.all([
    Promise.all(INDEX_PROXIES.map((symbol) => fetchQuote(symbol, { revalidate: 30 }))),
    Promise.all(
      SECTOR_ETFS.map(async (item) => {
        const quote = await fetchQuote(item.symbol, { revalidate: 30 });
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 45);
        const historical = await fetchStockData(item.symbol, from, to, "1d", undefined, {
          revalidate: 300,
        });
        const points = [...(historical?.results ?? [])]
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((point) => ({
            close: point.close ?? undefined,
            volume: point.volume ?? undefined,
          }))
          .filter(
            (point) =>
              typeof point.close === "number" &&
              Number.isFinite(point.close) &&
              point.close > 0,
          );
        const tradingPoints = points.filter(
          (point) =>
            typeof point.volume === "number" &&
            Number.isFinite(point.volume) &&
            point.volume > 0,
        );

        const closes = tradingPoints.map((p) => p.close as number);
        const last = closes.length ? closes[closes.length - 1] : undefined;
        const prev = closes.length > 1 ? closes[closes.length - 2] : undefined;
        const week = closes.length > 5 ? closes[closes.length - 6] : undefined;
        const month = closes.length > 21 ? closes[closes.length - 22] : undefined;
        const change = (current?: number, prior?: number) =>
          typeof current === "number" &&
          typeof prior === "number" &&
          Number.isFinite(current) &&
          Number.isFinite(prior) &&
          prior !== 0
            ? ((current - prior) / prior) * 100
            : undefined;
        const change1dFromQuote = computeChangePct(
          quote?.currentPrice,
          quote?.previousClose,
        );

        return {
          symbol: item.symbol,
          name: item.name,
          category: item.category,
          sizeWeight: item.sizeWeight,
          price:
            typeof quote?.currentPrice === "number" && Number.isFinite(quote.currentPrice)
              ? quote.currentPrice
              : last,
          volume: tradingPoints.length
            ? tradingPoints[tradingPoints.length - 1]?.volume
            : undefined,
          change1d:
            typeof change1dFromQuote === "number" && Number.isFinite(change1dFromQuote)
              ? change1dFromQuote
              : change(last, prev),
          change1w: change(last, week),
          change1m: change(last, month),
          sparkline: closes.slice(-20),
        } satisfies SectorHeatmapItem;
      }),
    ),
    fetchScreener("day_gainers", 8, { revalidate: 120 }),
    fetchScreener("day_losers", 8, { revalidate: 120 }),
    fetchTrending("US", 10, { revalidate: 120 }),
    fetchNews("SPY", { revalidate: 180 }),
  ]);

  const rawTrendingQuotes = trending?.finance?.result?.[0]?.quotes ?? [];
  const trendingQuotes =
    rawTrendingQuotes.length > 0 ? rawTrendingQuotes : (gainers?.quotes ?? []);
  const trendingSource =
    rawTrendingQuotes.length > 0
      ? (trending?._meta?.source ?? "yahoo_trending")
      : "most_actives_fallback";
  const trendingUpdatedAt = trending?._meta?.updatedAt;
  const isTrendingStale =
    Boolean(trending?._meta?.stale) || rawTrendingQuotes.length === 0;
  const topNews: NewsItem[] = news ?? [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#dbeafe_0%,#f8fafc_38%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_20%_0%,#111827_0%,#030712_45%,#1e1b4b_100%)]">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-cyan-200/60 dark:border-violet-500/30 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 dark:from-indigo-950 dark:via-violet-900 dark:to-fuchsia-900 p-6 text-white shadow-xl shadow-blue-500/20 dark:shadow-violet-900/40">
          <div className="text-xs uppercase tracking-wide text-blue-100 dark:text-slate-300">Stock Market Dashboard</div>
          <h1 className="mt-2 text-3xl font-bold">Market Home</h1>
          <p className="mt-2 text-sm text-blue-50 dark:text-slate-200">
            Track indices, top movers, trending names, and major headlines.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Indices</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INDEX_PROXIES.map((symbol, idx) => {
              const quote = indexQuotes[idx];
              const pct = computeChangePct(quote?.currentPrice, quote?.previousClose);
              const up = typeof pct === "number" && pct >= 0;
              return (
                <Link
                  key={symbol}
                  href={`/${symbol}`}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-4 backdrop-blur hover:bg-white dark:hover:bg-slate-800"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">{symbol}</div>
                  <div className="price-nums mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(quote?.currentPrice)}
                  </div>
                  <div className={`price-nums mt-1 text-sm ${up ? "text-green-600" : "text-red-600"}`}>
                    {typeof pct === "number" ? `${up ? "+" : ""}${pct.toFixed(2)}%` : "–"}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MoversList title="Top Gainers" items={gainers?.quotes ?? []} />
          <MoversList title="Top Losers" items={losers?.quotes ?? []} />
        </section>

        <SectorHeatmap sectors={sectorSnapshots} defaultTimeframe="1d" />

        <section className="mt-8 rounded-xl border border-emerald-200/70 dark:border-emerald-500/30 bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/40 dark:from-gray-900 dark:via-emerald-950/20 dark:to-slate-900 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-100">
              Trending Symbols
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {isTrendingStale && (
                <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-800 dark:border-amber-500/50 dark:bg-amber-900/40 dark:text-amber-200">
                  Stale
                </span>
              )}
              <span className="rounded-full border border-emerald-300/70 bg-emerald-100/70 px-2 py-0.5 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-900/40 dark:text-emerald-100">
                {trendingSource === "most_actives_fallback"
                  ? "Source: Top Gainers Fallback"
                  : trendingSource === "cache"
                    ? "Source: Cached Trending"
                    : "Source: Trending"}
              </span>
              {trendingUpdatedAt && (
                <span className="text-slate-500 dark:text-slate-400">
                  Updated {new Date(trendingUpdatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {trendingQuotes.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">No trending symbols available.</div>
            )}
            {trendingQuotes.slice(0, 10).map((item) => {
              const symbol = item.symbol ?? "";
              return (
                <Link
                  key={`trending-${symbol}`}
                  href={`/${encodeURIComponent(symbol)}`}
                  className="rounded-md border border-emerald-200/70 dark:border-emerald-700/60 bg-white/60 dark:bg-slate-900/40 px-3 py-2 hover:bg-white dark:hover:bg-emerald-900/20"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{symbol}</div>
                  <div className="price-nums text-xs text-gray-500 dark:text-gray-400">
                    Vol {formatCompact(item.regularMarketVolume)}
                  </div>
                  <div
                    className={`price-nums text-xs ${
                      typeof item.regularMarketChangePercent === "number" &&
                      item.regularMarketChangePercent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPct(item.regularMarketChangePercent)}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Top Market News</h2>
          <div className="mt-3">
            <NewsList items={topNews} />
            {topNews.length === 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 text-sm text-gray-500 dark:text-gray-400 backdrop-blur">
                No market news available right now.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
