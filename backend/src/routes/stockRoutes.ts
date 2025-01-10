import express from "express";
import { getStockQuote } from "../controllers/quoteController";
import { getHistoricalData } from "../controllers/historicalController";
import { getStockSummary } from "../controllers/summaryController";
import { getDividendHistory } from "../controllers/dividendController";
import { validateQueryDates } from "../middlewares/validateQueryDates";
import { validateFields } from "../middlewares/validateFields";

const router = express.Router();

router.use(validateFields(["symbol"]));

router.get("/:symbol/quote", getStockQuote);
router.get(
  "/:symbol/historical",
  validateFields(["from", "to"]),
  validateQueryDates,
  getHistoricalData,
);

router.get("/:symbol/summary", getStockSummary);
router.get(
  "/:symbol/dividends",
  validateFields(["from", "to"]),
  validateQueryDates,
  getDividendHistory,
);
export default router;
