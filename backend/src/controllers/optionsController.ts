import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";

export const getOptionsData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { symbol } = req.params;
  const { expirationDate, lang = "en-US", region = "US" } = req.query;

  const date: Date = new Date(expirationDate as string);

  const queryOptions = {
    date: date,
    lang: lang as string,
    formatted: false,
    region: region as string,
  };

  if (isNaN(date.getTime())) {
    res.status(400).json({ error: "Options expiration date must be valid" });
    return;
  }

  try {
    const data = await yahooFinance.options(symbol, queryOptions);

    if (!data) {
      res.status(404).json({ error: `No options found for ${symbol}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    const errorString = `Error fetching options for ${symbol}:`;

    console.error(errorString, (error as Error).message);

    res.status(500).json({
      error: errorString,
    });
  }
};
