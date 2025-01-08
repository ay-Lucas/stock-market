import express, { Request, Response } from "express";
import fetchStockData, { StockData } from "../utils/fetchStockData";

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

export default router;
