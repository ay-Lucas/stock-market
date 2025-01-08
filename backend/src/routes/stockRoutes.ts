import express, { Request, Response } from "express";
import fetchStockData, {
  fetchHistoricalData,
  StockData,
} from "../utils/fetchStockData";

const router = express.Router();

router.get("/:symbol", async (req: Request, res: Response) => {
  const { symbol } = req.params;

  try {
    const uppercaseSymbol = symbol.toUpperCase();
    const stockData: StockData = await fetchStockData(uppercaseSymbol);
    res.status(200).json(stockData);
  } catch (error: unknown) {
    console.error(
      `Error fetching data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

router.get("/:symbol/history", async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "startDate and endDate query parameters are required" });
  }

  try {
    const historicalData = await fetchHistoricalData(
      symbol.toUpperCase(),
      startDate as string,
      endDate as string,
    );
    res.status(200).json(historicalData);
  } catch (error: unknown) {
    console.error(
      `Error fetching historical data for ${symbol}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

export default router;
