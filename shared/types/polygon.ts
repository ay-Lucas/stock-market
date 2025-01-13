export type PolygonInterval =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

// Represents a single aggregate bar (candle) in the results array
export interface PolygonAggregateBar {
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  n: number; // Number of trades
  o: number; // Open price
  t: number; // Timestamp in Unix milliseconds
  v: number; // Volume
  vw: number; // Volume-weighted average price
}

// Represents the full response from the aggregate bar endpoint
export interface PolygonAggregateBarResponse {
  adjusted: boolean; // Indicates if the data is adjusted for splits/dividends
  next_url?: string; // URL for the next page of results (if pagination applies)
  queryCount: number; // Number of queries made to generate the data
  request_id: string; // Unique ID for the API request
  results: PolygonAggregateBar[]; // Array of aggregate bars (candles)
  resultsCount: number; // Total count of results in the current page
  status: string; // Status of the API response (e.g., "OK")
  ticker: string; // The stock ticker symbol
}
