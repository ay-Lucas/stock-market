"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, ChartHandle } from "@/components/stocks/Chart";
import {
  fetchStockData,
  fetchQuote,
  fetchSummary,
  fetchNews,
  type NewsItem,
} from "@/lib/stockData";
import { ChartData } from "@/types/chart";
import OverviewCards from "@/components/stocks/OverviewCards";
import type { StockData } from "@shared/types/stock";
import type { QuoteSummaryMinimal } from "@shared/types/yahoo";
import NewsList from "@/components/stocks/NewsList";

export default function StockDashboard({
  initialTicker = "AAPL",
  initialData = [],
  initialQuote,
  initialSummary,
  initialNews = [],
}: {
  initialTicker?: string;
  initialData?: ChartData[];
  initialQuote?: StockData;
  initialSummary?: QuoteSummaryMinimal;
  initialNews?: NewsItem[];
}) {
  const [ticker] = useState<string>(initialTicker);
  const [data, setData] = useState<ChartData[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartHandle>(null);
  const [quote, setQuote] = useState<StockData | undefined>(initialQuote);
  const [summary, setSummary] = useState<QuoteSummaryMinimal | undefined>(
    initialSummary,
  );
  const [news, setNews] = useState<NewsItem[]>(initialNews);

  useEffect(() => {
    const run = async () => {
      try {
        // If we already have initial data for the initial ticker, skip first fetch
        if (data.length && ticker === initialTicker) return;
        setLoading(true);
        setError(null);
        const now = new Date();
        const from = new Date();
        from.setFullYear(now.getFullYear() - 50);
        const hd = await fetchStockData(ticker, from, now, "1d");
        const formatted = (hd?.results ?? []).map((e) => ({
          time: new Date(e.timestamp).toISOString().slice(0, 10),
          value: e.close!,
        }));
        setData(formatted);
        // Fetch overview data in parallel (after kick-off)
        fetchQuote(ticker)
          .then(setQuote)
          .catch(() => setQuote(undefined));
        fetchSummary(ticker)
          .then(setSummary)
          .catch(() => setSummary(undefined));
        fetchNews(ticker)
          .then((n) => setNews(n ?? []))
          .catch(() => setNews([]));
      } catch (e) {
        console.error(e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const lastDate = useMemo(
    () => (data.length ? data[data.length - 1].time : undefined),
    [data],
  );

  const setMonthsRange = (months: number) => {
    if (!lastDate || !chartRef.current) return;
    const to = new Date(
      typeof lastDate === "string" ? lastDate : (lastDate as number) * 1000,
    );
    const from = new Date(to);
    from.setMonth(to.getMonth() - months);
    // const fromTs = Math.floor(from.getTime() / 1000).toString();
    // const toTs = Math.floor(to.getTime() / 1000).toString();
    // chartRef.current.setVisibleRange(fromTs, toTs);

    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    chartRef.current.setVisibleRange(fromStr, toStr);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between rounded-xl border border-cyan-200/60 dark:border-violet-500/30 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-indigo-950 dark:via-violet-900 dark:to-fuchsia-900 px-4 py-3 text-white shadow-lg shadow-blue-500/20 dark:shadow-violet-900/40">
        <h2 className="text-2xl font-semibold">
          {ticker}
        </h2>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-white/30 bg-white/15 px-2.5 py-1 text-sm font-medium text-white hover:bg-white/25 transition-colors"
            onClick={() => setMonthsRange(6)}
          >
            6M
          </button>
          <button
            className="rounded-md border border-white/30 bg-white/15 px-2.5 py-1 text-sm font-medium text-white hover:bg-white/25 transition-colors"
            onClick={() => setMonthsRange(12)}
          >
            1Y
          </button>
          <button
            className="rounded-md border border-white/30 bg-white/15 px-2.5 py-1 text-sm font-medium text-white hover:bg-white/25 transition-colors"
            onClick={() => setMonthsRange(60)}
          >
            5Y
          </button>
          <button
            className="rounded-md border border-white/30 bg-white/15 px-2.5 py-1 text-sm font-medium text-white hover:bg-white/25 transition-colors"
            onClick={() => chartRef.current?.fitContent()}
          >
            Max
          </button>
        </div>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading chart…</div>
      ) : (
        data.length > 0 && (
          <div className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-3 shadow-sm backdrop-blur">
            <Chart ref={chartRef} data={data} />
          </div>
        )
      )}
      <OverviewCards ticker={ticker} quote={quote} summary={summary} />
      <div className="w-full">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Latest News
        </h3>
      </div>
      <NewsList items={news} />
    </div>
  );
}
