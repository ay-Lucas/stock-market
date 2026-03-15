import Link from "next/link";
import StocksExplorer, {
  type ExplorerRow,
} from "@/components/stocks/StocksExplorer";
import {
  fetchScreener,
  fetchTrending,
  type ScreenerQuote,
} from "@/lib/stockData";

export const revalidate = 90;

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

function ScreenerBlock({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: ScreenerQuote[];
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
            No data available.
          </div>
        )}
        {items.slice(0, 10).map((item, idx) => {
          const symbol = item.symbol ?? "";
          const pct = item.regularMarketChangePercent;
          const up = typeof pct === "number" && pct >= 0;
          return (
            <Link
              key={`${title}-${symbol}-${idx}`}
              href={`/${encodeURIComponent(symbol)}`}
              className="flex items-center justify-between rounded-md border border-slate-200/80 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-slate-100">{symbol}</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400 max-w-44">
                  {item.shortName ?? item.longName ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.regularMarketPrice)}
                </div>
                <div className={`text-xs ${up ? "text-emerald-600" : "text-rose-600"}`}>
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

const mergeRows = (
  sources: Array<{ key: string; quotes: ScreenerQuote[] }>,
): ExplorerRow[] => {
  const bySymbol = new Map<string, ExplorerRow>();

  for (const source of sources) {
    for (const quote of source.quotes) {
      const symbol = (quote.symbol ?? "").toUpperCase();
      if (!symbol) continue;
      const existing = bySymbol.get(symbol);
      const merged: ExplorerRow = {
        symbol,
        name: quote.shortName ?? quote.longName ?? existing?.name,
        price: quote.regularMarketPrice ?? existing?.price,
        changePct: quote.regularMarketChangePercent ?? existing?.changePct,
        volume: quote.regularMarketVolume ?? existing?.volume,
        marketCap: quote.marketCap ?? existing?.marketCap,
        sources: existing?.sources ?? [],
      };
      if (!merged.sources.includes(source.key)) {
        merged.sources.push(source.key);
      }
      bySymbol.set(symbol, merged);
    }
  }

  return [...bySymbol.values()];
};

export default async function StocksPage() {
  const [mostActive, gainers, losers, undervaluedLargeCaps, trending] =
    await Promise.all([
      fetchScreener("most_actives", 10, { revalidate: 90 }),
      fetchScreener("day_gainers", 10, { revalidate: 90 }),
      fetchScreener("day_losers", 10, { revalidate: 90 }),
      fetchScreener("undervalued_large_caps", 10, { revalidate: 180 }),
      fetchTrending("US", 10, { revalidate: 90 }),
    ]);

  const rawTrendingQuotes = trending?.finance?.result?.[0]?.quotes ?? [];
  const trendingQuotes =
    rawTrendingQuotes.length > 0 ? rawTrendingQuotes : (mostActive?.quotes ?? []);
  const trendingSource =
    rawTrendingQuotes.length > 0
      ? (trending?._meta?.source ?? "yahoo_trending")
      : "most_actives_fallback";
  const trendingUpdatedAt = trending?._meta?.updatedAt;
  const isTrendingStale =
    Boolean(trending?._meta?.stale) || rawTrendingQuotes.length === 0;
  const explorerRows = mergeRows([
    { key: "most_active", quotes: mostActive?.quotes ?? [] },
    { key: "gainers", quotes: gainers?.quotes ?? [] },
    { key: "losers", quotes: losers?.quotes ?? [] },
    { key: "undervalued", quotes: undervaluedLargeCaps?.quotes ?? [] },
    { key: "trending", quotes: trendingQuotes },
  ]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#dbeafe_0%,#f8fafc_38%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_20%_0%,#111827_0%,#030712_45%,#1e1b4b_100%)]">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-cyan-200/60 dark:border-violet-500/30 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 dark:from-indigo-950 dark:via-violet-900 dark:to-fuchsia-900 p-6 text-white shadow-xl shadow-blue-500/20 dark:shadow-violet-900/40">
          <div className="text-xs uppercase tracking-wide text-blue-100 dark:text-slate-300">
            Dedicated Stocks Explorer
          </div>
          <h1 className="mt-2 text-3xl font-bold">Stocks</h1>
          <p className="mt-2 text-sm text-blue-50 dark:text-slate-200">
            Scan the market, compare leaders and laggards, and jump into any ticker quickly.
          </p>
        </section>

        <section className="mt-8 rounded-xl border border-emerald-200/70 dark:border-emerald-500/30 bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/40 dark:from-gray-900 dark:via-emerald-950/20 dark:to-slate-900 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-100">
              Trending Now
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {isTrendingStale && (
                <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-800 dark:border-amber-500/50 dark:bg-amber-900/40 dark:text-amber-200">
                  Stale
                </span>
              )}
              <span className="rounded-full border border-emerald-300/70 bg-emerald-100/70 px-2 py-0.5 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-900/40 dark:text-emerald-100">
                {trendingSource === "most_actives_fallback"
                  ? "Source: Most Active"
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
              <div className="text-sm text-slate-500 dark:text-slate-400">No trending symbols available.</div>
            )}
            {trendingQuotes.slice(0, 10).map((item) => {
              const symbol = item.symbol ?? "";
              const up =
                typeof item.regularMarketChangePercent === "number" &&
                item.regularMarketChangePercent >= 0;
              return (
                <Link
                  key={`stocks-trending-${symbol}`}
                  href={`/${encodeURIComponent(symbol)}`}
                  className="rounded-md border border-emerald-200/70 dark:border-emerald-700/60 bg-white/60 dark:bg-slate-900/40 px-3 py-2 hover:bg-white dark:hover:bg-emerald-900/20"
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">{symbol}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Vol {formatCompact(item.regularMarketVolume)}
                  </div>
                  <div className={`text-xs ${up ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatPct(item.regularMarketChangePercent)}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <StocksExplorer rows={explorerRows} />

        <details className="mt-8 lg:hidden rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-3 shadow-sm backdrop-blur">
          <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-slate-100">
            Market Lists (Tap to expand)
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-4">
            <ScreenerBlock
              title="Most Active"
              subtitle="Highest trading volume today"
              items={mostActive?.quotes ?? []}
            />
            <ScreenerBlock
              title="Top Gainers"
              subtitle="Best performers by daily percent change"
              items={gainers?.quotes ?? []}
            />
            <ScreenerBlock
              title="Top Losers"
              subtitle="Largest daily declines"
              items={losers?.quotes ?? []}
            />
            <ScreenerBlock
              title="Undervalued Large Caps"
              subtitle="Large-cap names from Yahoo screener"
              items={undervaluedLargeCaps?.quotes ?? []}
            />
          </div>
        </details>

        <section className="mt-8 hidden lg:grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ScreenerBlock
            title="Most Active"
            subtitle="Highest trading volume today"
            items={mostActive?.quotes ?? []}
          />
          <ScreenerBlock
            title="Top Gainers"
            subtitle="Best performers by daily percent change"
            items={gainers?.quotes ?? []}
          />
          <ScreenerBlock
            title="Top Losers"
            subtitle="Largest daily declines"
            items={losers?.quotes ?? []}
          />
          <ScreenerBlock
            title="Undervalued Large Caps"
            subtitle="Large-cap names from Yahoo screener"
            items={undervaluedLargeCaps?.quotes ?? []}
          />
        </section>
      </main>
    </div>
  );
}
