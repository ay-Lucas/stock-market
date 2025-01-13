export interface StockData {
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: string;
}

export interface HistoricalData {
  meta?: {
    currency?: string;
    symbol: string;
    exchangeName?: string;
    instrumentType?: string;
    firstTradeDate?: Date | null;
    timezone?: string;
    regularMarketPrice?: number;
  };
  results?: Array<{
    c?: number; // Close price
    h?: number; // High price
    l?: number; // Low price
    o?: number; // Open price
    t: number; // Timestamp
    v?: number; // Volume
  }>;
  ticker?: string;
  status?: string;
  errors?: string[];
}
