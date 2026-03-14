import Link from "next/link";
import HomeTickerSearch from "@/components/stocks/HomeTickerSearch";
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
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
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
              className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">
                  {item.shortName ?? item.longName ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(item.regularMarketPrice)}
                </div>
                <div className={`text-xs ${up ? "text-green-600" : "text-red-600"}`}>
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

  const trendingQuotes = trending?.finance?.result?.[0]?.quotes ?? [];
  const topNews: NewsItem[] = news ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-slate-300">Stock Market Dashboard</div>
          <h1 className="mt-2 text-3xl font-bold">Market Home</h1>
          <p className="mt-2 text-sm text-slate-200">
            Track indices, top movers, trending names, and major headlines.
          </p>
          <div className="mt-5 max-w-2xl">
            <HomeTickerSearch />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Indices</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INDEX_PROXIES.map((symbol, idx) => {
              const quote = indexQuotes[idx];
              const pct = computeChangePct(quote?.currentPrice, quote?.previousClose);
              const up = typeof pct === "number" && pct >= 0;
              return (
                <Link
                  key={symbol}
                  href={`/${symbol}`}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">{symbol}</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(quote?.currentPrice)}
                  </div>
                  <div className={`mt-1 text-sm ${up ? "text-green-600" : "text-red-600"}`}>
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

        <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trending Symbols</h2>
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
                  className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">{symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Vol {formatCompact(item.regularMarketVolume)}
                  </div>
                  <div
                    className={`text-xs ${
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Top Market News</h2>
          <div className="mt-3">
            <NewsList items={topNews} />
            {topNews.length === 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm text-gray-500 dark:text-gray-400">
                No market news available right now.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
