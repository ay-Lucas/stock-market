"use client";
import { YahooInterval } from "@shared/types/yahoo";
import { Chart } from "./Chart";
import { PolygonInterval } from "@shared/types/polygon";
import { useStockData } from "@/context/StockChart";
const intervals: Map<string, YahooInterval | PolygonInterval> = new Map([
  ["1h", "hour"],
  ["1d", "1d"],
  ["1w", "1wk"],
  ["1m", "1mo"],
  ["3m", "3mo"],
  // Use supported intervals only; a "1y" range would be handled via date windowing
  // ["5y", "5y"],
]);
export const RangeSwitchingChart = () => {
  const { formattedData, setInterval } = useStockData();

  return (
    <div>
      <div>
        <Chart data={formattedData} />
        <div className="flex justify-between px-32 w-full mx-auto pt-3">
          {[...intervals].map(([key], index: number) => (
            <button
              key={index}
              className="bg-gray-200 rounded-lg p-1 px-3 text-black"
              onClick={() => setInterval(intervals.get(key) ?? "1mo")}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
