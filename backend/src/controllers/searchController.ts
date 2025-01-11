import { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { SearchResult } from "yahoo-finance2/dist/esm/src/modules/search";

export const getSearchResults = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { q } = req.query;

  try {
    const data: SearchResult = await yahooFinance.search(q as string);

    if (!data) {
      res
        .status(404)
        .json({ error: `No search results found for query: ${q}` });
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      `Error fetching search results for ${q}:`,
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to fetch search results" });
  }
};
