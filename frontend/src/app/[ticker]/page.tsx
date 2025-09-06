import StockDashboard from "@/components/stocks/StockDashboard";
import {
  fetchStockData,
  fetchQuote,
  fetchSummary,
  fetchNews,
} from "@/lib/stockData";

export const revalidate = 60;

export default async function TickerPage({
  params,
}: {
  params: { ticker: string };
}) {
  const ticker = params.ticker?.toUpperCase() || "AAPL";
  const now = new Date();
  const from = new Date();
  from.setFullYear(now.getFullYear() - 50);

  const [historical, quote, summary, news] = await Promise.all([
    fetchStockData(ticker, from, now, "1d", undefined, { revalidate: 60 }),
    fetchQuote(ticker, { revalidate: 30 }),
    fetchSummary(ticker, { revalidate: 300 }),
    fetchNews(ticker, { revalidate: 300 }),
  ]);

  const initialData =
    historical?.results.map((e) => ({
      time: new Date(e.timestamp).toISOString().slice(0, 10),
      value: e.close!,
    })) ?? [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 gap-12 bg-gray-50 dark:bg-gray-950 font-sans">
      <main className="w-full flex flex-col items-center gap-8">
        <StockDashboard
          initialTicker={ticker}
          initialData={initialData}
          initialQuote={quote}
          initialSummary={summary}
          initialNews={news ?? []}
        />
      </main>
    </div>
  );
}
