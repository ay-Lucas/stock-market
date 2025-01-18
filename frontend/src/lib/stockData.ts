import { HistoricalData } from "@shared/types/stock";

export const fetchStockData = async (ticker: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/stocks/${ticker}/historical?from=2023-01-01&to=2023-12-31&interval=day&multiplier=1`,
    );
    const result: HistoricalData = await response.json();
    return result;
  } catch (error) {
    console.error(`There was an error fetching: ${error}`);
  }
};
