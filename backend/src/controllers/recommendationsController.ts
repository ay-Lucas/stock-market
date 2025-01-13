import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { RecommendationsBySymbolResponseArray } from "yahoo-finance2/dist/esm/src/modules/recommendationsBySymbol";

export const getRecommendationsData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const symbolArray = symbol.split(",");
  try {
    const data: RecommendationsBySymbolResponseArray =
      await yahooFinance.recommendationsBySymbol(symbolArray);

    if (!data) {
      res
        .status(404)
        .json({ error: `No recommended symbols for: ${symbolArray}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    const errorString = `Error fetching recommended symbols for ${symbolArray}:`;
    console.error(errorString, (error as Error).message);
    res.status(500).json({
      error: errorString,
    });
  }
};
