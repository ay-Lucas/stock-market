import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { TrendingSymbolsResult } from "yahoo-finance2/dist/esm/src/modules/trendingSymbols";

export const getTrendingData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { count, region, lang, iso2 } = req.query; // iso2 -> country code (2 letter abreviation) e.g. US, GB

  const queryOptions = {
    count: Number(count),
    lang: (lang as string) ?? "en-US",
    // region: region as string,
  };
  try {
    const data: TrendingSymbolsResult = await yahooFinance.trendingSymbols(
      iso2 as string,
      queryOptions,
    );

    if (!data) {
      res.status(404).json({ error: `No trending data in region: ${region}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching trending data for ${region}:`,
      (error as Error).message,
    );
    res
      .status(500)
      .json({ error: `Error fetching trending data for ${region}:` });
  }
};
