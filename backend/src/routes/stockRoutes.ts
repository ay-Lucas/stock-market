import express from "express";
import { validateHistoricalQueryParams } from "../middlewares/validateQueryParams";
import { getStockQuote } from "../controllers/quoteController";
import { getHistoricalData } from "../controllers/historicalController";

const router = express.Router();

router.get("/:symbol/quote", getStockQuote);

router.get(
  "/:symbol/historical",
  validateHistoricalQueryParams,
  getHistoricalData,
);
export default router;
