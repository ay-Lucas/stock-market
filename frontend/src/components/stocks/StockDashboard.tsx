"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import TickerSearch from "@/components/stocks/TickerSearch";
import { Chart, ChartHandle } from "@/components/stocks/Chart";
import { fetchStockData, fetchQuote, fetchSummary } from "@/lib/stockData";
import { ChartData } from "@/types/chart";
import OverviewCards from "@/components/stocks/OverviewCards";
import type { StockData } from "@shared/types/stock";
import type { QuoteSummaryMinimal } from "@shared/types/yahoo";

export default function StockDashboard() {
  const [ticker, setTicker] = useState<string>("AAPL");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartHandle>(null);
  const [quote, setQuote] = useState<StockData | undefined>(undefined);
  const [summary, setSummary] = useState<QuoteSummaryMinimal | undefined>(
    undefined,
  );

  useEffect(() => {
    const run = async () => {
      try {
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
      } catch (e) {
        console.error(e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    run();
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
    <div className="w-full max-w-4xl flex flex-col items-center gap-6">
      <TickerSearch onSelect={setTicker} />
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">{ticker}</h2>
        <div className="flex gap-2 text-black dark:text-gray-100">
          <button
            className="bg-gray-200 dark:bg-gray-800 rounded px-2 py-1"
            onClick={() => setMonthsRange(6)}
          >
            6M
          </button>
          <button
            className="bg-gray-200 dark:bg-gray-800 rounded px-2 py-1"
            onClick={() => setMonthsRange(12)}
          >
            1Y
          </button>
          <button
            className="bg-gray-200 dark:bg-gray-800 rounded px-2 py-1"
            onClick={() => setMonthsRange(60)}
          >
            5Y
          </button>
          <button
            className="bg-gray-200 dark:bg-gray-800 rounded px-2 py-1"
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
          <div className="w-full">
            <Chart ref={chartRef} data={data} />
          </div>
        )
      )}
      <OverviewCards ticker={ticker} quote={quote} summary={summary} />
    </div>
  );
}
