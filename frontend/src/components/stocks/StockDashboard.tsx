"use client";
import { useEffect, useState } from "react";
import TickerSearch from "@/components/stocks/TickerSearch";
import { Chart } from "@/components/stocks/Chart";
import { fetchStockData } from "@/lib/stockData";
import { ChartData } from "@/types/chart";

export default function StockDashboard() {
  const [ticker, setTicker] = useState<string>("AAPL");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const now = new Date();
        const from = new Date();
        from.setMonth(now.getMonth() - 6);
        const hd = await fetchStockData(ticker, from, now, "1d");
        const formatted = (hd?.results ?? []).map((e) => ({
          time: new Date(e.timestamp).toISOString().slice(0, 10),
          value: e.close!,
        }));
        setData(formatted);
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [ticker]);

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6">
      <TickerSearch onSelect={setTicker} />
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-gray-800">{ticker}</h2>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading chart…</div>
      ) : (
        data.length > 0 && (
          <div className="w-full">
            <Chart data={data} />
          </div>
        )
      )}
    </div>
  );
}

