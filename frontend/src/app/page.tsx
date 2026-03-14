import Link from "next/link";
import HomeTickerSearch from "@/components/stocks/HomeTickerSearch";
import NewsList from "@/components/stocks/NewsList";
import {
  fetchNews,
  fetchQuote,
  fetchScreener,
  fetchTrending,
  type NewsItem,
  type ScreenerQuote,
} from "@/lib/stockData";

export const revalidate = 60;

const INDEX_PROXIES = ["SPY", "QQQ", "DIA", "IWM"];
const SECTOR_ETFS = [
  { symbol: "XLB", name: "Materials" },
  { symbol: "XLC", name: "Communication Services" },
  { symbol: "XLE", name: "Energy" },
  { symbol: "XLF", name: "Financials" },
  { symbol: "XLI", name: "Industrials" },
  { symbol: "XLK", name: "Technology" },
  { symbol: "XLP", name: "Consumer Staples" },
  { symbol: "XLRE", name: "Real Estate" },
  { symbol: "XLU", name: "Utilities" },
  { symbol: "XLV", name: "Health Care" },
  { symbol: "XLY", name: "Consumer Discretionary" },
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

const getHeatTileClass = (pct?: number) => {
  if (typeof pct !== "number" || !Number.isFinite(pct)) {
    return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  }
  if (pct >= 2.5) return "bg-green-600/25 border-green-500/40";
  if (pct >= 1) return "bg-green-500/20 border-green-500/30";
  if (pct > 0) return "bg-green-500/10 border-green-500/20";
  if (pct <= -2.5) return "bg-red-600/25 border-red-500/40";
  if (pct <= -1) return "bg-red-500/20 border-red-500/30";
  if (pct < 0) return "bg-red-500/10 border-red-500/20";
  return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
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
  const [indexQuotes, sectorQuotes, gainers, losers, trending, news] = await Promise.all([
    Promise.all(INDEX_PROXIES.map((symbol) => fetchQuote(symbol, { revalidate: 30 }))),
    Promise.all(SECTOR_ETFS.map((item) => fetchQuote(item.symbol, { revalidate: 30 }))),
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

        <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sector Heatmap</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SECTOR_ETFS.map((sector, idx) => {
              const quote = sectorQuotes[idx];
              const pct = computeChangePct(quote?.currentPrice, quote?.previousClose);
              const up = typeof pct === "number" && pct >= 0;
              return (
                <Link
                  key={`sector-${sector.symbol}`}
                  href={`/${sector.symbol}`}
                  className={`rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400/60 dark:hover:border-slate-500/60 ${getHeatTileClass(pct)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {sector.name}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        {sector.symbol}
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${up ? "text-green-700" : "text-red-700"}`}>
                      {typeof pct === "number" ? `${up ? "+" : ""}${pct.toFixed(2)}%` : "–"}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-800 dark:text-gray-100">
                    {formatCurrency(quote?.currentPrice)}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

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
