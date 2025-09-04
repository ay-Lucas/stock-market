"use client";
import { fetchStockData } from "@/lib/stockData";
import { ChartData } from "@/types/chart";
import { PolygonInterval } from "@shared/types/polygon";
import { YahooInterval } from "@shared/types/yahoo";
import { UTCTimestamp } from "lightweight-charts";
import React, { useContext, useEffect, useState } from "react";

type StockContextType = {
  formattedData: ChartData[];
  loading: boolean;
  error: string | null;
  interval: string;
  setInterval: React.Dispatch<
    React.SetStateAction<YahooInterval | PolygonInterval>
  >;
};
const StockContext = React.createContext<StockContextType | undefined>(
  undefined,
);
const StockProvider = ({ children }: { children: React.ReactNode }) => {
  const [formattedData, setFormattedData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<YahooInterval | PolygonInterval>(
    "1d",
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentDate = new Date();
        const from = new Date(currentDate);
        from.setMonth(currentDate.getMonth() - 10);

        const historicalData = await fetchStockData(
          "AAPL",
          from,
          currentDate,
          interval,
        );
        const formatted =
          historicalData?.results.map((entry) => ({
            time: (entry.timestamp / 1000) as UTCTimestamp, // UTCTimestamp
            value: entry.close!,
          })) ?? [];
        setFormattedData(formatted);
      } catch (err) {
        setError("Failed to fetch stock data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [interval]);

  return (
    <StockContext.Provider
      value={{ formattedData, loading, error, interval, setInterval }}
    >
      {children}
    </StockContext.Provider>
  );
};

const useStockData = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStockData must be used within a StockProvider");
  }
  return context;
};

export { StockProvider, useStockData };
