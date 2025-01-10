import express from "express";
import { getStockQuote } from "../controllers/quoteController";
import { getHistoricalData } from "../controllers/historicalController";
import { getStockSummary } from "../controllers/summaryController";
import { getDividendHistory } from "../controllers/dividendController";
import { validateQueryDates } from "../middlewares/validateQueryDates";
import { validateFields } from "../middlewares/validateFields";
import { getStockNews } from "../controllers/newsController";
import { getEarningsData } from "../controllers/earningsController";
import { validateSymbolCase } from "../middlewares/validateSymbolCase";
import { getFinancialData } from "../controllers/financialsController";

const router = express.Router();

router.param("symbol", validateSymbolCase);

// Define routes
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
router.get("/:symbol/news", getStockNews);
router.get("/:symbol/earnings", getEarningsData);
router.get("/:symbol/financials", getFinancialData);

export default router;
