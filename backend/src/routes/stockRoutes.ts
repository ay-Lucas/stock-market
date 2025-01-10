import express from "express";
import { getStockQuote } from "../controllers/quoteController";
import { getHistoricalData } from "../controllers/historicalController";
import { getStockSummary } from "../controllers/summaryController";
import { getDividendHistory } from "../controllers/dividendController";
import { validateQueryDates } from "../middlewares/validateQueryDates";
import { validateFields } from "../middlewares/validateFields";

const router = express.Router();

router.get("/:symbol/quote", validateFields(["symbol"]), getStockQuote);

router.get(
  "/:symbol/historical",
  validateFields(["symbol"], ["from", "to"]),
  validateQueryDates,
  getHistoricalData,
);

router.get("/:symbol/summary", validateFields(["symbol"]), getStockSummary);
router.get(
  "/:symbol/dividends",
  validateFields(["symbol"], ["from", "to"]),
  validateQueryDates,
  getDividendHistory,
);
export default router;
