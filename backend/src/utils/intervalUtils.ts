import { PolygonInterval } from "@shared/types/polygon";
import { YahooInterval } from "@shared/types/yahoo";

// Finer intervals require Yahoo Finance premium
export const yahooIntervals: YahooInterval[] = [
  "60m",
  "1h",
  "1d",
  "5d",
  "1wk",
  "1mo",
  "3mo",
];

export const polygonIntervals: PolygonInterval[] = [
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
];

export const isPolygonInterval = (value: string): value is PolygonInterval => {
  return polygonIntervals.includes(value as PolygonInterval);
};

export const isYahooInterval = (value: string): value is YahooInterval => {
  return yahooIntervals.includes(value as YahooInterval);
};
