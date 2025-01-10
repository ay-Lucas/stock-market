import express from "express";
import { validateHistoricalQueryParams } from "../middlewares/validateQueryParams";
import { getStockQuote } from "../controllers/quoteController";
import { getHistoricalData } from "../controllers/historicalController";
import { getStockSummary } from "../controllers/summaryController";
import { getDividendHistory } from "../controllers/dividendController";
import { validateQueryDates } from "../middlewares/validateQueryDates";
import { validateSymbolParam } from "../middlewares/validateSymbolParam";

const router = express.Router();

router.get("/:symbol/quote", getStockQuote);

router.get(
  "/:symbol/historical",
  validateHistoricalQueryParams,
  getHistoricalData,
);

router.get("/:symbol/summary", getStockSummary);
router.get(
  "/:symbol/dividends",
  validateSymbolParam,
  validateQueryDates,
  getDividendHistory,
);
export default router;
