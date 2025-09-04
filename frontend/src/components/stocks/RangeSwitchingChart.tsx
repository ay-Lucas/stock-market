"use client";
import { YahooInterval } from "@shared/types/yahoo";
import { ChartData } from "@/types/chart";
import { Chart } from "./Chart";
import { PolygonInterval } from "@shared/types/polygon";
import { useState } from "react";
import { useStockData } from "@/context/StockChart";
const intervals: Map<string, YahooInterval | PolygonInterval> = new Map([
  ["1h", "hour"],
  ["1d", "1d"],
  ["1w", "1wk"],
  ["1m", "1mo"],
  ["3m", "3mo"],
  ["1y", "1yr"],
  // ["5y", "5y"],
]);
export const RangeSwitchingChart = ({
  data,
  ticker,
}: {
  data: ChartData[];
  ticker: string;
}) => {
  const { formattedData, setInterval } = useStockData();
  // const [chartData, setChartData] = useState<ChartData[]>(data);

  const currentDate = new Date();
  const from = new Date(currentDate);
  from.setMonth(currentDate.getMonth() - 10);

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
