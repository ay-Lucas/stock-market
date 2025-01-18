import { Chart } from "@/components/stocks/Chart";
import { fetchStockData } from "@/lib/stockData";
import { convertMillisecondsToDateString } from "@/utils/dateUtils";

export default async function Home() {
  const historicalData = await fetchStockData("AAPL");
  const formattedData = historicalData?.results.map(
    (entry) =>
      ({
        time: convertMillisecondsToDateString(entry.timestamp),
        value: entry.close!,
      })!,
  );
  console.log(historicalData);
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 gap-12 bg-gray-50 font-sans">
      <main className="w-full max-w-4xl flex flex-col items-center gap-8">
        <h2 className="text-2xl font-semibold text-gray-800">AAPL</h2>
        {historicalData && (
          <div className="w-full">
            <Chart data={formattedData!} />
          </div>
        )}
      </main>
    </div>
  );
}
