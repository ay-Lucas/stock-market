import YahooFinance from "yahoo-finance2";
export const yahooFinance = new YahooFinance({
  // ...options,
  suppressNotices: ["yahooSurvey"], // optional
});

type YahooTask<T> = () => Promise<T>;

const YAHOO_MIN_INTERVAL_MS = 100;
const YAHOO_RATE_LIMIT_COOLDOWN_MS = 45_000;
let queueTail: Promise<void> = Promise.resolve();
let yahooRateLimitedUntil = 0;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const isYahooRateLimitError = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const normalized = message.toLowerCase();
  return (
    normalized.includes("too many requests") ||
    normalized.includes("429") ||
    normalized.includes("rate limit")
  );
};

const enqueueYahooTask = async <T>(task: YahooTask<T>): Promise<T> => {
  const prev = queueTail;
  let release!: () => void;
  queueTail = new Promise<void>((resolve) => {
    release = resolve;
  });

  await prev;
  try {
    return await task();
  } finally {
    await sleep(YAHOO_MIN_INTERVAL_MS);
    release();
  }
};

export const runYahooRequest = async <T>(
  task: YahooTask<T>,
  retries: number = 1,
): Promise<T> => {
  if (Date.now() < yahooRateLimitedUntil) {
    throw new Error("Yahoo Finance rate limit cooldown active");
  }

  let attempt = 0;
  while (true) {
    try {
      return await enqueueYahooTask(task);
    } catch (error: unknown) {
      if (isYahooRateLimitError(error)) {
        yahooRateLimitedUntil = Date.now() + YAHOO_RATE_LIMIT_COOLDOWN_MS;
      }
      if (!isYahooRateLimitError(error) || attempt >= retries) {
        throw error;
      }
      const backoffMs = 200 * 2 ** attempt;
      await sleep(backoffMs);
      attempt += 1;
    }
  }
};
